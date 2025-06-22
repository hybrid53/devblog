import { Link } from 'react-router-dom';
import { useState } from 'react';
import './Navbar.css';

const Navbar = ({ user, logout }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <h1>Dev Blog</h1>
        </Link>
        
        <div className="navbar-menu">
          <Link to="/" className="navbar-link">
            Home
          </Link>
          
          {user ? (
            <>
              <Link to="/create" className="navbar-link">
                Create Post
              </Link>
              <div 
                className="navbar-user"
                onMouseEnter={() => setDropdownOpen(true)}
                onMouseLeave={() => setDropdownOpen(false)}
              >
                <button className="username-btn">
                  {user.username}
                </button>
                {dropdownOpen && (
                  <div className="user-dropdown">
                    <Link to="/profile" className="dropdown-item">Profile</Link>
                    <button onClick={logout} className="dropdown-item">
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="navbar-auth">
              <Link to="/login" className="btn btn-outline">
                Login
              </Link>
              <Link to="/signup" className="btn btn-primary">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 