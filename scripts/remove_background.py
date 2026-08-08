#!/usr/bin/env python3
"""Remove an image background locally and write a transparent PNG."""

from __future__ import annotations

import argparse
from pathlib import Path
import sys


def fail(message: str) -> None:
    print(message, file=sys.stderr)
    raise SystemExit(1)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", required=True, help="Opaque source image")
    parser.add_argument("--out", required=True, help="Transparent .png output")
    args = parser.parse_args()

    source = Path(args.input)
    output = Path(args.out)
    if not source.is_file():
        fail(f"Input image not found: {source}")
    if output.suffix.lower() != ".png":
        fail("Background-removed output must end in .png")

    try:
        from rembg import new_session, remove
    except ImportError:
        fail("rembg is not installed; run ./install.sh from the skill directory")

    try:
        session = new_session("birefnet-general")
        result = remove(source.read_bytes(), session=session, alpha_matting=True)
    except Exception as error:
        fail(f"rembg failed: {error}")

    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_bytes(result)
    print(output)


if __name__ == "__main__":
    main()
