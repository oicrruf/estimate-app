"""Export a bounded synthetic Angular fixture from the integrated API bridge."""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path
from typing import Any

PINNED_API_REVISION = "fe9440727636c1b5c89d2f876fa7448a4d4816a7"
OUTPUT = Path(__file__).resolve().parents[1] / "public/fixtures/at248-review.v1.json"
CHECKS = {"global:total-ports", "global:poe-ports"}


def _repo_stdout(root: Path, *args: str) -> str:
    return subprocess.check_output(["git", "-C", str(root), *args], text=True).strip()


def _case(result: Any) -> dict[str, Any]:
    review = result.scope_review.payload
    if not result.review_required or result.persisted or review["commercialReady"]:
        raise ValueError("Fixture must remain unapproved and unpersisted")
    if len(review["lines"]) > 16 or len(review["evidencePaths"]) > 16:
        raise ValueError("Fixture exceeds display bounds")
    constraints = review["constraints"]
    if constraints is None:
        raise ValueError("Missing constraint review")
    return {
        "stage": result.stage,
        "reviewRequired": result.review_required,
        "persisted": result.persisted,
        "status": review["status"],
        "commercialReady": review["commercialReady"],
        "constraintReason": constraints["reason"],
        "checks": [
            {"id": item["checkId"], "status": item["status"]}
            for item in constraints["findings"]
            if item["checkId"] in CHECKS
        ],
        "lines": [
            {
                "key": line["key"],
                "state": line["state"],
                "quantity": line["quantity"],
                "unit": line["unit"],
                "evidenceStatus": line["evidenceStatus"],
                "ruleId": line["ruleId"],
                "sourceRefs": line["sourceRefs"],
            }
            for line in review["lines"]
        ],
        "evidencePaths": review["evidencePaths"],
        "changes": review["changes"],
        "intakeQuestions": list(result.intake_questions),
    }


def export(api_root: Path) -> bytes:
    if _repo_stdout(api_root, "rev-parse", "HEAD") != PINNED_API_REVISION:
        raise ValueError("API checkout is not the pinned integrated commit")
    if _repo_stdout(api_root, "status", "--porcelain"):
        raise ValueError("API checkout must be clean")
    sys.path.insert(0, str(api_root / "src"))
    from estimate_api.chat.scope_review_bridge import (  # noqa: PLC0415
        ConstraintSnapshot,
        NetworkIntake,
        preview_scope_review,
    )
    from estimate_api.domain.scope_capture import Certainty, Fact, ScopeIntake  # noqa: PLC0415

    document = json.loads(
        (api_root / "tests/at267/global_constraints.json")
        .read_text(encoding="utf-8")
        .replace("global:goal", "camera:goal")
    )
    scope = ScopeIntake("Fictional site: eight PoE cameras and one separate uplink.")
    eight = preview_scope_review(
        NetworkIntake(
            scope,
            Fact(8, Certainty.CONFIRMED, "synthetic://at248/camera-count"),
            Fact(1, Certainty.CONFIRMED, "synthetic://at248/uplink-count"),
        ),
        snapshot=ConstraintSnapshot(document, 8, 1),
    )
    missing = preview_scope_review(
        NetworkIntake(scope, Fact(8, Certainty.INFERRED), None)
    )
    changed = preview_scope_review(
        NetworkIntake(
            scope,
            Fact(10, Certainty.CONFIRMED, "synthetic://at248/changed-count"),
            Fact(1, Certainty.CONFIRMED, "synthetic://at248/uplink-count"),
        ),
        previous=eight.scope_review.proposal,
    )
    value = {
        "wireVersion": "at248.synthetic-review.v1",
        "synthetic": True,
        "sourceCommit": PINNED_API_REVISION,
        "cases": {
            "eight": _case(eight),
            "missing": _case(missing),
            "changed": _case(changed),
        },
    }
    if {item["id"]: item["status"] for item in value["cases"]["eight"]["checks"]} != {
        "global:total-ports": "fail",
        "global:poe-ports": "pass",
    }:
        raise ValueError("Synthetic constraint control changed")
    return (
        json.dumps(value, indent=2, sort_keys=True, ensure_ascii=False) + "\n"
    ).encode()


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Export the fixed synthetic AT-248 review fixture"
    )
    parser.add_argument("--api-root", required=True, type=Path)
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    try:
        rendered = export(args.api_root.resolve())
        if args.check:
            if OUTPUT.read_bytes() != rendered:
                raise ValueError("Pinned review fixture has drifted")
        else:
            OUTPUT.parent.mkdir(parents=True, exist_ok=True)
            OUTPUT.write_bytes(rendered)
    except (OSError, subprocess.CalledProcessError, ValueError) as error:
        parser.exit(2, f"error: {error}\n")
    print("Synthetic review fixture verified" if args.check else f"Wrote {OUTPUT}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
