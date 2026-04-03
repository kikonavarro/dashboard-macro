#!/usr/bin/env python3
"""
Macro Risk Dashboard — Data Writer
Receives macro data as a JSON string via stdin or first argument,
validates it, writes to data.json, and commits + pushes to GitHub.

Usage:
  echo '<json>' | python3 update_data.py
  python3 update_data.py '<json>'

This script does NOT fetch data — fetching is done by the Cowork session
using web search tools, then the result is passed to this script.
"""

import json
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

# ─────────────────────────────────────────────
# CONFIG
# ─────────────────────────────────────────────
REPO_DIR = Path(__file__).parent.resolve()
DATA_FILE = REPO_DIR / "data.json"

REQUIRED_KEYS = [
    "brent", "vix", "move", "yield_curve", "inflation_5y5y",
    "hy_spreads", "bdti", "xccy_basis", "nfci", "global_liquidity",
    "dxy", "copper_gold", "jobless_claims", "ism_pmi", "sofr_ois",
    "trends", "timestamp", "sources"
]

# ─────────────────────────────────────────────
# GIT OPERATIONS
# ─────────────────────────────────────────────
def git(args: list, cwd: Path) -> str:
    result = subprocess.run(
        ["git"] + args,
        cwd=str(cwd),
        capture_output=True,
        text=True
    )
    if result.returncode != 0:
        raise RuntimeError(f"git {' '.join(args)} failed:\n{result.stderr}")
    return result.stdout.strip()


def commit_and_push(repo_dir: Path, timestamp: str):
    date_str = timestamp[:10]  # YYYY-MM-DD
    git(["add", "data.json"], repo_dir)

    # Check if there are actual changes to commit
    status = subprocess.run(
        ["git", "diff", "--cached", "--quiet"],
        cwd=str(repo_dir)
    )
    if status.returncode == 0:
        print("ℹ️  No changes detected in data.json — skipping commit.")
        return False

    git(["commit", "-m", f"chore: update macro data {date_str}"], repo_dir)
    git(["push", "origin", "main"], repo_dir)
    print(f"✅ Committed and pushed data for {date_str}")
    return True


# ─────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────
def main():
    # Read JSON from argument or stdin
    if len(sys.argv) > 1:
        raw = sys.argv[1]
    else:
        raw = sys.stdin.read()

    raw = raw.strip()

    # Strip markdown fences if present
    if raw.startswith("```"):
        lines = raw.split("\n")
        raw = "\n".join(lines[1:-1] if lines[-1].strip() == "```" else lines[1:])
    raw = raw.strip()

    try:
        data = json.loads(raw)
    except json.JSONDecodeError as e:
        print(f"❌ Invalid JSON: {e}")
        print(f"   Raw input was:\n{raw[:500]}")
        sys.exit(1)

    # Validate required keys
    missing = [k for k in REQUIRED_KEYS if k not in data]
    if missing:
        print(f"⚠️  Missing keys in data: {missing}")
        print("   Proceeding anyway with available data...")

    # Ensure timestamp
    if "timestamp" not in data:
        data["timestamp"] = datetime.now(timezone.utc).isoformat()

    # Write data.json
    DATA_FILE.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n")
    print(f"📝 data.json updated (timestamp: {data.get('timestamp', 'unknown')})")

    # Commit and push
    try:
        commit_and_push(REPO_DIR, data.get("timestamp", datetime.now().isoformat()))
    except Exception as e:
        print(f"❌ Git error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
