import { Injectable } from '@angular/core';
import { getAuth } from "firebase/auth";
import { LoginRegisterService } from './login-register.service';
import { AngularFirestore, DocumentReference } from '@angular/fire/compat/firestore';
import { combineLatest, Observable, Subscriber, switchMap } from 'rxjs';
import { arrayUnion } from '@angular/fire/firestore';
import { arrayRemove, getDoc, getFirestore, onSnapshot, updateDoc } from 'firebase/firestore';
import { doc, DocumentSnapshot, DocumentData } from '@angular/fire/firestore';
import User from '../../models/user';
import Group from '../../models/group';
import GroupUser from '../../models/groupUsers';

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
  // Returns an observable array of groups to display groups
  async getGroups(): Promise<Observable<Group[]>> {
    // Call the sleep function to make sure the user is logged in first
    await this.sleep(1000)

    const user = this.loginRegService.currentUser;
    const userDocRef = this.db.firestore.collection('User').doc(user);

    // Gets an observable to update your current groups if the user is added to one
    const userDoc$ = new Observable<DocumentData>(observer => {
      const unsubscribe = onSnapshot(userDocRef, (userDoc) => {
        if(!userDoc.exists()) {
          throw new Error('No such document.')
        }
        observer.next(userDoc.data());
      });
      return unsubscribe;
    });

    // Create an observable that emits the user's groups
    const groups$ = userDoc$.pipe(
      switchMap(userData => {
        const groupDocRefArray = userData['userGroups'];
        const groupObservables = groupDocRefArray.map((groupRef: DocumentReference) => {
          return new Observable<Group>(observer => {
            const unsubscribe = onSnapshot(doc(getFirestore(), groupRef.path), (doc) => {
              observer.next(doc.data() as Group);
            });
            return unsubscribe;
          });
        });
        return combineLatest(groupObservables) as Observable<Group[]>;
      })
    );

    return groups$
  }

  // Returns an array of users and a User object for owner
  async getUserData(group: Group): Promise<User[]> {
    let users: User[] = [];
    let owner: User | null = null;

    // Loops through the group uses and uses their document references to get the user documents
    for(let i = 0; i < group.groupUsers.length; i++)
    {
      const split = group.groupUsers[i].userDocRef.path.split("/")[1];
      await this.db.collection('User').ref.where('userId', '==', split).get().then(querySnapshot => {
        let docData = querySnapshot.docs[0];
        users.push(docData.data() as User);
      });
    }

    // Returns the Array and User Object
    return users;
  }
 
  // Function to update users permissions
  updatePerms(newGroupUsers: GroupUser[], groupId: string) {

    // Update the groupUsers with their new permissions
    this.db.collection('Groups').doc(groupId).update({
      groupUsers: newGroupUsers
    });
  }

  // Gets the document reference of the person creating the group
  getOwnerDocRef(): DocumentReference<DocumentData> {
    const owner = this.loginRegService.currentUser;
    const ownerDocReference = this.db.firestore.collection('User').doc(owner);
    //console.log('Owner Doc ref: ', ownerDocReference.path)
    return ownerDocReference
  }

  // Create group and store in Groups collection.
  createGroup(group: Group): Promise<DocumentReference<DocumentData>> {
    // Takes in a group Object and adds it the the User collection
    // Returns the document ID of the new document
    console.log('Creating the group.');
    const doc = this.db.collection<DocumentData>('Groups').add(group);
    return doc;
  }

  // Sets the groupId field for the group after it is created
  setCreatedGroupId(groupDocRef: DocumentReference) {
    console.log('Adding new groupId to created group.');
    this.db.doc(groupDocRef).update({
      groupId: groupDocRef.path.split('/')[1]
    })
  }

  // Adds group document reference to userGroups field and userOwnedGroups field
  addGroupToOwnersDocument(ownerDocRef: DocumentReference, groupDocRef: DocumentReference) {
    console.log('Adding the new group doc ref to the users groups')
    this.db.doc(ownerDocRef).update({
      userGroups: arrayUnion(groupDocRef),
      userOwnedGroups:  arrayUnion(groupDocRef),
    });
  }

  // Replaces the group data in the database with the updated data
  updateGroup(group: Group, groupDocId: string) {
    console.log('Updating Group Data.');
    this.db.collection('Groups').doc(groupDocId).update(group);
  }

  // Deletes a groups document from the Groups collection
  deleteGroup(group: Group) {
    console.log('Deleting the Group.');
    const groupDocRef = this.db.collection('Groups').doc(group.groupId);
    groupDocRef.delete();
  }

  // Removes a user from a group based on their username
  async removeUser(group: Group, username: string) {
    let userDocRef: DocumentReference | any = null;

    // Gets User DocumentReference based on their username
    await this.db.collection('User').ref.where('userDisplayName', '==', username).get().then(querySnapshot => {
      let docData = querySnapshot.docs[0];
      userDocRef = docData.ref;
    });

    // Finds and removes the userMap that matches the userDocRef found from the username
    const updatedUsers = group.groupUsers.filter((userMap: GroupUser) => (userMap.userDocRef.path !== userDocRef.path || userMap.isOwner === true));

    // Remove from Groups doc in groupUsers field
    this.db.collection('Groups').doc(group.groupId).update({
      groupUsers: updatedUsers
    });

    // Remove from User doc in userGroups field
    this.db.doc(userDocRef).update({
      userGroups: arrayRemove(this.db.firestore.collection('Groups').doc(group.groupId))
    });

    console.log('Finished removing user')

  }

  // Helper fucntion for deleteing groups
  // Removes the group doc ref from the users userGroups field
  removeGroupFromUsers(group: Group) {
    console.log('Removing deleted group from user userGroups.')

    // Get the groups document reference
    const groupDocRef = this.db.firestore.collection('Groups').doc(group.groupId);

    // Loop through users and remove the group from the userGroups
    for(let i = 0; i < group.groupUsers.length; i++)
    {
      this.db.collection('User').doc(group.groupUsers[i].userDocRef.path.split("/")[1]).update({
        userGroups: arrayRemove(groupDocRef),
        userOwnedGroups: arrayRemove(groupDocRef)
      });
    }
  }

  // Adds a user to the group based on username
  async addUserToGroup(groupId: string, username: string) {
    let userDocRef: DocumentReference | any = null;

    // Get the Group Doc Ref
    const groupDocRef = this.db.firestore.collection('Groups').doc(groupId);

    // Gets User DocumentReference based on their username
    await this.db.collection('User').ref.where('userDisplayName', '==', username).get().then(querySnapshot => {
      let docData = querySnapshot.docs[0];
      userDocRef = docData.ref;
    });

    // Add New User Map to groups groupUsers field
    const userMap: GroupUser = {
      userDocRef: userDocRef,
      addUserPerm: false,
      removeUserPerm: false,
      updateGroupPerm: false,
      deleteGroupPerm: false,
      updatePermissionsPerm: false,
      isOwner: false,
    }

    this.db.doc(groupDocRef).update({
      groupUsers: arrayUnion(userMap)
    });

    // Add group doc ref to user documents userGroups field
    this.db.doc(userDocRef).update({
      userGroups: arrayUnion(groupDocRef)
    });
  }

  updateOwnedGroups(newOwner: DocumentReference, groupId: string, prevOwner: DocumentReference) {
    // Gets the document reference for the group
    const groupDocRef = this.db.firestore.collection('Groups').doc(groupId);

    console.log('New Owner: ', prevOwner.path)
    // Gets the user document reference
    const userDocRef = this.db.firestore.collection('User').doc(newOwner.path.split("/")[1]);
    // Get previous owner document reference
    const prevUserDocRef = this.db.firestore.collection('User').doc(prevOwner.path.split("/")[1]);

    // Put groupDocRef in newOwner document 'userOwnedGroups' field
    this.db.doc(userDocRef).update({
      userOwnedGroups: arrayUnion(groupDocRef)
    });

    // Remove groupDocRef from previous owners document 'userOwnedGroups' field
    this.db.doc(prevUserDocRef).update({
      userOwnedGroups: arrayRemove(groupDocRef)
    });
  }
 }
