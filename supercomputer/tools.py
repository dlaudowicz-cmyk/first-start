"""Tool schemas exposed to Claude, plus the dispatcher that executes them."""

import json
import re
from pathlib import Path

TOOLS = [
    {
        "name": "set_plan",
        "description": "Record the ordered list of steps you intend to take to reach the goal. "
                       "Call this first, and again whenever the plan changes.",
        "input_schema": {
            "type": "object",
            "properties": {
                "steps": {"type": "array", "items": {"type": "string"},
                          "description": "Ordered, concrete steps."}
            },
            "required": ["steps"],
        },
    },
    {
        "name": "generate_image",
        "description": "Generate one image from a text prompt via the configured media backend.",
        "input_schema": {
            "type": "object",
            "properties": {
                "prompt": {"type": "string"},
                "filename": {"type": "string", "description": "Base filename, no extension."},
                "aspect_ratio": {"type": "string", "description": "e.g. '1:1', '16:9', '9:16'."},
                "style": {"type": "string"},
            },
            "required": ["prompt", "filename"],
        },
    },
    {
        "name": "generate_video",
        "description": "Generate one video from a text prompt via the configured media backend.",
        "input_schema": {
            "type": "object",
            "properties": {
                "prompt": {"type": "string"},
                "filename": {"type": "string", "description": "Base filename, no extension."},
                "duration": {"type": "number", "description": "Seconds."},
                "aspect_ratio": {"type": "string"},
            },
            "required": ["prompt", "filename"],
        },
    },
    {
        "name": "list_assets",
        "description": "List every asset already produced in this project, with its index and prompt. "
                       "Use this to reference earlier work (e.g. 'another like the third one').",
        "input_schema": {"type": "object", "properties": {}},
    },
    {
        "name": "save_note",
        "description": "Append a note to the project brief for durable context across sessions.",
        "input_schema": {
            "type": "object",
            "properties": {"text": {"type": "string"}},
            "required": ["text"],
        },
    },
    {
        "name": "mark_goal_complete",
        "description": "Call this once the goal is fully met. Provide a short summary of what was delivered.",
        "input_schema": {
            "type": "object",
            "properties": {"summary": {"type": "string"}},
            "required": ["summary"],
        },
    },
]


def _safe_name(name: str) -> str:
    return re.sub(r"[^A-Za-z0-9_-]+", "_", name).strip("_") or "asset"


def dispatch(name: str, args: dict, project, backend) -> tuple[str, bool]:
    """Run a tool. Returns (result_text, goal_complete)."""
    if name == "set_plan":
        project.set_plan(args["steps"])
        return "Plan saved:\n" + "\n".join(f"{i+1}. {s}" for i, s in enumerate(args["steps"])), False

    if name == "generate_image":
        out = project.assets_dir / _safe_name(args["filename"])
        opts = {k: v for k, v in args.items() if k not in ("prompt", "filename")}
        info = backend.generate_image(args["prompt"], out, **opts)
        entry = project.record_asset(Path(info["path"]),
                                     "image", args["prompt"], opts)
        return f"Image #{entry['index']} created: {info}", False

    if name == "generate_video":
        out = project.assets_dir / _safe_name(args["filename"])
        opts = {k: v for k, v in args.items() if k not in ("prompt", "filename")}
        info = backend.generate_video(args["prompt"], out, **opts)
        entry = project.record_asset(Path(info["path"]),
                                     "video", args["prompt"], opts)
        return f"Video #{entry['index']} created: {info}", False

    if name == "list_assets":
        assets = project.list_assets()
        if not assets:
            return "No assets yet.", False
        return json.dumps(assets, indent=2, ensure_ascii=False), False

    if name == "save_note":
        project.append_note(args["text"])
        return "Note saved to brief.", False

    if name == "mark_goal_complete":
        return f"Goal complete: {args['summary']}", True

    return f"Unknown tool: {name}", False
