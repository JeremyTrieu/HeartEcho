import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

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
      <div className="profile p-4 max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Profile</h2>
          <button 
            onClick={() => {navigate("/newsfeed")}} 
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            News Feed
          </button>
          <button 
            onClick={handleSignOut} 
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Sign Out
          </button>
        </div>
  
        <div className="border p-4 rounded shadow-md mb-4">
          <h3 className="text-lg font-semibold">Personal Information</h3>
          {loading ? (
            <div className="flex justify-center my-6">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <p className="text-red-500 text-center">{error}</p>
          ) : (
            <div>
              <p><strong>Email:</strong> {profile?.email}</p>
              <p><strong>Username:</strong> {profile?.username}</p>
            </div>
          )}
        </div>
  
        <h3 className="text-lg font-semibold mb-2">Your Posts</h3>
        {loading ? (
          <div className="flex justify-center my-6">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <p className="text-red-500 text-center">{error}</p>
        ) : posts.length === 0 ? (
          <p className="text-center text-gray-500">You haven't posted anything yet.</p>
        ) : (
          <ul className="space-y-4">
            {posts.map((post) => (
              <li key={post._id} className="border p-4 rounded shadow-md">
                <p className="text-lg">{post.content}</p>
                <p className="text-gray-400 text-xs">{new Date(post.created_at).toLocaleString()}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };
  

export default Profile;
