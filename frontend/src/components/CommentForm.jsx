import { useState } from 'react';
import './CommentForm.css';

const CommentForm = ({ postId, onCommentAdded }) => {
  const [text, setText] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!text.trim()) {
      setError('Comment cannot be empty.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/posts/${postId}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text })
      });

      if (response.ok) {
        const updatedPost = await response.json();
        onCommentAdded(updatedPost.comments);
        setText('');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to add comment.');
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      setError('Network error. Please try again.');
    }
  };

  return (
    <div className="comment-form-card card">
      <h3 className="comment-form-title">Leave a Comment</h3>
      <form onSubmit={handleSubmit} className="comment-form">
        <div className="form-group">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write your comment here..."
            className="form-control"
            rows="4"
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        <button type="submit" className="btn btn-primary">
          Submit Comment
        </button>
      </form>
    </div>
  );
};

export default CommentForm; 