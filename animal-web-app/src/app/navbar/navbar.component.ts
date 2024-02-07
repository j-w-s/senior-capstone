import { Component } from '@angular/core';
import { LoginRegisterService } from '../services/login-register.service';
import { Router } from '@angular/router';
import { LoginRegisterComponent } from '../login-register/login-register.component';
import { doc, getDoc, getFirestore } from 'firebase/firestore';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  constructor(public loginRegService: LoginRegisterService, private router: Router) {

  }

  handleButtonClick(action: string): void {
    this.router.navigate([action]);
  }

  userLoggedIn() {
    return this.loginRegService.isLoggedIn;
  }

  // add a method to get user details including the role
  async getUserDetails(uid: string): Promise<any> {
    const db = getFirestore();
    const userRef = doc(db, "User", uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return userSnap.data();
    } else {
      throw new Error('User does not exist');
    }
  }

}
