from pathlib import Path
import json
from threading import RLock
from typing import Any, Dict

_DATA_DIR = Path(__file__).resolve().parent.parent / "data"
_DATA_DIR.mkdir(parents=True, exist_ok=True)

_LOCK = RLock()

def _file(path: str) -> Path:
    p = _DATA_DIR / path
    p.parent.mkdir(parents=True, exist_ok=True)
    if not p.exists():
        with p.open("w", encoding="utf-8") as f:
            f.write("{}" if p.suffix == ".json" else "")
    return p

def read_json(name: str) -> Dict[str, Any]:
    with _LOCK:
        p = _file(name)
        try:
            with p.open("r", encoding="utf-8") as f:
                return json.load(f) if f.readable() else {}
        except json.JSONDecodeError:
            return {}

def write_json(name: str, data: Dict[str, Any]) -> None:
    with _LOCK:
        p = _file(name)
        tmp = p.with_suffix(".tmp")
        with tmp.open("w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
        tmp.replace(p)
