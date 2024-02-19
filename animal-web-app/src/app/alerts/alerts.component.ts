// alert.component.ts
import { Component } from '@angular/core';
import { AlertsService, AlertType } from '../services/alerts.service'; 

@Component({
  selector: 'app-alerts',
  templateUrl: './alerts.component.html',
  styleUrls: ['./alerts.component.scss']
})
export class AlertComponent {
  alertClass!: string;

  constructor(private alertService: AlertsService) {
    this.alertService.alert$.subscribe(alert => {
      switch (alert.type) {
        case 'success':
          this.alertClass = 'alert-success';
          break;
        case 'error':
          this.alertClass = 'alert-error';
          break;
        case 'warning':
          this.alertClass = 'alert-warning';
          break;
        case 'info':
          this.alertClass = 'alert-info';
          break;
        default:
          this.alertClass = 'alert-success';
      }
    });
  }
}
