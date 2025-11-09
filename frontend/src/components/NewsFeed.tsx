import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

interface Post {
  _id: string;
  user_email: string;
  content: string;
  created_at: string;
}

const NewsFeed: React.FC = () => {
  const navigate = useNavigate();
  const authContext = useContext(AuthContext);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  if (!authContext) return null; // Ensure context is available
  const { logout } = authContext;

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/post/news-feed");
        if (!response.ok) throw new Error("Failed to fetch posts");

        const data = await response.json();
        setPosts(data.news_feed);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const handleSignOut = () => {
    logout();
    navigate("/signin");
  };

  return (
    <div className="news-feed p-4 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">News Feed</h2>
        <button 
          onClick={() => navigate("/profile")} 
          className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
        >
          Profile
        </button>
        <button 
          onClick={handleSignOut} 
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Sign Out
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center my-6">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <p className="text-red-500 text-center">{error}</p>
      ) : posts.length === 0 ? (
        <p className="text-center text-gray-500">No posts available.</p>
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

export default NewsFeed;
