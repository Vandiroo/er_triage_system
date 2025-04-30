// src/components/PatientForm.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './PatientForm.css';
import { patientService } from '../services/api';
import { usePatients } from '../context/PatientContext';

const PatientForm = ({ token, apiUrl }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Get the addPatient function from context
  const { addPatient } = usePatients();
  
  // Patient form state
  const [formData, setFormData] = useState({
    age: '',
    sex: '1',
    arrival_mode: '3',
    injury: '1',
    chief_complaint: '',
    mental_status: '1',
    pain: '0',
    pain_score: '',
    vital_signs: {
      sbp: '',
      dbp: '',
      hr: '',
      rr: '',
      bt: '',
      saturation: ''
    }
  });

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      // Handle nested vital signs objects
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      // Handle normal fields
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  // Handle pain toggle
  const handlePainToggle = (e) => {
    const hasPain = e.target.value === '1';
    setFormData({
      ...formData,
      pain: e.target.value,
      pain_score: hasPain ? formData.pain_score : ''
    });
  };
  
  // Submit form data
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Prepare the data in the format expected by the backend
      const requestData = {
        age: parseInt(formData.age),
        sex: parseInt(formData.sex),
        arrival_mode: parseInt(formData.arrival_mode),
        injury: parseInt(formData.injury),
        chief_complaint: formData.chief_complaint,
        mental_status: parseInt(formData.mental_status),
        pain: parseInt(formData.pain),
        pain_score: formData.pain === '1' ? parseInt(formData.pain_score) : null,
        vital_signs: {
          sbp: formData.vital_signs.sbp ? parseInt(formData.vital_signs.sbp) : null,
          dbp: formData.vital_signs.dbp ? parseInt(formData.vital_signs.dbp) : null,
          hr: formData.vital_signs.hr ? parseInt(formData.vital_signs.hr) : null,
          rr: formData.vital_signs.rr ? parseInt(formData.vital_signs.rr) : null,
          bt: formData.vital_signs.bt ? parseFloat(formData.vital_signs.bt) : null,
          saturation: formData.vital_signs.saturation ? parseInt(formData.vital_signs.saturation) : null
        }
      };

      console.log('Submitting data:', requestData);
      
      // Try to use the service, but fallback to mock data
      let triageResult;
      try {
        triageResult = await patientService.submitPatient(requestData);
      } catch (apiError) {
        console.log('Using mock data due to API error:', apiError);
        
        // Mock response for development
        triageResult = {
          triage_level: Math.floor(Math.random() * 3) + 2, // Level 2-4 for realism
          confidence: 0.75 + (Math.random() * 0.2),
          probabilities: {
            "1": Math.random() * 0.1,
            "2": Math.random() * 0.2,
            "3": Math.random() * 0.3,
            "4": Math.random() * 0.25,
            "5": Math.random() * 0.15
          },
          severity_factors: [
            {factor: "blood_pressure", impact: formData.vital_signs.sbp > 160 ? "high" : "medium"},
            {factor: "heart_rate", impact: formData.vital_signs.hr > 100 ? "high" : "low"},
            {factor: "respiratory_rate", impact: formData.vital_signs.rr > 24 ? "high" : "low"},
            {factor: "age_risk", impact: formData.age > 65 ? "high" : "low"}
          ],
          estimated_wait_time: (Math.floor(Math.random() * 5) + 1) * 10,
          recommended_resources: getDynamicResources(formData)
        };
        
        // Normalize probabilities to sum to 1
        const sum = Object.values(triageResult.probabilities).reduce((a, b) => a + b, 0);
        for (const key in triageResult.probabilities) {
          triageResult.probabilities[key] = triageResult.probabilities[key] / sum;
        }
      }
      
      // Store form data in sessionStorage (new)
      sessionStorage.setItem('patientFormData', JSON.stringify(formData));
      
      // Store result in sessionStorage
      sessionStorage.setItem('triageResult', JSON.stringify(triageResult));
      
      // Create a patient ID (in real app, this would come from backend)
      const patientId = 'P' + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      
      // Navigate to result page
      navigate(`/triage/${patientId}`);
      
    } catch (err) {
      console.error('Error submitting patient data:', err);
      setError('Failed to submit patient data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get dynamic resource recommendations based on patient data
  const getDynamicResources = (data) => {
    const resources = ["Vital Signs Monitoring"];
    
    // Add resources based on chief complaint
    const complaint = data.chief_complaint.toLowerCase();
    if (complaint.includes("chest") && complaint.includes("pain")) {
      resources.push("ECG", "Cardiac Markers", "Chest X-ray");
    } else if (complaint.includes("breath") || complaint.includes("respir")) {
      resources.push("Pulse Oximetry", "Respiratory Assessment", "Oxygen Therapy");
    } else if (complaint.includes("trauma") || complaint.includes("injury")) {
      resources.push("X-ray", "Trauma Assessment");
    } else if (complaint.includes("fever") || complaint.includes("infection")) {
      resources.push("Blood Cultures", "Antibiotics");
    } else if (complaint.includes("pain")) {
      resources.push("Pain Assessment", "Analgesics");
    }
    
    // Add resources based on vital signs
    if (data.vital_signs.sbp > 180 || data.vital_signs.sbp < 90) {
      resources.push("Blood Pressure Management");
    }
    if (data.vital_signs.hr > 120 || data.vital_signs.hr < 50) {
      resources.push("Cardiac Monitoring");
    }
    if (data.vital_signs.saturation < 94) {
      resources.push("Oxygen Therapy");
    }
    
    return [...new Set(resources)]; // Remove duplicates
  };
  
  return (
    <div className="patient-form-container">
      <h1>New Patient Assessment</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="patient-form">
        <div className="form-layout">
          {/* Left column */}
          <div className="form-column">
            <div className="form-section">
              <h2>Patient Information</h2>
              <div className="form-grid">
                <div className="form-group compact">
                  <label htmlFor="age">Age</label>
                  <input
                    type="number"
                    id="age"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    min="0"
                    max="120"
                    required
                  />
                </div>
                
                <div className="form-group compact">
                  <label htmlFor="sex">Sex</label>
                  <select
                    id="sex"
                    name="sex"
                    value={formData.sex}
                    onChange={handleChange}
                    required
                  >
                    <option value="1">Male</option>
                    <option value="2">Female</option>
                  </select>
                </div>
              </div>
              
              <div className="form-grid">
                <div className="form-group compact">
                  <label htmlFor="arrival_mode">Arrival Mode</label>
                  <select
                    id="arrival_mode"
                    name="arrival_mode"
                    value={formData.arrival_mode}
                    onChange={handleChange}
                    required
                  >
                    <option value="1">Ambulance</option>
                    <option value="2">Helicopter</option>
                    <option value="3">Walk-in</option>
                    <option value="4">Police</option>
                    <option value="5">Public Transport</option>
                    <option value="6">Other</option>
                  </select>
                </div>
                
                <div className="form-group compact">
                  <label htmlFor="injury">Injury Type</label>
                  <select
                    id="injury"
                    name="injury"
                    value={formData.injury}
                    onChange={handleChange}
                    required
                  >
                    <option value="1">Medical</option>
                    <option value="2">Trauma</option>
                  </select>
                </div>
              </div>
            </div>
          
            <div className="form-section">
              <h2>Vital Signs</h2>
              <div className="form-grid">
                <div className="form-group compact">
                  <label htmlFor="vital_signs.sbp">Systolic BP</label>
                  <input
                    type="number"
                    id="vital_signs.sbp"
                    name="vital_signs.sbp"
                    value={formData.vital_signs.sbp}
                    onChange={handleChange}
                    min="0"
                    max="300"
                  />
                </div>
                
                <div className="form-group compact">
                  <label htmlFor="vital_signs.dbp">Diastolic BP</label>
                  <input
                    type="number"
                    id="vital_signs.dbp"
                    name="vital_signs.dbp"
                    value={formData.vital_signs.dbp}
                    onChange={handleChange}
                    min="0"
                    max="200"
                  />
                </div>
              </div>
              
              <div className="form-grid">
                <div className="form-group compact">
                  <label htmlFor="vital_signs.hr">Heart Rate</label>
                  <input
                    type="number"
                    id="vital_signs.hr"
                    name="vital_signs.hr"
                    value={formData.vital_signs.hr}
                    onChange={handleChange}
                    min="0"
                    max="300"
                  />
                </div>
                
                <div className="form-group compact">
                  <label htmlFor="vital_signs.rr">Respiratory Rate</label>
                  <input
                    type="number"
                    id="vital_signs.rr"
                    name="vital_signs.rr"
                    value={formData.vital_signs.rr}
                    onChange={handleChange}
                    min="0"
                    max="100"
                  />
                </div>
              </div>
              
              <div className="form-grid">
                <div className="form-group compact">
                  <label htmlFor="vital_signs.bt">Body Temperature</label>
                  <input
                    type="number"
                    id="vital_signs.bt"
                    name="vital_signs.bt"
                    value={formData.vital_signs.bt}
                    onChange={handleChange}
                    min="30"
                    max="45"
                    step="0.1"
                  />
                </div>
                
                <div className="form-group compact">
                  <label htmlFor="vital_signs.saturation">O2 Saturation (%)</label>
                  <input
                    type="number"
                    id="vital_signs.saturation"
                    name="vital_signs.saturation"
                    value={formData.vital_signs.saturation}
                    onChange={handleChange}
                    min="0"
                    max="100"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Right column */}
          <div className="form-column">
            <div className="form-section">
              <h2>Clinical Assessment</h2>
              
              <div className="form-group">
                <label htmlFor="chief_complaint">Chief Complaint</label>
                <textarea
                  id="chief_complaint"
                  name="chief_complaint"
                  value={formData.chief_complaint}
                  onChange={handleChange}
                  required
                  rows="3"
                  placeholder="Describe the main symptom or reason for visit"
                ></textarea>
              </div>
              
              <div className="form-grid">
                <div className="form-group compact">
                  <label htmlFor="mental_status">Mental Status</label>
                  <select
                    id="mental_status"
                    name="mental_status"
                    value={formData.mental_status}
                    onChange={handleChange}
                    required
                  >
                    <option value="1">Alert</option>
                    <option value="2">Verbal</option>
                    <option value="3">Pain</option>
                    <option value="4">Unresponsive</option>
                  </select>
                </div>
                
                <div className="form-group compact">
                  <label htmlFor="pain">Pain Present</label>
                  <select
                    id="pain"
                    name="pain"
                    value={formData.pain}
                    onChange={handlePainToggle}
                    required
                  >
                    <option value="0">No</option>
                    <option value="1">Yes</option>
                  </select>
                </div>
              </div>
              
              {formData.pain === '1' && (
                <div className="form-group compact">
                  <label htmlFor="pain_score">Pain Score (0-10)</label>
                  <input
                    type="number"
                    id="pain_score"
                    name="pain_score"
                    value={formData.pain_score}
                    onChange={handleChange}
                    min="0"
                    max="10"
                    required
                  />
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="form-actions">
          <button type="button" className="button secondary" onClick={() => navigate('/dashboard')}>
            Cancel
          </button>
          <button type="submit" className="button primary" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit for Triage'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PatientForm;