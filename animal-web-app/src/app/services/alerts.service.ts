// alerts.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

@Injectable({
  providedIn: 'root'
})
export class AlertsService {
  private alertSource = new BehaviorSubject<{ show: boolean, type: AlertType, message: string }>({ show: false, type: 'success', message: '' });
  alert$ = this.alertSource.asObservable();

  show(type: AlertType, message: string) {
    this.alertSource.next({ show: true, type, message });
    setTimeout(() => {
      this.alertSource.next({ show: false, type, message });
    }, 3000);
  }

  closeModal(modalId: string) {
    const modalElement = document.getElementById(modalId) as HTMLDialogElement;
    if (modalElement) {
      modalElement.close();
    }
  }
}
