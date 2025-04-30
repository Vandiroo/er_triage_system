// src/services/api.js
import axios from 'axios';

// API base URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Create axios instance with default settings
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add authorization token to requests if it exists
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Authentication service
export const authService = {
  // Login user
  login: async (credentials) => {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Get user information
  getUserInfo: async () => {
    try {
      const response = await apiClient.get('/auth/me');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

// Patient service for API calls
export const patientService = {
  // Submit patient data for triage
  submitPatient: async (patientData) => {
    try {
      const response = await apiClient.post('/triage/predict', patientData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Get all patients
  getPatients: async () => {
    try {
      const response = await apiClient.get('/patients');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Get a specific patient by ID
  getPatient: async (patientId) => {
    try {
      const response = await apiClient.get(`/patients/${patientId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default {
  auth: authService,
  patient: patientService
};