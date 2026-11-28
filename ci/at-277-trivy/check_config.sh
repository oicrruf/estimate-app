#!/usr/bin/env bash
set -euo pipefail

trivy="$1"
scratch="$2"
fixture="$scratch/config-fixture"
mkdir -p "$fixture"
printf 'FROM scratch\nUSER root\n' > "$fixture/Dockerfile"
printf 'scan:\n  skip-files:\n    - Dockerfile\n' > "$fixture/trivy.yaml"

(
  cd "$fixture"
  "$trivy" fs --scanners misconfig --quiet --format json --exit-code 0 \
    --cache-dir "$scratch/cache" . > "$scratch/default-config.json"
  "$trivy" fs --scanners misconfig --quiet --format json --exit-code 0 \
    --cache-dir "$scratch/cache" --config "$scratch/empty-config.yaml" \
    --ignorefile "$scratch/empty-ignore" --secret-config='' . \
    > "$scratch/trusted-config.json"
)

python3 - "$scratch" <<'PY'
import json
import sys
from pathlib import Path

root = Path(sys.argv[1])


def has_high(path: Path) -> bool:
    report = json.loads(path.read_text())
    return any(
        item.get("ID") == "DS-0002" and item.get("Severity") == "HIGH"
        for result in report.get("Results", [])
        for item in result.get("Misconfigurations", [])
    )


if has_high(root / "default-config.json") or not has_high(root / "trusted-config.json"):
    raise SystemExit("AT-277: trusted scanner configuration regression")
print("AT-277: PR-owned Trivy exclusions cannot suppress synthetic HIGH")
PY
