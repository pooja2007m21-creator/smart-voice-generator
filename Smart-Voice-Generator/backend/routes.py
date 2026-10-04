import re
from collections import Counter
from flask import Blueprint, jsonify, request
from . import models

api = Blueprint("api", __name__)
MAX_CHARS = 5000
STOP = set("the a an and or but of to in on at is are was were be it this that for with as by from".split())


def clean_text():
    data = request.get_json(silent=True) or {}
    text = (data.get("text") or "").strip()
    if not text:
        return None, (jsonify(error="Enter some text first."), 400)
    if len(text) > MAX_CHARS:
        return None, (jsonify(error=f"Text is limited to {MAX_CHARS} characters."), 400)
    return (text, data), None


@api.post("/analyze")
def analyze():
    res, err = clean_text()
    if err:
        return err
    text, _ = res
    words = re.findall(r"[\w']+", text.lower())
    sentences = [s for s in re.split(r"[.!?]+", text) if s.strip()]
    top = Counter(w for w in words if w not in STOP and len(w) > 2).most_common(5)
    return jsonify(
        characters=len(text), words=len(words), sentences=len(sentences),
        unique_words=len(set(words)), top_words=top,
        reading_minutes=round(len(words) / 200, 1), speaking_minutes=round(len(words) / 150, 1),
    )


@api.get("/history")
def history():
    return jsonify(models.list_entries())


@api.post("/history")
def add_history():
    res, err = clean_text()
    if err:
        return err
    text, d = res
    new_id = models.add_entry(text, d.get("voice", ""), float(d.get("rate", 1)), float(d.get("pitch", 1)))
    return jsonify(id=new_id), 201


@api.delete("/history/<int:entry_id>")
def delete_history(entry_id):
    models.delete_entry(entry_id)
    return "", 204


@api.delete("/history")
def clear_history():
    models.clear_entries()
    return "", 204
