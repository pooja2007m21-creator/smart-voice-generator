from flask import Flask
from .database import init_db
from .routes import api


def create_app():
    app = Flask(__name__, static_folder="../frontend", static_url_path="")
    app.register_blueprint(api, url_prefix="/api")
    init_db()

    @app.route("/")
    def home():
        return app.send_static_file("index.html")

    return app
