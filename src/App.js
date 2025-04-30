// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import axios from 'axios';

// Services
import { authService } from './services/api';

// Components
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import PatientForm from './components/PatientForm';
import TriageResult from './components/TriageResult';
import PatientQueue from './components/PatientQueue';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';

// Context
import { PatientProvider } from './context/PatientContext';

// Styles
import './App.css';

// API Configuration
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Check if user is authenticated on initial load
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          // For frontend-only mode, check if token is mock token
          if (token === 'mock_token_for_development') {
            // Retrieve user data from localStorage
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
              setUser(JSON.parse(storedUser));
              setIsAuthenticated(true);
            }
          } else {
            // Normal API flow
            // Use the service instead of direct axios call
            const userData = await authService.getUserInfo();
            setUser(userData);
            setIsAuthenticated(true);
          }
        } catch (err) {
          console.error('Authentication error:', err);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setIsAuthenticated(false);
        }
      }
      setLoading(false);
    };
    
    checkAuth();
  }, [token]);
  
  // Login handler
  const handleLogin = async (credentials) => {
    try {
      setLoading(true);
      
      // Check if we got mock data directly from Login component
      if (credentials.userData && credentials.access_token) {
        // Use the mock data directly for frontend-only testing
        const mockUser = credentials.userData;
        const mockToken = credentials.access_token;
        
        // Save to localStorage
        localStorage.setItem('token', mockToken);
        localStorage.setItem('user', JSON.stringify(mockUser));
        
        // Update state
        setToken(mockToken);
        setUser(mockUser);
        setIsAuthenticated(true);
        setError(null);
      } else {
        // Normal API flow
        try {
          // Use the service instead of direct axios call
          const response = await authService.login(credentials);
          
          const { access_token } = response;
          
          // Save token to localStorage
          localStorage.setItem('token', access_token);
          setToken(access_token);
          
          // Get user info
          const userData = await authService.getUserInfo();
          
          setUser(userData);
          setIsAuthenticated(true);
          setError(null);
        } catch (err) {
          throw err; // Pass the error to the outer catch block
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Invalid username or password');
      
      // Legacy development auto-login fallback
      if (process.env.NODE_ENV === 'development') {
        console.log('Using mock login for development');
        const mockUser = {
          username: credentials.username,
          full_name: credentials.username === 'doctor' ? 'ER Doctor' : 'ER Nurse',
          email: `${credentials.username}@hospital.org`,
          role: credentials.username
        };
        
        const mockToken = 'mock_token_for_development';
        localStorage.setItem('token', mockToken);
        localStorage.setItem('user', JSON.stringify(mockUser));
        setToken(mockToken);
        setUser(mockUser);
        setIsAuthenticated(true);
        setError(null);
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };
  
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  return (
    <Router>
      <PatientProvider>
        <div className="app">
          {isAuthenticated && <Header user={user} onLogout={handleLogout} />}
          <div className="app-container">
            {isAuthenticated && <Sidebar />}
            <main className="main-content">
              <Routes>
                <Route 
                  path="/login" 
                  element={!isAuthenticated ? (
                    <Login onLogin={handleLogin} error={error} />
                  ) : (
                    <Navigate to="/dashboard" replace />
                  )} 
                />
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute isAuthenticated={isAuthenticated}>
                      <Dashboard user={user} />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/patient/new" 
                  element={
                    <ProtectedRoute isAuthenticated={isAuthenticated}>
                      <PatientForm token={token} apiUrl={API_URL} />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/triage/:patientId" 
                  element={
                    <ProtectedRoute isAuthenticated={isAuthenticated}>
                      <TriageResult token={token} apiUrl={API_URL} />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/queue" 
                  element={
                    <ProtectedRoute isAuthenticated={isAuthenticated}>
                      <PatientQueue token={token} apiUrl={API_URL} />
                    </ProtectedRoute>
                  } 
                />
                <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
              </Routes>
            </main>
          </div>
        </div>
      </PatientProvider>
    </Router>
  );
}

export default App;