import User from './user';

interface Appointment {
  parties: User[];
  appointmentTime: Date;
  appointmentLocation: string;
  active: boolean;
}
export default Appointment;
