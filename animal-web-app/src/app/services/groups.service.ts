import { Injectable } from '@angular/core';
import { getAuth } from "firebase/auth";
import { LoginRegisterService } from './login-register.service';
import { AngularFirestore, DocumentReference } from '@angular/fire/compat/firestore';
import { combineLatest, Observable } from 'rxjs';
import { Group, Use } from '../groups-page/groups-page.component';
import { arrayUnion } from '@angular/fire/firestore';
import { arrayRemove, doc, DocumentData, DocumentSnapshot, getDoc, getFirestore, onSnapshot, updateDoc } from 'firebase/firestore';

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

  updateGroup(group: any, docId: string) {
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
    const userMap = {
      user: user,
      addUserPerm: false,
      removeUserPerm: false,
      editInfoPerm: false,
      deleteGroupPerm: false,
      updatePermsPerm: false,
    }
    groupDocRef.update({
      users: arrayUnion(userMap)
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
      owner: userDocRef.ref
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
  async resolveUsernames(docRefs: any[], group: any): Promise<[any[], any | null]> {
    //const usernames: string[] = [];
    let users: Use[] = [];
    let owner: Use | null = null;
    //console.log('GRABBED USER BEFORE RESOLVE: ', docRefs);
    const doc = await getDoc(group.owner as DocumentReference);
    if (doc.exists()) {
      // Gets the username stored in the document
      const newOwner: any = {
        userId: doc.data()['userId'],
        firstname: doc.data()['userFirstName'],
        lastname: doc.data()['userLastName'],
        email: doc.data()['userEmail'],
        phonenumber: doc.data()['userPhoneNumber'],
        username: doc.data()['userDisplayName'],
        groups: doc.data()['userGroups'],
        image: doc.data()['userImage'],
        // GET THE USER PERMS FROM GROUPS COLLECTION
        perms: [['']],
      }
      owner = newOwner;
      console.log('OWNER ', newOwner)
    }


    for (let i = 0; i < docRefs.length; i++) {
       console.log('GRABBED USER INN RESOLVE: ', docRefs[i]);
       const doc = await getDoc(docRefs[i].user) as DocumentSnapshot;

        let perm = [];

        perm.push(docRefs[i].addUserPerm)
        perm.push(docRefs[i].removeUserPerm)
        perm.push(docRefs[i].editInfoPerm)
        perm.push(docRefs[i].deleteGroupPerm)
        perm.push(docRefs[i].updatePermsPerm)


       if (doc.exists()) {
        

        const newUser: any = {
          userId: doc.data()['userId'],
          firstname: doc.data()['userFirstName'],
          lastname: doc.data()['userLastName'],
          email: doc.data()['userEmail'],
          phonenumber: doc.data()['userPhoneNumber'],
          username: doc.data()['userDisplayName'],
          groups: doc.data()['userGroups'],
          image: doc.data()['userImage'],
          // GET THE USER PERMS FROM GROUPS COLLECTION
          perms: perm,
        }
        
         users.push(newUser); 
       }
    }
    return [users, owner];
   }

   removeGroupFromUsers(group: any) {
    //console.log('GROUP TO DELETE: ', group);
    const groupOwner = group.owner

    for(let i = 0; i < group.users.length; i++)
    {
      console.log('User ' + i + ' : ' + group.users[i].user.path)
      const split = group.users[i].user.path.split('/');
      const split2 = group.owner.path.split('/');

      const ownerRef = this.db.collection(split2[0]).doc(split2[1]);
      const dRef = this.db.collection(split[0]).doc(split[1]);
      const gRef = this.db.collection('Groups').doc(group.useId)
      dRef.update({
        userGroups: arrayRemove(gRef.ref)
      });
      ownerRef.update({
        userGroups: arrayRemove(gRef.ref)
      })
    }
   }

  deleteGroup(group: any) {

  const dRef = this.db.collection('Groups').doc(group.useId);
  dRef.delete();
  }

  async removeUser(group: any, username: string)
  {
    let usernaID: DocumentReference | null = null; 
    const nRef = this.db.collection('UsernameMapping').doc(username)
    const doc = await getDoc(nRef.ref);
       if (doc.exists()) {
        usernaID = (doc.data() as DocumentData)['userID']
       }

    const userRef = this.db.collection('User').doc(usernaID?.id);
    const groupRef = this.db.collection('Groups').doc(group.useId)
    userRef.update({
      userGroups: arrayRemove(groupRef.ref)
    });

    // Retrieve the group document and its data
    const groupDoc = await groupRef.get().toPromise();
    if (groupDoc && groupDoc.exists) {
       const groupData = groupDoc.data();
       if (groupData && typeof groupData === 'object' && 'users' in groupData) {
         const users = groupData.users as Array<{ user: DocumentReference, [key: string]: any }>;
   
         // Iterate over the array of maps to find the map with the matching 'user' field
         const updatedUsers = users.filter(userMap => userMap.user.path !== userRef.ref.path);
   
         // Update the document with the new array
         await groupRef.update({ users: updatedUsers });
       }
    }

  }

  updatePerms(updatedUserPerms: any, groupID: any) {
    const groupRef = this.db.collection('Groups').doc(groupID);

    //console.log('IN UPDATEPERMS: ', updatedUserPerms)
    groupRef.update({
      users: updatedUserPerms
    });
  }
 }
