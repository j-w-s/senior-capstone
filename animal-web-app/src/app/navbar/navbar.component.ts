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

  showPopup = false;
  menuListItems = [
    { menuLinkText: 'Settings', menuIcon: 'settings', isDisabled: true },
    { menuLinkText: 'About Us', menuIcon: 'people', isDisabled: true },
    { menuLinkText: 'Help', menuIcon: 'help', isDisabled: true },
    { menuLinkText: 'Contact', menuIcon: 'contact', isDisabled: true}
  ];

  accountListItems = [
    { menuLinkText: 'Account Info', menuIcon: 'account_box', isDisabled: true, onClick: () => this.loginRegService.signoutUser() },
    { menuLinkText: 'Groups', menuIcon: 'group', isDisabled: true, onClick: () => this.loginRegService.signoutUser() },
    { menuLinkText: 'Sign Out', menuIcon: 'login', isDisabled: false, onClick: () => this.loginRegService.signoutUser() }
  ]

  updateTabIndex(): void {
    if (this.loginRegService.tabIndex === 9) {
      this.loginRegService.tabIndex = 0;
    } else {
      this.loginRegService.tabIndex = 9;
    }
  }

  userLoggedIn() {
    return this.loginRegService.isLoggedIn;
   }

}
