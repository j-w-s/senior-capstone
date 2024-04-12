import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-scheduler',
  templateUrl: './scheduler.component.html',
  styleUrl: './scheduler.component.scss'
})
export class SchedulerComponent {
  currentMonth = new Date().getMonth();
  currentYear = new Date().getFullYear();
  items: { [key: string]: any[] } = {};
  showModal: boolean = false;
  appointmentForm: FormGroup;
  day: any;
  month: any;
  year: any;
  constructor(private fb: FormBuilder) {
    this.appointmentForm = this.fb.group({
      userDisplayName: ['', Validators.required],
      appointmentDate: ['', Validators.required],
      notes: ['']
    });
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
    if (this.appointmentForm.valid) {
      console.log(this.appointmentForm.value);
      // Handle form submission here
      this.showModal = false;
    }
  }
}
