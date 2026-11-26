"""Publish only redacted counts and gate state from two private Trivy reports."""

import json
import sys
from pathlib import Path

from policy import evaluate


def build(filesystem: object, image: object) -> dict[str, object]:
    surfaces: dict[str, object] = {}
    blocked = False
    for name, report in (("filesystem", filesystem), ("image", image)):
        counts, blockers = evaluate(report)
        surfaces[name] = {"counts": dict(sorted(counts.items())), "blocking_count": len(blockers)}
        blocked |= bool(blockers)
    return {"schema": 1, "result": "policy_failed" if blocked else "pass", "surfaces": surfaces}


def main() -> int:
    try:
        source_path, image_path, output_path = map(Path, sys.argv[1:4])
        summary = build(json.loads(source_path.read_text()), json.loads(image_path.read_text()))
        output_path.write_text(json.dumps(summary, sort_keys=True, separators=(",", ":")) + "\n")
    except (IndexError, OSError, ValueError, TypeError):
        print("AT-277: invalid scanner report", file=sys.stderr)
        return 2
    print("AT-277: redacted result=" + str(summary["result"]))
    return 1 if summary["result"] == "policy_failed" else 0


if __name__ == "__main__":
    raise SystemExit(main())
