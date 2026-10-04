import User from './user';

interface Appointment {
  userDisplayName: string;
  appointmentDate: Date;
  appointmentLocation: string;
  appointmentCreator: string;
  notes: string;
}

export default Appointment
