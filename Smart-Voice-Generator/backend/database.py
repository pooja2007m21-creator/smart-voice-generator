import os
import sqlite3

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "database.db")


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    with get_db() as db:
        db.execute(
            """CREATE TABLE IF NOT EXISTS history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                text TEXT NOT NULL,
                voice TEXT,
                rate REAL DEFAULT 1,
                pitch REAL DEFAULT 1,
                words INTEGER DEFAULT 0,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP)"""
        )
