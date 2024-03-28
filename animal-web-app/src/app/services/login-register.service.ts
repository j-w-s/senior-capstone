import { Injectable } from '@angular/core';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, getFirestore, setDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class LoginRegisterService {

  public tabIndex = 0;
  public isLoggedIn = true;
  public currentUser = '';
  public auth;
  //public currentUserObject: any;

  constructor() {
    const auth = getAuth();
    this.auth = auth;
    onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log('Service detected change for userID: ' + user.uid);
        this.isLoggedIn = true;
        this.currentUser = user.uid;

        const cachedUserDetails = this.loadUserDetailsFromCache(user.uid);
        if (cachedUserDetails) {
          console.log('Loaded user details from cache');

        } else {
          this.getUserDetails(user.uid).then(userDetails => {
            this.saveUserDetailsToCache(user.uid, userDetails);
          }).catch(err => console.error('Error loading user details:', err));

        }
      } else {
        this.isLoggedIn = false;
        this.currentUser = '';
      }
    });
  }

  async registerUser(email: string, password: string, firstname: string, lastname: string, phonenumber: string, username: string, image: string): Promise<any> {
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
            userImage: image,
            userAccountType: "1",
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

  public signoutUser() {
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

  // method to save user details to local storage
  saveUserDetailsToCache(uid: string, userDetails: any): void {
    localStorage.setItem(`user-details-${uid}`, JSON.stringify(userDetails));
  }

  // method to load user details from local storage
  loadUserDetailsFromCache(uid: string): any {
    const cachedUserDetails = localStorage.getItem(`user-details-${uid}`);
    return cachedUserDetails ? JSON.parse(cachedUserDetails) : null;
  }

  // getUserDetails uses cache now
  async getUserDetails(uid: string): Promise<any> {
    // try to load user details from cache
    const cachedUserDetails = this.loadUserDetailsFromCache(uid);
    if (cachedUserDetails) {
      return Promise.resolve(cachedUserDetails);
    }

    // if not in cache, fetch from Firestore
    const db = getFirestore();
    const userRef = doc(db, "User", uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userDetails = userSnap.data();
      // save user details to cache
      this.saveUserDetailsToCache(uid, userDetails);
      return userDetails;
    } else {
      throw new Error('User does not exist');
    }
  }

  // method to check if user details are in the cache
  checkUserDetailsInCache(uid: string): any {
    return this.loadUserDetailsFromCache(uid);
  }

  signOut() {
    return this.auth.signOut().then(() => {
      console.log('User signed out');
      // Clear all cache
      localStorage.clear();
    }).catch((error) => {
      console.error('Error signing out: ', error);
    })
  }
}
