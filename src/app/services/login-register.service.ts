import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database'; // Updated import statement
import 'firebase/database';
import { Observable } from 'rxjs';
import * as bcrypt from 'bcryptjs';
import { initializeApp } from 'firebase/app';
import {
  UserCredential,
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { doc, getFirestore, setDoc } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { environment } from '../../environments/environment'
import { from, switchMap, of } from 'rxjs';
import { forkJoin } from 'rxjs';
import { AngularFirestore } from '@angular/fire/compat/firestore';

const app = initializeApp(environment.firebase);
const auth = getAuth();
const db = getFirestore(app);
const functions = getFunctions(app, 'us-central1');

@Injectable({
  providedIn: 'root'
})
export class LoginRegisterService {

  constructor(private afs: AngularFirestore) { }

  // hash password (security)
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  }

  // validate login credentials
  async validateLogin(usernameOrEmail: string, password: string): Promise<boolean> {
    const storedCredentials = await this.getLoginCredentials("User", usernameOrEmail);
    if (storedCredentials && password) {
      return await bcrypt.compare(password, storedCredentials.password);
    }
    return false;
  }

  // retrieve user information based on username or email
  getUserInfoForLogin(usernameOrEmail: string): Observable<any> {
    return this.getUserData("User", usernameOrEmail);
  }

  // check if registration details are valid
  async checkRegistration(username: string, email: string): Promise<{ isValid: boolean, message: string }> {
    try {
      const existingUser = await this.getUserData("User", username);
      if (existingUser) {
        return { isValid: false, message: 'Username already exists.' };
      }
      const existingEmail = await this.getRegistrationDetails(email);
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

  async getLoginCredentials(collectionName: string, usernameOrEmail: string): Promise<any> {
    const snapshot = await this.afs.collection('User').ref.where('userEmail', '==', usernameOrEmail).get();
    if (!snapshot.empty) {
      return snapshot.docs[0].data();
    } else {
      throw new Error(`No account associated with ${usernameOrEmail}`);
    }
  }

  getUserData(collectionName: string, usernameOrEmail: string): Observable<any> {
    return this.afs.collection(collectionName).doc(usernameOrEmail).valueChanges();
  }

  async getRegistrationDetails(email: string): Promise<any> {
    const snapshot = await this.afs.collection('User').ref.where('userEmail', '==', email).get();
    if (!snapshot.empty) {
      return snapshot.docs[0].data();
    } else {
      throw new Error(`No account associated with ${email}`);
    }
  }

  async storeUserData(username: string, userData: any): Promise<void> {
    await this.afs.collection('User').doc(username).set(userData);
  }

}
