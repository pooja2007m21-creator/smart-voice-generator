from .database import get_db


def add_entry(text, voice, rate, pitch):
    words = len(text.split())
    with get_db() as db:
        cur = db.execute(
            "INSERT INTO history (text, voice, rate, pitch, words) VALUES (?,?,?,?,?)",
            (text, voice, rate, pitch, words),
        )
        return cur.lastrowid


def list_entries(limit=100):
    with get_db() as db:
        rows = db.execute("SELECT * FROM history ORDER BY id DESC LIMIT ?", (limit,)).fetchall()
    return [dict(r) for r in rows]


def delete_entry(entry_id):
    with get_db() as db:
        db.execute("DELETE FROM history WHERE id = ?", (entry_id,))


def clear_entries():
    with get_db() as db:
        db.execute("DELETE FROM history")
