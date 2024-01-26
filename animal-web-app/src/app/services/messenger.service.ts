import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, switchMap } from 'rxjs';
import Message from '../../models/message';
import Messages from '../../models/messages';
import User from '../../models/user';
import UserPreferences from '../../models/user-preferences';
import Animal from '../../models/animal';
import UserRating from '../../models/user-ratings';
import { faker } from "@faker-js/faker/locale/en";
import { AngularFirestore, DocumentReference } from '@angular/fire/compat/firestore';

@Injectable({
  providedIn: 'root'
})
export class MessengerService {

  private conversationsSource = new BehaviorSubject<Message[]>([]);
  private selectedConversationSource = new BehaviorSubject<Message[] | null>(null);
  public currentUser!: User;
  public dummyPrimaryUser!: User;
  public demoPrimaryUserId = "2d8bbf01-40b2-4fb6-aaad-428e96cbf158";
  public dummyConversationUsers: User[] = [];
  private messagesSubject = new BehaviorSubject<Messages | null>(null);

  conversations = this.conversationsSource.asObservable();
  selectedConversation = this.selectedConversationSource.asObservable();
  messages = this.messagesSubject.asObservable();

  constructor(private firestore: AngularFirestore) {
    //this.seedUsers();
    (async () => {
      const dummyPrimaryUser = await this.getUserById(this.demoPrimaryUserId);
      console.log('DUMMY USER', dummyPrimaryUser);
      const dummyMessages = await this.getMessagesByUserId(this.demoPrimaryUserId);
      console.log('DUMMY MESSAGES', dummyMessages);
      const userIds = dummyMessages?.contactsList.map(contact => contact.userId);

      // loop through the userIds
      userIds?.forEach(async (userId) => {
        // get the user by userId
        const user = await this.getUserById(userId);
        if (user != null) {
          // push the user into dummyConversationUsers
          this.dummyConversationUsers.push(user);
        }
        else {
          console.log("no user");
        }
      }
      );
      console.log(this.dummyConversationUsers);
      if (dummyMessages) {
        this.messagesSubject.next(dummyMessages);
        console.log(this.messagesSubject);
      }
    })();
  }

  // may come back to this at some point...
  getMessagesById(id: string): Observable<Message[]> {
    return this.firestore.collection<Messages>('Messages', ref => ref.where('userId', '==', id)).valueChanges().pipe(
      map((messages: Messages[]) => {
        if (!messages || messages.length === 0) {
          throw new Error(`No messages found with id ${id}`);
        }
        console.log('messages:', messages);
        console.log('messages[0].messagesList', messages[0].messagesList);
        return messages[0].messagesList;
      })
    );
  }

  addUser(user: User): Promise<any> {
    return this.firestore.collection('User').add(user);
  }

  async addMessage(message: Message): Promise<any> {
    // messages doc ref
    const userId = "2d8bbf01-40b2-4fb6-aaad-428e96cbf158";
    const docRef = this.firestore.collection('Messages').doc(userId);
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
      const result = await docRef.set(existingConversation, { merge: true });

      // if the operation was successful, update the BehaviorSubject
      this.messagesSubject.next(existingConversation);

    } else {
      return;
    }
  }

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

  async getMessagesByUserId(userId: string): Promise<Messages | null> {
    // get the 'Messages' document for the user
    const docRef = this.firestore.collection('Messages').doc(userId);
    const docSnapshot = await docRef.get().toPromise();

    // check if the document exists
    if (docSnapshot?.exists) {
      // if it exists, return the 'Messages' object
      return docSnapshot?.data() as Messages;
    } else {
      // if it doesn't exist, return null
      return null;
    }
  }

  // problem with this initially was that it would override existing data for
  // contacts and messages, so we have to do it this way.
  // we will probably need to implement similar solutions for
  // all collections storing *lists* of a certain type by reference.
  async addOrUpdateConversation(conversation: Messages): Promise<any> {
    // get the existing 'Messages' document for the user
    const docRef = this.firestore.collection('Messages').doc(conversation.userId);
    const docSnapshot = await docRef.get().toPromise();

    // check if the document exists
    if (docSnapshot?.exists) {
      // if it exists, fetch the existing 'Messages' object
      const existingConversation: Messages = docSnapshot.data() as Messages;

      // append the new messages to the existing 'messagesList'
      existingConversation.messagesList = [...existingConversation.messagesList, ...conversation.messagesList];

      //update contacts if necessary
      existingConversation.contactsList = [...existingConversation.contactsList, ...conversation.contactsList.filter(newContact => !existingConversation.contactsList.some(existingContact => existingContact.userId === newContact.userId))];

      // save the updated 'Messages' object back to Firestore
      return docRef.set(existingConversation, { merge: true });
    } else {
      // if it doesn't exist, simply add the new 'Messages' object to Firestore
      return docRef.set(conversation, { merge: true });
    }
  }

  /*updateConversations(conversations: Messages[]) {
    this.conversationsSource.next(conversations);
  }

  updateSelectedConversation(conversation: Message[]) {
    this.selectedConversationSource.next(conversation);
  }*/

  async generateDummyData() {
    let allConversations: Messages[] = [];

    for (let user of this.dummyConversationUsers) {
      let isPrimaryUserTurn = true;

      const messages: Message[] = Array.from({ length: Math.floor(Math.random() * 2) + 20 }, () => {
        isPrimaryUserTurn = !isPrimaryUserTurn;

        return {
          messageId: faker.datatype.uuid(),
          senderId: isPrimaryUserTurn ? this.dummyPrimaryUser.userId : user.userId,
          receiverId: isPrimaryUserTurn ? user.userId : this.dummyPrimaryUser.userId,
          messageContent: faker.lorem.words(Math.floor(Math.random() * 5)),
          timeSent: faker.date.past(),
        };
      });

      allConversations.push({
        userId: isPrimaryUserTurn ? this.dummyPrimaryUser.userId : user.userId,
        messagesList: messages,
        contactsList: [user]
      });
      console.log(allConversations);
    }

    for (let convo of allConversations) {
      await this.addOrUpdateConversation(convo);
    }

    //this.updateConversations(allConversations);
    //this.updateSelectedConversation(allConversations[0]);

    //console.log(allConversations);
  }

  async generateDummyUser(): Promise<User> {
    
    const user: User = {
      userId: faker.datatype.uuid(),
      userFirstName: faker.name.firstName(),
      userLastName: faker.name.lastName(),
      userPhoneNumber: faker.phone.number(),
      userEmail: faker.internet.email(),
      userDisplayName: faker.internet.userName(),
      userBiography: faker.lorem.paragraph(),
      userImage: faker.image.avatar(),
      userAccountType: Math.floor(Math.random() * 10),
      userPreferences: {
        zipCode: faker.datatype.number({ min: 71270, max: 71275 }),
        geoCoordinates: [faker.address.latitude(), faker.address.longitude()] as [number, number],
        pushNotifications: faker.datatype.boolean(),
      },
      userRatings: Array.from({ length: Math.floor(Math.random() * 10) + 1 }).map(() => ({
        ratingId: faker.datatype.uuid(),
        ratedBy: faker.name.firstName() + faker.name.lastName(),
        ratingValue: faker.datatype.number({ min: 1, max: 5 }),
        timeSent: faker.date.past(),
      })),
      petsOwned: Array.from({ length: Math.floor(Math.random() * 10) + 1 }).map(() => {
        let images = Array.from({ length: Math.floor(Math.random() * 5) + 1 }).map(() => faker.image.imageUrl());
        return {
          animalId: faker.datatype.uuid(),
          animalType: faker.random.word(),
          animalWeight: faker.datatype.number({ min: 0, max: 20 }),
          animalSex: ['male', 'female'][Math.floor(Math.random() * 2)],
          temperament: Array.from({ length: Math.floor(Math.random() * 5) + 1 }).map(() => faker.random.word()),
          about: faker.lorem.paragraph(),
          images: images,
          primaryImage: Math.floor(Math.random() * images.length),
          location: faker.address.streetAddress(),
          zipCode: faker.datatype.number({ min: 71270, max: 71275 }),
          adoptionStatus: faker.datatype.number({ min: 1, max: 3 }),
          dateOfBirth: faker.date.past(),
          color: faker.color.human(),
          vaccinationStatus: faker.datatype.boolean(),
        };
      }),
      petsLost: Array.from({ length: Math.floor(Math.random() * 10) + 1 }).map(() => {
        let images = Array.from({ length: Math.floor(Math.random() * 5) + 1 }).map(() => faker.image.imageUrl());
        return {
          animalId: faker.datatype.uuid(),
          animalType: faker.random.word(),
          animalWeight: faker.datatype.number({ min: 0, max: 20 }),
          animalSex: ['male', 'female'][Math.floor(Math.random() * 2)],
          temperament: Array.from({ length: Math.floor(Math.random() * 5) + 1 }).map(() => faker.random.word()),
          about: faker.lorem.paragraph(),
          images: images,
          primaryImage: Math.floor(Math.random() * images.length),
          location: faker.address.streetAddress(),
          zipCode: faker.datatype.number({ min: 71270, max: 71275 }),
          adoptionStatus: faker.datatype.number({ min: 1, max: 3 }),
          dateOfBirth: faker.date.past(),
          color: faker.color.human(),
          vaccinationStatus: faker.datatype.boolean(),
        };
      })
    };

    return user;

  }

  async seedUsers(): Promise<void> {

    this.dummyPrimaryUser = await this.generateDummyUser();
    console.log(this.dummyPrimaryUser);
    this.addUser(this.dummyPrimaryUser).then(() => console.log('User added successfully', this.dummyPrimaryUser.userId)).catch(error => console.error('Error adding user: ', error));

    for (let i = 0; i < 10; i++) {

      const user: User = await this.generateDummyUser();
      this.addUser(user).then(() => console.log('User added successfully', user.userId)).catch(error => console.error('Error adding user: ', error));
      this.dummyConversationUsers.push(user);

    }

    this.generateDummyData();

  }

}

