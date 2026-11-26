"""Summarize Trivy JSON without exposing matched content or source paths."""

import json
import sys
from collections import Counter
from pathlib import Path

SEVERITIES = {"UNKNOWN", "LOW", "MEDIUM", "HIGH", "CRITICAL"}
SEVERITY_RANK = {"LOW": 0, "MEDIUM": 1, "HIGH": 2, "CRITICAL": 3, "UNKNOWN": 4}
KINDS = (
    ("Vulnerabilities", "vulnerability"),
    ("Misconfigurations", "misconfiguration"),
    ("Secrets", "secret"),
)


def evaluate(report: object) -> tuple[Counter[str], list[str]]:
    if not isinstance(report, dict) or not isinstance(report.get("SchemaVersion"), int):
        raise ValueError("invalid Trivy report header")
    if not isinstance(report.get("ArtifactType"), str):
        raise ValueError("missing artifact type")
    results = report.get("Results", [])
    if not isinstance(results, list):
        raise ValueError("invalid results")
    counts: Counter[str] = Counter()
    blockers: list[str] = []
    distinct: dict[tuple[object, ...], tuple[str, str, object]] = {}
    for result in results:
        if not isinstance(result, dict):
            raise ValueError("invalid result")
        target = result.get("Target")
        if target is not None and not isinstance(target, str):
            raise ValueError("invalid target")
        for field, kind in KINDS:
            findings = result.get(field, [])
            if findings is None:
                findings = []
            if not isinstance(findings, list):
                raise ValueError("invalid findings")
            for finding in findings:
                if not isinstance(finding, dict):
                    raise ValueError("invalid finding")
                severity = finding.get("Severity")
                if not isinstance(severity, str) or severity not in SEVERITIES:
                    raise ValueError("unknown severity")
                vulnerability_id = finding.get("VulnerabilityID")
                rule_id = finding.get("ID")
                if any(
                    value is not None and not isinstance(value, str)
                    for value in (vulnerability_id, rule_id)
                ):
                    raise ValueError("invalid finding identity")
                finding_id = vulnerability_id or rule_id
                position = finding.get("StartLine")
                metadata = finding.get("IacMetadata")
                if metadata is not None:
                    if not isinstance(metadata, dict):
                        raise ValueError("invalid finding metadata")
                    position = metadata.get("StartLine", position)
                package = finding.get("PkgName")
                installed = finding.get("InstalledVersion")
                if any(
                    value is not None and not isinstance(value, str)
                    for value in (package, installed)
                ) or (position is not None and (type(position) is not int or position < 0)):
                    raise ValueError("invalid finding identity")
                identity = (
                    kind,
                    target,
                    finding_id,
                    package,
                    installed,
                    position,
                )
                previous = distinct.get(identity)
                if previous is None or SEVERITY_RANK[severity] > SEVERITY_RANK[previous[1]]:
                    distinct[identity] = (kind, severity, finding_id)
    for kind, severity, finding_id in distinct.values():
        counts[f"{kind}:{severity}"] += 1
        if kind == "secret" or severity in {"HIGH", "CRITICAL", "UNKNOWN"}:
            safe_id = finding_id if isinstance(finding_id, str) else "unidentified"
            if (
                not safe_id.isascii()
                or len(safe_id) > 80
                or not all(char.isalnum() or char in "-_.:" for char in safe_id)
            ):
                safe_id = "redacted-id"
            blockers.append(f"{kind}:{severity}:{safe_id}")
    blockers.sort()
    return counts, blockers


def main() -> int:
    try:
        report = json.loads(Path(sys.argv[1]).read_text())
        counts, blockers = evaluate(report)
    except (IndexError, OSError, ValueError, json.JSONDecodeError) as error:
        print(f"Trivy policy: invalid report ({type(error).__name__})", file=sys.stderr)
        return 2
    scope = sys.argv[2] if len(sys.argv) > 2 else "unspecified"
    if scope not in {"filesystem", "image"}:
        print("Trivy policy: invalid scope", file=sys.stderr)
        return 2
    print(f"Trivy {scope} counts: " + ", ".join(f"{key}={counts[key]}" for key in sorted(counts)))
    if blockers:
        print(
            f"Trivy {scope} gate: {len(blockers)} blocking findings; IDs: {', '.join(blockers[:8])}"
        )
        return 1
    print(f"Trivy {scope} gate: pass")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
