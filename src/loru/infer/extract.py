"""Optional MediaPipe landmark extract stub (offline synthetic if MediaPipe missing)."""

from __future__ import annotations

import json
import math
from pathlib import Path


def extract_landmarks(
    source: Path | None = None,
    *,
    gloss: str = "unknown",
    frames: int = 8,
    joints: int = 21,
) -> dict:
    """
    Build a landmark sequence JSON compatible with Loru samples.

    - If ``mediapipe`` is installed and ``source`` is an image/video path, a
      best-effort hand landmark pass is attempted (scaffold).
    - Otherwise returns a deterministic synthetic spiral (CI-safe offline).
    """
    if source is not None and source.exists():
        mp_result = _try_mediapipe(source, gloss=gloss)
        if mp_result is not None:
            return mp_result

    seq = []
    for f in range(max(1, frames)):
        t = f / max(1, frames - 1)
        frame = []
        for j in range(joints):
            ang = t * math.pi * 2 + j * 0.15
            frame.append(
                [
                    0.5 + 0.2 * math.cos(ang),
                    0.5 + 0.2 * math.sin(ang),
                    0.02 * math.sin(ang * 2),
                ]
            )
        seq.append(frame)
    return {
        "gloss": gloss,
        "language": "demo-asl",
        "fps": 15,
        "source": "synthetic-extract" if source is None else f"synthetic-fallback:{source.name}",
        "frames": seq,
        "extractor": "stub",
    }


def write_extract(payload: dict, out_path: Path) -> Path:
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    return out_path


def _try_mediapipe(source: Path, *, gloss: str) -> dict | None:
    try:
        import mediapipe as mp  # type: ignore  # noqa: F401
    except Exception:
        return None
    # Full MediaPipe video pipeline is environment-specific; keep scaffold signal.
    return {
        "gloss": gloss,
        "language": "demo-asl",
        "fps": 15,
        "source": str(source),
        "frames": [],
        "extractor": "mediapipe-scaffold",
        "note": "MediaPipe present — wire Hands/Pose pipeline in bounty follow-up",
    }
