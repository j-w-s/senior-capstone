import { Injectable } from '@angular/core';
import { getAuth } from "firebase/auth";
import { LoginRegisterService } from './login-register.service';
import { AngularFirestore, DocumentReference } from '@angular/fire/compat/firestore';
import { combineLatest, Observable } from 'rxjs';
import { Group, Use } from '../groups-page/groups-page.component';
import { arrayUnion } from '@angular/fire/firestore';
import { doc, DocumentData, getDoc, getFirestore, onSnapshot } from 'firebase/firestore';

@Injectable({
 providedIn: 'root'
})
export class GroupsService {
  constructor(private db: AngularFirestore, private loginRegService: LoginRegisterService) { }

  // Sleep function to delay loading data until user is logged in
  async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
 
  
  // Get groups function
  // Returns an observable and array of groups to display groups
  async getGroups(): Promise<Observable<unknown>> {
    await this.sleep(1000)
    const auth = getAuth();
    const user = auth.currentUser?.uid;
   
    if (!this.loginRegService.isLoggedIn) {
       throw new Error('No user is currently signed in.');
    }
   
    const userDocRef = doc(getFirestore(), 'User/' + user);
    
    return new Observable(observer => {
       const unsubscribe = onSnapshot(userDocRef, async (userDoc) => {
         if (!userDoc.exists()) {
           throw new Error('No such document!');
         }
   
         const documentReferencesArray = userDoc.data()['userGroups'];
         const observables = documentReferencesArray.map((docRef: any) => {
           return new Observable(observer => {
             const unsubscribe = onSnapshot(doc(getFirestore(), docRef.path), (doc) => observer.next({ useId: doc.id, ...doc.data() }));
             return unsubscribe;
           });
         });
   
         combineLatest(observables).subscribe(groups => observer.next(groups));
       });
   
       return unsubscribe;
    });
   }
 
  // Create group and store in Groups collection. (Working)
  createGroup(group: Group): Promise<DocumentReference<unknown>> {
    // Takes in a group Object and adds it the the User collection
    // Returns the document ID of the new document
    return this.db.collection('Groups').add(group);
  }

  updateGroup(group: Group, docId: string) {
    console.log(docId)
    this.db.collection('Groups').doc(docId).update(group);

  }
 
  /*
  // Update group
  updateGroup(id: string, group: Partial<Group>): Promise<void> {
     return this.db.collection('Groups').doc(id).update(group);
  }
 
  // Delete group
  deleteGroup(id: string): Promise<void> {
     return this.db.collection('Groups').doc(id).delete();
  }
  */

  // Add user to group 
  async addUserToGroup(groupRef: string, username: string)  {
    // Placeholders for the user and path
    let user: DocumentReference | null = null;
    let uPath = ""

    // Gets the user document ID and user ID
    // sets them to the placeholders above
    const userRef = this.db.collection('UsernameMapping').doc(username)
    await userRef.get().toPromise().then(docData => {
     if (docData && docData.exists) {
        let data = docData.data() as {userID: DocumentReference};
        user = data.userID;
        uPath = user.path
        console.log('Trying to add user: ' + user.path); 
     } else {
        console.log('No such document!');
     }
    });

    // Adds the user to the Group document
    const groupDocRef = this.db.collection('Groups').doc(groupRef);
    groupDocRef.update({
      users: arrayUnion(user)
    }).then(() => {
        console.log('Document successfully updated!');
    }).catch((error) => {
        console.error('Error updating document: ', error);
    });

    //Adds the group to the User document
    const split = uPath.split("/");
    const ref = this.db.collection(split[0]).doc(split[1]);
    ref.update({
      userGroups: arrayUnion(groupDocRef.ref)
    }).then(() => {
        console.log('Document successfully updated!');
    }).catch((error) => {
        console.error('Error updating document: ', error);
    });


  }

  // Adds the owner to the group 
  addOwner(groupRef: string) {
    // Gets the userId of the current user
    const auth = getAuth();
    const user = auth.currentUser?.uid;
    // Creates a document reference to the users collection
    const userDocRef = this.db.doc('User/'+ user)
    

    // Split the groupRef at the "/" to make a document reference
    const split = groupRef.split("/");
    const groupDocRef = this.db.collection(split[0]).doc(split[1]);

    // Updates the group collection to include the user
    groupDocRef.update({
      users: arrayUnion(userDocRef.ref)
    }).then(() => {
        console.log('Document successfully updated!');
    }).catch((error) => {
        console.error('Error updating document: ', error);
    });

    // Updates the user document by adding the new group document reference to the groups field
    userDocRef.update({
      userGroups: arrayUnion(groupDocRef.ref)
    }).then(() => {
        console.log('Document successfully updated!');
    }).catch((error) => {
        console.error('Error updating document: ', error);
    });

  }

  // Resolves a user DocumentReference array into an array of usernames
  async resolveUsernames(docRefs: DocumentReference<DocumentData>[]): Promise<Use[]> {
    //const usernames: string[] = [];
    let users: Use[] = [];
    for (let i = 0; i < docRefs.length; i++) {
       const doc = await getDoc(docRefs[i]);
       if (doc.exists()) {
        // Gets the username stored in the document
        const newUser: Use = {
          firstname: doc.data()['userFirstName'],
          lastname: doc.data()['userLastName'],
          email: doc.data()['userEmail'],
          phonenumber: doc.data()['userPhoneNumber'],
          username: doc.data()['userDisplayName'],
          groups: doc.data()['userGroups'],
          image: doc.data()['userImage']
        }
        
         users.push(newUser); 
       }
    }
    return users;
   }
 }
