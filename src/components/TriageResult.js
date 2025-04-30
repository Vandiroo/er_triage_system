// src/components/TriageResult.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './TriageResult.css';
import { usePatients } from '../context/PatientContext';

const TriageResult = () => {
  const navigate = useNavigate();
  const { patientId } = useParams();
  const [triageResult, setTriageResult] = useState(null);
  const [patientData, setPatientData] = useState(null);
  const [addedToQueue, setAddedToQueue] = useState(false);
  
  // Get the context functions
  const { addPatient } = usePatients();
  
  useEffect(() => {
    // For demo purposes, we're getting results from sessionStorage
    // In a real app, you'd fetch this from an API
    const result = JSON.parse(sessionStorage.getItem('triageResult'));
    const patientFormData = JSON.parse(sessionStorage.getItem('patientFormData'));
    
    if (result) {
      setTriageResult(result);
      setPatientData(patientFormData);
    } else {
      // No result found, redirect to form
      navigate('/patient/new');
    }
  }, [navigate]);
  
  if (!triageResult) {
    return <div className="loading">Loading triage result...</div>;
  }
  
  // Helper function for triage level description
  const getTriageLevelInfo = (level) => {
    const levels = {
      1: {
        name: 'Resuscitation',
        description: 'Immediately life-threatening conditions requiring immediate aggressive intervention',
        color: '#e53935',
        timeframe: 'Immediate'
      },
      2: {
        name: 'Emergency',
        description: 'High risk of deterioration, or signs of a time-critical problem',
        color: '#ff9800',
        timeframe: 'Very Urgent (10 minutes)'
      },
      3: {
        name: 'Urgent',
        description: 'Urgent problem that needs treatment within a short period of time',
        color: '#ffd600',
        timeframe: 'Urgent (30 minutes)'
      },
      4: {
        name: 'Semi-urgent',
        description: 'Standard condition that may deteriorate or cause discomfort',
        color: '#4caf50',
        timeframe: 'Standard (60 minutes)'
      },
      5: {
        name: 'Non-urgent',
        description: 'Chronic or minor condition that can wait for assessment and treatment',
        color: '#2196f3',
        timeframe: 'Non-urgent (120 minutes)'
      }
    };
    
    return levels[level] || {
      name: 'Unknown',
      description: 'Triage level information not available',
      color: '#9e9e9e',
      timeframe: 'Unknown'
    };
  };
  
  // Get triage level info
  const levelInfo = getTriageLevelInfo(triageResult.triage_level);
  
  // Format confidence as percentage
  const confidencePercentage = Math.round(triageResult.confidence * 100);
  
  // Handle adding patient to queue
  const handleAddToQueue = () => {
    if (patientData && !addedToQueue) {
      // Add the patient to our context which will update both dashboard and queue
      addPatient(patientData, triageResult);
      
      // Set flag to prevent adding the same patient multiple times
      setAddedToQueue(true);
      
      // Navigate to queue to see the new patient
      navigate('/queue');
    }
  };
  
  return (
    <div className="triage-result-container">
      <div className="triage-result-header">
        <h1>Triage Recommendation</h1>
        <div className="patient-id">Patient ID: {patientId === 'new' ? 'New Patient' : patientId}</div>
      </div>
      
      <div className="triage-level-card" style={{ borderColor: levelInfo.color }}>
        <div className="triage-level-header" style={{ backgroundColor: levelInfo.color }}>
          <h2>Level {triageResult.triage_level}: {levelInfo.name}</h2>
        </div>
        <div className="triage-level-content">
          <p className="triage-description">{levelInfo.description}</p>
          <div className="triage-timeframe">
            <strong>Target Wait Time:</strong> {levelInfo.timeframe}
          </div>
          <div className="triage-confidence">
            <strong>AI Confidence:</strong> {confidencePercentage}%
          </div>
          <div className="estimated-wait">
            <strong>Estimated Wait Time:</strong> {triageResult.estimated_wait_time} minutes
          </div>
        </div>
      </div>
      
      <div className="triage-details-grid">
        <div className="triage-card severity-factors">
          <h3>Severity Factors</h3>
          <ul className="severity-list">
            {triageResult.severity_factors.map((factor, index) => (
              <li key={index} className={`severity-item ${factor.impact}`}>
                <span className="factor-name">
                  {factor.factor.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
                <span className={`impact-badge ${factor.impact}`}>
                  {factor.impact.toUpperCase()}
                </span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="triage-card recommended-resources">
          <h3>Recommended Resources</h3>
          <ul className="resources-list">
            {triageResult.recommended_resources.map((resource, index) => (
              <li key={index} className="resource-item">
                {resource}
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      <div className="triage-probabilities">
        <h3>Triage Level Probabilities</h3>
        <div className="probability-bars">
          {Object.entries(triageResult.probabilities).map(([level, probability]) => (
            <div key={level} className="probability-item">
              <div className="probability-label">
                Level {level}
              </div>
              <div className="probability-bar-container">
                <div 
                  className="probability-bar" 
                  style={{ 
                    width: `${Math.round(probability * 100)}%`,
                    backgroundColor: getTriageLevelInfo(parseInt(level)).color
                  }}
                ></div>
                <span className="probability-value">
                  {Math.round(probability * 100)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="triage-actions">
        <button className="action-button secondary" onClick={() => navigate('/patient/new')}>
          New Assessment
        </button>
        <button 
          className="action-button primary" 
          onClick={handleAddToQueue}
          disabled={addedToQueue}
        >
          {addedToQueue ? "Added to Queue" : "Add to Queue"}
        </button>
      </div>
    </div>
  );
};

export default TriageResult;