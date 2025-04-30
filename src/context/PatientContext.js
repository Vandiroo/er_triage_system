// src/context/PatientContext.js
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

// Create the context
const PatientContext = createContext();

// Initial mock data
const initialPatients = [
  {
    id: 'P001',
    age: 65,
    sex: 'M',
    chief_complaint: 'Chest pain',
    arrival_time: '09:15',
    triage_level: 2,
    wait_time: 30,
    vital_signs: { sbp: 160, hr: 92, rr: 22 },
    processing_time: 0 // Track how long patient has been in the system
  },
  {
    id: 'P002',
    age: 27,
    sex: 'F',
    chief_complaint: 'Abdominal pain',
    arrival_time: '09:32',
    triage_level: 3,
    wait_time: 13,
    vital_signs: { sbp: 125, hr: 88, rr: 18 },
    processing_time: 0
  },
  {
    id: 'P003',
    age: 8,
    sex: 'M',
    chief_complaint: 'Fever, cough',
    arrival_time: '09:15',
    triage_level: 4,
    wait_time: 30,
    vital_signs: { sbp: 110, hr: 100, rr: 22 },
    processing_time: 0
  },
  {
    id: 'P004',
    age: 42,
    sex: 'F',
    chief_complaint: 'Sprained ankle',
    arrival_time: '09:05',
    triage_level: 4,
    wait_time: 40,
    vital_signs: { sbp: 128, hr: 76, rr: 16 },
    processing_time: 0
  },
  {
    id: 'P005',
    age: 18,
    sex: 'F',
    chief_complaint: 'Allergic reaction',
    arrival_time: '09:48',
    triage_level: 3,
    wait_time: 0,
    vital_signs: { sbp: 115, hr: 110, rr: 20 },
    processing_time: 0
  }
];

// Initial bed capacity settings
const TOTAL_BEDS = 50;
const INITIAL_DEPARTMENT_LOAD = 60; // Starting at 60%

// Patient processing time thresholds (in minutes) by triage level
// After this time, patients have a chance to be discharged
const TREATMENT_THRESHOLDS = {
  1: 45,    // Level 1 (Resuscitation) - treated quickly but may stay longer for stabilization
  2: 60,    // Level 2 (Emergency) - higher complexity cases
  3: 90,    // Level 3 (Urgent) - moderate complexity
  4: 120,   // Level 4 (Semi-urgent) - lower complexity but may wait longer
  5: 150    // Level 5 (Non-urgent) - lowest complexity but longest wait
};

// Base wait times for new patients by triage level
const BASE_WAIT_TIMES = {
  1: 5,     // Immediate
  2: 15,    // Very urgent - small wait time
  3: 30,    // Urgent - moderate wait time
  4: 60,    // Semi-urgent - longer wait time
  5: 90     // Non-urgent - longest wait time
};

// Create a provider component
export const PatientProvider = ({ children }) => {
  // Load patients from localStorage or use initial data
  const [patients, setPatients] = useState(() => {
    const storedPatients = localStorage.getItem('patients');
    return storedPatients ? JSON.parse(storedPatients) : initialPatients;
  });

  // Load recent activities from localStorage or initialize empty array
  const [recentActivities, setRecentActivities] = useState(() => {
    const storedActivities = localStorage.getItem('recentActivities');
    return storedActivities ? JSON.parse(storedActivities) : [];
  });

  // Calculate dashboard stats based on patients data
  const [stats, setStats] = useState({
    patientsWaiting: 0,
    averageWaitTime: 0,
    currentOccupancy: 85,
    departmentLoad: INITIAL_DEPARTMENT_LOAD,
    bedAvailability: {
      total: TOTAL_BEDS,
      available: TOTAL_BEDS - Math.round(TOTAL_BEDS * INITIAL_DEPARTMENT_LOAD / 100),
      occupied: Math.round(TOTAL_BEDS * INITIAL_DEPARTMENT_LOAD / 100)
    },
    triageLevelCounts: {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0
    },
    recentAssessments: []
  });

  // Function to add patient discharge activity
  const addDischargeActivity = useCallback((patient) => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const currentTime = `${hours}:${minutes}`;
    
    const newActivity = {
      id: `ACT-${Date.now()}`,
      time: currentTime,
      type: 'Discharge',
      patientId: patient.id,
      details: `${patient.age} y/o ${patient.sex} - ${patient.chief_complaint}`,
      level: patient.triage_level
    };
    
    // Add to beginning of array, keep only most recent 10 activities
    const updatedActivities = [newActivity, ...recentActivities].slice(0, 10);
    setRecentActivities(updatedActivities);
    
    // Save to localStorage
    localStorage.setItem('recentActivities', JSON.stringify(updatedActivities));
  }, [recentActivities]);

  // Function to process patients (increase processing time, remove if done)
  const processPatients = useCallback(() => {
    setPatients(currentPatients => {
      // Skip if no patients
      if (currentPatients.length === 0) return currentPatients;

      // Make a copy we can modify
      const updatedPatients = [...currentPatients];
      
      // Flag to track if any patients were removed
      let patientsChanged = false;
      
      // Array to collect patients to remove
      const patientsToRemove = [];
      
      // Update each patient
      for (let i = 0; i < updatedPatients.length; i++) {
        const patient = updatedPatients[i];
        
        // Increase processing time (simulate passing time)
        patient.processing_time += 1;
        patient.wait_time += 1;
        
        // Check if patient is ready for potential discharge
        if (patient.processing_time >= TREATMENT_THRESHOLDS[patient.triage_level]) {
          // Calculate discharge probability based on triage level and processing time
          // Higher triage levels (more urgent) get processed more quickly
          const dischargeProb = 0.05 + 
            (0.02 * (patient.processing_time - TREATMENT_THRESHOLDS[patient.triage_level])) + 
            (0.01 * (6 - patient.triage_level)); // Higher triage levels are 1-2, lower are 4-5
          
          // Random check if patient should be discharged
          if (Math.random() < dischargeProb) {
            patientsToRemove.push(i);
            addDischargeActivity(patient);
            patientsChanged = true;
          }
        }
      }
      
      // Remove discharged patients (starting from the end to not affect indices)
      for (let i = patientsToRemove.length - 1; i >= 0; i--) {
        updatedPatients.splice(patientsToRemove[i], 1);
      }
      
      return patientsChanged ? updatedPatients : currentPatients;
    });
  }, [addDischargeActivity]);

  // Effect to periodically process patients
  useEffect(() => {
    // Process patients every 10 seconds
    const interval = setInterval(() => {
      processPatients();
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, [processPatients]);

  // Update stats whenever patients change
  useEffect(() => {
    // Calculate stats from patients data
    const patientsWaiting = patients.length;
    
    // Calculate average wait time based on:
    // 1. Current patient wait times
    // 2. Department load - as load increases, all patients wait longer
    // 3. Number of patients in each triage level
    
    // Base average from current patients
    let averageWaitTime = 0;
    
    if (patients.length > 0) {
      // Sum of all patient wait times
      const totalWaitTime = patients.reduce((sum, p) => sum + p.wait_time, 0);
      
      // Calculate the average
      averageWaitTime = Math.round(totalWaitTime / patients.length);
      
      // Apply a modifier based on department load
      // Each 10% over 60% increases wait times by 10%
      if (stats.departmentLoad > 60) {
        const loadFactor = 1 + ((stats.departmentLoad - 60) / 100);
        averageWaitTime = Math.round(averageWaitTime * loadFactor);
      }
    }
    
    // Count patients by triage level
    const triageLevelCounts = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0
    };
    
    patients.forEach(patient => {
      triageLevelCounts[patient.triage_level] = (triageLevelCounts[patient.triage_level] || 0) + 1;
    });
    
    // Get 5 most recent assessments
    const recentAssessments = [...patients]
      .sort((a, b) => {
        // Convert arrival_time to minutes for comparison
        const timeA = a.arrival_time.split(':');
        const timeB = b.arrival_time.split(':');
        const minutesA = parseInt(timeA[0]) * 60 + parseInt(timeA[1]);
        const minutesB = parseInt(timeB[0]) * 60 + parseInt(timeB[1]);
        return minutesB - minutesA;
      })
      .slice(0, 5)
      .map(p => ({
        id: p.id,
        time: p.arrival_time,
        patient: `${p.sex}, ${p.age}`,
        complaint: p.chief_complaint,
        level: p.triage_level
      }));
    
    // Calculate department load based on patient count and triage levels
    // The formula increases load by 2-5% per new patient, with higher impact for more critical patients
    const baseLoad = INITIAL_DEPARTMENT_LOAD;
    const patientImpact = patients.reduce((total, patient) => {
      // Higher triage levels (more urgent) have more impact on department load
      const impactByLevel = {
        1: 5, // Immediate attention - highest impact
        2: 4, // Very urgent
        3: 3, // Urgent
        4: 2.5, // Semi-urgent
        5: 2  // Non-urgent - lowest impact
      };
      return total + (impactByLevel[patient.triage_level] || 3);
    }, 0);
    
    // Calculate new department load, capped at 98%
    const calculatedDepartmentLoad = Math.min(baseLoad + patientImpact, 98);
    
    // Update bed availability based on department load
    const occupiedBeds = Math.round(TOTAL_BEDS * calculatedDepartmentLoad / 100);
    const availableBeds = TOTAL_BEDS - occupiedBeds;
    
    setStats({
      ...stats,
      patientsWaiting,
      averageWaitTime,
      departmentLoad: calculatedDepartmentLoad,
      bedAvailability: {
        total: TOTAL_BEDS,
        available: availableBeds,
        occupied: occupiedBeds
      },
      triageLevelCounts,
      recentAssessments
    });
    
    // Save to localStorage
    localStorage.setItem('patients', JSON.stringify(patients));
  }, [patients]);

  // Function to add a new patient
  const addPatient = (patientData, triageResult) => {
    // Format current time
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const currentTime = `${hours}:${minutes}`;
    
    // Generate a patient ID (in a real app, this would come from backend)
    const nextId = patients.length > 0
      ? 'P' + (parseInt(patients[0].id.substring(1)) + 1).toString().padStart(3, '0')
      : 'P001';
    
    // Get the base wait time for this triage level
    const baseWaitTime = BASE_WAIT_TIMES[triageResult.triage_level] || 30;
    
    // Adjust wait time based on current department load
    // As department gets busier, wait times increase
    let adjustedWaitTime = baseWaitTime;
    if (stats.departmentLoad > 60) {
      // Each 10% over 60% increases wait time by 15%
      const loadFactor = 1 + ((stats.departmentLoad - 60) / 100) * 1.5;
      adjustedWaitTime = Math.round(baseWaitTime * loadFactor);
    }
    
    // Add some randomness (+/- 20%)
    const randomFactor = 0.8 + (Math.random() * 0.4); // 0.8 to 1.2
    adjustedWaitTime = Math.round(adjustedWaitTime * randomFactor);
    
    // Create new patient object
    const newPatient = {
      id: nextId,
      age: patientData.age,
      sex: patientData.sex === '1' ? 'M' : 'F',
      chief_complaint: patientData.chief_complaint,
      arrival_time: currentTime,
      triage_level: triageResult.triage_level,
      wait_time: adjustedWaitTime,
      vital_signs: {
        sbp: patientData.vital_signs.sbp || 120,
        hr: patientData.vital_signs.hr || 80,
        rr: patientData.vital_signs.rr || 16
      },
      processing_time: 0 // Initialize processing time
    };
    
    // Add arrival activity
    const newActivity = {
      id: `ACT-${Date.now()}`,
      time: currentTime,
      type: 'Arrival',
      patientId: nextId,
      details: `${newPatient.age} y/o ${newPatient.sex} - ${newPatient.chief_complaint}`,
      level: newPatient.triage_level
    };
    
    // Update activities
    const updatedActivities = [newActivity, ...recentActivities].slice(0, 10);
    setRecentActivities(updatedActivities);
    localStorage.setItem('recentActivities', JSON.stringify(updatedActivities));
    
    // Add to the beginning of the array for most recent first
    setPatients([newPatient, ...patients]);
    
    return nextId; // Return the ID for navigation
  };

  // Function to manually discharge a patient (for user interaction)
  const dischargePatient = (patientId) => {
    const patientIndex = patients.findIndex(p => p.id === patientId);
    
    if (patientIndex !== -1) {
      // Get the patient for activity log
      const patient = patients[patientIndex];
      
      // Add to activity log
      addDischargeActivity(patient);
      
      // Remove patient from array
      const updatedPatients = [...patients];
      updatedPatients.splice(patientIndex, 1);
      setPatients(updatedPatients);
      
      return true;
    }
    
    return false;
  };

  // Provide the context value
  const contextValue = {
    patients,
    stats,
    recentActivities,
    addPatient,
    dischargePatient
  };

  return (
    <PatientContext.Provider value={contextValue}>
      {children}
    </PatientContext.Provider>
  );
};

// Custom hook to use the patient context
export const usePatients = () => {
  const context = useContext(PatientContext);
  if (context === undefined) {
    throw new Error('usePatients must be used within a PatientProvider');
  }
  return context;
};