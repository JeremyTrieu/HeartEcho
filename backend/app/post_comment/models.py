from flask import jsonify, request
from passlib.hash import pbkdf2_sha256
import uuid
from datetime import datetime

from pymongo import MongoClient

# MongoDB Configuration
client = MongoClient('mongodb://localhost:27017/')
db = client["heart_echo_db"]

class Post:
    def create_post(self, user_email):
        """ Create a new post """
        data = request.json
        if not data.get("content"):
            return jsonify({"error": "Post content is required"}), 400

        # Get user's username
        user = db.users.find_one({"email": user_email})
        username = user.get("username") if user else user_email

        post = {
            "_id": str(uuid.uuid4()),
            "user_email": user_email,
            "username": username,
            "content": data["content"],
            "created_at": datetime.utcnow(),
            "likes": 0,
            "comments": []
        }

        db.posts.insert_one(post)
        return jsonify({"message": "Post created successfully", "post": post}), 201

    def edit_post(self, post_id, user_email):
        """ Edit an existing post """
        data = request.json
        post = db.posts.find_one({"_id": post_id, "user_email": user_email})

        if not post:
            return jsonify({"error": "Post not found or unauthorized"}), 404

        db.posts.update_one({"_id": post_id}, {"$set": {"content": data["content"]}})
        return jsonify({"message": "Post updated successfully"}), 200

    def delete_post(self, post_id, user_email):
        """ Delete a post """
        post = db.posts.find_one({"_id": post_id, "user_email": user_email})

        if not post:
            return jsonify({"error": "Post not found or unauthorized"}), 404

        db.posts.delete_one({"_id": post_id})
        return jsonify({"message": "Post deleted successfully"}), 200

    def get_user_posts(self, user_email):
        """ Get all posts of the logged-in user """
        posts = list(db.posts.find({"user_email": user_email}).sort("created_at", -1))
        return jsonify({"posts": posts}), 200

    def get_news_feed(self):
        """ Get posts from all users sorted by latest """
        posts = list(db.posts.find({}).sort("created_at", -1))
        return jsonify({"news_feed": posts}), 200

class Comment:
    def add_comment(self, post_id, user_email):
        """ Add a comment to a post """
        data = request.json
        if not data.get("content"):
            return jsonify({"error": "Comment content is required"}), 400

        # Get user's username
        user = db.users.find_one({"email": user_email})
        username = user.get("username") if user else user_email

        comment = {
            "_id": str(uuid.uuid4()),
            "user_email": user_email,
            "username": username,
            "content": data["content"],
            "created_at": datetime.utcnow()
        }

        db.posts.update_one({"_id": post_id}, {"$push": {"comments": comment}})

        # Get the post to find the post owner for notification
        post = db.posts.find_one({"_id": post_id})
        if post and post["user_email"] != user_email:
            # Create notification for post owner (if commenter is not the owner)
            notification = {
                "_id": str(uuid.uuid4()),
                "user_email": post["user_email"],  # Owner of the post
                "type": "comment",
                "message": f"commented on your post: \"{data['content'][:30]}{'...' if len(data['content']) > 30 else ''}\"",
                "from_user": username,  # Use username instead of email
                "post_id": post_id,
                "timestamp": datetime.utcnow(),
                "read": False
            }
            db.notifications.insert_one(notification)

        return jsonify({"message": "Comment added successfully", "comment": comment}), 201

    def delete_comment(self, post_id, comment_id, user_email):
        """ Delete a comment from a post """
        post = db.posts.find_one({"_id": post_id})
        if not post:
            return jsonify({"error": "Post not found"}), 404

        comment = next((c for c in post["comments"] if c["_id"] == comment_id and c["user_email"] == user_email), None)
        if not comment:
            return jsonify({"error": "Comment not found or unauthorized"}), 404

        db.posts.update_one({"_id": post_id}, {"$pull": {"comments": {"_id": comment_id}}})
        return jsonify({"message": "Comment deleted successfully"}), 200

    def react_to_post(self, post_id, action, user_email):
        """ React to a post (love - only for now) """
        if action not in ["love"]:
            return jsonify({"error": "Invalid action"}), 400

        increment = 1 if action == "love" else -1
        db.posts.update_one({"_id": post_id}, {"$inc": {"hearts": increment}})

        # Get the post to find the post owner for notification
        post = db.posts.find_one({"_id": post_id})
        if post and post["user_email"] != user_email and increment == 1:
            # Get user's username
            user = db.users.find_one({"email": user_email})
            username = user.get("username") if user else user_email
            
            # Create notification for post owner (if reactor is not the owner)
            # Only create notification when adding a reaction (increment = 1)
            notification = {
                "_id": str(uuid.uuid4()),
                "user_email": post["user_email"],  # Owner of the post
                "type": "reaction",
                "message": "reacted 💚 to your post",
                "from_user": username,  # Use username instead of email
                "post_id": post_id,
                "timestamp": datetime.utcnow(),
                "read": False
            }
            db.notifications.insert_one(notification)

        return jsonify({"message": f"Post {action}d successfully"}), 200

class Notification:
    def get_notifications(self, user_email):
        """ Get all notifications for a user """
        notifications = list(db.notifications.find({"user_email": user_email}).sort("timestamp", -1).limit(50))
        return jsonify({"notifications": notifications}), 200

    def mark_as_read(self, notification_id, user_email):
        """ Mark a notification as read """
        result = db.notifications.update_one(
            {"_id": notification_id, "user_email": user_email},
            {"$set": {"read": True}}
        )
        
        if result.matched_count == 0:
            return jsonify({"error": "Notification not found"}), 404
            
        return jsonify({"message": "Notification marked as read"}), 200

    def clear_all_notifications(self, user_email):
        """ Delete all notifications for a user """
        db.notifications.delete_many({"user_email": user_email})
        return jsonify({"message": "All notifications cleared"}), 200