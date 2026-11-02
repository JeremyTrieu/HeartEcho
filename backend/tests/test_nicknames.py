import sys
import unittest
from pathlib import Path
from unittest.mock import Mock, patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "app"))
from utils.nicknames import get_nickname, populate_author_names


class NicknameTests(unittest.TestCase):
    def test_legacy_user_is_saved_and_reused(self):
        user = {"_id": "1", "email": "person@example.com", "username": "person"}
        db = Mock()
        db.users.find_one.side_effect = lambda query: dict(user)
        db.users.update_one.side_effect = lambda query, update: user.update(update["$set"])
        with patch("utils.nicknames.generate_nickname", return_value="rapidspider") as generate:
            self.assertEqual(get_nickname(db, user["email"]), "rapidspider")
            self.assertEqual(get_nickname(db, user["email"]), "rapidspider")
        generate.assert_called_once()
        db.users.update_one.assert_called_once()
        self.assertEqual(user["nickname_version"], 1)

    def test_concurrent_assignment_returns_saved_winner(self):
        db = Mock()
        db.users.find_one.side_effect = [
            {"_id": "1", "username": "person"},
            {"_id": "1", "username": "calmotter", "nickname_version": 1},
        ]
        with patch("utils.nicknames.generate_nickname", return_value="rapidspider"):
            self.assertEqual(get_nickname(db, "person@example.com"), "calmotter")

    def test_old_posts_and_comments_use_profile_name(self):
        db = Mock()
        db.users.find_one.return_value = {"username": "rapidspider", "nickname_version": 1}
        posts = [{"user_email": "person@example.com", "username": "person", "comments": [
            {"user_email": "person@example.com", "username": "person"}]}]
        populate_author_names(db, posts)
        self.assertEqual(posts[0]["username"], "rapidspider")
        self.assertEqual(posts[0]["comments"][0]["username"], "rapidspider")
        db.users.find_one.assert_called_once()
        db.users.update_one.assert_not_called()

    def test_missing_user_does_not_display_email(self):
        db = Mock()
        db.users.find_one.return_value = None
        self.assertEqual(get_nickname(db, "missing@example.com"), "Anonymous")


if __name__ == "__main__":
    unittest.main()