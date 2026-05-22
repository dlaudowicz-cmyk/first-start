"""Pluggable media-generation backends.

The orchestrator never generates pixels itself; it delegates to a backend.
Select one with the SUPERCOMPUTER_BACKEND env var (or --backend):

    stub        (default) writes a real, viewable placeholder PNG locally so the
                whole pipeline can be exercised without any API key or network.
    openai      OpenAI Images API (gpt-image-1). Images only.
    gemini      Google Gemini / Imagen predict API. Images only.
    higgsfield  Higgsfield Cloud API. Images and video (async submit + poll).
    http        Generic: POST the prompt to a JSON endpoint you configure.

Important: a ChatGPT or Gemini *chat subscription* is NOT API access. The
backends below need developer API keys (platform.openai.com, ai.google.dev,
cloud.higgsfield.ai), which are billed separately from chat subscriptions.

Required env vars per backend:
    openai      OPENAI_API_KEY            [OPENAI_IMAGE_MODEL=gpt-image-1]
    gemini      GEMINI_API_KEY            [GEMINI_IMAGE_MODEL=imagen-4.0-generate-001]
    higgsfield  HIGGSFIELD_API_KEY        [HIGGSFIELD_BASE=https://cloud.higgsfield.ai]
                [HIGGSFIELD_RESULT_KEY] dotted path to the asset URL in the polled job
    http        SUPERCOMPUTER_IMAGE_URL / SUPERCOMPUTER_VIDEO_URL,
                SUPERCOMPUTER_API_KEY, [SUPERCOMPUTER_RESULT_KEY=data.0.url]
"""

import base64
import json
import os
import struct
import time
import urllib.request
import zlib
from pathlib import Path


class MediaBackend:
    name = "base"

    def generate_image(self, prompt: str, out: Path, **opts) -> dict:
        raise NotImplementedError

    def generate_video(self, prompt: str, out: Path, **opts) -> dict:
        raise NotImplementedError(f"backend '{self.name}' does not support video")


# --- shared HTTP helpers -----------------------------------------------------
def _post_json(url: str, body: dict, headers: dict, timeout: int = 300) -> dict:
    data = json.dumps(body).encode()
    h = {"Content-Type": "application/json", **headers}
    req = urllib.request.Request(url, data=data, headers=h, method="POST")
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return json.loads(resp.read().decode())


def _get_json(url: str, headers: dict, timeout: int = 60) -> dict:
    req = urllib.request.Request(url, headers=headers, method="GET")
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return json.loads(resp.read().decode())


def _download(url: str, out: Path, timeout: int = 300) -> None:
    with urllib.request.urlopen(url, timeout=timeout) as resp:
        out.write_bytes(resp.read())


def _write_b64(out: Path, b64: str) -> None:
    out.write_bytes(base64.b64decode(b64))


def _dig(obj, dotted: str):
    for part in dotted.split("."):
        obj = obj[int(part)] if part.isdigit() else obj[part]
    return obj


# --- stub --------------------------------------------------------------------
def _png(path: Path, width: int, height: int, rgb: tuple) -> None:
    """Write a minimal valid solid-colour PNG without any third-party deps."""
    def chunk(tag: bytes, data: bytes) -> bytes:
        return (struct.pack(">I", len(data)) + tag + data
                + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF))

    raw = bytearray()
    row = bytes(rgb) * width
    for _ in range(height):
        raw += b"\x00" + row  # filter byte 0 per scanline
    ihdr = struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0)  # 8-bit RGB
    png = (b"\x89PNG\r\n\x1a\n"
           + chunk(b"IHDR", ihdr)
           + chunk(b"IDAT", zlib.compress(bytes(raw), 9))
           + chunk(b"IEND", b""))
    path.write_bytes(png)


class StubBackend(MediaBackend):
    name = "stub"

    def generate_image(self, prompt: str, out: Path, **opts) -> dict:
        h = zlib.crc32(prompt.encode())  # deterministic colour, stable reruns
        rgb = ((h >> 16) & 0xFF, (h >> 8) & 0xFF, h & 0xFF)
        out = out.with_suffix(".png")
        _png(out, 512, 512, rgb)
        return {"path": str(out), "backend": self.name, "note": "placeholder image"}

    def generate_video(self, prompt: str, out: Path, **opts) -> dict:
        out = out.with_suffix(".json")
        out.write_text(json.dumps({"prompt": prompt, "opts": opts,
                                   "note": "placeholder video descriptor"}, indent=2))
        return {"path": str(out), "backend": self.name, "note": "placeholder video"}


# --- OpenAI Images (gpt-image-1) --------------------------------------------
_OPENAI_SIZE = {"1:1": "1024x1024", "16:9": "1536x1024", "9:16": "1024x1536"}


class OpenAIBackend(MediaBackend):
    name = "openai"

    def __init__(self):
        self.key = os.environ["OPENAI_API_KEY"]
        self.model = os.environ.get("OPENAI_IMAGE_MODEL", "gpt-image-1")

    def generate_image(self, prompt: str, out: Path, **opts) -> dict:
        body = {
            "model": self.model,
            "prompt": prompt,
            "size": _OPENAI_SIZE.get(opts.get("aspect_ratio"), "1024x1024"),
            "n": 1,
        }
        if "quality" in opts:
            body["quality"] = opts["quality"]
        payload = _post_json("https://api.openai.com/v1/images/generations", body,
                             {"Authorization": f"Bearer {self.key}"})
        out = out.with_suffix(".png")
        item = payload["data"][0]
        if item.get("b64_json"):
            _write_b64(out, item["b64_json"])
        else:
            _download(item["url"], out)
        return {"path": str(out), "backend": self.name, "model": self.model}


# --- Google Gemini / Imagen --------------------------------------------------
class GeminiBackend(MediaBackend):
    name = "gemini"

    def __init__(self):
        self.key = os.environ.get("GEMINI_API_KEY") or os.environ["GOOGLE_API_KEY"]
        self.model = os.environ.get("GEMINI_IMAGE_MODEL", "imagen-4.0-generate-001")

    def generate_image(self, prompt: str, out: Path, **opts) -> dict:
        url = (f"https://generativelanguage.googleapis.com/v1beta/models/"
               f"{self.model}:predict")
        params = {"sampleCount": 1}
        if opts.get("aspect_ratio"):
            params["aspectRatio"] = opts["aspect_ratio"]
        body = {"instances": [{"prompt": prompt}], "parameters": params}
        payload = _post_json(url, body, {"x-goog-api-key": self.key})
        out = out.with_suffix(".png")
        _write_b64(out, payload["predictions"][0]["bytesBase64Encoded"])
        return {"path": str(out), "backend": self.name, "model": self.model}


# --- Higgsfield Cloud (async submit + poll) ----------------------------------
class HiggsfieldBackend(MediaBackend):
    name = "higgsfield"

    def __init__(self):
        self.key = os.environ["HIGGSFIELD_API_KEY"]
        self.base = os.environ.get("HIGGSFIELD_BASE", "https://cloud.higgsfield.ai").rstrip("/")
        # Where the finished asset URL lives in the polled job JSON. Defaults are
        # best-effort; override if the current API differs.
        self.result_key = os.environ.get("HIGGSFIELD_RESULT_KEY", "result.url")

    @property
    def _headers(self) -> dict:
        return {"Authorization": f"Bearer {self.key}"}

    def _generate(self, body: dict, out: Path) -> dict:
        job = _post_json(f"{self.base}/v1/generations", body, self._headers)
        job_id = job.get("id") or job.get("job_id") or _dig(job, "data.id")
        url = self._poll(job_id)
        _download(url, out)
        return {"path": str(out), "backend": self.name, "job": job_id, "source": url}

    def _poll(self, job_id: str, interval: int = 3, max_wait: int = 600) -> str:
        deadline = time.time() + max_wait
        while time.time() < deadline:
            job = _get_json(f"{self.base}/v1/generations/{job_id}", self._headers)
            status = (job.get("status") or "").lower()
            if status in ("completed", "succeeded", "success", "done"):
                return _dig(job, self.result_key)
            if status in ("failed", "error", "canceled", "cancelled"):
                raise RuntimeError(f"Higgsfield job {job_id} {status}: {job}")
            time.sleep(interval)
        raise TimeoutError(f"Higgsfield job {job_id} did not finish within {max_wait}s")

    def generate_image(self, prompt: str, out: Path, **opts) -> dict:
        body = {"prompt": prompt, "type": "image", **opts}
        return self._generate(body, out.with_suffix(".png"))

    def generate_video(self, prompt: str, out: Path, **opts) -> dict:
        body = {"prompt": prompt, "type": "video", **opts}
        return self._generate(body, out.with_suffix(".mp4"))


# --- generic http ------------------------------------------------------------
class HttpBackend(MediaBackend):
    name = "http"

    def __init__(self):
        self.image_url = os.environ.get("SUPERCOMPUTER_IMAGE_URL")
        self.video_url = os.environ.get("SUPERCOMPUTER_VIDEO_URL")
        self.api_key = os.environ.get("SUPERCOMPUTER_API_KEY")
        self.result_key = os.environ.get("SUPERCOMPUTER_RESULT_KEY", "data.0.url")

    def _call(self, url: str, prompt: str, opts: dict, out: Path) -> dict:
        if not url:
            raise RuntimeError("backend endpoint not configured (see SUPERCOMPUTER_*_URL)")
        headers = {"Authorization": f"Bearer {self.api_key}"} if self.api_key else {}
        payload = _post_json(url, {"prompt": prompt, **opts}, headers)
        asset_url = _dig(payload, self.result_key)
        _download(asset_url, out)
        return {"path": str(out), "backend": self.name, "source": asset_url}

    def generate_image(self, prompt: str, out: Path, **opts) -> dict:
        return self._call(self.image_url, prompt, opts, out.with_suffix(".png"))

    def generate_video(self, prompt: str, out: Path, **opts) -> dict:
        return self._call(self.video_url, prompt, opts, out.with_suffix(".mp4"))


_BACKENDS = {
    "stub": StubBackend,
    "openai": OpenAIBackend,
    "gemini": GeminiBackend,
    "higgsfield": HiggsfieldBackend,
    "http": HttpBackend,
}


def get_backend(name: str | None = None) -> MediaBackend:
    name = (name or os.environ.get("SUPERCOMPUTER_BACKEND") or "stub").lower()
    if name not in _BACKENDS:
        raise ValueError(f"unknown backend: {name!r} (choose from {', '.join(_BACKENDS)})")
    try:
        return _BACKENDS[name]()
    except KeyError as e:
        raise RuntimeError(f"backend '{name}' is missing required env var {e}") from None
