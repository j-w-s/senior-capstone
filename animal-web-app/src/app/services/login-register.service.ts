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
        this.getUserDetails(user.uid);
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
    // creates a user account user firebase function
    return createUserWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        // gets the UID of the signed in user
        const user = userCredential.user.uid;

        try {
          // gets the firestore data
          const db = getFirestore();
          // creates a document named after 'const user' in the User collection
          await setDoc(doc(db, "User", user+''), {
            userId: user,
            userFirstName: firstname,
            userLastName: lastname,
            userPhoneNumber: phonenumber,
            userEmail: email,
            userDisplayName: username,
            userBiography: '',
            userImage: 'pugster.webp',
            userAccountType: 1,
            userPreferences: [],
            userRatings: [],
            petsOwned: [],
            petsLost: [],
            userGroups: [],
          });
          console.log("User Account Created!");

          // calls function to map username to document in User collection
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
    let email = usernameOrEmail;
    const db = getFirestore();

    // fetch the user's email from Firestore
    const usernameMappingRef = doc(db, "UsernameMapping", usernameOrEmail);
    const usernameMappingDoc = await getDoc(usernameMappingRef);

    if (usernameMappingDoc.exists()) {
      const pathToUserDoc = usernameMappingDoc.data()['userID'];
      const userRef = doc(db, pathToUserDoc.path);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        email = userDoc.data()['userEmail'];
      }
    }

    // Now that we have the email, proceed with the sign-in
    return signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
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

  // method to get user details including the role
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
