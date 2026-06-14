from pathlib import Path

import pandas as pd
import sqlite3

DB_PATH = Path(__file__).parent / "novabite.db"
CSV_PATH = Path(__file__).parent.parent / "data" / "novabite_sales_data.csv"
TABLE_NAME = "sales"


def seed() -> None:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)

    conn = sqlite3.connect(str(DB_PATH))
    cursor = conn.cursor()

    cursor.execute(
        f"SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name='{TABLE_NAME}'"
    )
    if cursor.fetchone()[0]:
        cursor.execute(f"SELECT COUNT(*) FROM {TABLE_NAME}")
        count = cursor.fetchone()[0]
        print(f"Already seeded — {count} rows in '{TABLE_NAME}'")
        conn.close()
        return

    df = pd.read_csv(CSV_PATH)
    df.to_sql(TABLE_NAME, conn, if_exists="replace", index=False)

    cursor.execute(f"SELECT COUNT(*) FROM {TABLE_NAME}")
    count = cursor.fetchone()[0]
    print(f"Seeded {count} rows into '{TABLE_NAME}' at {DB_PATH}")
    conn.close()


if __name__ == "__main__":
    seed()
