"""Tests for provider dispatch in the client layer."""

import importlib

import pytest


def _reload(monkeypatch, provider):
    monkeypatch.setenv("FRIDAY_PROVIDER", provider)
    import friday.config as config
    import friday.client as client

    importlib.reload(config)
    importlib.reload(client)
    return client


def test_unknown_provider_raises(monkeypatch):
    client = _reload(monkeypatch, "bogus")
    with pytest.raises(ValueError, match="Unknown FRIDAY_PROVIDER"):
        client.stream_reply([{"role": "user", "content": "hi"}])


def test_ollama_dispatch(monkeypatch):
    client = _reload(monkeypatch, "ollama")
    called = {}

    def fake(messages):
        called["messages"] = messages
        return "ok"

    monkeypatch.setattr(client, "_stream_ollama", fake)
    assert client.stream_reply([{"role": "user", "content": "hi"}]) == "ok"
    assert called["messages"] == [{"role": "user", "content": "hi"}]


def test_anthropic_dispatch(monkeypatch):
    client = _reload(monkeypatch, "anthropic")
    monkeypatch.setattr(client, "_stream_anthropic", lambda m: "claude")
    assert client.stream_reply([]) == "claude"
