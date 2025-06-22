import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import CommentForm from '../components/CommentForm';
import CommentList from '../components/CommentList';
import { API_URL } from '../config';
import './ViewPost.css';

const ViewPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [postActionsDropdown, setPostActionsDropdown] = useState(false);

  useEffect(() => {
    fetchPost();
    fetchUser();
  }, [id]);

  const fetchPost = async () => {
    try {
      const response = await fetch(`${API_URL}/api/posts/${id}`);
      if (response.ok) {
        const data = await response.json();
        setPost(data);
        setComments(data.comments || []);
      } else {
        setError('Post not found');
      }
    } catch (error) {
      console.error('Error fetching post:', error);
      setError('Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  const fetchUser = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await fetch(`${API_URL}/api/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/posts/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        navigate('/');
      } else {
        setError('Failed to delete post');
      }
    } catch (error) {
      console.error('Delete error:', error);
      setError('Network error. Please try again.');
    }
  };

  const handleLikeDislike = async (action) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/posts/${id}/${action}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const updatedPost = await response.json();
        setPost(updatedPost);
      }
    } catch (error) {
      console.error(`Error ${action} post:`, error);
    }
  };

  const handleCommentChange = (newComments) => {
    setComments(newComments);
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

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading">Loading post...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">{error}</div>
        <Link to="/" className="btn btn-primary">
          Back to Home
        </Link>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="error-container">
        <div className="error-message">Post not found</div>
        <Link to="/" className="btn btn-primary">
          Back to Home
        </Link>
      </div>
    );
  }

  const isAuthor = user && post.author._id === user.id;

  return (
    <div className="view-post-container">
      <article className="view-post-card card">
        {post.imageUrl && (
          <div className="post-hero-image">
            <img src={post.imageUrl} alt={post.title} />
          </div>
        )}

        <div className="post-header">
          <div>
            <h1 className="post-title">{post.title}</h1>
            
            {post.subtitle && (
              <p className="post-subtitle">{post.subtitle}</p>
            )}

            <div className="post-meta">
              <div className="post-author">
                <span>By {post.author.username}</span>
              </div>
              <div className="post-date">
                <span>{formatDate(post.createdAt)}</span>
              </div>
            </div>
          </div>
          
          {isAuthor && (
            <div 
              className="post-actions"
              onMouseEnter={() => setPostActionsDropdown(true)}
              onMouseLeave={() => setPostActionsDropdown(false)}
            >
              <button className="btn btn-outline">Actions</button>
              {postActionsDropdown && (
                <div className="dropdown-menu">
                  <Link to={`/edit/${post._id}`} className="dropdown-item">
                    Edit Post
                  </Link>
                  <button onClick={handleDelete} className="dropdown-item dropdown-item-delete">
                    Delete Post
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="post-content">
          <div className="content-text">
            {post.content.split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>

        {post && (
          <div className="post-feedback">
            <button
              onClick={() => handleLikeDislike('like')}
              className={`btn-feedback ${post.likes.includes(user?.id) ? 'active' : ''}`}
            >
              👍 {post.likes.length}
            </button>
            <button
              onClick={() => handleLikeDislike('dislike')}
              className={`btn-feedback ${post.dislikes.includes(user?.id) ? 'active' : ''}`}
            >
              👎 {post.dislikes.length}
            </button>
          </div>
        )}

        <div className="post-footer">
          <Link to="/" className="btn btn-outline">
            ← Back to All Posts
          </Link>
        </div>
      </article>

      <div className="comments-section">
        {user && (
          <CommentForm postId={id} onCommentAdded={handleCommentChange} />
        )}
        <CommentList 
          postId={id}
          comments={comments}
          user={user}
          onCommentChange={handleCommentChange}
        />
      </div>
    </div>
  );
};

export default ViewPost; 