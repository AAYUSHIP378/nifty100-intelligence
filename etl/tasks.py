import subprocess
import sys
from pathlib import Path

from config.celery import app


ROOT = Path(__file__).resolve().parents[1]


@app.task
def refresh_warehouse():
    """Run the full extract, transform, load, and ML refresh pipeline."""
    commands = [
        [sys.executable, str(ROOT / "etl" / "01_extract_from_mysql.py")],
        [sys.executable, str(ROOT / "etl" / "02_clean_and_transform.py")],
        [sys.executable, str(ROOT / "etl" / "03_load_to_warehouse.py")],
        [sys.executable, str(ROOT / "ml" / "generate_ml_scores.py")],
    ]
    for command in commands:
        subprocess.run(command, cwd=ROOT, check=True)
    return "warehouse refresh complete"
