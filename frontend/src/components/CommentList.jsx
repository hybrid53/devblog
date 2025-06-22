import React, { useState } from 'react';
import { API_URL } from '../config';
import './CommentList.css';

const CommentList = ({ postId, comments, setComments, currentUser }) => {
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedText, setEditedText] = useState('');
  const [activeDropdown, setActiveDropdown] = useState(null);

  const handleEdit = (comment) => {
    setEditingCommentId(comment._id);
    setEditedText(comment.text);
  };

  const handleCancel = () => {
    setEditingCommentId(null);
    setEditedText('');
  };

  const handleUpdate = async (commentId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/posts/${postId}/comment/${commentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text: editedText })
      });

      if (response.ok) {
        const updatedPost = await response.json();
        setComments(updatedPost.comments);
        setEditingCommentId(null);
        setEditedText('');
      } else {
        console.error('Failed to update comment');
      }
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/posts/${postId}/comment/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const updatedPost = await response.json();
        setComments(updatedPost.comments);
      } else {
        console.error('Failed to delete comment');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleCommentLikeDislike = async (commentId, action) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/posts/${postId}/comment/${commentId}/${action}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const updatedPost = await response.json();
        setComments(updatedPost.comments);
      }
    } catch (error) {
      console.error(`Error ${action} comment:`, error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="comment-list-card card">
      <h3 className="comment-list-title">Comments</h3>
      {comments && comments.length > 0 ? (
        <ul className="comment-list">
          {comments.map((comment) => (
            <li key={comment._id} className="comment-item">
              <div className="comment-header">
                <div className="comment-author">
                  <strong>{comment.postedBy?.username || 'Anonymous'}</strong>
                </div>
                <div className="comment-date">
                  {formatDate(comment.createdAt)}
                </div>
              </div>
              {editingCommentId === comment._id ? (
                <div className="comment-edit-form">
                  <textarea
                    value={editedText}
                    onChange={(e) => setEditedText(e.target.value)}
                    className="form-control"
                    rows="3"
                  />
                  <div className="edit-actions">
                    <button onClick={() => handleUpdate(comment._id)} className="btn btn-primary btn-sm">Save</button>
                    <button onClick={handleCancel} className="btn btn-outline btn-sm">Cancel</button>
                  </div>
                </div>
              ) : (
                <p className="comment-text">{comment.text}</p>
              )}
              <div className="comment-feedback">
                <button 
                  onClick={() => handleCommentLikeDislike(comment._id, 'like')}
                  className={`btn-feedback ${comment.likes.includes(currentUser?.id) ? 'active' : ''}`}
                >
                  👍 {comment.likes.length}
                </button>
                <button
                  onClick={() => handleCommentLikeDislike(comment._id, 'dislike')}
                  className={`btn-feedback ${comment.dislikes.includes(currentUser?.id) ? 'active' : ''}`}
                >
                  👎 {comment.dislikes.length}
                </button>
              </div>
              {currentUser && currentUser.id === comment.postedBy?._id && editingCommentId !== comment._id && (
                <div 
                  className="comment-actions"
                  onMouseEnter={() => setActiveDropdown(comment._id)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button className="btn-link">Actions</button>
                  {activeDropdown === comment._id && (
                    <div className="dropdown-menu">
                      <button onClick={() => handleEdit(comment)} className="dropdown-item">Edit</button>
                      <button onClick={() => handleDelete(comment._id)} className="dropdown-item">Delete</button>
                    </div>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>No comments yet. Be the first to comment!</p>
      )}
    </div>
  );
};

export default CommentList; 