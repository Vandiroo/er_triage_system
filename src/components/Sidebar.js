// src/components/Sidebar.js
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();
  
  // Check if the current path matches a given path
  const isActive = (path) => {
    return location.pathname === path;
  };
  
  return (
    <div className="sidebar">
      <nav className="sidebar-nav">
        <Link 
          to="/dashboard" 
          className={`sidebar-nav-item ${isActive('/dashboard') ? 'active' : ''}`}
        >
          <i>📊</i>
          <span>Dashboard</span>
        </Link>
        
        <Link 
          to="/patient/new" 
          className={`sidebar-nav-item ${isActive('/patient/new') ? 'active' : ''}`}
        >
          <i>👤</i>
          <span>New Patient</span>
        </Link>
        
        <Link 
          to="/queue" 
          className={`sidebar-nav-item ${isActive('/queue') ? 'active' : ''}`}
        >
          <i>🧑‍⚕️</i>
          <span>Patient Queue</span>
        </Link>
      </nav>
    </div>
  );
};

export default Sidebar;