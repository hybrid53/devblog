import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './CreatePost.css';

const EditPost = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    content: ''
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPost();
  }, [id]);

  // Redirect if not logged in
  if (!user) {
    navigate('/login');
    return null;
  }

  const fetchPost = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/posts/${id}`);
      if (response.ok) {
        const data = await response.json();
        
        // Check if user is the author
        if (data.author._id !== user.id) {
          setError('You are not authorized to edit this post');
          setLoading(false);
          return;
        }

        setFormData({
          title: data.title,
          subtitle: data.subtitle || '',
          content: data.content
        });
        
        if (data.imageUrl) {
          setCurrentImageUrl(data.imageUrl);
        }
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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('subtitle', formData.subtitle);
      formDataToSend.append('content', formData.content);
      
      if (image) {
        formDataToSend.append('image', image);
      }

      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/posts/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      const data = await response.json();

      if (response.ok) {
        navigate(`/post/${id}`);
      } else {
        setError(data.message || 'Failed to update post');
      }
    } catch (error) {
      console.error('Update post error:', error);
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading">Loading post...</div>
      </div>
    );
  }

  if (error && !formData.title) {
    return (
      <div className="error-container">
        <div className="error-message">{error}</div>
        <button onClick={() => navigate('/')} className="btn btn-primary">
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="create-post-container">
      <div className="create-post-card card">
        <div className="create-post-header">
          <h1>Edit Post</h1>
          <p>Update your post content and settings</p>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="create-post-form">
          <div className="form-group">
            <label htmlFor="title" className="form-label">
              Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter your post title"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="subtitle" className="form-label">
              Subtitle
            </label>
            <input
              type="text"
              id="subtitle"
              name="subtitle"
              value={formData.subtitle}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter a subtitle (optional)"
            />
          </div>

          <div className="form-group">
            <label htmlFor="content" className="form-label">
              Content *
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              className="form-input form-textarea"
              placeholder="Write your post content here..."
              required
              rows={12}
            />
          </div>

          <div className="form-group">
            <label htmlFor="image" className="form-label">
              Featured Image
            </label>
            <input
              type="file"
              id="image"
              name="image"
              onChange={handleImageChange}
              className="form-input"
              accept="image/*"
            />
            
            {currentImageUrl && !imagePreview && (
              <div className="image-preview">
                <img src={currentImageUrl} alt="Current" />
                <p className="image-note">Current image</p>
              </div>
            )}
            
            {imagePreview && (
              <div className="image-preview">
                <img src={imagePreview} alt="Preview" />
                <p className="image-note">New image preview</p>
                <button
                  type="button"
                  onClick={() => {
                    setImage(null);
                    setImagePreview(null);
                  }}
                  className="btn btn-danger btn-sm"
                >
                  Remove New Image
                </button>
              </div>
            )}
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate(`/post/${id}`)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Updating Post...' : 'Update Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPost; 