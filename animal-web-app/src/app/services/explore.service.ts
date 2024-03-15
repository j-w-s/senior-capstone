import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentReference } from '@angular/fire/compat/firestore';
import { Observable, BehaviorSubject, of, from } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { faker } from "@faker-js/faker/locale/en";
import Animal from '../../models/animal';
import { LoginRegisterService } from './login-register.service';

@Injectable({
  providedIn: 'root'
})
export class ExploreService {
  private animalsSubject = new BehaviorSubject<Animal[]>([]);
  private selectedAnimalSource = new BehaviorSubject<Animal | null>(null);

  constructor(private firestore: AngularFirestore,
    private loginRegisterService: LoginRegisterService) { }

  getAnimals(): Observable<Animal[]> {
    return this.firestore.collection<Animal>('Animal').valueChanges().pipe(
      tap((animals: Animal[]) => {
        this.animalsSubject.next(animals);
      })
    );
  }

  async deleteAnimal(animal: Animal): Promise<Observable<Animal>> {
    return from(this.firestore.collection<Animal>('Animal').doc(animal.animalId).delete()).pipe(
      map(() => animal) 
    );
  }

  getAnimalById(id: string): Observable<Animal> {
    return this.firestore.collection<Animal>('Animal').doc(id).valueChanges().pipe(
      switchMap((animal: Animal | undefined) => {
        if (!animal) {
          throw new Error(`No animal found with id ${id}`);
        }
        return of(animal);
      })
    );
  }

  selectAnimal(id: string): void {
    this.firestore.collection<Animal>('Animal').doc(id).valueChanges().pipe(
      switchMap((animal: Animal | undefined) => {
        if (!animal) {
          return of(null);
        }
        return of(animal);
      })
    ).subscribe((animal: Animal | null) => {
      this.selectedAnimalSource.next(animal);
    });
  }

  createAnimal(animal: Animal): Promise<DocumentReference<Animal>> {
    return this.firestore.collection<Animal>('Animal').add(animal);
  }

  async seedAnimals(): Promise<void> {
    for (let i = 0; i < 30; i++) {
      const animal: Animal = {
        animalId: faker.datatype.uuid(),
        owner: faker.name.firstName() + faker.name.lastName(),
        animalType: faker.animal.type(),
        animalBreed: faker.random.words(3).split(' '),
        animalName: faker.name.lastName(),
        animalWeight: faker.datatype.number(),
        animalSex: faker.name.gender(),
        temperament: faker.random.words(3).split(' '),
        about: faker.lorem.paragraph(),
        images: [faker.image.avatar(), faker.image.avatar(), faker.image.avatar()],
        primaryImage: 0,
        location: faker.address.city(),
        zipCode: parseInt(faker.address.zipCode()),
        adoptionStatus: faker.datatype.number(),
        dateOfBirth: faker.date.past(),
        color: faker.color.human(),
        vaccinationStatus: faker.datatype.boolean(),
      };
      await this.createAnimal(animal);
    }
  }

  selectedAnimal = this.selectedAnimalSource.asObservable();

  async getCurrentUser(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.loginRegisterService.getCurrentUser().then(userId => {
        resolve(userId);
      }).catch(error => {
        reject(error);
      });
    });
  }
}
