import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

from policy import evaluate


def report(*, vulnerabilities=None, misconfigurations=None, secrets=None):
    return {
        "SchemaVersion": 2,
        "ArtifactType": "filesystem",
        "Results": [
            {
                "Vulnerabilities": vulnerabilities or [],
                "Misconfigurations": misconfigurations or [],
                "Secrets": secrets or [],
            }
        ],
    }


class PolicyTests(unittest.TestCase):
    def test_high_blocks_and_medium_reports(self):
        counts, blockers = evaluate(
            report(
                vulnerabilities=[
                    {"Severity": "HIGH", "VulnerabilityID": "CVE-2099-0001"},
                    {"Severity": "MEDIUM", "VulnerabilityID": "CVE-2099-0002"},
                ]
            )
        )
        self.assertEqual(counts["vulnerability:MEDIUM"], 1)
        self.assertEqual(blockers, ["vulnerability:HIGH:CVE-2099-0001"])

    def test_secret_blocks_without_value(self):
        _, blockers = evaluate(report(secrets=[{"Severity": "LOW", "ID": "synthetic-rule"}]))
        self.assertEqual(blockers, ["secret:LOW:synthetic-rule"])

    def test_invalid_and_unknown_fail_closed(self):
        for payload in ({}, report(vulnerabilities=[{"Severity": "UNRATED"}])):
            with self.subTest(payload=payload), self.assertRaises(ValueError):
                evaluate(payload)

    def test_empty_valid_report_passes(self):
        self.assertEqual(evaluate({"SchemaVersion": 2, "ArtifactType": "filesystem"})[1], [])

    def test_identifier_redaction(self):
        _, blockers = evaluate(
            report(misconfigurations=[{"Severity": "CRITICAL", "ID": "unsafe value here"}])
        )
        self.assertEqual(blockers, ["misconfiguration:CRITICAL:redacted-id"])

    def test_malformed_file_exits_without_echoing_input(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "report.json"
            path.write_text("not-json-SYNTHETIC-PRIVATE-VALUE")
            result = subprocess.run(
                [
                    sys.executable,
                    str(Path(__file__).with_name("policy.py")),
                    str(path),
                    "filesystem",
                ],
                capture_output=True,
                text=True,
                check=False,
            )
        self.assertEqual(result.returncode, 2)
        self.assertNotIn("SYNTHETIC-PRIVATE-VALUE", result.stdout + result.stderr)

    def test_duplicate_package_finding_is_counted_once(self):
        duplicate = {
            "Severity": "HIGH",
            "VulnerabilityID": "CVE-2099-0001",
            "PkgName": "synthetic-package",
            "InstalledVersion": "1.0",
        }
        counts, blockers = evaluate(report(vulnerabilities=[duplicate, duplicate.copy()]))
        self.assertEqual(counts["vulnerability:HIGH"], 1)
        self.assertEqual(len(blockers), 1)

    def test_duplicate_keeps_strictest_severity_in_either_order(self):
        medium = {
            "Severity": "MEDIUM",
            "VulnerabilityID": "CVE-2099-0001",
            "PkgName": "synthetic-package",
            "InstalledVersion": "1.0",
        }
        critical = {**medium, "Severity": "CRITICAL"}
        for findings in ([medium, critical], [critical, medium]):
            with self.subTest(findings=findings):
                counts, blockers = evaluate(report(vulnerabilities=findings))
                self.assertEqual(counts["vulnerability:MEDIUM"], 0)
                self.assertEqual(counts["vulnerability:CRITICAL"], 1)
                self.assertEqual(blockers, ["vulnerability:CRITICAL:CVE-2099-0001"])

    def test_malformed_identity_is_tool_failure(self):
        for malformed in ({"PkgName": ["bad"]}, {"VulnerabilityID": []}):
            with self.subTest(malformed=malformed), tempfile.TemporaryDirectory() as directory:
                path = Path(directory) / "report.json"
                path.write_text(
                    json.dumps(report(vulnerabilities=[{"Severity": "HIGH", **malformed}]))
                )
                result = subprocess.run(
                    [
                        sys.executable,
                        str(Path(__file__).with_name("policy.py")),
                        str(path),
                        "image",
                    ],
                    capture_output=True,
                    text=True,
                    check=False,
                )
            self.assertEqual(result.returncode, 2)
            self.assertIn("invalid report", result.stderr)
            self.assertNotIn("blocking", result.stdout)

    def test_policy_exit_differs_from_parse_failure(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "report.json"
            path.write_text(json.dumps(report(vulnerabilities=[{"Severity": "HIGH", "ID": "X-1"}])))
            result = subprocess.run(
                [sys.executable, str(Path(__file__).with_name("policy.py")), str(path), "image"],
                capture_output=True,
                text=True,
                check=False,
            )
        self.assertEqual(result.returncode, 1)
        self.assertIn("Trivy image gate: 1 blocking", result.stdout)


if __name__ == "__main__":
    unittest.main()
