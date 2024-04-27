import { Injectable, OnDestroy } from '@angular/core';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, getFirestore, setDoc } from '@angular/fire/firestore';
import { UserService } from './user.service';
import User from '../../models/user';
import { BehaviorSubject, Observable, of, Subject, takeUntil } from 'rxjs';
import { AngularFirestore, DocumentData, DocumentReference } from '@angular/fire/compat/firestore';
import Group from '../../models/group';

@Injectable({
  providedIn: 'root'
})
export class LoginRegisterService implements OnDestroy {
  public tabIndex = 0;
  public isLoggedIn = true;
  public currentUser = '';
  public auth;
  private userDataSubject = new BehaviorSubject<User | null>(null);
  public userData$: Observable<User | null> = this.userDataSubject.asObservable();
  public userData!: User;
  public userOwnedGroups!: Group[];
  private destroyed$ = new Subject<void>();
  public userOwnedGroupsSubject = new BehaviorSubject<Group[]>([]);

  constructor(public userService: UserService, private db: AngularFirestore) {
    const auth = getAuth();
    this.auth = auth;
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log('Service detected change for userID: ' + user.uid);
        this.isLoggedIn = true;
        this.currentUser = user.uid;
        (await this.userService.getUserData()).pipe(takeUntil(this.destroyed$)).subscribe((data: User) => {
          this.userData = data;
          this.userDataSubject.next(data);
          this.resolveOwnedGroups(this.userData.userOwnedGroups).then((returnedOwnedGroups) => {
            this.userOwnedGroups = returnedOwnedGroups;
            // Update the BehaviorSubject with the new value
            this.userOwnedGroupsSubject.next(this.userOwnedGroups);
          });
        });
      } else {
        this.isLoggedIn = false;
        this.currentUser = '';
        this.userDataSubject.next(null); 
      }
    });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  // Function to get the owned groups document data from a document reference
  async resolveOwnedGroups(ownedGroups: DocumentReference[]): Promise<Group[]> {
    // Stores the resolved list of owned groups
    let returnedOwnedGroups: Group[] = [];

    // Makes sure there are ownedGroups
    if(ownedGroups != undefined)
    // Loops through document references
    for(let i = 0; i < ownedGroups.length; i++)
    {
      try {
        // Gets document data as 'Group' and pushes it to the returnedOwnedGroups array
        const ownedGroupsDoc = await getDoc(ownedGroups[i]);
        if(ownedGroupsDoc.exists()) {
          returnedOwnedGroups.push(ownedGroupsDoc.data() as Group)
        }
      }
      catch (error) {
        console.error("Error getting document:", error)
      }
    }
    return returnedOwnedGroups;
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
            userAccountType: 1,
            userPreferences: [],
            userRatings: [],
            petsOwned: [],
            petsLost: [],
            userGroups: [],
            userOwnedGroups: [],
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

  getUserId(): string {
    const auth = getAuth();
    const user = auth.currentUser?.uid;
    if (user) {
      return user;
    }
    return "";
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
      const userId = this.getUserId();
      this.saveUserDetailsToCache(userId, this.userData);
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
    localStorage.setItem(`user-details`, JSON.stringify(userDetails));
  }

  // method to load user details from local storage
  loadUserDetailsFromCache(uid: string): any {
    const cachedUserDetails = localStorage.getItem(`user-details`);
    if (cachedUserDetails) {
      return JSON.parse(cachedUserDetails);
    }
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
      localStorage.removeItem("user-details");
    }).catch((error) => {
      console.error('Error signing out: ', error);
    })
  }

  getUserDataSubject() {
    return this.userDataSubject
  }
}
