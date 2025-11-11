from flask import jsonify, request, url_for
from passlib.hash import pbkdf2_sha256
import uuid
import datetime
import jwt
import smtplib
from email.message import EmailMessage
from email.mime.text import MIMEText
from pymongo import MongoClient

# MongoDB Configuration
client = MongoClient('mongodb://localhost:27017/')  # Ensure correct hostname
db = client["heart_echo_db"]  # Reference database
# from app import db, app  # Import MongoDB instance and Flask app



SECRET_KEY = "FOLLOW_YOUR_HEART"  # Change this to a secure secret key

class User:
    def signup(self):
        data = request.get_json()
        
        if not data or not all(k in data for k in ("email", "password")):
            return jsonify({"error": "Missing required fields"}), 400
        
        if db.users.find_one({"email": data["email"]}):
            return jsonify({"error": "Email already registered"}), 400
        
        if "@" not in data["email"]:
            return jsonify({"error": "Wrong email format"}), 400
        username = data["email"].split("@")[0]
        user = {
            "_id": str(uuid.uuid4()),
            "username": username,
            "email": data["email"],
            "password": pbkdf2_sha256.hash(data["password"])
        }

        db.users.insert_one(user)
        
        return jsonify({"message": "User registered successfully"}), 201

    def signin(self):
        data = request.json
        user = db.users.find_one({"email": data["email"]})

        if not user or not pbkdf2_sha256.verify(data["password"], user["password"]):
            return jsonify({"error": "Invalid email or password"}), 401

        # Generate JWT token (valid for 1 hour)
        token = jwt.encode(
            {"email": user["email"], "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=1)},
            SECRET_KEY,
            algorithm="HS256"
        )

        # Return the token and the email
        return jsonify({"token": token, "email": user["email"]}), 200

    def forgot_password(self):
        data = request.json
        user = db.users.find_one({"email": data["email"]})

        if not user:
            return jsonify({"error": "User not found"}), 404
        
        # Generate a token valid for 1 hour
        token = jwt.encode(
            {"email": user["email"], "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=1)},
            SECRET_KEY,
            algorithm="HS256"
        )
        
        reset_link = f"http://localhost:5173/reset-password?token={token}"
        
        # Send reset email (using SMTP)
        if self.send_reset_email(user["email"], reset_link):
            return jsonify({"message": "Password reset email sent"}), 200
        else:
            return jsonify({"error": "Failed to send email"}), 500

    # @user_bp.route('/reset_password', methods=['POST'], endpoint='reset_password')
    def reset_password(self):
        token = request.json.get("token")
        data = request.json

        try:
            decoded_token = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            email = decoded_token["email"]
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token has expired"}), 400
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 400

        user = db.users.find_one({"email": email})
        if not user:
            return jsonify({"error": "User not found"}), 404

        new_password = pbkdf2_sha256.hash(data["password"])
        db.users.update_one({"email": email}, {"$set": {"password": new_password}})

        return jsonify({"message": "Password reset successful"}), 200

    def send_reset_email(self, recipient_email, reset_link):
        EMAIL_ADDRESS = "heartechoproject@gmail.com"
        EMAIL_PASSWORD = "zrjh qykz reuq kpcr"
        TO_EMAIL = recipient_email

        subject = "Heartecho - Password Reset Request"
        body = f"Click the link to reset your password:\n\n{reset_link}"

        msg = MIMEText(body)
        msg['From'] = EMAIL_ADDRESS
        msg['To'] = TO_EMAIL
        msg['Subject'] = subject

        try:
            # Connect to Gmail’s SMTP server (TLS)
            with smtplib.SMTP("smtp.gmail.com", 587) as server:
                server.ehlo()  # Can be omitted, but good practice
                server.starttls()  # Upgrade the connection to secure TLS
                server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
                server.send_message(msg)
                print("Email sent successfully!")

            return True
        except Exception as e:
            print("Error sending email:", e)
            return False
        
    def get_profile(self, user_email):
        """Fetch user profile details."""
        print(f"Fetching profile for email: {user_email}")  # Debugging line

        user = db.users.find_one({"email": user_email}, {"_id": 0, "email": 1, "username": 1})
        
        if not user:
            print("User not found in MongoDB")  # Debugging line
            return jsonify({"error": "User not found"}), 404

        return jsonify(user), 200
