import { Component, OnInit } from '@angular/core';
import { LoginRegisterService } from '../services/login-register.service';
import { SchedulerService } from '../services/scheduler.service';
import { finalize, Observable, of, Subscription } from 'rxjs';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { v4 as uuidv4 } from 'uuid';
import Appointment from '../../models/appointment';
import User from '../../models/user';
import { MessengerService } from '../services/messenger.service';
import { AlertsService } from '../services/alerts.service';

@Component({
  selector: 'app-scheduler',
  templateUrl: './scheduler.component.html',
  styleUrl: './scheduler.component.scss'
})
export class SchedulerComponent implements OnInit {
  currentMonth = new Date().getMonth();
  currentYear = new Date().getFullYear();
  items: { [key: string]: any[] } = {};
  showModal: boolean = false;
  appointmentForm: FormGroup;
  day: any;
  month: any;
  year: any;
  userAppointments: Appointment[] = [];
  scheduleAppointments: Appointment[] = [];
  userContacts!: any;
  contactNames!: any[];
  appointmentsForSelectedDate$: Observable<Appointment[]> | undefined;

  constructor(private fb: FormBuilder, public loginRegService: LoginRegisterService, public schedulerService: SchedulerService, public messengerService: MessengerService, public alertsService: AlertsService) {
    this.appointmentForm = this.fb.group({
      userDisplayName: ['', Validators.required],
      appointmentDate: ['', Validators.required],
      appointmentLocation: ['', Validators.required],
      appointmentCreator: [this.loginRegService.userData.userId, Validators.required],
      notes: ['']
    });
  }

  openModal(): void {
    const showScheduleModal = document.getElementById('showScheduleModal') as HTMLInputElement;
    showScheduleModal.checked = true;
  }

  closeModal(): void {
    const showScheduleModal = document.getElementById('showScheduleModal') as HTMLInputElement;
    showScheduleModal.checked = false;
  }

  async ngOnInit() {
    const userDetails = this.loginRegService.loadUserDetailsFromCache("") as User;
    const userId = userDetails.userId;
    const userContactIds = [];
    this.userContacts = [];
    this.userContacts = await this.messengerService.getContacts() as any[];
    for (const contact of this.userContacts) {
      const id = contact._key.path.segments[contact._key.path.segments.length - 1];
      console.log(id); // This prints the ID of each contact
      userContactIds.push(id);
    }

    this.contactNames = [];

    // Iterate over userContactIds and fetch user data
    for (const contactId of userContactIds) {
      const user = await this.messengerService.getUserById2(contactId);
      // Extract userDisplayName and push it into the userDisplayNames array
      if (user) {
        this.contactNames.push(user.userDisplayName);
      }
    }

    // Log the array of user display names
    console.log(this.contactNames);

    if (userDetails.appointments) {
      this.userAppointments = userDetails.appointments;
      console.log(this.userAppointments);
    }
  }

  checkAppointmentExists(date: string): boolean {
    return this.userAppointments.some(appointment => appointment.appointmentDate as unknown as string === date);
  }

  formatDate(year: number, month: number, day: number): string {
    const formattedMonth = month + 1;
    const formattedDay = day < 10 ? `0${day}` : day;
    const formattedMonthStr = formattedMonth < 10 ? `0${formattedMonth}` : formattedMonth;
    return `${year}-${formattedMonthStr}-${formattedDay}`;
  }

  getAppointmentsForDate(year: number, month: number, day: number): Observable<Appointment[]> {
    const appointmentDate = this.formatDate(year, month, day);
    const appointments = this.userAppointments.filter(appointment => {
      return appointment.appointmentDate as unknown as string === appointmentDate;
    });
    return of(appointments);
  }

  getDaysInMonth(month: number, year: number): number {
    this.month = month;
    this.year = year;
    return new Date(year, month, 0).getDate();
  }

  getFirstDayOfMonth(month: number, year: number): number {
    return new Date(year, month, 1).getDay();
  }

  getItemsForDay(day: number): any[] {
    const key = `${this.currentYear}-${this.currentMonth + 1}-${day}`;
    return this.items[key] || [];
  }

  changeMonth(offset: number): void {
    this.currentMonth += offset;
    if (this.currentMonth > 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else if (this.currentMonth < 0) {
      this.currentMonth = 11;
      this.currentYear--;
    }
  }

  selectDay(day: number): void {
    this.day = day;
    this.appointmentsForSelectedDate$ = this.getAppointmentsForDate(this.currentYear, this.currentMonth, day);
  }

  onSubmit() {
    let createdAppointment = this.schedulerService.createAppointment(this.appointmentForm.value as Appointment);

    createdAppointment.then(() => {
      this.appointmentForm.reset();
      this.alertsService.show('success', 'Appointment created successfully.');
      setTimeout(() => {
      }, 3000);
    }).catch((error) => {
      this.alertsService.show('error', 'There was an error creating your appointment. Please try again.');
    });
  }

}
