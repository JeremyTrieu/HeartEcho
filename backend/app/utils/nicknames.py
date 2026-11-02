"""Persistent public names, independent of a user's email address."""
import secrets


ADJECTIVES = (
    "rapid", "gentle", "bright", "calm", "clever", "brave", "happy", "swift",
    "quiet", "sunny", "cosmic", "curious", "kind", "lucky", "merry", "bold",
    "silver", "golden", "playful", "jolly", "mellow", "nimble", "peaceful", "vivid",
)
ANIMALS = (
    "spider", "otter", "fox", "panda", "owl", "koala", "dolphin", "tiger",
    "rabbit", "falcon", "badger", "penguin", "gecko", "robin", "lynx", "deer",
    "heron", "turtle", "sparrow", "whale", "finch", "hedgehog", "seal", "jaguar",
)


def generate_nickname():
    return secrets.choice(ADJECTIVES) + secrets.choice(ANIMALS)


def get_nickname(db, email):
    """Assign once, including legacy accounts; concurrent reads reuse the winner."""
    user = db.users.find_one({"email": email})
    if not user:
        return "Anonymous"
    if user.get("nickname_version") != 1 or not user.get("username"):
        # Compare the values read so another request cannot overwrite a new name.
        db.users.update_one(
            {"_id": user["_id"], "nickname_version": user.get("nickname_version"),
             "username": user.get("username")},
            {"$set": {"username": generate_nickname(), "nickname_version": 1}},
        )
        user = db.users.find_one({"_id": user["_id"]})
    return user["username"] if user else "Anonymous"


def populate_author_names(db, posts):
    """Resolve historical post/comment snapshots from the saved user profile."""
    names = {}
    for post in posts:
        for item in [post, *post.get("comments", [])]:
            email = item.get("user_email")
            if email not in names:
                names[email] = get_nickname(db, email)
            item["username"] = names[email]
    return posts