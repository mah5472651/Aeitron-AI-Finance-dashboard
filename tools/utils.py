"""Shared utilities for WAT framework tools."""

import json
import sys
import os
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv

# Load .env from project root
PROJECT_ROOT = Path(__file__).resolve().parent.parent
load_dotenv(PROJECT_ROOT / ".env")

TMP_DIR = PROJECT_ROOT / ".tmp"


def ensure_tmp_dir(*subdirs):
    """Create and return a .tmp subdirectory path."""
    path = TMP_DIR.joinpath(*subdirs)
    path.mkdir(parents=True, exist_ok=True)
    return path


def read_json_input():
    """Read JSON from stdin or from a file path passed as first argument."""
    if len(sys.argv) > 1:
        filepath = sys.argv[1]
        with open(filepath, "r", encoding="utf-8") as f:
            return json.load(f)
    else:
        return json.load(sys.stdin)


def write_json_output(data):
    """Write JSON result to stdout."""
    json.dump(data, sys.stdout, indent=2, default=str)
    print()


def format_currency(amount):
    """Format a number as USD currency string."""
    return f"${amount:,.2f}"


def format_date(date_str):
    """Parse and format a date string."""
    if not date_str:
        return "N/A"
    try:
        dt = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
        return dt.strftime("%b %d, %Y")
    except (ValueError, AttributeError):
        return str(date_str)


def timestamp_filename(prefix, extension):
    """Generate a timestamped filename."""
    ts = datetime.now().strftime("%Y-%m-%d_%H%M%S")
    return f"{prefix}_{ts}.{extension}"


def get_env(key, default=None):
    """Get an environment variable with optional default."""
    return os.getenv(key, default)
