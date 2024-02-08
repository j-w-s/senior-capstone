import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, switchMap } from 'rxjs';
import Message from '../../models/message';
import Messages from '../../models/messages';
import User from '../../models/user';
import { AngularFirestore, DocumentReference } from '@angular/fire/compat/firestore';
import { LoginRegisterService } from './login-register.service';
import { getAuth } from 'firebase/auth';
import { arrayUnion, doc, getFirestore, onSnapshot } from 'firebase/firestore';
import { getDownloadURL, getStorage, ref } from 'firebase/storage';

@Injectable({
  providedIn: 'root'
})
export class MessengerService {

  // Lets us reference the current User later
  public demoPrimaryUserId = '';
  public dummyConversationUsers: User[] = [];
  private messagesSubject = new BehaviorSubject<Messages | null>(null);
  public prevContact = ''

  messages = this.messagesSubject.asObservable();

  constructor(private firestore: AngularFirestore,
    private loginRegService: LoginRegisterService,
  ) { }

  // Saves the last selected contact
  setContact(oldID: string) {
    this.prevContact = oldID
  }

  // Adjust the return type of the method to Observable<any>
  getMessages(): Observable<any> {
    const auth = getAuth();
    const user = auth.currentUser?.uid;
    this.demoPrimaryUserId = user + '';

    // Gets the document in the Messages collection for the current user
    const userDocRef = doc(getFirestore(), 'Messages/' + user);

    // Returns an observable for the file to update it whenever there is a change
    return new Observable(observer => {
      const unsubscribe = onSnapshot(userDocRef, async (userDoc) => {
        const data = { ...userDoc.data() };
        //console.log(data); // This will print the data
        observer.next(data);
      });
      return unsubscribe;
    });
  }


  // Resolves the image path to the URL for the image in firebase storage
  resolveProfilePicture(user: User | null): Promise<string> {
    const storage = getStorage();
  
    // Gets and returns the URL of the image from the storage
    return getDownloadURL(ref(storage, user?.userImage)).then((url) => {
      console.log('URL: ', url)

      return url
    })
  }

  // Adds new contact to the contactsList of current user and adds
  // currentUser to contactsList of new contact
  async addContact(user: string) {
    const auth = getAuth();
    const currUser = auth.currentUser?.uid;

    //const split = user.split("/");
    const usernameDocRef = this.firestore.collection('UsernameMapping').doc(user);
    let newContact: DocumentReference | any = null;
    await usernameDocRef.get().toPromise().then(docData => {
      if (docData && docData.exists) {
         let data = docData.data() as {userID: DocumentReference};
         newContact = data.userID;
         console.log('UsernameMapping: ', docData)
      } else {
         console.log('No such document!');
      }
     });

    if(newContact != null)
    {
      // Adds current user to new contact's contacts
      const userDocRef = this.firestore.doc('Messages/'+ newContact.path.split('/')[1])
      userDocRef.update({
        contactsList: arrayUnion(this.firestore.doc('User/'+ currUser).ref)
      }).then(() => {
          console.log('Document successfully updated!');
      }).catch((error) => {
          console.error('Error updating document: ', error);
      });
  
      // Adds new contact to current users contacts
      const currUserDocRef = this.firestore.doc('Messages/'+ currUser)
      currUserDocRef.update({
        contactsList: arrayUnion(this.firestore.doc('User/'+ newContact.path.split('/')[1]).ref)
      }).then(() => {
          console.log('Document successfully updated!');
      }).catch((error) => {
          console.error('Error updating document: ', error);
      });
    }
    
  }

  // Adds message to the database
  async addMessage(message: Message, contact: string): Promise<any> {
    // messages doc ref
    const docRef = this.firestore.collection('Messages').doc(this.demoPrimaryUserId);
    const docSnapshot = await docRef.get().toPromise();
    const messageAsMessageList: Message[] = [];
    messageAsMessageList.push(message);

    // check if the document exists
    if (docSnapshot?.exists) {
      
      // if it exists, fetch the existing 'Messages' object
      const existingConversation: Messages = docSnapshot.data() as Messages;

      // append the new messages to the existing 'messagesList'
      existingConversation.messagesList = [...existingConversation.messagesList, ...messageAsMessageList];

      // save the updated 'Messages' object back to Firestore
      const result = await docRef.update(existingConversation);
    } else {
      return;
    }
    this.addToOtherUser(message, contact);
  }

  // Adds the message to the user it was sent to as well in there messagesList
  async addToOtherUser(message: Message, contact: string): Promise<any> {
    const docRef = this.firestore.collection('Messages').doc(contact);
    const docSnapshot = await docRef.get().toPromise();
    const messageAsMessageList: Message[] = [];
    messageAsMessageList.push(message);

    // check if the document exists
    if (docSnapshot?.exists) {
      
      // if it exists, fetch the existing 'Messages' object
      const existingConversation: Messages = docSnapshot.data() as Messages;

      // append the new messages to the existing 'messagesList'
      existingConversation.messagesList = [...existingConversation.messagesList, ...messageAsMessageList];

      // save the updated 'Messages' object back to Firestore
      const result = await docRef.update(existingConversation);

    } else {
      return;
    }
  }

  // Returns a user object based on the userId given
  async getUserById(userId: string): Promise<User | null> {
    // query the 'User' collection where 'userId' equals the provided userId
    const querySnapshot = await this.firestore.collection('User', ref => ref.where('userId', '==', userId)).get().toPromise();

    // check if any documents were found
    if (querySnapshot?.empty) {
      // if no documents were found, return null
      return null;
    } else {
      // if documents were found, return the first 'User' object
      return querySnapshot?.docs[0].data() as User;
    }
  }

  // Returns a user object based on the userId given
  async getUserById2(userId: string): Promise<User> {
    // query the 'User' collection where 'userId' equals the provided userId
    const querySnapshot = await this.firestore.collection('User', ref => ref.where('userId', '==', userId)).get().toPromise();

    // if documents were found, return the first 'User' object
    return querySnapshot?.docs[0].data() as User;
  }
}

