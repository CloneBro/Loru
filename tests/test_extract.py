from pathlib import Path

from loru.infer.extract import extract_landmarks, write_extract


def test_extract_synthetic(tmp_path: Path) -> None:
    payload = extract_landmarks(gloss="hello", frames=4)
    assert payload["extractor"] == "stub"
    assert len(payload["frames"]) == 4
    path = write_extract(payload, tmp_path / "x.json")
    assert path.exists()
