import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import Message from '../../models/message';
import Messages from '../../models/messages';
import User from '../../models/user';
import UserPreferences from '../../models/user-preferences';
import Animal from '../../models/animal';
import UserRating from '../../models/user-ratings';
import { faker } from "@faker-js/faker/locale/en";

@Injectable({
  providedIn: 'root'
})
export class MessengerService {

  private conversationsSource = new BehaviorSubject<Messages[]>([]);
  private selectedConversationSource = new BehaviorSubject<Messages | null>(null);
  public currentUser!: User;
  public dummyPrimaryUser!: User;
  public dummyConversationUsers: User[] = [];

  conversations = this.conversationsSource.asObservable();
  selectedConversation = this.selectedConversationSource.asObservable();

  constructor() {
    this.seedUsers();
  }

  updateConversations(conversations: Messages[]) {
    this.conversationsSource.next(conversations);
  }

  updateSelectedConversation(conversation: Messages) {
    this.selectedConversationSource.next(conversation);
  }

  generateDummyData() {
    let allConversations: Messages[] = [];

    for (let user of this.dummyConversationUsers) {
      let isPrimaryUserTurn = true;

      const messages: Message[] = Array.from({ length: Math.floor(Math.random() * 2) + 20 }, () => {
        isPrimaryUserTurn = !isPrimaryUserTurn;

        return {
          userId: isPrimaryUserTurn ? this.dummyPrimaryUser.userId : user.userId,
          messageContent: faker.lorem.words(Math.floor(Math.random() * 5)),
          timeSent: faker.date.past(),
        };
      });

      allConversations.push({
        userId: isPrimaryUserTurn ? this.dummyPrimaryUser.userId : user.userId,
        messagesList: messages,
        contactsList: [user]
      });
    }

    this.updateConversations(allConversations);
    this.updateSelectedConversation(allConversations[0]);

    console.log(allConversations);
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

    for (let i = 0; i < 10; i++) {

      const user: User = await this.generateDummyUser();
      this.dummyConversationUsers.push(user);

    }

    this.generateDummyData();

  }

}

