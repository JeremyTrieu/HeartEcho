// src/components/Post.tsx

interface PostProps {
  content: string;
  postId: string;
  onDelete: (postId: string) => void;
}

const Post = ({ content, postId, onDelete }: PostProps) => {
  return (
    <div className="post">
      <p>{content}</p>
      <button onClick={() => onDelete(postId)}>Delete Post</button>
    </div>
  );
};

export default Post;
