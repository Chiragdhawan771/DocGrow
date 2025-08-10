import { colors } from "../styles/colors";

export const doctorInfo = {
  name: 'Dr. Rajesh Mehta',
  specialization: 'General Physician',
  experience: '15 years',
};

export const appointments = [
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

export const calendarData = {
  '2025-08-08': {marked: true, dotColor: colors.error, appointmentCount: 3},
  '2025-08-09': {marked: true, dotColor: colors.warning, appointmentCount: 2},
  '2025-08-10': {marked: true, dotColor: colors.success, appointmentCount: 1},
  '2025-08-12': {marked: true, dotColor: colors.warning, appointmentCount: 2},
  '2025-08-15': {marked: true, dotColor: colors.success, appointmentCount: 1},
};