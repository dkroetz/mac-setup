from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MANIFEST_PATH = ROOT / "benchmark-manifest.json"
BEFORE_PATH = ROOT / "results" / "before.json"
AFTER_PATH = ROOT / "results" / "after.json"


def load_json(path: Path) -> dict:
    return json.loads(path.read_text())


def validate_run(run: dict, task_ids: set[str], label: str) -> list[str]:
    errors: list[str] = []
    seen: set[str] = set()
    for task in run.get("tasks", []):
        task_id = task.get("id")
        if task_id not in task_ids:
            errors.append(f"{label}: unknown task id '{task_id}'")
        if task_id in seen:
            errors.append(f"{label}: duplicate task id '{task_id}'")
        seen.add(task_id)

        if task.get("score") not in {"pass", "soft_fail", "hard_fail"}:
            errors.append(f"{label}: invalid score for '{task_id}'")
        if not isinstance(task.get("human_interventions"), int) or task["human_interventions"] < 0:
            errors.append(f"{label}: invalid human_interventions for '{task_id}'")
        if not isinstance(task.get("token_usage"), int) or task["token_usage"] < 0:
            errors.append(f"{label}: invalid token_usage for '{task_id}'")
        if not isinstance(task.get("time_to_first_meaningful_edit_seconds"), (int, float)) or task[
            "time_to_first_meaningful_edit_seconds"
        ] < 0:
            errors.append(f"{label}: invalid time_to_first_meaningful_edit_seconds for '{task_id}'")
        if not isinstance(task.get("post_first_pass_fix"), bool):
            errors.append(f"{label}: invalid post_first_pass_fix for '{task_id}'")

    missing = task_ids - seen
    if missing:
        errors.append(f"{label}: missing task ids {sorted(missing)}")
    if len(run.get("tasks", [])) != len(task_ids):
        errors.append(f"{label}: expected {len(task_ids)} tasks, found {len(run.get('tasks', []))}")

    return errors


def main() -> None:
    manifest = load_json(MANIFEST_PATH)
    before = load_json(BEFORE_PATH)
    after = load_json(AFTER_PATH)

    tasks = manifest.get("tasks", [])
    if not (10 <= len(tasks) <= 20):
        raise SystemExit(f"FAIL: benchmark task count must be 10-20, got {len(tasks)}")

    categories = {t.get("category") for t in tasks}
    required_categories = set(manifest.get("required_categories", []))
    missing_categories = required_categories - categories
    if missing_categories:
        raise SystemExit(f"FAIL: missing required categories: {sorted(missing_categories)}")

    task_ids = {t.get("id") for t in tasks}
    errors = []
    errors.extend(validate_run(before, task_ids, "before"))
    errors.extend(validate_run(after, task_ids, "after"))

    if errors:
        print("FAIL")
        for err in errors:
            print(f"- {err}")
        raise SystemExit(1)

    print("PASS")


if __name__ == "__main__":
    main()
