import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { from, Observable } from 'rxjs';
import { getAuth } from 'firebase/auth';
import { doc, DocumentData, getDoc, getFirestore, onSnapshot, updateDoc } from 'firebase/firestore';
import User from '../../models/user';


@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private firestore: AngularFirestore) {
  }

  getUserDataObservable(): Observable<User> {
    const auth = getAuth();
    const user = auth.currentUser?.uid;

    const userDocRef = doc(getFirestore(), 'User/' + user);
    return new Observable(observer => {
      const unsubscribe = onSnapshot(userDocRef, async (userDoc) => observer.next(userDoc.data() as User));
      return unsubscribe;
    });
  }

  //Function to actually retrieve the users data
  async getUserData(): Promise<Observable<User>> {
    const auth = getAuth();
    const user = auth.currentUser?.uid;

    //Proper reference to the Firestore database
    const userDocRef = doc(getFirestore(), 'User/' + user);
    //Observable for the users account/profile information
    return new Observable(observer => {
      const unsubscribe = onSnapshot(userDocRef, async (userDoc) => observer.next(userDoc.data() as User));
      return unsubscribe;

    });

  }

  async updateUserProfileInformation(user: User, username: string, bio: string, image: string): Promise<void> {
    try {
      const db = getFirestore();
      const userRef = doc(db, "User", user.userId);

      await updateDoc(userRef, {
        userDisplayName: username,
        userBiography: bio,
        userImage: image
      });

      console.log("User profile updated successfully!");
    } catch (error) {
      console.error("Error updating user profile:", error);
    }

  }


  async updateUserAccountInformation(user: User, firstName: string, lastName: string, email: string, zipcode: string): Promise<void> {
    try {
      const db = getFirestore();
      const userRef = doc(db, "User", user.userId);

      await updateDoc(userRef, {
        userFirstName: firstName,
        userLastName: lastName,
        userEmail: email,
        userZipcode: zipcode
      });

      console.log("User account updated successfully!");
    } catch (error) {
      console.error("Error updating user account:", error);
    }
  }

}

