from pathlib import Path
import sqlite3

DB_PATH = Path(__file__).parent.parent / "novabite.db"


def get_db() -> sqlite3.Connection:
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn
