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
  private contactsSubject = new BehaviorSubject<User[]>([]);
  public contacts$: Observable<User[]> = this.contactsSubject.asObservable();

  private messagesSubject = new BehaviorSubject<Messages | null>(null);
  public messages$: Observable<Messages | null> = this.messagesSubject.asObservable();

  updateContacts(contacts: User[]) {
    this.contactsSubject.next(contacts);
  }

  updateMessages(messages: Messages | null) {
    this.messagesSubject.next(messages);
  }

  // Lets us reference the current User later
  public demoPrimaryUserId = '';
  public dummyConversationUsers: User[] = [];
  public prevContact = '';
  public notifications = new BehaviorSubject<string[][]>([]);

  messages = this.messagesSubject.asObservable();

  constructor(private firestore: AngularFirestore,
    private loginRegService: LoginRegisterService,
   
  ) {
  }

  // Saves the last selected contact
  setContact(oldID: string) {
    this.prevContact = oldID
  }

  getMessages(): Observable<any> {
    const user = this.loginRegService.getUserId();

    // Gets the document in the Messages collection for the current user
    const userDocRef = doc(getFirestore(), 'Messages/' + user);

    return new Observable(observer => {
      const unsubscribe = onSnapshot(userDocRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
          observer.next(docSnapshot.data());
        } else {
          console.log("No such document!");
          observer.next(null); // Optionally handle the case where the document does not exist
        }
      }, (error) => {
        console.error("Error fetching document:", error);
        observer.error(error);
      });

      // Return the unsubscribe function to allow the caller to stop listening for updates
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

  async addContact(user: string) {
    const auth = getAuth();
    const currUser = auth.currentUser?.uid;

    // Query the 'User' collection for a document where 'userDisplayName' equals the input contact name
    const userQuery = this.firestore.collection('User', ref => ref.where('userDisplayName', '==', user));
    let newContact: DocumentReference | any = null;

    await userQuery.get().toPromise().then((querySnapshot: any) => {
      if (!querySnapshot.empty) {
        let docData = querySnapshot.docs[0];
        newContact = docData.ref;
        console.log('User found: ', docData.data());
      } else {
        console.log('No user found with the given display name!');
      }
    }).catch((error) => {
      console.error('Error querying user: ', error);
    });

    console.log(newContact);
    if (newContact != null) {
      // Adds current user to new contact's contacts
      const userDocRef = this.firestore.doc('Messages/' + newContact.path.split('/')[1]);
      userDocRef.set({
        contactsList: arrayUnion(this.firestore.doc('User/' + currUser).ref)
      }, { merge: true }).then(() => {
        console.log('Document successfully updated or created!');
      }).catch((error) => {
        console.error('Error updating or creating document: ', error);
      });

      // Adds new contact to current users contacts
      const currUserDocRef = this.firestore.doc('Messages/' + currUser);
      currUserDocRef.set({
        contactsList: arrayUnion(newContact)
      }, { merge: true }).then(() => {
        console.log('Document successfully updated or created!');
      }).catch((error) => {
        console.error('Error updating or creating document: ', error);
      });
    }
  }

  async addMessage(message: Message, contact: string): Promise<any> {
    const docRef = this.firestore.collection('Messages').doc(this.demoPrimaryUserId);
    const docSnapshot = await docRef.get().toPromise();

    // Check if the document exists
    if (!docSnapshot?.exists) {
      // If the document does not exist, create a new one with a default messagesList
      await docRef.set({ messagesList: [message] });
    } else {
      // If the document exists, append the new message to the existing messagesList
      const existingConversation: Messages = docSnapshot.data() as Messages;
      if (!existingConversation.messagesList) {
        // If messagesList is undefined, initialize it with the new message
        existingConversation.messagesList = [message];
      } else {
        // If messagesList exists, append the new message
        existingConversation.messagesList.push(message);
      }
      await docRef.update(existingConversation);
    }

    this.addToOtherUser(message, contact);
  }


  // adds the message to the user it was sent to as well in there messagesList
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

  getNotifications() {
    return this.notifications.asObservable();
  }

  addNotification(message: string, username: string) {
    const currentNotification = this.notifications.getValue();
    const usernameAndContent = [username, message];
    this.notifications.next([...currentNotification, usernameAndContent]);
  }

}

