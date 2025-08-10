export const getTodayString = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  const options = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  return date.toLocaleDateString('en-IN', options);
};

export const formatTime = (timeString) => {
  return timeString;
};

export const getDateStatus = (appointmentCount) => {
  if (appointmentCount === 0) return 'available';
  if (appointmentCount <= 2) return 'partial';
  return 'booked';
};

export const isToday = (dateString) => {
  return dateString === getTodayString();
};

export const isPast = (dateString) => {
  return dateString < getTodayString();
};

export const isFuture = (dateString) => {
  return dateString > getTodayString();
};