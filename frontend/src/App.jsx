import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import CreatePost from './pages/CreatePost';
import ViewPost from './pages/ViewPost';
import EditPost from './pages/EditPost';
import Profile from './pages/Profile';
import DeleteAccount from './pages/DeleteAccount';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app load
    const token = localStorage.getItem('token');
    if (token) {
      fetchUser(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async (token) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      localStorage.removeItem('token');
    }
    setLoading(false);
  };

  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem('token', token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <Router>
      <div className="App">
        <Navbar user={user} logout={logout} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login login={login} />} />
            <Route path="/signup" element={<Signup login={login} />} />
            <Route path="/create" element={<CreatePost user={user} />} />
            <Route path="/post/:id" element={<ViewPost />} />
            <Route path="/edit/:id" element={<EditPost user={user} />} />
            <Route path="/profile" element={<Profile logout={logout} />} />
            <Route path="/delete-account" element={<DeleteAccount logout={logout} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
