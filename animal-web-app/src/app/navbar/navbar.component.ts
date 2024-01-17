import { Component } from '@angular/core';
import { LoginRegisterService } from '../services/login-register.service';
import { Router } from '@angular/router';
import { LoginRegisterComponent } from '../login-register/login-register.component';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  constructor(public loginRegService: LoginRegisterService, private router: Router) {

  }

  handleButtonClick(action: string): void {
    this.router.navigate(['/login'], { state: { action } });
  }

  userLoggedIn() {
    return this.loginRegService.isLoggedIn;
   }

}
