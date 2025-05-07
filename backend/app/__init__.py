from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from pymongo import MongoClient
from app.config import Config
import os
jwt = JWTManager()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize JWT and CORS
    
    jwt.init_app(app)
    CORS(app)
    from flask_jwt_extended import JWTManager

    @jwt.invalid_token_loader
    def invalid_token_callback(reason):
        print('❌ INVALID TOKEN:', reason)
        return jsonify({"msg": "Invalid token", "reason": reason}), 422

    @jwt.unauthorized_loader
    def missing_token_callback(reason):
        print('❌ MISSING TOKEN:', reason)
        return jsonify({"msg": "Missing token", "reason": reason}), 401


    # Set up MongoDB with PyMongo directly
    mongo_uri = app.config.get("MONGO_URI", "mongodb://localhost:27017/")
    client = MongoClient(mongo_uri)
    db_name = app.config.get("MONGO_DBNAME", "yourdbname")  # Set this in Config
    app.db = client[db_name]

    # Register blueprints
    from app.auth.routes import auth
    from app.api.faculty_routes import faculty_bp
    from app.api.student_routes import student_bp
    from app.api.collaboration_routes import collaboration_bp

    app.register_blueprint(auth, url_prefix='/api/auth')
    app.register_blueprint(faculty_bp, url_prefix='/api')
    app.register_blueprint(student_bp, url_prefix='/api')
    app.register_blueprint(collaboration_bp, url_prefix='/api')

    return app
