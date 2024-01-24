import { Component } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { MessengerService } from '../services/messenger.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {

  days = Array.from({ length: 5 }, (_, i) => Array.from({ length: 7 }, (__, j) => i * 7 + j + 1));

  constructor(public messengerService: MessengerService, ) {

  }

}
