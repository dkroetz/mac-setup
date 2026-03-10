from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
COMPARISON_JSON = ROOT / "results" / "comparison.json"
GATE_POLICY = ROOT / "release-gate.json"
RESULT_JSON = ROOT / "results" / "release-gate-result.json"


def load_json(path: Path) -> dict:
    return json.loads(path.read_text())


def main() -> None:
    comparison = load_json(COMPARISON_JSON)
    policy = load_json(GATE_POLICY)

    before = comparison["metrics"]["before"]
    after = comparison["metrics"]["after"]

    success_ok = after["success_rate"] >= before["success_rate"]

    token_growth_pct = 0.0
    if before["token_total"] > 0:
        token_growth_pct = ((after["token_total"] - before["token_total"]) / before["token_total"]) * 100.0
    token_ok = token_growth_pct <= policy["max_token_growth_percent"]

    intervention_ok = after["human_intervention_total"] <= before["human_intervention_total"]

    passed = success_ok and token_ok and intervention_ok

    result = {
        "passed": passed,
        "checks": {
            "no_success_regression": success_ok,
            "token_growth_within_limit": token_ok,
            "intervention_reduced_or_stable": intervention_ok,
        },
        "observed": {
            "before_success_rate": before["success_rate"],
            "after_success_rate": after["success_rate"],
            "token_growth_percent": token_growth_pct,
            "before_human_intervention_total": before["human_intervention_total"],
            "after_human_intervention_total": after["human_intervention_total"],
        },
    }

    RESULT_JSON.write_text(json.dumps(result, indent=2) + "\n")
    print("PASS" if passed else "FAIL")
    print(f"Wrote {RESULT_JSON}")


if __name__ == "__main__":
    main()
