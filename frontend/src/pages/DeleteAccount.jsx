import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API_URL } from '../config';
import './DeleteAccount.css';

const DeleteAccount = ({ logout }) => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const openModal = () => {
    setIsModalOpen(true);
    setError('');
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setPassword('');
  };

  const handleConfirmDeletion = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/auth/me`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ password })
      });

      const data = await response.json();
      if (response.ok) {
        closeModal();
        setSuccessMessage('Account has been deleted successfully.');
        logout();
        setTimeout(() => {
          navigate('/');
        }, 4000);
      } else {
        setError(data.message || 'An error occurred during account deletion.');
      }
    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred. Please try again later.');
    }
  };
  
  if (successMessage) {
    return (
      <div className="delete-account-container">
        <div className="success-popup card">
          <p>{successMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="delete-account-container">
      <div className="delete-account-card card">
        <h1 className="delete-account-title">Are you absolutely sure?</h1>
        <p className="delete-account-warning">
          This action is irreversible. All of your posts and comments will be permanently deleted.
        </p>
        <div className="delete-account-actions">
          <button onClick={openModal} className="btn btn-danger">
            Yes, Delete My Account
          </button>
          <Link to="/profile" className="btn btn-outline">
            No, Take Me Back
          </Link>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content card">
            <h2>Confirm Deletion</h2>
            <p>To confirm, please enter your password.</p>
            <div className="form-group">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-control"
                placeholder="Enter your password"
              />
            </div>
            {error && <p className="error-message">{error}</p>}
            <div className="modal-actions">
              <button onClick={handleConfirmDeletion} className="btn btn-danger">Confirm Deletion</button>
              <button onClick={closeModal} className="btn btn-outline">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeleteAccount; 