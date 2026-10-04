# Smart Voice Generator – Text-to-Speech Application

Flask + SQLite backend, vanilla HTML/CSS/JS frontend, browser Web Speech API for speech.

## Run (VS Code)
```
python -m venv venv
venv\Scripts\activate        # macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
python app.py
```
Open http://127.0.0.1:5000 in Chrome or Edge.

## API
| Method | Route | Purpose |
|---|---|---|
| POST | /api/analyze | Text statistics |
| GET / POST | /api/history | List / save a speech request |
| DELETE | /api/history/<id> | Delete one entry |
| DELETE | /api/history | Clear all |

## Notes
- Voices come from the browser/OS, so the list differs per device.
- Browsers do not expose Web Speech audio as a file. "Download audio" records the tab's audio through screen-share capture (Chrome/Edge desktop: choose "This tab" and tick "Share tab audio").
