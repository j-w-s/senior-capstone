import { Injectable } from '@angular/core';
import { doc, getFirestore, onSnapshot, query, where, getDocs, addDoc, deleteDoc, collection, setDoc } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { getFirestoreOptions } from 'firebase-admin/lib/firestore/firestore-internal';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { initializeAppCheck, ReCaptchaV3Provider } from '@firebase/app-check';

const firebaseConfig = {
  apiKey: "AIzaSyAUxQ8rHeBD8VwHJ2Cu4nMYenkEHFjQPQw",
  authDomain: "animal-adopt-d41d0.firebaseapp.com",
  databaseURL: "https://animal-adopt-d41d0-default-rtdb.firebaseio.com",
  projectId: "animal-adopt-d41d0",
  storageBucket: "animal-adopt-d41d0.appspot.com",
  messagingSenderId: "365373523489",
  appId: "1:365373523489:web:e8db7a7cb903c823640560",
  measurementId: "G-34K0D0GLV0"
};

@Injectable({
  providedIn: 'root'
})
export class LoginRegService {
  private db;
  private app;
  private auth;
  public tabIndex = 0;

  constructor() {
    this.auth = getAuth();
    this.app = initializeApp(firebaseConfig);
    this.db = getFirestore(this.app);

    if (!this.app) {
      this.initializeAppCheck();
    }
  }

  private initializeAppCheck() {
    const appCheck = initializeAppCheck(this.app, {
      provider: new ReCaptchaV3Provider('8893450a-265c-4e3f-b16c-ef1974044c28'),
    });
    appCheck.app;
  }

  async signInWithMyCredentials() {
    await signInWithEmailAndPassword(this.auth, 'ceb089@email.latech.edu', 'Cbailey431102!');
  }

  async checkIfUserExists(usernameOrEmail: string, password: string) {
    const userCollection = collection(this.db, "Login");
    const emailQuery = query(userCollection, where("userEmail", "==", usernameOrEmail));
    const usernameQuery = query(userCollection, where("userName", "==", usernameOrEmail));
    const passwordQuery = query(userCollection, where("password", "==", password));

    const emailQuerySnapshot = await getDocs(emailQuery);
    const usernameQuerySnapshot = await getDocs(usernameQuery);
    const passwordQuerySnapshot = await getDocs(passwordQuery);

    if ((!emailQuerySnapshot.empty || !usernameQuerySnapshot.empty) && !passwordQuerySnapshot.empty) {
      console.log('User exists');
      return true;
    } else {
      console.log('User does not exist');
      return false;
    }
  }

  async getUserData(usernameOrEmail: string) {
    const userCollection = collection(this.db, "User");
    const emailQuery = query(userCollection, where("userEmail", "==", usernameOrEmail));
    const usernameQuery = query(userCollection, where("userDisplayName", "==", usernameOrEmail));

    const emailQuerySnapshot = await getDocs(emailQuery);
    const usernameQuerySnapshot = await getDocs(usernameQuery);

    if (!emailQuerySnapshot.empty) {
      return emailQuerySnapshot.docs[0].data();
    } else if (!usernameQuerySnapshot.empty) {
      return usernameQuerySnapshot.docs[0].data();
    } else {
      console.log("Error");
      return {};
    }
  }

  async checkIfRegistered(username: string, email: string) {
    const userCollection = collection(this.db, "User");
    const emailQuery = query(userCollection, where("userEmail", "==", email));
    const usernameQuery = query(userCollection, where("userName", "==", username));

    const emailQuerySnapshot = await getDocs(emailQuery);
    const usernameQuerySnapshot = await getDocs(usernameQuery);

    if(!emailQuerySnapshot.empty) {
      return true;
    }
    else if(!usernameQuerySnapshot.empty) {
      return true;
    }
    else {
      return false;
    }
  }

  /*async registerUser(registerForm: FormBuilder) {
    const userCollection = collection(this.db, "User");
    
    // Add a new document with a generated id.
    const docRef = await addDoc(userCollection, {
        username: registerForm.username,
        password: registerForm.password,
        email: registerForm.email,
        phonenumber: registerForm.phonenumber;
        firstname: registerForm.firstname;
        lastname: registerForm.lastname;
      });
      console.log("Document written with ID: ", docRef.id);
  }*/


  seeDatabase(): any {
    console.log(this.db);
  }
}
