import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoginRegisterService } from '../services/login-register.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  constructor(public loginRegService: LoginRegisterService, private router: Router) {

  }

}
