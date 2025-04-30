// src/components/Header.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = ({ user, onLogout }) => {
  // Format date and time with proper spacing
  const now = new Date();
  const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const timeOptions = { hour: '2-digit', minute: '2-digit' };
  
  const formattedDate = now.toLocaleDateString('en-US', dateOptions);
  const formattedTime = now.toLocaleTimeString('en-US', timeOptions);
  
  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-left">
          <h1>Welcome, {user?.username === 'doctor' ? 'ER Doctor' : 'ER Nurse'}</h1>
          <span className="user-role">{user?.username === 'doctor' ? 'Doctor' : 'Nurse'}</span>
        </div>
        
        <div className="header-center">
          <Link to="/dashboard">
            <h1>ER Triage System</h1>
          </Link>
          <div className="current-datetime">
            {formattedDate} &nbsp;|&nbsp; {formattedTime}
          </div>
        </div>
        
        <div className="header-right">
          <div className="system-status">
            <span className="status-indicator"></span>
            System Online v1.0.0
          </div>
          <button onClick={onLogout} className="logout-button">
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;