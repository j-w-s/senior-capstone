// login-register.service.ts
import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database'; // Updated import statement
import 'firebase/database';
import { Observable } from 'rxjs';
import * as bcrypt from 'bcryptjs';

@Injectable({
  providedIn: 'root'
})
export class LoginRegisterService {

  constructor(private db: AngularFireDatabase) { }

  // hash password (security)
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  }

  // validate login credentials
  async validateLogin(usernameOrEmail: string, password: string): Promise<boolean> {
    const storedCredentials = await this.getLoginCredentials(usernameOrEmail).toPromise();
    if (storedCredentials && password) {
      return await bcrypt.compare(password, storedCredentials.password);
    }
    return false;
  }

  // retrieve user information based on username or email
  getUserInfoForLogin(usernameOrEmail: string): Observable<any> {
    return this.getUserData(usernameOrEmail);
  }

  // check if registration details are valid
  async checkRegistration(username: string, email: string): Promise<{ isValid: boolean, message: string }> {
    try {
      const existingUser = await this.getUserData(username).toPromise();
      if (existingUser) {
        return { isValid: false, message: 'Username already exists.' };
      }
      const existingEmail = await this.getRegistrationDetails(email).toPromise();
      if (existingEmail) {
        return { isValid: false, message: 'Email already exists.' };
      }
      return { isValid: true, message: 'Registration details are valid.' };
    } catch (error) {
      console.error('Error checking registration:', error);
      return { isValid: false, message: 'Error checking registration.' };
    }
  }

  // register a new user account
  async registerUser(username: string, registrationData: any): Promise<{ success: boolean, message: string, userInfo?: any }> {
    try {
      const hashedPassword = await this.hashPassword(registrationData.password);
      const userData = { ...registrationData, password: hashedPassword };
      await this.storeUserData(username, userData);
      return { success: true, message: 'Account created successfully.', userInfo: userData };
    } catch (error) {
      console.error('Error creating account:', error);
      return { success: false, message: 'Error creating account.' };
    }
  }

  getLoginCredentials(usernameOrEmail: string): Observable<any> {
    return this.db.object(`users/${usernameOrEmail}`).valueChanges();
  }

  getUserData(usernameOrEmail: string): Observable<any> {
    return this.db.object(`users/${usernameOrEmail}`).valueChanges();
  }

  storeUserData(username: string, userData: any): Promise<void> {
    return this.db.object(`users/${username}`).set(userData);
  }

  getRegistrationDetails(email: string): Observable<any> {
    return this.db.list('users', ref => ref.orderByChild('email').equalTo(email).limitToFirst(1)).valueChanges();
  }

}
