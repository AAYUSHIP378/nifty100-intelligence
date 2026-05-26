"""
Extract raw Nifty 100 tables from a MariaDB/MySQL dump into CSV files.

The project data is sometimes supplied as a SQL dump and sometimes as Excel
exports. This script supports both so the pipeline remains runnable with the
files currently present in the repository.
"""

from __future__ import annotations

import argparse
import ast
import csv
import re
from pathlib import Path
from typing import Iterable

import pandas as pd


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_SQL = ROOT / "scriptticker.sql"
DEFAULT_EXCEL_DIR = ROOT / "n100"
RAW_DIR = ROOT / "data" / "raw"

TABLES = [
    "companies",
    "analysis",
    "balancesheet",
    "profitandloss",
    "cashflow",
    "prosandcons",
    "documents",
]


def _split_insert_rows(values_sql: str) -> list[str]:
    rows: list[str] = []
    depth = 0
    start = None
    in_quote = False
    escape = False

    for index, char in enumerate(values_sql):
        if escape:
            escape = False
            continue
        if char == "\\":
            escape = True
            continue
        if char == "'":
            in_quote = not in_quote
            continue
        if in_quote:
            continue
        if char == "(":
            if depth == 0:
                start = index
            depth += 1
        elif char == ")":
            depth -= 1
            if depth == 0 and start is not None:
                rows.append(values_sql[start : index + 1])
                start = None
    return rows


def _parse_sql_row(row_sql: str) -> list[object]:
    text = row_sql.strip()[1:-1]
    text = re.sub(r"\bNULL\b", "None", text, flags=re.IGNORECASE)
    text = text.replace("\\'", "'").replace('\\"', '"')
    return list(ast.literal_eval(f"({text},)"))


def _extract_table(sql_text: str, table: str) -> pd.DataFrame:
    pattern = re.compile(
        rf"INSERT\s+INTO\s+`?{re.escape(table)}`?\s*"
        rf"(?:\((?P<columns>.*?)\))?\s*VALUES\s*(?P<values>.*?);",
        flags=re.IGNORECASE | re.DOTALL,
    )
    frames: list[pd.DataFrame] = []

    for match in pattern.finditer(sql_text):
        columns_text = match.group("columns")
        columns = None
        if columns_text:
            columns = [col.strip().strip("`") for col in columns_text.split(",")]
        rows = [_parse_sql_row(row) for row in _split_insert_rows(match.group("values"))]
        frames.append(pd.DataFrame(rows, columns=columns))

    if not frames:
        return pd.DataFrame()
    return pd.concat(frames, ignore_index=True)


def extract_from_sql(sql_path: Path, output_dir: Path) -> None:
    sql_text = sql_path.read_text(encoding="utf-8", errors="replace")
    output_dir.mkdir(parents=True, exist_ok=True)

    for table in TABLES:
        df = _extract_table(sql_text, table)
        df.to_csv(output_dir / f"{table}.csv", index=False, quoting=csv.QUOTE_MINIMAL)
        print(f"{table}: {len(df)} rows, columns={list(df.columns)}")


def extract_from_excel(excel_dir: Path, output_dir: Path) -> None:
    output_dir.mkdir(parents=True, exist_ok=True)
    for table in TABLES:
        path = excel_dir / f"{table}.xlsx"
        if not path.exists():
            print(f"{table}: missing {path.name}")
            continue
        df = pd.read_excel(path)
        first_col = str(df.columns[0])
        if not df.empty and (first_col.startswith("Unnamed") or "records" in first_col.lower()):
            df.columns = df.iloc[0]
            df = df.iloc[1:].reset_index(drop=True)
        df.to_csv(output_dir / f"{table}.csv", index=False, quoting=csv.QUOTE_MINIMAL)
        print(f"{table}: {len(df)} rows, columns={list(df.columns)}")


def main(argv: Iterable[str] | None = None) -> None:
    parser = argparse.ArgumentParser(description="Extract raw N100 source tables.")
    parser.add_argument("--sql", type=Path, default=DEFAULT_SQL)
    parser.add_argument("--excel-dir", type=Path, default=DEFAULT_EXCEL_DIR)
    parser.add_argument("--out", type=Path, default=RAW_DIR)
    args = parser.parse_args(argv)

    if args.sql.exists():
        extract_from_sql(args.sql, args.out)
    else:
        print(f"SQL dump not found at {args.sql}; using Excel exports from {args.excel_dir}.")
        extract_from_excel(args.excel_dir, args.out)


if __name__ == "__main__":
    main()
