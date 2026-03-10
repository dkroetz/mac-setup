from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
BEFORE_PATH = ROOT / "results" / "before.json"
AFTER_PATH = ROOT / "results" / "after.json"
COMPARISON_JSON = ROOT / "results" / "comparison.json"
COMPARISON_MD = ROOT / "results" / "comparison.md"


def load_json(path: Path) -> dict:
    return json.loads(path.read_text())


def aggregate(run: dict) -> dict:
    tasks = run["tasks"]
    total = len(tasks)
    passes = sum(1 for t in tasks if t["score"] == "pass")
    success_rate = passes / total
    token_total = sum(t["token_usage"] for t in tasks)
    intervention_total = sum(t["human_interventions"] for t in tasks)
    avg_ttfme = sum(t["time_to_first_meaningful_edit_seconds"] for t in tasks) / total
    post_fix_rate = sum(1 for t in tasks if t["post_first_pass_fix"]) / total
    return {
        "success_rate": success_rate,
        "token_total": token_total,
        "human_intervention_total": intervention_total,
        "avg_time_to_first_meaningful_edit_seconds": avg_ttfme,
        "post_first_pass_fix_rate": post_fix_rate,
    }


def main() -> None:
    before = load_json(BEFORE_PATH)
    after = load_json(AFTER_PATH)
    before_metrics = aggregate(before)
    after_metrics = aggregate(after)

    comparison = {
        "before_run": before.get("run_name"),
        "after_run": after.get("run_name"),
        "metrics": {
            "before": before_metrics,
            "after": after_metrics,
            "delta": {
                "success_rate": after_metrics["success_rate"] - before_metrics["success_rate"],
                "token_total": after_metrics["token_total"] - before_metrics["token_total"],
                "human_intervention_total": after_metrics["human_intervention_total"]
                - before_metrics["human_intervention_total"],
                "avg_time_to_first_meaningful_edit_seconds": after_metrics[
                    "avg_time_to_first_meaningful_edit_seconds"
                ]
                - before_metrics["avg_time_to_first_meaningful_edit_seconds"],
                "post_first_pass_fix_rate": after_metrics["post_first_pass_fix_rate"]
                - before_metrics["post_first_pass_fix_rate"],
            },
        },
    }

    COMPARISON_JSON.write_text(json.dumps(comparison, indent=2) + "\n")

    md = [
        "# Before/After Comparison",
        "",
        f"Before run: `{comparison['before_run']}`",
        f"After run: `{comparison['after_run']}`",
        "",
        "| Metric | Before | After | Delta |",
        "|---|---:|---:|---:|",
        f"| Success rate | {before_metrics['success_rate']:.3f} | {after_metrics['success_rate']:.3f} | {comparison['metrics']['delta']['success_rate']:+.3f} |",
        f"| Token total | {before_metrics['token_total']} | {after_metrics['token_total']} | {comparison['metrics']['delta']['token_total']:+d} |",
        f"| Human intervention total | {before_metrics['human_intervention_total']} | {after_metrics['human_intervention_total']} | {comparison['metrics']['delta']['human_intervention_total']:+d} |",
        f"| Avg time-to-first-meaningful-edit (s) | {before_metrics['avg_time_to_first_meaningful_edit_seconds']:.1f} | {after_metrics['avg_time_to_first_meaningful_edit_seconds']:.1f} | {comparison['metrics']['delta']['avg_time_to_first_meaningful_edit_seconds']:+.1f} |",
        f"| Post-first-pass fix rate | {before_metrics['post_first_pass_fix_rate']:.3f} | {after_metrics['post_first_pass_fix_rate']:.3f} | {comparison['metrics']['delta']['post_first_pass_fix_rate']:+.3f} |",
        "",
    ]
    COMPARISON_MD.write_text("\n".join(md))

    print(f"Wrote {COMPARISON_JSON}")
    print(f"Wrote {COMPARISON_MD}")


if __name__ == "__main__":
    main()
