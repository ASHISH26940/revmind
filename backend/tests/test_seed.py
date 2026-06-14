from pathlib import Path
import sqlite3

import pytest

from seed import seed, DB_PATH, TABLE_NAME, CSV_PATH


def test_seed_database_exists():
    assert DB_PATH.exists(), "Database file not found — run `uv run python backend/seed.py` first"


def test_seed_table_has_1000_rows():
    conn = sqlite3.connect(str(DB_PATH))
    count = conn.execute(f"SELECT COUNT(*) FROM {TABLE_NAME}").fetchone()[0]
    conn.close()
    assert count == 1000, f"Expected 1000 rows, got {count}"


def test_seed_idempotent():
    """Running seed() on an already-seeded DB should not crash or duplicate rows."""
    before = _row_count()
    seed()
    after = _row_count()
    assert after == before, f"Row count changed after re-seed: {before} -> {after}"


def test_seed_columns_present():
    conn = sqlite3.connect(str(DB_PATH))
    cols = [r[1] for r in conn.execute(f"PRAGMA table_info({TABLE_NAME})").fetchall()]
    conn.close()
    expected = {"transaction_id", "date", "sku", "product_name", "category",
                "region", "channel", "sales_rep", "net_revenue_usd", "gross_profit_usd"}
    assert expected.issubset(set(cols)), f"Missing columns: {expected - set(cols)}"


def test_seed_data_integrity():
    """Spot-check: total net revenue should be ~$1.29M range for 1000 rows."""
    conn = sqlite3.connect(str(DB_PATH))
    total = conn.execute(f"SELECT SUM(net_revenue_usd) FROM {TABLE_NAME}").fetchone()[0]
    conn.close()
    assert 1_200_000 < total < 1_400_000, f"Total revenue ${total:,.2f} out of expected range"


def test_seed_total_units_positive():
    conn = sqlite3.connect(str(DB_PATH))
    total = conn.execute(f"SELECT SUM(units_sold) FROM {TABLE_NAME}").fetchone()[0]
    conn.close()
    assert total > 0, "Total units should be positive"


def _row_count() -> int:
    conn = sqlite3.connect(str(DB_PATH))
    count = conn.execute(f"SELECT COUNT(*) FROM {TABLE_NAME}").fetchone()[0]
    conn.close()
    return count
