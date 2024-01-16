import { Injectable } from '@angular/core';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { doc, getFirestore, setDoc } from '@angular/fire/firestore';
import { AngularFireModule } from '@angular/fire/compat';
import { LoginRegisterComponent } from '../login-register/login-register.component';

@Injectable({
  providedIn: 'root'
})
export class LoginRegisterService {

  public tabIndex = 0;
  public isLoggedIn = false;
  public currentUser = '';

  constructor() {  
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {

      if(user != undefined || user != null) {
        console.log('Service detected change: ' + user.uid);
        this.isLoggedIn = true;
        this.currentUser = user.uid;
      }
      else {
        // User is signed out
        this.isLoggedIn = false;
        this.currentUser = '';
      }
    });
  }

  registerUser(email: string, password: string, firstname: string, lastname: string, phonenumber: string, username: string): Promise<any> {
    const auth = getAuth();
    return createUserWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        // Signed up 
        const user = userCredential.user.uid;
        console.log('User was registered: ' + user);

        try {
          const db = getFirestore();
          const docRef = await setDoc(doc(db, "Users", user+''), {
            firstname: firstname,
            lastname: lastname,
            phonenumber: phonenumber,
            username: username,
          });
          console.log("Document written");
        } catch (e) {
          console.error("Error adding document: ", e);
        }

        // ...
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log('Error: ' + errorMessage + " Code: " + errorCode);
        // ..
      });
  }

  loginUser(email: string, password: string): Promise<any> {
    const auth = getAuth();
    return signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed in 
      const user = userCredential.user.uid;
      console.log('User was signed in!');
      // ...
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log('Error: ' + errorMessage + " Code: " + errorCode);
    });
  }

  signoutUser() {
    const auth = getAuth();
    const user = auth.currentUser?.uid;
    console.log('UID: ' + user);
    if(!this.isLoggedIn) {
      console.log('No user was signed in!');
      return false;
    }
    else {
      return signOut(auth).then(() => {
        console.log('User was signed out!');
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log('Error: ' + errorMessage + " Code: " + errorCode);
      });
    }
  }


}
