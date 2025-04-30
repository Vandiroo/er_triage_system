// src/components/Dashboard.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';
import { usePatients } from '../context/PatientContext';

const Dashboard = ({ user }) => {
  // Get stats from context instead of using local state
  const { stats, recentActivities } = usePatients();

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="quick-actions">
          <Link to="/patient/new" className="action-button primary">
            New Patient
          </Link>
          <Link to="/queue" className="action-button secondary">
            View Queue
          </Link>
        </div>
      </div>
      
      {/* Main stats cards */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Patients Waiting</h3>
          <div className="stat-value">{stats.patientsWaiting}</div>
        </div>

        <div className="stat-card">
          <h3>Average Wait Time</h3>
          <div className="stat-value">{stats.averageWaitTime} min</div>
        </div>

        {/* Department Load */}
        <div className="stat-card">
          <h3>Department Load</h3>
          <div className="stat-value">{Math.round(stats.departmentLoad)}%</div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ 
                width: `${stats.departmentLoad}%`,
                backgroundColor: stats.departmentLoad > 90 ? '#e53935' : stats.departmentLoad > 75 ? '#ff9800' : '#4caf50'
              }}
            ></div>
          </div>
        </div>
      </div>
      
      {/* Main dashboard content */}
      <div className="dashboard-grid">
        {/* Bed Availability Card */}
        <div className="dashboard-card bed-availability">
          <h2>Bed Availability</h2>
          <div className="bed-status">
            <div className="bed-chart">
              <div className="bed-chart-container">
                <div 
                  className="bed-chart-fill" 
                  style={{ 
                    height: `${(stats.bedAvailability.occupied / stats.bedAvailability.total) * 100}%`,
                    backgroundColor: '#e53935'
                  }}
                ></div>
              </div>
              <div className="bed-chart-labels">
                <div className="bed-label available">
                  <span className="bed-count">{stats.bedAvailability.available}</span>
                  <span className="bed-text">Available</span>
                </div>
                <div className="bed-label occupied">
                  <span className="bed-count">{stats.bedAvailability.occupied}</span>
                  <span className="bed-text">Occupied</span>
                </div>
                <div className="bed-label total">
                  <span className="bed-count">{stats.bedAvailability.total}</span>
                  <span className="bed-text">Total</span>
                </div>
              </div>
            </div>
            <div className="bed-percentage">
              <div className="percentage-value">
                {Math.round((stats.bedAvailability.available / stats.bedAvailability.total) * 100)}%
              </div>
              <div className="percentage-label">Available</div>
            </div>
          </div>
        </div>
        
        {/* Patients by Triage Level Card */}
        <div className="dashboard-card triage-distribution">
          <h2>Patients by Triage Level</h2>
          <div className="triage-bars">
            {Object.entries(stats.triageLevelCounts).map(([level, count]) => {
              const levelInfo = {
                1: { name: 'Resuscitation', color: '#e53935' },
                2: { name: 'Emergency', color: '#ff9800' },
                3: { name: 'Urgent', color: '#ffd600' },
                4: { name: 'Semi-urgent', color: '#4caf50' },
                5: { name: 'Non-urgent', color: '#2196f3' }
              }[level];
              
              const total = Object.values(stats.triageLevelCounts).reduce((sum, val) => sum + val, 0);
              const percentage = total > 0 ? (count / total) * 100 : 0;
              
              return (
                <div key={level} className="triage-bar-item">
                  <div className="triage-bar-label">
                    <div className="level-indicator" style={{ backgroundColor: levelInfo.color }}>
                      {level}
                    </div>
                    <span className="level-name">{levelInfo.name}</span>
                  </div>
                  <div className="triage-bar-container">
                    <div 
                      className="triage-bar-fill" 
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: levelInfo.color
                      }}
                    ></div>
                    <span className="triage-bar-value">{count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Recent Activities Card (new) */}
        <div className="dashboard-card recent-activity">
          <h2>Recent Activities</h2>
          {recentActivities && recentActivities.length > 0 ? (
            <div className="activity-list">
              {recentActivities.map((activity, index) => {
                // Determine color based on activity type and triage level
                let activityColor = '#1DB954'; // Default green
                if (activity.type === 'Arrival') {
                  activityColor = activity.level <= 2 ? '#e53935' : // Red for high priority
                                activity.level === 3 ? '#ff9800' : // Orange for medium
                                '#4caf50'; // Green for low priority
                }
                
                return (
                  <div key={activity.id || index} className="activity-item">
                    <span className="activity-time">{activity.time}</span>
                    <span className="activity-type" style={{ color: activityColor }}>
                      {activity.type}
                    </span>
                    <span className="activity-details">
                      {activity.patientId}: {activity.details}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="no-patients-message">
              No recent activities to display.
            </div>
          )}
        </div>
        
        {/* Recent Assessments Card */}
        <div className="dashboard-card recent-assessments">
          <h2>Recent Assessments</h2>
          {stats.recentAssessments.length > 0 ? (
            <table className="assessments-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>ID</th>
                  <th>Patient</th>
                  <th>Complaint</th>
                  <th>Level</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentAssessments.map((assessment, index) => (
                  <tr key={index}>
                    <td>{assessment.time}</td>
                    <td>{assessment.id}</td>
                    <td>{assessment.patient}</td>
                    <td className="complaint-cell">{assessment.complaint}</td>
                    <td>
                      <span 
                        className="triage-badge" 
                        style={{ 
                          backgroundColor: 
                            assessment.level === 1 ? '#e53935' : 
                            assessment.level === 2 ? '#ff9800' : 
                            assessment.level === 3 ? '#ffd600' : 
                            assessment.level === 4 ? '#4caf50' : 
                            '#2196f3'
                        }}
                      >
                        {assessment.level}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="no-patients-message">
              No recent assessments to display.
            </div>
          )}
        </div>
      </div>
      
      {/* Department Statistics */}
      <div className="dashboard-stats" style={{ marginTop: '20px' }}>
        <div className="stat-card">
          <h3>Critical Cases</h3>
          <div className="stat-value">{stats.triageLevelCounts[1] + stats.triageLevelCounts[2]}</div>
        </div>
        
        <div className="stat-card">
          <h3>Urgent Cases</h3>
          <div className="stat-value">{stats.triageLevelCounts[3]}</div>
        </div>
        
        <div className="stat-card">
          <h3>Non-Critical</h3>
          <div className="stat-value">{stats.triageLevelCounts[4] + stats.triageLevelCounts[5]}</div>
        </div>
        
        <div className="stat-card">
          <h3>Total Patients</h3>
          <div className="stat-value">{Object.values(stats.triageLevelCounts).reduce((sum, val) => sum + val, 0)}</div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;