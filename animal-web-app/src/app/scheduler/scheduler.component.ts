import { Component, OnInit } from '@angular/core';
import { LoginRegisterService } from '../services/login-register.service';
import { SchedulerService } from '../services/scheduler.service';
import { finalize, Observable, Subscription } from 'rxjs';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { v4 as uuidv4 } from 'uuid';
import Appointment from '../../models/appointment';
import User from '../../models/user';

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
  userAppointments: Appointment[] = []
  constructor(private fb: FormBuilder, public loginRegService: LoginRegisterService, public schedulerService: SchedulerService) {
    this.appointmentForm = this.fb.group({
      userDisplayName: ['', Validators.required],
      appointmentDate: ['', Validators.required],
      appointmentLocation: ['', Validators.required],
      appointmentCreator: [this.loginRegService.userData.userId, Validators.required],
      notes: ['']
    });
  }

  ngOnInit() {
    const userDetails = this.loginRegService.loadUserDetailsFromCache("") as User;
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
  }

  onSubmit() {
    console.log(this.appointmentForm.value);
    let poop = this.schedulerService.createAppointment(this.appointmentForm.value as Appointment);
    this.showModal = false;
  }
}
