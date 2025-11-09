// src/pages/CreatePost.tsx
import React, { useState } from 'react';

const CreatePost = () => {
  const [content, setContent] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await fetch('http://localhost:5000/post/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Email': 'testuser@example.com', // Update with actual user email
      },
      body: JSON.stringify({ content }),
    });

    if (response.ok) {
      alert('Post created successfully');
    } else {
      alert('Failed to create post');
    }
  };

  return (
    <div className="create-post-container">
      <h2>Create Post</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          placeholder="What's on your mind?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
        <button type="submit">Post</button>
      </form>
    </div>
  );
};

export default CreatePost;
