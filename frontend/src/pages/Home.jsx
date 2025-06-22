import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/posts');
      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      } else {
        setError('Failed to fetch posts');
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError('Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const truncateText = (text, maxLength = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.subtitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading">Loading posts...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">{error}</div>
        <button onClick={fetchPosts} className="btn btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="home fade-in">
      <div className="home-header">
        <h1>Latest Developer Insights</h1>
        <p>Discover the latest trends, tutorials, and insights from the developer community</p>
        
        <div className="search-container">
          <input
            type="text"
            placeholder="Search posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {filteredPosts.length === 0 ? (
        <div className="no-posts">
          <h2>No posts found</h2>
          <p>
            {searchTerm 
              ? `No posts match "${searchTerm}"` 
              : 'Be the first to share your insights!'
            }
          </p>
          <Link to="/create" className="btn btn-primary">
            Create Your First Post
          </Link>
        </div>
      ) : (
        <div className="posts-grid">
          {filteredPosts.map((post) => (
            <Link to={`/post/${post._id}`} key={post._id} className="post-card-link">
              <article className="post-card card">
                {post.imageUrl && (
                  <div className="post-image">
                    <img src={post.imageUrl} alt={post.title} />
                  </div>
                )}
                
                <div className="post-content">
                  <h2 className="post-title">{post.title}</h2>
                  
                  {post.subtitle && (
                    <p className="post-subtitle">{post.subtitle}</p>
                  )}
                  
                  <p className="post-excerpt">
                    {truncateText(post.content)}
                  </p>
                  
                  <div className="post-meta">
                    <span className="post-author">By {post.author.username}</span>
                    <span className="post-date">{formatDate(post.createdAt)}</span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home; 