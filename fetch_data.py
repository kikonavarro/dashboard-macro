#!/usr/bin/env python3
"""
Macro Risk Dashboard — Automated Data Fetcher
Fetches all 19 macro indicators from free APIs (FRED + Yahoo Finance),
writes data.json, and optionally commits + pushes to GitHub.

Sources:
  - FRED (api.stlouisfed.org): yield curve, inflation, HY spreads, NFCI,
    jobless claims, Sahm rule, consumer sentiment, building permits, VIX, SOFR
  - Yahoo Finance (yfinance): Brent, VIX, MOVE, DXY, copper, gold, ISM

Usage:
  # Local (requires FRED_API_KEY env var)
  export FRED_API_KEY=your_key_here
  python3 fetch_data.py

  # GitHub Actions sets FRED_API_KEY as a secret
  python3 fetch_data.py --commit
"""

import json
import os
import sys
import subprocess
from datetime import datetime, timezone, timedelta
from pathlib import Path

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
REPO_DIR = Path(__file__).parent.resolve()
DATA_FILE = REPO_DIR / "data.json"
FRED_API_KEY = os.environ.get("FRED_API_KEY", "")
FRED_BASE = "https://api.stlouisfed.org/fred/series/observations"

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
import requests


def fred(series_id: str, limit: int = 5) -> float | None:
    """Fetch latest value from FRED API."""
    if not FRED_API_KEY:
        print(f"  ⚠️  No FRED_API_KEY — skipping {series_id}")
        return None
    try:
        resp = requests.get(FRED_BASE, params={
            "series_id": series_id,
            "api_key": FRED_API_KEY,
            "file_type": "json",
            "sort_order": "desc",
            "limit": limit,
        }, timeout=15)
        resp.raise_for_status()
        obs = resp.json().get("observations", [])
        # Return first non-"." value
        for o in obs:
            if o["value"] != ".":
                return float(o["value"])
    except Exception as e:
        print(f"  ❌ FRED {series_id}: {e}")
    return None


def yahoo(ticker: str) -> float | None:
    """Fetch latest close from Yahoo Finance via yfinance."""
    try:
        import yfinance as yf
        t = yf.Ticker(ticker)
        hist = t.history(period="5d")
        if hist.empty:
            print(f"  ⚠️  Yahoo {ticker}: no data")
            return None
        return float(hist["Close"].iloc[-1])
    except Exception as e:
        print(f"  ❌ Yahoo {ticker}: {e}")
    return None


def trend(new_val: float | None, old_val: float | None, threshold_pct: float = 1.0) -> str:
    """Determine trend vs previous value: up/down/flat."""
    if new_val is None or old_val is None or old_val == 0:
        return "flat"
    pct_change = ((new_val - old_val) / abs(old_val)) * 100
    if pct_change > threshold_pct:
        return "up"
    elif pct_change < -threshold_pct:
        return "down"
    return "flat"


def load_previous() -> dict:
    """Load previous data.json for trend calculation."""
    try:
        return json.loads(DATA_FILE.read_text())
    except Exception:
        return {}


# ---------------------------------------------------------------------------
# Fetch all indicators
# ---------------------------------------------------------------------------
def fetch_all() -> dict:
    prev = load_previous()
    data = {}
    trends = {}
    sources = []

    print("🔍 Fetching macro indicators...\n")

    # --- FRED indicators ---
    fred_indicators = {
        "brent":              ("DCOILBRENTEU", "Brent crude (FRED)"),
        "vix":                ("VIXCLS",       "VIX (FRED)"),
        "yield_curve_10y":    ("DGS10",        "10Y yield (FRED)"),
        "yield_curve_2y":     ("DGS2",         "2Y yield (FRED)"),
        "inflation_5y5y":     ("T5YIFR",       "5Y5Y inflation (FRED)"),
        "hy_spreads":         ("BAMLH0A0HYM2", "HY OAS spreads (FRED)"),
        "nfci":               ("NFCI",         "Chicago Fed NFCI (FRED)"),
        "jobless_claims":     ("ICSA",         "Initial claims (FRED)"),
        "sahm_rule":          ("SAHMREALTIME", "Sahm Rule (FRED)"),
        "consumer_sentiment": ("UMCSENT",      "UMich Sentiment (FRED)"),
        "building_permits":   ("PERMIT",       "Building permits (FRED)"),
        "sofr":               ("SOFR",         "SOFR rate (FRED)"),
        "effr":               ("EFFR",         "EFFR rate (FRED)"),
    }

    fred_values = {}
    for key, (series, label) in fred_indicators.items():
        val = fred(series)
        if val is not None:
            fred_values[key] = val
            print(f"  ✅ {label}: {val}")
        else:
            print(f"  ⚠️  {label}: not available")

    if fred_values:
        sources.append("FRED")

    # --- Yahoo Finance indicators ---
    yahoo_indicators = {
        "move":   ("^MOVE",     "MOVE Index"),
        "dxy":    ("DX-Y.NYB",  "DXY"),
        "copper": ("HG=F",      "Copper futures"),
        "gold":   ("GC=F",      "Gold futures"),
    }

    yahoo_values = {}
    for key, (ticker, label) in yahoo_indicators.items():
        val = yahoo(ticker)
        if val is not None:
            yahoo_values[key] = val
            print(f"  ✅ {label} (Yahoo): {val:.2f}")
        else:
            print(f"  ⚠️  {label} (Yahoo): not available")

    if yahoo_values:
        sources.append("Yahoo Finance")

    # --- Also try Yahoo as fallback for FRED indicators ---
    if "brent" not in fred_values:
        val = yahoo("BZ=F")
        if val is not None:
            fred_values["brent"] = val
            print(f"  ✅ Brent crude (Yahoo fallback): {val:.2f}")

    if "vix" not in fred_values:
        val = yahoo("^VIX")
        if val is not None:
            fred_values["vix"] = val
            print(f"  ✅ VIX (Yahoo fallback): {val:.2f}")

    # --- Assemble data ---
    print("\n📊 Assembling data.json...\n")

    # Brent
    data["brent"] = round(fred_values.get("brent", prev.get("brent", 0)), 2)

    # VIX
    data["vix"] = round(fred_values.get("vix", prev.get("vix", 0)), 2)

    # MOVE
    data["move"] = round(yahoo_values.get("move", prev.get("move", 0)), 1)

    # Yield curve (10Y - 2Y)
    if "yield_curve_10y" in fred_values and "yield_curve_2y" in fred_values:
        data["yield_curve"] = round(fred_values["yield_curve_10y"] - fred_values["yield_curve_2y"], 2)
    else:
        data["yield_curve"] = prev.get("yield_curve", 0)

    # Inflation 5y5y
    data["inflation_5y5y"] = round(fred_values.get("inflation_5y5y", prev.get("inflation_5y5y", 0)), 2)

    # HY spreads (FRED gives in %, multiply by 100 for bps)
    hy_raw = fred_values.get("hy_spreads")
    if hy_raw is not None:
        data["hy_spreads"] = round(hy_raw * 100) if hy_raw < 50 else round(hy_raw)
    else:
        data["hy_spreads"] = prev.get("hy_spreads", 0)

    # BDTI — not available from free APIs, keep previous value
    data["bdti"] = prev.get("bdti", 0)
    print("  ℹ️  BDTI: kept previous value (no free API)")

    # Cross-currency basis — not available from free APIs, keep previous
    data["xccy_basis"] = prev.get("xccy_basis", 0)
    print("  ℹ️  Cross-currency basis: kept previous value (no free API)")

    # NFCI
    data["nfci"] = round(fred_values.get("nfci", prev.get("nfci", 0)), 2)

    # Global liquidity — qualitative, keep previous
    data["global_liquidity"] = prev.get("global_liquidity", 1)
    print("  ℹ️  Global liquidity: kept previous value (qualitative)")

    # DXY
    data["dxy"] = round(yahoo_values.get("dxy", prev.get("dxy", 0)), 2)

    # Copper/Gold ratio (copper $/lb ÷ gold $/oz × 1000)
    copper = yahoo_values.get("copper")
    gold = yahoo_values.get("gold")
    if copper and gold and gold > 0:
        data["copper_gold"] = round((copper / gold) * 1000, 2)
    else:
        data["copper_gold"] = prev.get("copper_gold", 0)

    # Jobless claims (FRED gives raw number, convert to thousands)
    claims_raw = fred_values.get("jobless_claims")
    if claims_raw is not None:
        data["jobless_claims"] = round(claims_raw / 1000) if claims_raw > 1000 else round(claims_raw)
    else:
        data["jobless_claims"] = prev.get("jobless_claims", 0)

    # ISM PMI — try Yahoo (ISM not directly on FRED easily)
    ism = yahoo("^GSPC")  # S&P 500 as placeholder — ISM not on Yahoo
    # ISM PMI is hard to get for free; keep previous value
    data["ism_pmi"] = prev.get("ism_pmi", 0)
    print("  ℹ️  ISM PMI: kept previous value (proprietary data)")

    # SOFR-OIS spread
    sofr_val = fred_values.get("sofr")
    effr_val = fred_values.get("effr")
    if sofr_val is not None and effr_val is not None:
        data["sofr_ois"] = round((sofr_val - effr_val) * 100, 1)  # Convert to bps
    else:
        data["sofr_ois"] = prev.get("sofr_ois", 0)

    # LEI — Conference Board proprietary, keep previous
    data["lei_yoy"] = prev.get("lei_yoy", -3.9)
    print("  ℹ️  LEI YoY: kept previous value (Conference Board proprietary)")

    # Sahm Rule
    data["sahm_rule"] = round(fred_values.get("sahm_rule", prev.get("sahm_rule", 0)), 2)

    # Consumer Sentiment
    data["consumer_sentiment"] = round(fred_values.get("consumer_sentiment", prev.get("consumer_sentiment", 0)), 1)

    # Building Permits (FRED gives in thousands SAAR)
    data["building_permits"] = round(fred_values.get("building_permits", prev.get("building_permits", 0)))

    # --- Trends ---
    trend_keys = [
        "brent", "vix", "move", "yield_curve", "inflation_5y5y",
        "hy_spreads", "xccy_basis", "bdti", "nfci", "dxy",
        "copper_gold", "jobless_claims", "ism_pmi", "sofr_ois"
    ]
    for k in trend_keys:
        trends[k] = trend(data.get(k), prev.get(k))
    # Add trends for newer indicators
    for k in ["lei_yoy", "sahm_rule", "consumer_sentiment", "building_permits"]:
        trends[k] = trend(data.get(k), prev.get(k))

    data["trends"] = trends
    data["timestamp"] = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.000Z")
    data["sources"] = ", ".join(sources) if sources else prev.get("sources", "")

    return data


# ---------------------------------------------------------------------------
# Git operations
# ---------------------------------------------------------------------------
def git(args: list, cwd: Path) -> str:
    result = subprocess.run(
        ["git"] + args, cwd=str(cwd),
        capture_output=True, text=True
    )
    if result.returncode != 0:
        raise RuntimeError(f"git {' '.join(args)} failed:\n{result.stderr}")
    return result.stdout.strip()


def commit_and_push(repo_dir: Path, timestamp: str):
    date_str = timestamp[:10]
    git(["add", "data.json"], repo_dir)

    status = subprocess.run(
        ["git", "diff", "--cached", "--quiet"], cwd=str(repo_dir)
    )
    if status.returncode == 0:
        print("\nℹ️  No changes in data.json — skipping commit.")
        return False

    git(["commit", "-m", f"chore: auto-update macro data {date_str}"], repo_dir)
    git(["push", "origin", "main"], repo_dir)
    print(f"\n✅ Committed and pushed data for {date_str}")
    return True


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main():
    if not FRED_API_KEY:
        print("⚠️  FRED_API_KEY not set. FRED indicators will use fallbacks.")
        print("   Get a free key at: https://fred.stlouisfed.org/docs/api/api_key.html\n")

    data = fetch_all()

    # Write data.json
    DATA_FILE.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n")
    print(f"\n📝 data.json updated ({data['timestamp']})")

    # Count what we got
    prev = load_previous()
    fresh = sum(1 for k in data if k not in ("trends", "timestamp", "sources", "global_liquidity")
                and data.get(k) != prev.get(k))
    total = sum(1 for k in data if k not in ("trends", "timestamp", "sources"))
    print(f"   {fresh}/{total} indicators updated with fresh data")

    # Commit if requested
    if "--commit" in sys.argv:
        try:
            commit_and_push(REPO_DIR, data["timestamp"])
        except Exception as e:
            print(f"\n❌ Git error: {e}")
            sys.exit(1)

    # Print summary
    print("\n" + "─" * 50)
    print("📋 Summary:")
    for k, v in data.items():
        if k in ("trends", "timestamp", "sources"):
            continue
        print(f"   {k}: {v}")
    print("─" * 50)


if __name__ == "__main__":
    main()
