"""
Run the full Nifty 100 data pipeline end-to-end.

Usage:
    python run_pipeline.py
    python run_pipeline.py --skip-extract
    python run_pipeline.py --load-postgres
"""

from __future__ import annotations

import argparse
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parent
PYTHON = sys.executable


def run_step(script: str, extra_args: list[str] | None = None) -> None:
    command = [PYTHON, str(ROOT / script), *(extra_args or [])]
    print(f"\n>>> {' '.join(command)}")
    subprocess.run(command, cwd=ROOT, check=True)


def main() -> None:
    parser = argparse.ArgumentParser(description="Run Nifty 100 ETL + ML pipeline")
    parser.add_argument("--skip-extract", action="store_true", help="Reuse existing data/raw CSV files")
    parser.add_argument("--load-postgres", action="store_true", help="Load warehouse tables into PostgreSQL")
    args = parser.parse_args()

    if not args.skip_extract:
        run_step("etl/01_extract_from_mysql.py")
    run_step("etl/02_clean_and_transform.py")
    if args.load_postgres:
        run_step("etl/03_load_to_warehouse.py")
    run_step("ml/generate_ml_scores.py", ["--csv-only"] if not args.load_postgres else ["--postgres"])
    run_step("powerbi/export_for_powerbi.py")
    print("\nPipeline complete.")


if __name__ == "__main__":
    main()
