import { Component } from '@angular/core';

@Component({
  selector: 'app-scheduler',
  templateUrl: './scheduler.component.html',
  styleUrl: './scheduler.component.scss'
})
export class SchedulerComponent {
  currentMonth = new Date().getMonth();
  currentYear = new Date().getFullYear();
  items: { [key: string]: any[] } = {}; 

  getDaysInMonth(month: number, year: number): number {
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
    console.log(`Selected day: ${day}`);
  }
}
