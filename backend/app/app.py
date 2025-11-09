from flask import Flask
from flask_cors import CORS
from pymongo import MongoClient
# import logging
# logging.basicConfig(level=logging.DEBUG)



app = Flask(__name__)
CORS(app)

# MongoDB Configuration
client = MongoClient('mongodb://localhost:27017/')  # Ensure correct hostname
db = client["heart_echo_db"]  # Reference database


# Routes
from user.routes import user_bp
from post_comment.routes import post_bp, comment_bp

# Register Blueprints
app.register_blueprint(user_bp, url_prefix="/user")
app.register_blueprint(post_bp, url_prefix="/post")
app.register_blueprint(comment_bp, url_prefix="/comment")

@app.route('/')
def home():
    return "Welcome to the Flask app!"

if __name__ == "__main__":
    app.run(debug=True)
