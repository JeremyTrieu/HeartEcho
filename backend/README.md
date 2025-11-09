#Backend Structure

myapp-backend/
│
├── app/
│   ├── __init__.py             # Initializes the Flask app
│   ├── config.py               # Configuration settings (e.g., DB, JWT, etc.)
│   ├── routes/                 # Store route logic here
│   │   ├── __init__.py         # Imports all routes in the directory
│   │   ├── auth_routes.py      # Routes for authentication (login, register, reset)
│   │   ├── post_routes.py      # Routes for posts (create, edit, delete, etc.)
│   │   └── comment_routes.py   # Routes for comments (add, delete)
│   ├── models/                 # Database models (MongoDB)
│   │   ├── __init__.py         # Imports all models in the directory
│   │   ├── user.py             # User model
│   │   ├── post.py             # Post model
│   │   └── comment.py          # Comment model
│   ├── utils/                  # Helper utilities (e.g., password hashing, validation)
│   │   ├── __init__.py
│   │   ├── password_helper.py  # Functions for hashing passwords, etc.
│   └── run.py                  # Entry point for running the app
│
├── venv/                       # Virtual environment (optional but recommended)
├── requirements.txt            # Python dependencies
├── .gitignore                  # Ignore unnecessary files in git (e.g., venv, .env)
└── README.md                   # Project overview

#feature

<!-- 

Create a new post

Edit a post

Delete a post

View a user's own posts

View posts from other users (news feed)

Comment on a post

Delete your own comment on any post

Delete a comment made by another user on your own post ✅ (New Feature)

React to a post (like/dislike) 

-->