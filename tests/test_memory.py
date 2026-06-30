"""Tests for the persistent memory layer."""

import importlib

import pytest


@pytest.fixture
def memory(tmp_path, monkeypatch):
    """Reload config + memory pointed at a temporary file."""
    monkeypatch.setenv("FRIDAY_MEMORY_FILE", str(tmp_path / "mem.json"))
    import friday.config as config
    import friday.memory as memory

    importlib.reload(config)
    importlib.reload(memory)
    return memory


def test_load_empty_when_missing(memory):
    assert memory.load_memory() == []


def test_save_and_load_round_trip(memory):
    messages = [
        {"role": "user", "content": "hi"},
        {"role": "assistant", "content": "hello"},
    ]
    memory.save_memory(messages)
    assert memory.load_memory() == messages


def test_forget_removes_file(memory):
    memory.save_memory([{"role": "user", "content": "x"}])
    memory.forget_memory()
    assert memory.load_memory() == []


def test_load_handles_corrupt_file(memory, tmp_path):
    from friday.config import MEMORY_FILE

    with open(MEMORY_FILE, "w") as f:
        f.write("{ not valid json")
    assert memory.load_memory() == []
