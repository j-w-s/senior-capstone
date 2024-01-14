import { Injectable } from '@angular/core';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, getFirestore, setDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class LoginRegisterService {

  public tabIndex = 0;

  constructor() {  
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
  

}
