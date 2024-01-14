import { Component } from '@angular/core';
import { LoginRegisterService } from '../services/login-register.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  constructor(public loginRegService: LoginRegisterService) {

  }

  showPopup = false;
  menuListItems = [
    { menuLinkText: 'Settings', menuIcon: 'settings', isDisabled: true },
    { menuLinkText: 'About Us', menuIcon: 'people', isDisabled: true },
    { menuLinkText: 'Help', menuIcon: 'help', isDisabled: true },
    { menuLinkText: 'Contact', menuIcon: 'contact', isDisabled: true }
  ];

  updateTabIndex(): void {
    if (this.loginRegService.tabIndex === 9) {
      this.loginRegService.tabIndex = 0;
    } else {
      this.loginRegService.tabIndex = 9;
    }
  }

}
