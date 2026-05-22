"""Pluggable media-generation backends.

The orchestrator never generates pixels itself; it delegates to a backend.
Select one with the SUPERCOMPUTER_BACKEND env var:

    stub  (default) writes a real, viewable placeholder file locally so the
          whole pipeline can be exercised without any API key or network.
    http  POSTs the prompt to a JSON endpoint you configure and downloads the
          result. Point it at Higgsfield, OpenAI images, Replicate, etc.

http backend env vars:
    SUPERCOMPUTER_IMAGE_URL   endpoint for images
    SUPERCOMPUTER_VIDEO_URL   endpoint for videos
    SUPERCOMPUTER_API_KEY     bearer token (sent as Authorization: Bearer ...)
    SUPERCOMPUTER_RESULT_KEY  JSON path to the asset URL in the response
                              (dotted, default "data.0.url")
"""

import json
import os
import struct
import urllib.request
import zlib
from pathlib import Path


class MediaBackend:
    name = "base"

    def generate_image(self, prompt: str, out: Path, **opts) -> dict:
        raise NotImplementedError

    def generate_video(self, prompt: str, out: Path, **opts) -> dict:
        raise NotImplementedError


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
        # Deterministic colour from the prompt so reruns are stable.
        h = zlib.crc32(prompt.encode())
        rgb = ((h >> 16) & 0xFF, (h >> 8) & 0xFF, h & 0xFF)
        out = out.with_suffix(".png")
        _png(out, 512, 512, rgb)
        return {"path": str(out), "backend": self.name, "note": "placeholder image"}

    def generate_video(self, prompt: str, out: Path, **opts) -> dict:
        out = out.with_suffix(".json")
        out.write_text(json.dumps({"prompt": prompt, "opts": opts,
                                    "note": "placeholder video descriptor"}, indent=2))
        return {"path": str(out), "backend": self.name, "note": "placeholder video"}


# --- http --------------------------------------------------------------------
class HttpBackend(MediaBackend):
    name = "http"

    def __init__(self):
        self.image_url = os.environ.get("SUPERCOMPUTER_IMAGE_URL")
        self.video_url = os.environ.get("SUPERCOMPUTER_VIDEO_URL")
        self.api_key = os.environ.get("SUPERCOMPUTER_API_KEY")
        self.result_key = os.environ.get("SUPERCOMPUTER_RESULT_KEY", "data.0.url")

    def _dig(self, obj, dotted: str):
        for part in dotted.split("."):
            obj = obj[int(part)] if part.isdigit() else obj[part]
        return obj

    def _call(self, url: str, prompt: str, opts: dict, out: Path) -> dict:
        if not url:
            raise RuntimeError("backend endpoint not configured (see SUPERCOMPUTER_*_URL)")
        body = json.dumps({"prompt": prompt, **opts}).encode()
        headers = {"Content-Type": "application/json"}
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"
        req = urllib.request.Request(url, data=body, headers=headers, method="POST")
        with urllib.request.urlopen(req, timeout=300) as resp:
            payload = json.loads(resp.read().decode())
        asset_url = self._dig(payload, self.result_key)
        with urllib.request.urlopen(asset_url, timeout=300) as resp:
            out.write_bytes(resp.read())
        return {"path": str(out), "backend": self.name, "source": asset_url}

    def generate_image(self, prompt: str, out: Path, **opts) -> dict:
        return self._call(self.image_url, prompt, opts, out.with_suffix(".png"))

    def generate_video(self, prompt: str, out: Path, **opts) -> dict:
        return self._call(self.video_url, prompt, opts, out.with_suffix(".mp4"))


def get_backend(name: str | None = None) -> MediaBackend:
    name = (name or os.environ.get("SUPERCOMPUTER_BACKEND") or "stub").lower()
    if name == "stub":
        return StubBackend()
    if name == "http":
        return HttpBackend()
    raise ValueError(f"unknown backend: {name!r} (use 'stub' or 'http')")
