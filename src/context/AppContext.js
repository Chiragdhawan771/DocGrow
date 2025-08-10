import React, {createContext, useContext, useState, useEffect} from 'react';
import {colors} from '../styles/colors';

// Initial data
const initialDoctorInfo = {
  name: 'Dr. Rajesh Mehta',
  specialization: 'General Physician',
  experience: '15 years',
};

const initialAppointments = [
  {
    id: '1',
    patientName: 'Priya Sharma',
    time: '09:00 AM',
    date: '2025-08-08',
    issue: 'Regular Checkup',
    status: 'confirmed',
    notes: 'Annual health checkup. Patient reports feeling well.',
    contact: '+91 9876543210',
  },
  {
    id: '2',
    patientName: 'Amit Singh',
    time: '10:30 AM',
    date: '2025-08-08',
    issue: 'Fever and Cough',
    status: 'confirmed',
    notes: 'Fever for 3 days, dry cough. Prescribed medication.',
    contact: '+91 9876543211',
  },
  {
    id: '3',
    patientName: 'Sunita Devi',
    time: '11:15 AM',
    date: '2025-08-08',
    issue: 'Blood Pressure Check',
    status: 'completed',
    notes: 'BP: 140/90. Advised lifestyle changes.',
    contact: '+91 9876543212',
  },
  {
    id: '4',
    patientName: 'Rahul Kumar',
    time: '02:00 PM',
    date: '2025-08-09',
    issue: 'Diabetes Follow-up',
    status: 'confirmed',
    notes: 'HbA1c test due. Check blood sugar levels.',
    contact: '+91 9876543213',
  },
  {
    id: '5',
    patientName: 'Anjali Gupta',
    time: '03:30 PM',
    date: '2025-08-09',
    issue: 'Skin Consultation',
    status: 'pending',
    notes: 'Rash on arms. Possible allergic reaction.',
    contact: '+91 9876543214',
  },
  {
    id: '6',
    patientName: 'Vikram Patel',
    time: '10:00 AM',
    date: '2025-08-10',
    issue: 'Joint Pain',
    status: 'confirmed',
    notes: 'Knee pain for 2 weeks. Physical examination needed.',
    contact: '+91 9876543215',
  },
];

const initialCalendarData = {
  '2025-08-08': {marked: true, dotColor: colors.error, appointmentCount: 3},
  '2025-08-09': {marked: true, dotColor: colors.warning, appointmentCount: 2},
  '2025-08-10': {marked: true, dotColor: colors.success, appointmentCount: 1},
  '2025-08-12': {marked: true, dotColor: colors.warning, appointmentCount: 2},
  '2025-08-15': {marked: true, dotColor: colors.success, appointmentCount: 1},
};

// Create context
const AppContext = createContext();

// Context provider component
export const AppProvider = ({children}) => {
  const [doctorInfo, setDoctorInfo] = useState(initialDoctorInfo);
  const [allAppointments, setAllAppointments] = useState(initialAppointments);
  const [calendarData, setCalendarData] = useState(initialCalendarData);
  const [appointmentFilter, setAppointmentFilter] = useState('today');
  
  // ADD MISSING STATE FOR SELECTED DATE
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split('T')[0]; // Today's date in YYYY-MM-DD format
  });

  // Helper function to get today's date in YYYY-MM-DD format
  const getTodaysDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  // ADD MISSING getTodayString function that your CalendarScreen uses
  const getTodayString = () => {
    return new Date().toISOString().split('T')[0];
  };

  // Helper function to get appointment count for a date
  const getAppointmentCountForDate = (date) => {
    return allAppointments.filter(apt => apt.date === date).length;
  };

  // Helper function to get dot color based on appointment count
  const getDotColorForCount = (count) => {
    if (count >= 4) return colors.error;
    if (count >= 2) return colors.warning;
    return colors.success;
  };

  // Update calendar data when appointments change
  const updateCalendarData = () => {
    const newCalendarData = {};
    
    // Group appointments by date
    const appointmentsByDate = allAppointments.reduce((acc, appointment) => {
      const date = appointment.date;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(appointment);
      return acc;
    }, {});

    // Create calendar data for each date with appointments
    Object.keys(appointmentsByDate).forEach(date => {
      const appointmentCount = appointmentsByDate[date].length;
      newCalendarData[date] = {
        marked: true,
        dotColor: getDotColorForCount(appointmentCount),
        appointmentCount: appointmentCount,
      };
    });

    setCalendarData(newCalendarData);
  };

  // Update calendar data whenever appointments change
  useEffect(() => {
    updateCalendarData();
  }, [allAppointments]);

  // Add new appointment
  const addAppointment = (appointmentData) => {
    const newAppointment = {
      ...appointmentData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9), // More unique ID
    };

    setAllAppointments(prevAppointments => {
      const updatedAppointments = [...prevAppointments, newAppointment];
      return updatedAppointments.sort((a, b) => {
        // Sort by date first, then by time
        const dateComparison = new Date(a.date) - new Date(b.date);
        if (dateComparison !== 0) return dateComparison;
        
        // Convert time to comparable format for sorting
        const timeA = new Date(`1970-01-01 ${a.time}`);
        const timeB = new Date(`1970-01-01 ${b.time}`);
        return timeA - timeB;
      });
    });

    return newAppointment.id;
  };

  // Update appointment status
  const updateAppointmentStatus = (appointmentId, newStatus) => {
    setAllAppointments(prevAppointments =>
      prevAppointments.map(apt =>
        apt.id === appointmentId ? {...apt, status: newStatus} : apt
      )
    );
  };

  // Add appointment note
  const addAppointmentNote = (appointmentId, note) => {
    setAllAppointments(prevAppointments =>
      prevAppointments.map(apt =>
        apt.id === appointmentId ? {...apt, notes: note} : apt
      )
    );
  };

  // Delete appointment
  const deleteAppointment = (appointmentId) => {
    setAllAppointments(prevAppointments =>
      prevAppointments.filter(apt => apt.id !== appointmentId)
    );
  };

  // Get filtered appointments
  const getFilteredAppointments = (filter = appointmentFilter) => {
    const today = getTodaysDate();
    
    switch (filter) {
      case 'today':
        return allAppointments.filter(apt => apt.date === today);
      
      case 'upcoming':
        return allAppointments.filter(apt => apt.date > today);
      
      case 'past':
        return allAppointments.filter(apt => apt.date < today);
      
      case 'all':
        return allAppointments;
      
      default:
        return allAppointments;
    }
  };

  // Get appointments for a specific date
  const getAppointmentsForDate = (date) => {
    return allAppointments.filter(apt => apt.date === date);
  };

  // Get today's statistics
  const getTodayStats = () => {
    const today = getTodaysDate();
    const todayAppointments = allAppointments.filter(apt => apt.date === today);
    const completedToday = todayAppointments.filter(apt => apt.status === 'completed');
    
    // Get unique patients
    const uniquePatients = new Set(allAppointments.map(apt => apt.patientName.toLowerCase()));
    
    return {
      todayAppointments: todayAppointments.length,
      totalPatients: uniquePatients.size,
      completedToday: completedToday.length,
      pendingToday: todayAppointments.filter(apt => apt.status === 'pending').length,
      confirmedToday: todayAppointments.filter(apt => apt.status === 'confirmed').length,
    };
  };

  // Get appointment statistics
  const getAppointmentStats = () => {
    const totalAppointments = allAppointments.length;
    const completedAppointments = allAppointments.filter(apt => apt.status === 'completed').length;
    const pendingAppointments = allAppointments.filter(apt => apt.status === 'pending').length;
    const confirmedAppointments = allAppointments.filter(apt => apt.status === 'confirmed').length;
    const cancelledAppointments = allAppointments.filter(apt => apt.status === 'cancelled').length;
    
    return {
      total: totalAppointments,
      completed: completedAppointments,
      pending: pendingAppointments,
      confirmed: confirmedAppointments,
      cancelled: cancelledAppointments,
    };
  };

  // Check for appointment conflicts
  const checkAppointmentConflict = (date, time, excludeId = null) => {
    return allAppointments.some(apt => 
      apt.date === date && 
      apt.time === time && 
      apt.id !== excludeId &&
      apt.status !== 'cancelled'
    );
  };

  // Get available time slots for a date
  const getAvailableTimeSlots = (date) => {
    const allTimeSlots = [
      '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
      '12:00 PM', '12:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
      '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM'
    ];
    
    const bookedSlots = allAppointments
      .filter(apt => apt.date === date && apt.status !== 'cancelled')
      .map(apt => apt.time);
    
    return allTimeSlots.filter(slot => !bookedSlots.includes(slot));
  };

  // Context value - UPDATED TO INCLUDE MISSING PROPERTIES
  const value = {
    // Data
    doctorInfo,
    allAppointments,
    calendarData,
    appointmentFilter,
    selectedDate,        // ADD THIS
    
    // Setters
    setDoctorInfo,
    setAppointmentFilter,
    setSelectedDate,     // ADD THIS
    
    // Appointment operations
    addAppointment,
    updateAppointmentStatus,
    addAppointmentNote,
    deleteAppointment,
    
    // Getters
    getFilteredAppointments,
    getAppointmentsForDate,
    getTodayStats,
    getAppointmentStats,
    getAvailableTimeSlots,
    getTodayString,      // ADD THIS - your CalendarScreen uses this
    
    // Utilities
    checkAppointmentConflict,
    updateCalendarData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Hook to use the app context
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};