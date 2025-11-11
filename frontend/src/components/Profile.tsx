import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "../styles/Profile.css";

interface Post {
  _id: string;
  content: string;
  created_at: string;
}

interface ProfileData {
  email: string;
  username: string;
}

const Profile: React.FC = () => {
    const navigate = useNavigate();
    const authContext = useContext(AuthContext);
    const [profile, setProfile] = useState<any>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
  
    if (!authContext) return null; // Ensure context is available
    const { user, logout } = authContext;
  
    useEffect(() => {
        console.log(user);
      const fetchUserProfile = async () => {
        if (!user?.email) {
          setError("User email is not available");
          setLoading(false);
          return;
        }
  
        try {
          const response = await fetch("http://127.0.0.1:5000/user/profile", {
            headers: { "User-Email": user.email || "" },
          });
  
          if (!response.ok) {
            throw new Error("Failed to fetch profile");
          }
  
          const data = await response.json();
          setProfile(data);
        } catch (err) {
          setError((err as Error).message);
        } finally {
          setLoading(false);
        }
      };
  
      const fetchUserPosts = async () => {
        if (!user?.email) {
          setError("User email is not available");
          setLoading(false);
          return;
        }
  
        try {
          const response = await fetch("http://127.0.0.1:5000/post/my-posts", {
            headers: { "User-Email": user.email || "" },
          });
  
          if (!response.ok) {
            throw new Error("Failed to fetch posts");
          }
  
          const data = await response.json();
          setPosts(data.posts);
        } catch (err) {
          setError((err as Error).message);
        } finally {
          setLoading(false);
        }
      };
  
      setLoading(true); // Start loading when useEffect runs
  
      fetchUserProfile();
      fetchUserPosts();
    }, [user]);
  
    const handleSignOut = () => {
      logout();
      navigate("/signin");
    };
  
    return (
      <div className="profile-container">
        <div className="profile-wrapper">
          {/* Header with Logo */}
          <div className="profile-header">
            <div className="heartecho-branding">
              <div className="heartecho-logo">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </div>
              <h1 className="heartecho-title">heartecho</h1>
            </div>
            
            <div className="header-actions">
              <button 
                onClick={() => {navigate("/newsfeed")}} 
                className="btn-secondary"
              >
                News Feed
              </button>
              <button 
                onClick={handleSignOut} 
                className="btn-signout"
              >
                Sign Out
              </button>
            </div>
          </div>
  
          {/* Profile Information Card */}
          <div className="profile-card">
            <h2 className="card-title">Profile</h2>
            <div className="info-section">
              <h3 className="section-title">Personal Information</h3>
              {loading ? (
                <div className="loading-spinner">
                  <div className="spinner"></div>
                </div>
              ) : error ? (
                <p className="error-message">{error}</p>
              ) : (
                <div className="info-details">
                  <div className="info-item">
                    <span className="info-label">Email:</span>
                    <span className="info-value">{profile?.email}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Username:</span>
                    <span className="info-value">{profile?.username}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
  
          {/* Posts Section */}
          <div className="posts-section">
            <h3 className="section-title">Your Posts</h3>
            {loading ? (
              <div className="loading-spinner">
                <div className="spinner"></div>
              </div>
            ) : error ? (
              <p className="error-message">{error}</p>
            ) : posts.length === 0 ? (
              <p className="empty-message">You haven't posted anything yet.</p>
            ) : (
              <ul className="posts-list">
                {posts.map((post) => (
                  <li key={post._id} className="post-card">
                    <p className="post-content">{post.content}</p>
                    <p className="post-date">{new Date(post.created_at).toLocaleString()}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    );
  };
  

export default Profile;