#!/usr/bin/env python3
"""ComfyUI Workflow Testing Tool.

Tests ComfyUI workflows locally and evaluates generated images
using Claude, ChatGPT (OpenAI), and Gemini side-by-side.

Usage:
  python comfyui_tester.py workflow.json
  python comfyui_tester.py workflows/          # run all .json files in dir
  python comfyui_tester.py workflow.json --host 192.168.1.10 --port 8188
  python comfyui_tester.py workflow.json --models claude gpt gemini
  python comfyui_tester.py workflow.json --no-eval  # just run, skip AI eval
"""

import argparse
import base64
import json
import os
import sys
import time
import urllib.error
import urllib.request
import uuid
import websocket  # websocket-client
from pathlib import Path
from datetime import datetime

import anthropic
import openai
import google.generativeai as genai

# ── defaults ──────────────────────────────────────────────────────────────────
COMFYUI_HOST = os.getenv("COMFYUI_HOST", "127.0.0.1")
COMFYUI_PORT = int(os.getenv("COMFYUI_PORT", "8188"))

EVAL_PROMPT = (
    "You received this image from a ComfyUI image-generation workflow. "
    "Please evaluate it briefly:\n"
    "1. What do you see? (1-2 sentences)\n"
    "2. Overall quality (1-10) with a short reason.\n"
    "3. Any obvious artifacts or issues?\n"
    "Keep your answer concise."
)

# ── ComfyUI client ─────────────────────────────────────────────────────────────

class ComfyUIClient:
    def __init__(self, host: str, port: int):
        self.base = f"http://{host}:{port}"
        self.ws_base = f"ws://{host}:{port}"
        self.client_id = str(uuid.uuid4())

    def _get(self, path: str) -> dict:
        with urllib.request.urlopen(f"{self.base}{path}") as r:
            return json.loads(r.read())

    def _post(self, path: str, data: dict) -> dict:
        body = json.dumps(data).encode()
        req = urllib.request.Request(
            f"{self.base}{path}",
            data=body,
            headers={"Content-Type": "application/json"},
        )
        with urllib.request.urlopen(req) as r:
            return json.loads(r.read())

    def queue_prompt(self, workflow: dict) -> str:
        resp = self._post("/prompt", {"prompt": workflow, "client_id": self.client_id})
        return resp["prompt_id"]

    def wait_for_completion(self, prompt_id: str, timeout: int = 300) -> None:
        ws_url = f"{self.ws_base}/ws?clientId={self.client_id}"
        ws = websocket.WebSocket()
        ws.connect(ws_url)
        deadline = time.time() + timeout
        try:
            while time.time() < deadline:
                raw = ws.recv()
                if isinstance(raw, bytes):
                    continue
                msg = json.loads(raw)
                if msg.get("type") == "executing":
                    data = msg.get("data", {})
                    if data.get("node") is None and data.get("prompt_id") == prompt_id:
                        return  # done
        finally:
            ws.close()
        raise TimeoutError(f"Workflow did not finish within {timeout}s")

    def get_output_images(self, prompt_id: str) -> list[bytes]:
        history = self._get(f"/history/{prompt_id}")
        outputs = history.get(prompt_id, {}).get("outputs", {})
        images: list[bytes] = []
        for node_output in outputs.values():
            for img in node_output.get("images", []):
                url = (
                    f"{self.base}/view"
                    f"?filename={img['filename']}"
                    f"&subfolder={img.get('subfolder', '')}"
                    f"&type={img.get('type', 'output')}"
                )
                with urllib.request.urlopen(url) as r:
                    images.append(r.read())
        return images

    def ping(self) -> bool:
        try:
            self._get("/system_stats")
            return True
        except Exception:
            return False


# ── AI evaluators ──────────────────────────────────────────────────────────────

def _b64(data: bytes) -> str:
    return base64.standard_b64encode(data).decode()


def eval_claude(image_bytes: bytes, prompt: str) -> str:
    client = anthropic.Anthropic()
    msg = client.messages.create(
        model="claude-opus-4-7",
        max_tokens=512,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": "image/png",
                            "data": _b64(image_bytes),
                        },
                    },
                    {"type": "text", "text": prompt},
                ],
            }
        ],
    )
    return msg.content[0].text


def eval_gpt(image_bytes: bytes, prompt: str) -> str:
    client = openai.OpenAI()
    resp = client.chat.completions.create(
        model="gpt-4o",
        max_tokens=512,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:image/png;base64,{_b64(image_bytes)}"},
                    },
                    {"type": "text", "text": prompt},
                ],
            }
        ],
    )
    return resp.choices[0].message.content


def eval_gemini(image_bytes: bytes, prompt: str) -> str:
    genai.configure(api_key=os.environ["GEMINI_API_KEY"])
    model = genai.GenerativeModel("gemini-2.0-flash")
    import google.generativeai as genai_types
    part = genai_types.types.Part.from_bytes(data=image_bytes, mime_type="image/png")
    resp = model.generate_content([part, prompt])
    return resp.text


EVALUATORS = {
    "claude": ("Claude (claude-opus-4-7)", eval_claude),
    "gpt": ("ChatGPT (gpt-4o)", eval_gpt),
    "gemini": ("Gemini (gemini-2.0-flash)", eval_gemini),
}

# ── output helpers ─────────────────────────────────────────────────────────────

def save_image(image_bytes: bytes, workflow_name: str, idx: int, out_dir: Path) -> Path:
    out_dir.mkdir(parents=True, exist_ok=True)
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    path = out_dir / f"{workflow_name}_{ts}_{idx}.png"
    path.write_bytes(image_bytes)
    return path


def print_separator(char: str = "─", width: int = 70) -> None:
    print(char * width)


def run_workflow(
    client: ComfyUIClient,
    workflow_path: Path,
    models: list[str],
    no_eval: bool,
    out_dir: Path,
    timeout: int,
) -> None:
    print_separator("═")
    print(f"Workflow : {workflow_path.name}")
    print_separator()

    workflow = json.loads(workflow_path.read_text())

    print("  Queuing workflow...")
    prompt_id = client.queue_prompt(workflow)
    print(f"  Prompt ID: {prompt_id}")

    print("  Waiting for ComfyUI to finish...", end="", flush=True)
    start = time.time()
    client.wait_for_completion(prompt_id, timeout=timeout)
    elapsed = time.time() - start
    print(f" done ({elapsed:.1f}s)")

    images = client.get_output_images(prompt_id)
    if not images:
        print("  No output images found.")
        return

    print(f"  {len(images)} image(s) generated.")

    for i, img_bytes in enumerate(images):
        saved = save_image(img_bytes, workflow_path.stem, i, out_dir)
        print(f"  Saved: {saved}")

        if no_eval:
            continue

        print_separator()
        print(f"  AI Evaluation — image {i + 1}/{len(images)}")
        print_separator()

        for key in models:
            label, fn = EVALUATORS[key]
            print(f"\n  [{label}]")
            try:
                result = fn(img_bytes, EVAL_PROMPT)
                for line in result.strip().splitlines():
                    print(f"    {line}")
            except Exception as exc:
                print(f"    ERROR: {exc}")


# ── CLI ────────────────────────────────────────────────────────────────────────

def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(
        description="Test ComfyUI workflows and evaluate results with multiple AI models."
    )
    p.add_argument(
        "target",
        help="Path to a workflow JSON file or a directory containing workflow JSON files.",
    )
    p.add_argument("--host", default=COMFYUI_HOST, help="ComfyUI host (default: 127.0.0.1)")
    p.add_argument("--port", type=int, default=COMFYUI_PORT, help="ComfyUI port (default: 8188)")
    p.add_argument(
        "--models",
        nargs="+",
        choices=list(EVALUATORS.keys()),
        default=list(EVALUATORS.keys()),
        help="AI models to use for evaluation (default: all)",
    )
    p.add_argument(
        "--no-eval",
        action="store_true",
        help="Skip AI evaluation — only run workflows and save images.",
    )
    p.add_argument(
        "--out",
        default="comfyui_results",
        help="Output directory for saved images (default: comfyui_results)",
    )
    p.add_argument(
        "--timeout",
        type=int,
        default=300,
        help="Seconds to wait for each workflow (default: 300)",
    )
    return p.parse_args()


def collect_workflows(target: str) -> list[Path]:
    p = Path(target)
    if p.is_dir():
        workflows = sorted(p.glob("*.json"))
        if not workflows:
            print(f"No JSON workflow files found in {p}", file=sys.stderr)
            sys.exit(1)
        return workflows
    if p.is_file():
        return [p]
    print(f"Target not found: {target}", file=sys.stderr)
    sys.exit(1)


def check_env_keys(models: list[str], no_eval: bool) -> None:
    if no_eval:
        return
    missing = []
    if "gpt" in models and not os.getenv("OPENAI_API_KEY"):
        missing.append("OPENAI_API_KEY (required for ChatGPT)")
    if "gemini" in models and not os.getenv("GEMINI_API_KEY"):
        missing.append("GEMINI_API_KEY (required for Gemini)")
    if "claude" in models and not os.getenv("ANTHROPIC_API_KEY"):
        missing.append("ANTHROPIC_API_KEY (required for Claude)")
    if missing:
        print("Missing environment variables:", file=sys.stderr)
        for m in missing:
            print(f"  {m}", file=sys.stderr)
        sys.exit(1)


def main() -> None:
    args = parse_args()

    client = ComfyUIClient(args.host, args.port)

    print(f"Connecting to ComfyUI at {args.host}:{args.port}...")
    if not client.ping():
        print(
            f"ERROR: Cannot reach ComfyUI at {args.host}:{args.port}.\n"
            "Make sure ComfyUI is running and accessible.",
            file=sys.stderr,
        )
        sys.exit(1)
    print("ComfyUI is reachable.\n")

    check_env_keys(args.models, args.no_eval)

    workflows = collect_workflows(args.target)
    print(f"Found {len(workflows)} workflow(s) to test.")
    if not args.no_eval:
        print(f"Evaluation models: {', '.join(args.models)}")
    print()

    out_dir = Path(args.out)
    errors = 0
    for wf in workflows:
        try:
            run_workflow(
                client=client,
                workflow_path=wf,
                models=args.models,
                no_eval=args.no_eval,
                out_dir=out_dir,
                timeout=args.timeout,
            )
        except Exception as exc:
            print(f"  FAILED: {exc}")
            errors += 1

    print_separator("═")
    total = len(workflows)
    print(f"Done: {total - errors}/{total} workflow(s) succeeded.")
    if errors:
        sys.exit(1)


if __name__ == "__main__":
    main()
