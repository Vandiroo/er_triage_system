// src/components/PatientQueue.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './PatientQueue.css';
import { usePatients } from '../context/PatientContext';

const PatientQueue = () => {
  // Get patients and stats from context instead of local state
  const { patients, stats, dischargePatient } = usePatients();
  
  // Filter states
  const [filter, setFilter] = useState('all');
  
  // Filtered patients
  const filteredPatients = filter === 'all' 
    ? patients 
    : patients.filter(p => p.triage_level === parseInt(filter));
  
  // Sort patients by triage level and then by wait time
  const sortedPatients = [...filteredPatients].sort((a, b) => {
    if (a.triage_level !== b.triage_level) {
      return a.triage_level - b.triage_level;
    }
    return b.wait_time - a.wait_time;
  });
  
  // Calculate stats - use the same values from context
  const totalWaiting = stats.patientsWaiting;
  const averageWait = stats.averageWaitTime;
  
  // Handle discharge button click
  const handleDischarge = (patientId) => {
    dischargePatient(patientId);
  };
  
  return (
    <div className="queue-container">
      <div className="queue-header">
        <div className="queue-header-left">
          <h1>Patient Queue</h1>
          <div className="queue-stats">
            <div className="stat-pill">
              <span className="stat-label">Total Waiting:</span>
              <span className="stat-value">{totalWaiting}</span>
            </div>
            <div className="stat-pill">
              <span className="stat-label">Average Wait:</span>
              <span className="stat-value">{averageWait} min</span>
            </div>
          </div>
        </div>
        <Link to="/patient/new" className="action-button primary">
          Add New Patient
        </Link>
      </div>
      
      <div className="queue-filters">
        <button 
          className={`filter-button ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button 
          className={`filter-button level-1 ${filter === '1' ? 'active' : ''}`}
          onClick={() => setFilter('1')}
        >
          Level 1
        </button>
        <button 
          className={`filter-button level-2 ${filter === '2' ? 'active' : ''}`}
          onClick={() => setFilter('2')}
        >
          Level 2
        </button>
        <button 
          className={`filter-button level-3 ${filter === '3' ? 'active' : ''}`}
          onClick={() => setFilter('3')}
        >
          Level 3
        </button>
        <button 
          className={`filter-button level-4 ${filter === '4' ? 'active' : ''}`}
          onClick={() => setFilter('4')}
        >
          Level 4
        </button>
        <button 
          className={`filter-button level-5 ${filter === '5' ? 'active' : ''}`}
          onClick={() => setFilter('5')}
        >
          Level 5
        </button>
      </div>
      
      <div className="patient-list">
        {sortedPatients.length > 0 ? (
          sortedPatients.map(patient => (
            <div key={patient.id} className={`patient-card triage-${patient.triage_level}`}>
              <div className="patient-header">
                <div className="patient-id">{patient.id}</div>
                <div className="patient-triage">
                  Level {patient.triage_level}
                </div>
              </div>
              <div className="patient-body">
                <div className="patient-info">
                  <div className="patient-demographics">
                    {patient.age} y/o {patient.sex}
                  </div>
                  <div className="patient-complaint">
                    {patient.chief_complaint}
                  </div>
                </div>
                <div className="patient-vitals">
                  <div className="vital-sign">
                    <span className="vital-label">BP:</span>
                    <span className="vital-value">{patient.vital_signs.sbp}/{Math.max(patient.vital_signs.sbp - 40, 40)}</span>
                  </div>
                  <div className="vital-sign">
                    <span className="vital-label">HR:</span>
                    <span className="vital-value">{patient.vital_signs.hr}</span>
                  </div>
                  <div className="vital-sign">
                    <span className="vital-label">RR:</span>
                    <span className="vital-value">{patient.vital_signs.rr}</span>
                  </div>
                </div>
              </div>
              <div className="patient-footer">
                <div className="wait-time">
                  Waiting: <strong>{patient.wait_time}</strong> min
                </div>
                <div className="arrival-time">
                  Arrived: {patient.arrival_time}
                </div>
                <div className="patient-actions">
                  <Link to={`/triage/${patient.id}`} className="view-details-link">
                    View Details
                  </Link>
                  <button 
                    className="discharge-button"
                    onClick={() => handleDischarge(patient.id)}
                  >
                    Discharge
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-patients-message">
            No patients match the selected filter.
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientQueue;