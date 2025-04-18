from flask import Flask
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    CORS(app)

    # Register blueprints
    from app.routes.govscheme import govscheme_bp
    from app.routes.translate import translate_bp
    from app.routes.plant_disease import plant_disease_bp
    app.register_blueprint(govscheme_bp)
    app.register_blueprint(translate_bp)
    app.register_blueprint(plant_disease_bp)

    return app
