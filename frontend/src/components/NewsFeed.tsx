import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Notifications from "./Notifications";
import "../styles/Profile.css";

interface Comment {
  _id: string;
  user_email: string;
  content: string;
  created_at: string;
}

interface Post {
  _id: string;
  user_email: string;
  content: string;
  created_at: string;
  hearts?: number;
  comments?: Comment[];
}

interface Notification {
  _id: string;
  type: 'reaction' | 'comment';
  message: string;
  timestamp: Date;
  post_id?: string;
}

const NewsFeed: React.FC = () => {
  const navigate = useNavigate();
  const authContext = useContext(AuthContext);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({});
  const [showComments, setShowComments] = useState<{ [key: string]: boolean }>({});
  const [reactedPosts, setReactedPosts] = useState<Set<string>>(new Set());
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState<boolean>(true);

  if (!authContext) return null;
  const { user, logout } = authContext;

  // Helper function to add notification
  const addNotification = (type: 'reaction' | 'comment', message: string, post_id?: string) => {
    const newNotification: Notification = {
      _id: Date.now().toString() + Math.random(),
      type,
      message,
      timestamp: new Date(),
      post_id
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  // Helper function to remove notification
  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n._id !== id));
  };

  // Helper function to clear all notifications
  const clearAllNotifications = () => {
    setNotifications([]);
  };

  useEffect(() => {
    fetchAllPosts();
  }, [user]);

  const fetchAllPosts = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/post/news-feed", {
        headers: { "User-Email": user?.email || "" },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }

      const data = await response.json();
      setPosts(data.news_feed);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm("Are you sure you want to delete this post?")) {
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:5000/post/delete/${postId}`, {
        method: "DELETE",
        headers: { "User-Email": user?.email || "" },
      });

      if (!response.ok) {
        throw new Error("Failed to delete post");
      }

      setPosts(posts.filter(post => post._id !== postId));
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleReact = async (postId: string) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/comment/react/${postId}/love`, {
        method: "POST",
        headers: { "User-Email": user?.email || "" },
      });

      if (!response.ok) {
        throw new Error("Failed to react to post");
      }

      // Update local state
      setPosts(posts.map(post => {
        if (post._id === postId) {
          const newHearts = (post.hearts || 0) + (reactedPosts.has(postId) ? -1 : 1);
          const isAdding = !reactedPosts.has(postId);
          
          // Add notification if reacting to someone else's post
          if (isAdding && post.user_email !== user?.email) {
            addNotification(
              'reaction',
              `You reacted 💚 to a post`,
              postId
            );
          }
          
          return { ...post, hearts: newHearts };
        }
        return post;
      }));

      // Toggle reacted state
      setReactedPosts(prev => {
        const newSet = new Set(prev);
        if (newSet.has(postId)) {
          newSet.delete(postId);
        } else {
          newSet.add(postId);
        }
        return newSet;
      });
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleAddComment = async (postId: string) => {
    const content = commentInputs[postId]?.trim();
    if (!content) return;

    try {
      const response = await fetch(`http://127.0.0.1:5000/comment/add/${postId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Email": user?.email || "",
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error("Failed to add comment");
      }

      const data = await response.json();
      
      // Update local state
      setPosts(posts.map(post => {
        if (post._id === postId) {
          // Add notification if commenting on someone else's post
          if (post.user_email !== user?.email) {
            addNotification(
              'comment',
              `You commented on a post: "${content.substring(0, 30)}${content.length > 30 ? '...' : ''}"`,
              postId
            );
          }
          
          return {
            ...post,
            comments: [...(post.comments || []), data.comment]
          };
        }
        return post;
      }));

      // Clear input
      setCommentInputs({ ...commentInputs, [postId]: "" });
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleDeleteComment = async (postId: string, commentId: string) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) {
      return;
    }

    try {
      const response = await fetch(
        `http://127.0.0.1:5000/comment/delete/${postId}/${commentId}`,
        {
          method: "DELETE",
          headers: { "User-Email": user?.email || "" },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete comment");
      }

      // Update local state
      setPosts(posts.map(post => {
        if (post._id === postId) {
          return {
            ...post,
            comments: (post.comments || []).filter(c => c._id !== commentId)
          };
        }
        return post;
      }));
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const toggleComments = (postId: string) => {
    setShowComments({
      ...showComments,
      [postId]: !showComments[postId]
    });
  };

  const handleSignOut = () => {
    logout();
    navigate("/signin");
  };

  return (
    <div className="newsfeed-container">
      {/* Notifications Box */}
      {showNotifications && notifications.length > 0 && (
        <Notifications
          notifications={notifications}
          onClose={removeNotification}
          onClearAll={clearAllNotifications}
        />
      )}
      
      <div className="newsfeed-wrapper">
        {/* Header with Logo and Actions */}
        <div className="newsfeed-header">
          <div className="heartecho-branding">
            <div className="heartecho-logo">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
            <h1 className="heartecho-title">heartecho</h1>
          </div>

          <h2 className="page-title">News Feed</h2>
          
          <div className="header-actions">
            <button 
              onClick={() => navigate("/profile")} 
              className="btn-primary"
            >
              Profile
            </button>
            <button 
              onClick={handleSignOut} 
              className="btn-signout"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Posts Feed */}
        <div className="posts-feed">
          <h3 className="feed-title">Recent Diary Entries</h3>
          {loading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
            </div>
          ) : error ? (
            <p className="error-message">{error}</p>
          ) : posts.length === 0 ? (
            <p className="empty-message">No posts yet. Be the first to share!</p>
          ) : (
            <ul className="posts-list">
              {posts.map((post) => (
                <li key={post._id} className="post-card">
                  {/* Post Header */}
                  <div className="post-header">
                    <span className="post-author">{post.user_email}</span>
                    {post.user_email === user?.email && (
                      <div className="post-actions">
                        <button
                          onClick={() => handleDeletePost(post._id)}
                          className="btn-delete"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Post Content */}
                  <p className="post-content">{post.content}</p>

                  {/* Post Footer */}
                  <div className="post-footer">
                    <p className="post-date">
                      {new Date(post.created_at).toLocaleString()}
                    </p>
                    
                    <div className="post-reactions">
                      <button
                        onClick={() => handleReact(post._id)}
                        className={`reaction-btn ${reactedPosts.has(post._id) ? 'active' : ''}`}
                        title="React with love"
                      >
                        💚
                        <span className="reaction-count">{post.hearts || 0}</span>
                      </button>
                      
                      <button
                        onClick={() => toggleComments(post._id)}
                        className="comment-btn"
                      >
                        💬 {(post.comments || []).length} 
                        {(post.comments || []).length === 1 ? ' Comment' : ' Comments'}
                      </button>
                    </div>
                  </div>

                  {/* Comments Section */}
                  {showComments[post._id] && (
                    <div className="comments-section">
                      {post.comments && post.comments.length > 0 && (
                        <ul className="comments-list">
                          {post.comments.map((comment) => (
                            <li key={comment._id} className="comment-item">
                              <div className="comment-header">
                                <span className="comment-author">
                                  {comment.user_email}
                                </span>
                                {comment.user_email === user?.email && (
                                  <button
                                    onClick={() => handleDeleteComment(post._id, comment._id)}
                                    className="btn-delete-comment"
                                  >
                                    Delete
                                  </button>
                                )}
                              </div>
                              <p className="comment-content">{comment.content}</p>
                              <p className="comment-date">
                                {new Date(comment.created_at).toLocaleString()}
                              </p>
                            </li>
                          ))}
                        </ul>
                      )}
                      
                      {/* Add Comment Form */}
                      <div className="add-comment-form">
                        <input
                          type="text"
                          className="comment-input"
                          placeholder="Add a comment..."
                          value={commentInputs[post._id] || ""}
                          onChange={(e) =>
                            setCommentInputs({
                              ...commentInputs,
                              [post._id]: e.target.value,
                            })
                          }
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              handleAddComment(post._id);
                            }
                          }}
                        />
                        <button
                          onClick={() => handleAddComment(post._id)}
                          className="btn-add-comment"
                          disabled={!commentInputs[post._id]?.trim()}
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewsFeed;