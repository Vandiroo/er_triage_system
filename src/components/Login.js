// src/components/Login.js
import React, { useState } from 'react';
import './Login.css';

const Login = ({ onLogin, error }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(error);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Demo credentials hardcoded for frontend-only testing
    const validCredentials = [
      { username: 'doctor', password: 'doctorpassword' },
      { username: 'nurse', password: 'nursepassword' }
    ];
    
    // Check if credentials match any of the valid demo credentials
    const isValid = validCredentials.some(
      cred => cred.username === username && cred.password === password
    );
    
    if (isValid) {
      // Create mock user data based on username
      const mockUser = {
        username: username,
        full_name: username === 'doctor' ? 'ER Doctor' : 'ER Nurse',
        email: `${username}@hospital.org`,
        role: username
      };
      
      // Create mock token
      const mockToken = 'mock_token_for_development';
      
      // Call the onLogin function with the necessary data
      onLogin({ 
        username, 
        password,
        // Include the additional data that App.js would normally get from the API
        userData: mockUser,
        access_token: mockToken
      });
    } else {
      // Show error message for invalid credentials
      setLoginError('Invalid username or password');
    }
  };
  
  return (
    <div className="login-container">
      <div className="login-form-container">
        <div className="login-header">
          <h1>ER Triage System</h1>
          <p>AI-Driven Emergency Room Triage Classification</p>
        </div>
        <form className="login-form" onSubmit={handleSubmit}>
          {loginError && <div className="error-message">{loginError}</div>}
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="login-button">Login</button>
        </form>
        <div className="login-footer">
          <p>Demo Credentials:</p>
          <div className="demo-credentials">
            <div className="credential">
              <span>Username: <strong>doctor</strong></span>
              <span>Password: <strong>doctorpassword</strong></span>
            </div>
            <div className="credential">
              <span>Username: <strong>nurse</strong></span>
              <span>Password: <strong>nursepassword</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;