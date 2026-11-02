from flask import Flask, jsonify
from flask_cors import CORS
from pymongo import MongoClient
import os
from pymongo.errors import PyMongoError
# import logging
# logging.basicConfig(level=logging.DEBUG)



app = Flask(__name__)
CORS(app)

# MongoDB Configuration
# client = MongoClient('mongodb://localhost:27017/')  # Ensure correct hostname
mongo_uri = os.environ["MONGO_URI"]
client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
db = client["heart_echo_db"]  # Reference database


# Routes
from user.routes import user_bp
from post_comment.routes import post_bp, comment_bp, notification_bp

# Register Blueprints
app.register_blueprint(user_bp, url_prefix="/user")
app.register_blueprint(post_bp, url_prefix="/post")
app.register_blueprint(comment_bp, url_prefix="/comment")
app.register_blueprint(notification_bp, url_prefix="/notification")

@app.route('/')
def home():
    return "Welcome to the Flask app!"

@app.route("/health/live", methods=["GET"])
def health_live():
    return jsonify({"status": "alive"}), 200


@app.route("/health/ready", methods=["GET"])
def health_ready():
    try:
        client.admin.command("ping")
        return jsonify({"status": "ready"}), 200
    except PyMongoError:
        return jsonify({"status": "not ready"}), 503

if __name__ == "__main__":
    app.run(debug=True)
