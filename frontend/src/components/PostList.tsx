// src/pages/PostsList.tsx
import React, { useEffect, useState } from 'react';
import Post from '../components/Post';

const PostsList = () => {
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      const response = await fetch('http://localhost:5000/post/my-posts');
      const data = await response.json();
      setPosts(data);
    };
    fetchPosts();
  }, []);

  const handleDeletePost = async (postId: string) => {
    const response = await fetch(`http://localhost:5000/post/delete/${postId}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      alert('Post deleted');
      setPosts(posts.filter((post) => post._id !== postId));
    }
  };

  return (
    <div>
      <h2>Posts</h2>
      {posts.map((post) => (
        <Post key={post._id} content={post.content} postId={post._id} onDelete={handleDeletePost} />
      ))}
    </div>
  );
};

export default PostsList;
