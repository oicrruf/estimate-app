"""Safe publication contract for synthetic Trivy findings."""

import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

from summary import build


def report(findings=None):
    return {
        "SchemaVersion": 2,
        "ArtifactType": "filesystem",
        "Results": [{"Vulnerabilities": findings or []}],
    }


class SummaryTests(unittest.TestCase):
    def test_counts_and_policy_are_machine_readable_without_details(self):
        summary = build(
            report([{"Severity": "HIGH", "ID": "SYNTHETIC-1", "Title": "PRIVATE-VALUE"}]),
            report([{"Severity": "MEDIUM", "ID": "SYNTHETIC-2"}]),
        )
        self.assertEqual(summary["result"], "policy_failed")
        self.assertEqual(summary["surfaces"]["filesystem"]["blocking_count"], 1)
        self.assertEqual(summary["surfaces"]["image"]["counts"]["vulnerability:MEDIUM"], 1)
        self.assertNotIn("PRIVATE-VALUE", json.dumps(summary))
        self.assertNotIn("SYNTHETIC-1", json.dumps(summary))

    def test_invalid_report_keeps_tool_error_marker(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            source = root / "source.json"
            image = root / "image.json"
            output = root / "summary.json"
            source.write_text("PRIVATE-VALUE")
            image.write_text(json.dumps(report()))
            output.write_text('{"schema":1,"result":"tool_error"}\n')
            result = subprocess.run(
                [
                    sys.executable,
                    str(Path(__file__).with_name("summary.py")),
                    str(source),
                    str(image),
                    str(output),
                ],
                capture_output=True,
                text=True,
                check=False,
            )
            self.assertEqual(result.returncode, 2)
            self.assertEqual(json.loads(output.read_text())["result"], "tool_error")
            self.assertNotIn("PRIVATE-VALUE", result.stdout + result.stderr)


if __name__ == "__main__":
    unittest.main()
