"""Offline test suite. No network, no API keys, no anthropic SDK required.

Run: python -m unittest discover -s tests -v
"""

import base64
import json
import struct
import tempfile
import unittest
import zlib
from pathlib import Path
from unittest import mock

import supercomputer.backends as B
from supercomputer.agent import Orchestrator, _dump
from supercomputer.projects import Project
from supercomputer.tools import dispatch

# A real 1x1 PNG so backend decode paths produce a valid file.
PNG1x1_B64 = base64.b64encode(bytes.fromhex(
    "89504e470d0a1a0a0000000d4948445200000001000000010802000000907753de"
    "0000000c4944415408d76360000002000154a24f5f0000000049454e44ae426082"
)).decode()


def _is_png(p: Path) -> bool:
    return Path(p).read_bytes()[:8] == b"\x89PNG\r\n\x1a\n"


class TempProjectMixin:
    def setUp(self):
        self._tmp = tempfile.TemporaryDirectory()
        # Redirect project storage into the temp dir.
        self._root = mock.patch("supercomputer.projects.ROOT", Path(self._tmp.name))
        self._root.start()

    def tearDown(self):
        self._root.stop()
        self._tmp.cleanup()


class TestProjects(TempProjectMixin, unittest.TestCase):
    def test_memory_roundtrip_and_reset(self):
        p = Project("My Brand!")
        self.assertEqual(p.slug, "my-brand")
        p.save_memory([{"role": "user", "content": "hi"}])
        self.assertEqual(p.load_memory()[0]["content"], "hi")
        p.reset_memory()
        self.assertEqual(p.load_memory(), [])

    def test_plan_brief_assets(self):
        p = Project("x")
        p.set_plan(["a", "b"])
        self.assertEqual(p.get_plan(), ["a", "b"])
        p.append_note("note1")
        self.assertIn("note1", p.read_brief())
        e1 = p.record_asset(p.assets_dir / "f.png", "image", "prompt", {"k": "v"})
        e2 = p.record_asset(p.assets_dir / "g.png", "video", "p2", {})
        self.assertEqual([e1["index"], e2["index"]], [1, 2])
        self.assertEqual(len(p.list_assets()), 2)

    def test_corrupt_memory_recovers(self):
        p = Project("c")
        p._memory_file.write_text("{ not json")
        self.assertEqual(p.load_memory(), [])


class TestStubBackend(TempProjectMixin, unittest.TestCase):
    def test_png_is_valid_and_deterministic(self):
        p = Project("s")
        b = B.StubBackend()
        r1 = b.generate_image("same prompt", p.assets_dir / "a")
        r2 = b.generate_image("same prompt", p.assets_dir / "b")
        self.assertTrue(_is_png(r1["path"]))
        # deterministic colour -> identical bytes for identical prompt
        self.assertEqual(Path(r1["path"]).read_bytes(), Path(r2["path"]).read_bytes())
        # structural validity: CRCs and IDAT decode
        data = Path(r1["path"]).read_bytes()
        i, chunks = 8, {}
        while i < len(data):
            ln = struct.unpack(">I", data[i:i + 4])[0]
            tag, body = data[i + 4:i + 8], data[i + 8:i + 8 + ln]
            crc = struct.unpack(">I", data[i + 8 + ln:i + 12 + ln])[0]
            self.assertEqual(crc, zlib.crc32(tag + body) & 0xFFFFFFFF)
            chunks[tag] = body
            i += 12 + ln
        w, h, *_ = struct.unpack(">IIBB", chunks[b"IHDR"][:10])
        self.assertEqual(len(zlib.decompress(chunks[b"IDAT"])), h * (1 + w * 3))


class TestSelection(unittest.TestCase):
    def test_known_unknown_and_missing_key(self):
        self.assertEqual(B.get_backend("stub").name, "stub")
        with self.assertRaises(ValueError):
            B.get_backend("nope")
        with mock.patch.dict("os.environ", {}, clear=True):
            with self.assertRaises(RuntimeError) as ctx:
                B.get_backend("openai")
            self.assertIn("OPENAI_API_KEY", str(ctx.exception))


class TestProviderBackends(TempProjectMixin, unittest.TestCase):
    def _proj(self):
        return Project("prov")

    def test_openai_request_and_decode(self):
        captured = {}

        def fake_post(url, body, headers, timeout=300):
            captured.update(url=url, body=body, headers=headers)
            return {"data": [{"b64_json": PNG1x1_B64}]}

        with mock.patch.dict("os.environ", {"OPENAI_API_KEY": "sk-x"}), \
             mock.patch.object(B, "_post_json", fake_post):
            r = B.OpenAIBackend().generate_image("red cube", self._proj().assets_dir / "o",
                                                 aspect_ratio="16:9", quality="high")
        self.assertEqual(captured["body"]["size"], "1536x1024")
        self.assertEqual(captured["body"]["quality"], "high")
        self.assertEqual(captured["headers"], {"Authorization": "Bearer sk-x"})
        self.assertTrue(_is_png(r["path"]))

    def test_gemini_request_and_decode(self):
        captured = {}

        def fake_post(url, body, headers, timeout=300):
            captured.update(url=url, body=body, headers=headers)
            return {"predictions": [{"bytesBase64Encoded": PNG1x1_B64}]}

        with mock.patch.dict("os.environ", {"GEMINI_API_KEY": "g-x"}), \
             mock.patch.object(B, "_post_json", fake_post):
            r = B.GeminiBackend().generate_image("blue cube", self._proj().assets_dir / "g",
                                                 aspect_ratio="9:16")
        self.assertIn("imagen-4.0-generate-001:predict", captured["url"])
        self.assertEqual(captured["body"]["parameters"]["aspectRatio"], "9:16")
        self.assertEqual(captured["headers"], {"x-goog-api-key": "g-x"})
        self.assertTrue(_is_png(r["path"]))

    def test_gemini_video_unsupported(self):
        with mock.patch.dict("os.environ", {"GEMINI_API_KEY": "g-x"}):
            with self.assertRaises(NotImplementedError):
                B.GeminiBackend().generate_video("x", self._proj().assets_dir / "v")

    def test_higgsfield_submit_poll_download(self):
        polls = iter([{"status": "queued"},
                      {"status": "completed", "result": {"url": "https://h/out.png"}}])
        with mock.patch.dict("os.environ", {"HIGGSFIELD_API_KEY": "h-x"}), \
             mock.patch.object(B, "_post_json", lambda *a, **k: {"id": "job1"}), \
             mock.patch.object(B, "_get_json", lambda *a, **k: next(polls)), \
             mock.patch.object(B, "_download", lambda url, out, timeout=300: out.write_bytes(b"X")), \
             mock.patch("time.sleep", lambda *_: None):
            r = B.HiggsfieldBackend().generate_image("hero", self._proj().assets_dir / "h")
        self.assertEqual(r["job"], "job1")
        self.assertEqual(r["source"], "https://h/out.png")

    def test_higgsfield_failed_job_raises(self):
        with mock.patch.dict("os.environ", {"HIGGSFIELD_API_KEY": "h-x"}), \
             mock.patch.object(B, "_post_json", lambda *a, **k: {"id": "job2"}), \
             mock.patch.object(B, "_get_json", lambda *a, **k: {"status": "failed"}), \
             mock.patch("time.sleep", lambda *_: None):
            with self.assertRaises(RuntimeError):
                B.HiggsfieldBackend().generate_image("x", self._proj().assets_dir / "f")


class TestTools(TempProjectMixin, unittest.TestCase):
    def test_dispatch_all(self):
        p, b = Project("t"), B.StubBackend()
        self.assertFalse(dispatch("set_plan", {"steps": ["x"]}, p, b)[1])
        self.assertFalse(dispatch("generate_image", {"prompt": "p", "filename": "f"}, p, b)[1])
        self.assertEqual(len(p.list_assets()), 1)
        self.assertIn("p", dispatch("list_assets", {}, p, b)[0])
        self.assertTrue(dispatch("mark_goal_complete", {"summary": "done"}, p, b)[1])
        self.assertIn("Unknown", dispatch("bogus", {}, p, b)[0])

    def test_filename_sanitised(self):
        p, b = Project("t2"), B.StubBackend()
        dispatch("generate_image", {"prompt": "p", "filename": "../../etc/passwd"}, p, b)
        produced = list(p.assets_dir.iterdir())
        self.assertEqual(len(produced), 1)
        self.assertEqual(produced[0].parent, p.assets_dir)  # stayed inside the project


# --- fake anthropic client for the agent loop --------------------------------
class _Block:
    def __init__(self, **kw):
        self.__dict__.update(kw)

    def model_dump(self):
        return dict(self.__dict__)


def _text(t):
    return _Block(type="text", text=t)


def _tool(name, inp, id="tu"):
    return _Block(type="tool_use", name=name, input=inp, id=id)


class _Resp:
    def __init__(self, content, stop_reason):
        self.content, self.stop_reason = content, stop_reason


class _FakeMessages:
    def __init__(self, script):
        self._script = iter(script)
        self.calls = []

    def create(self, **kwargs):
        self.calls.append(kwargs)
        return next(self._script)


class _FakeClient:
    def __init__(self, script):
        self.messages = _FakeMessages(script)


class TestAgentLoop(TempProjectMixin, unittest.TestCase):
    def test_full_goal_run(self):
        script = [
            _Resp([_text("Planning."), _tool("set_plan", {"steps": ["render hero"]}, "t1")], "tool_use"),
            _Resp([_tool("generate_image", {"prompt": "hero shot", "filename": "hero"}, "t2")], "tool_use"),
            _Resp([_tool("mark_goal_complete", {"summary": "1 image"}, "t3")], "tool_use"),
        ]
        p = Project("agent")
        orch = Orchestrator(p, B.StubBackend(), verbose=False, client=_FakeClient(script))
        result = orch.run("make a hero image")
        self.assertEqual(result, "Goal complete.")
        self.assertEqual(len(p.list_assets()), 1)
        # The critical regression: saved memory must be JSON-serialisable.
        json.loads(p._memory_file.read_text())
        # Every tool_use in memory has a matching tool_result (valid API shape).
        mem = p.load_memory()
        tool_use_ids, result_ids = set(), set()
        for m in mem:
            if isinstance(m["content"], list):
                for blk in m["content"]:
                    if blk.get("type") == "tool_use":
                        tool_use_ids.add(blk["id"])
                    if blk.get("type") == "tool_result":
                        result_ids.add(blk["tool_use_id"])
        self.assertEqual(tool_use_ids, result_ids)

    def test_backend_failure_keeps_memory_valid(self):
        class Boom(B.MediaBackend):
            name = "boom"

            def generate_image(self, *a, **k):
                raise RuntimeError("network down")

        script = [
            _Resp([_tool("generate_image", {"prompt": "x", "filename": "f"}, "t1")], "tool_use"),
            _Resp([_text("Couldn't generate, stopping.")], "end_turn"),
        ]
        p = Project("agentfail")
        orch = Orchestrator(p, Boom(), verbose=False, client=_FakeClient(script))
        orch.run("try")
        # The error was passed back as a tool_result rather than crashing.
        mem = p.load_memory()
        results = [blk for m in mem if isinstance(m["content"], list)
                   for blk in m["content"] if blk.get("type") == "tool_result"]
        self.assertEqual(len(results), 1)
        self.assertTrue(results[0]["is_error"])
        self.assertIn("network down", results[0]["content"])

    def test_dump_passthrough_and_model_dump(self):
        self.assertEqual(_dump({"already": "dict"}), {"already": "dict"})
        self.assertEqual(_dump(_text("hi")), {"type": "text", "text": "hi"})


if __name__ == "__main__":
    unittest.main()
