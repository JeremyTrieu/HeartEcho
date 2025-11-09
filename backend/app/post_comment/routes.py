from flask import Blueprint, request, jsonify, Blueprint
from post_comment.models import Post, Comment
# from app import app
post_bp = Blueprint('post', __name__)
comment_bp = Blueprint('comment', __name__)

# Post routes
@post_bp.route('/create', methods=['POST'])
def create_post():
    user_email = request.headers.get("User-Email")  # Authenticated user email
    return Post().create_post(user_email)


@post_bp.route('/edit/<post_id>', methods=['PUT'])
def edit_post(post_id):
    user_email = request.headers.get("User-Email")
    return Post().edit_post(post_id, user_email)

@post_bp.route('/delete/<post_id>', methods=['DELETE'])
def delete_post(post_id):
    user_email = request.headers.get("User-Email")
    return Post().delete_post(post_id, user_email)

@post_bp.route('/my-posts', methods=['GET'])
def get_user_posts():
    user_email = request.headers.get("User-Email")
    return Post().get_user_posts(user_email)

@post_bp.route('/news-feed', methods=['GET'])
def get_news_feed():
    return Post().get_news_feed()

# Comment routes
@comment_bp.route('/add/<post_id>', methods=['POST'])
def add_comment(post_id):
    user_email = request.headers.get("User-Email")
    return Comment().add_comment(post_id, user_email)

@comment_bp.route('/delete/<post_id>/<comment_id>', methods=['DELETE'])
def delete_comment(post_id, comment_id):
    user_email = request.headers.get("User-Email")
    return Comment().delete_comment(post_id, comment_id, user_email)

@comment_bp.route('/react/<post_id>/<action>', methods=['POST'])
def react_to_post(post_id, action):
    return Comment().react_to_post(post_id, action)
