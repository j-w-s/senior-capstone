import { Injectable } from '@angular/core';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, getFirestore, setDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class LoginRegisterService {

  public tabIndex = 0;
  public isLoggedIn = false;
  public currentUser = '';
  //public currentUserObject: any;

  constructor() {  
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {

      if(user != undefined || user != null) {
        console.log('Service detected change for userID: ' + user.uid);
        this.isLoggedIn = true;
        this.currentUser = user.uid;
        //this.currentUserObject = user;
      }
      else {
        // User is signed out
        this.isLoggedIn = false;
        this.currentUser = '';
        //this.currentUserObject = null;
      }
    });
  }

  registerUser(email: string, password: string, firstname: string, lastname: string, phonenumber: string, username: string): Promise<any> {
    const auth = getAuth();
    // Creates a user account user firebase function
    return createUserWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        // Gets the UID of the signed in user
        const user = userCredential.user.uid;

        try {
          // Gets the firestore data
          const db = getFirestore();
          // Creates a document named after 'const user' in the User collection
          await setDoc(doc(db, "User", user+''), {
            userId: user,
            userFirstName: firstname,
            userLastName: lastname,
            userPhoneNumber: phonenumber,
            userEmail: email,
            userDisplayName: username,
            userBiography: '',
            userImage: 'pugster.webp',
            userAccountTypes: 1,
            userPreferences: [],
            userRatings: [],
            petsOwned: [],
            petsLost: [],
            userGroups: [],
          });
          console.log("User Account Created!");

          // Calls function to map username to document in User collection
          this.createUsernameMapping(user, username);
        } catch (e) {
          console.error("Error creating account: ", e);
        }
      })
      .catch((error) => {
        console.log('Error: ' + error);
      });
  }

  async createUsernameMapping(userID: string, username: string) {
    const auth = getAuth();
    try {
      // Gets the firestore database
      const db = getFirestore();
      // Creates a document named after 'username' in UsernameMapping Collection
      // and sets the 'userID' field to the reference to the corresponding document in User collection
      await setDoc(doc(db, "UsernameMapping", username+''), {
        userID: doc(db, 'User/' + userID),
      });
      console.log("Mapping successful");
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }

  async loginUser(usernameOrEmail: string, password: string): Promise<any> {
    const auth = getAuth();
    // Stores usernameOrEmail and has it changed to an email if its the username
    let email = usernameOrEmail;
    // Gets the firestore database
    const db = getFirestore();

    try {
      // Gets a reference to a document, in the UserMapping collection
      const usernameMappingRef = doc(db, "UsernameMapping", usernameOrEmail);
      await getDoc(usernameMappingRef).then(async (usernameMappingDoc) => {
        // Checks to see if the UsernameMaping exists
        if (usernameMappingDoc.exists()) {
          // Gets the reference to the document in the User collection
          const pathToUserDoc = usernameMappingDoc.data()['userID']
          // Creates reference to the document in the User collection
          const userRef = doc(db, pathToUserDoc.path);
          // Gets the document in the User collection that contains the email for that user
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            // Saves the email in the database to the email variable to be used for login
            email = userDoc.data()['userEmail']
            console.log('Email: ' + email)
          }
        }
      })
    } catch (error) {
      console.log('Error: ' + error);
    }

    return signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed in 
      const user = userCredential.user.uid;
      console.log('User was signed in!');
    })
    .catch((error) => {
      console.log('Error: ' + error);
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

  public getCurrentUser(): Promise<string> {
    return new Promise((resolve, reject) => {
      const auth = getAuth();
      onAuthStateChanged(auth, (user) => {
        if (user != undefined || user != null) {
          this.isLoggedIn = true;
          this.currentUser = user.uid;
          resolve(this.currentUser);
        }
        else {
          // User is signed out
          this.isLoggedIn = false;
          this.currentUser = '';
          reject('User is not logged in');
        }
      });
    });
  }

}
