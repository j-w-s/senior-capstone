import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import Forum from '../../models/forum';
import Thread from '../../models/thread';
import User from '../../models/user'; 
import UserPreferences from '../../models/user-preferences';
import Animal from '../../models/animal';
import UserRating from '../../models/user-ratings';
import { faker } from "@faker-js/faker/locale/en";

@Injectable({
  providedIn: 'root'
})

export class ForumService {
  private threadSource = new BehaviorSubject<Forum[]>([]);
  private selectedThreadSource = new BehaviorSubject<Forum | null>(null);
  public dummyPrimaryUser!: User;
  public dummyThreadUsers: User[] = [];
  threads = this.threadSource.asObservable();
  selectedThread = this.selectedThreadSource.asObservable();

  constructor() {
    this.seedThreads()
  }

  updateForum(threads: Forum[]) {
    this.threadSource.next(threads);
  }

  updateSelectedThread(threads: Forum) {
    this.selectedThreadSource.next(threads);
  }


  generateDummyData() {
    let allThreads: Forum[] = [];

    for (let user of this.dummyThreadUsers) {
      let isPrimaryUserTurn = true;

      const threads: Thread[] = Array.from({ length: Math.floor(Math.random() * 2) + 1 }, () => {
        isPrimaryUserTurn = !isPrimaryUserTurn;

        return {
          publisher: faker.lorem.words(Math.floor(Math.random() * 5)),
          users: [user],
          comments: undefined,
          title: faker.lorem.words(Math.floor(Math.random() * 5)),
          tags: [faker.lorem.words(Math.floor(Math.random() * 2))],
          threadContent: faker.lorem.words(Math.floor(Math.random() * 10)),
          timeSent: faker.date.past(),
        };
      });

      allThreads.push({
        threads: threads
      });
    }
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

  async seedThreads(): Promise<void> {

    this.dummyPrimaryUser = await this.generateDummyUser();

    for (let i = 0; i < 10; i++) {

      const user: User = await this.generateDummyUser();
      this.dummyThreadUsers.push(user);

    }

    this.generateDummyData();

  }
}

