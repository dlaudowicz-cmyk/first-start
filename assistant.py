#!/usr/bin/env python3
"""Backwards-compatible entry point. The implementation now lives in the
`friday` package; run `python -m friday` or the `friday` console script."""

from friday.cli import chat

if __name__ == "__main__":
    chat()
