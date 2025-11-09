from flask import Flask, request, jsonify, Blueprint
from user.models import User

user_bp = Blueprint('user', __name__)

@user_bp.route('/signup', methods=['POST'])
def signup():
    return User().signup()

@user_bp.route('/signin', methods=['POST'])
def signin():
    return User().signin()

@user_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    return User().forgot_password()

@user_bp.route('/reset', methods=['POST'])
def reset_password():
    return User().reset_password()

@user_bp.route('/profile', methods=['GET'])
def get_user_profile():
    user_email = request.headers.get("User-Email")

    if not user_email:
        return jsonify({"error": "User email is required"}), 400

    return User().get_profile(user_email)