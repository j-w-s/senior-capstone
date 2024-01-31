import { AfterViewInit, Component, OnInit } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { ExploreService } from '../services/explore.service';
import Animal from '../../models/animal';
import { LoginRegisterService } from '../services/login-register.service';
import { Observable } from 'rxjs';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-explore',
  templateUrl: './explore.component.html',
  styleUrl: './explore.component.scss'
})
export class ExploreComponent implements OnInit, AfterViewInit{

  animals$!: Observable<Animal[]>;

  animalCreateForm: FormGroup;

  images = [
    'https://www.randomlists.com/img/animals/octopus.webp',
    'https://www.randomlists.com/img/animals/squirrel.webp',
    'https://www.randomlists.com/img/animals/mouse.webp',
    'https://www.randomlists.com/img/animals/tiger.webp',
    'https://www.randomlists.com/img/animals/goat.webp',
    'https://www.randomlists.com/img/animals/snowy_owl.webp',
  ];

  names = ['James', 'Robert', 'John', 'Michael', 'David', 'William', 'Richard', 'Joseph', 'Thomas', 'Christopher', 'Charles', 'Daniel', 'Matthew', 'Anthony', 'Mark', 'Donald', 'Steven', 'Andrew', 'Paul', 'Joshua', 'Kenneth', 'Kevin', 'Brian', 'George', 'Timothy', 'Ronald', 'Jason', 'Edward', 'Jeffrey', 'Ryan', 'Jacob', 'Gary', 'Nicholas', 'Eric', 'Jonathan', 'Stephen', 'Larry', 'Justin', 'Scott', 'Brandon', 'Benjamin', 'Samuel', 'Gregory', 'Alexander', 'Patrick', 'Frank', 'Raymond', 'Jack', 'Dennis', 'Jerry', 'Tyler', 'Aaron', 'Jose', 'Adam', 'Nathan', 'Henry', 'Zachary', 'Douglas'];

  allCards = Array.from({ length: 79 }).map((_, i) => ({
    id: i + 1,
    title: `Title ${i + 1}`,
    description: `Description for card ${i + 1}`,
    animalName: this.names[Math.floor(Math.random() * this.names.length)],
    image: this.images[Math.floor(Math.random() * this.images.length)],
  }));

  animals!: Animal[];
  uniqueTypes: string[] = [];
  uniqueBreeds: string[] = [];
  uniqueWeights: number[] = [];
  uniqueSexes: string[] = [];
  uniqueTemperaments: string[] = [];
  uniqueLocations: string[] = [];
  uniqueZipCodes: number[] = [];
  uniqueAdoptionStatuses: number[] = [];
  uniqueDatesOfBirth: Date[] = [];
  uniqueColors: string[] = [];
  uniqueVaccinationStatuses: boolean[] = [];

  currentPage = 1;
  cardsPerPage = 8;
  totalPages = 0;
  searchTerm = '';

  constructor(private exploreService: ExploreService, private fb: FormBuilder) {
    this.animalCreateForm = new FormGroup({
      animalId: new FormControl('', Validators.required),
      owner: new FormControl(''),
      animalType: new FormControl('', Validators.required),
      animalBreed: new FormControl([''], Validators.required),
      animalName: new FormControl('', Validators.required),
      animalWeight: new FormControl(0, Validators.required),
      animalSex: new FormControl('', Validators.required),
      temperament: new FormControl([''], Validators.required),
      about: new FormControl('', Validators.required),
      images: new FormControl([''], Validators.required),
      primaryImage: new FormControl(0, Validators.required),
      location: new FormControl('', Validators.required),
      zipCode: new FormControl(0, Validators.required),
      adoptionStatus: new FormControl(0, Validators.required),
      dateOfBirth: new FormControl(new Date(), Validators.required),
      color: new FormControl(''),
      vaccinationStatus: new FormControl(false)
    });

  }

  generateUUID(): void {
    this.animalCreateForm.get('animalId')!.setValue(uuidv4());
  }

  displayModal = false;
  selectedAnimal: Animal | null = null;
  editAnimal(animal: Animal) {
    this.selectedAnimal = animal;
    this.animalCreateForm.setValue({
      animalId: this.selectedAnimal.animalId,
      owner: this.selectedAnimal.owner,
      animalType: this.selectedAnimal.animalType,
      animalBreed: this.selectedAnimal.animalBreed,
      animalName: this.selectedAnimal.animalName,
      animalWeight: this.selectedAnimal.animalWeight,
      animalSex: this.selectedAnimal.animalSex,
      temperament: this.selectedAnimal.temperament,
      about: this.selectedAnimal.about,
      images: this.selectedAnimal.images,
      primaryImage: this.selectedAnimal.primaryImage,
      location: this.selectedAnimal.location,
      zipCode: this.selectedAnimal.zipCode,
      adoptionStatus: this.selectedAnimal.adoptionStatus,
      dateOfBirth: this.selectedAnimal.dateOfBirth,
      color: this.selectedAnimal.color,
      vaccinationStatus: this.selectedAnimal.vaccinationStatus
    });
    this.displayModal = true;
  }

  ngOnInit(): void {
    this.exploreService.getAnimals().subscribe((animals: Animal[]) => {
      this.animals = animals;
      this.totalPages = Math.ceil(this.animals.length / this.cardsPerPage);

      // create a list of unique types for all categories
      this.uniqueTypes = Array.from(new Set(this.animals.filter(animal => animal.animalType !== undefined).map(animal => animal.animalType))) as string[];
      this.uniqueBreeds = Array.from(new Set(this.animals.flatMap(animal => animal.animalBreed))).filter(breed => breed !== undefined) as string[];
      this.uniqueWeights = Array.from(new Set(this.animals.map(animal => animal.animalWeight))) as number[];
      this.uniqueSexes = Array.from(new Set(this.animals.map(animal => animal.animalSex))) as string[];
      this.uniqueTemperaments = Array.from(new Set(this.animals.flatMap(animal => animal.temperament))) as string[];
      this.uniqueLocations = Array.from(new Set(this.animals.map(animal => animal.location))) as string[];
      this.uniqueZipCodes = Array.from(new Set(this.animals.map(animal => animal.zipCode))) as number[];
      this.uniqueAdoptionStatuses = Array.from(new Set(this.animals.map(animal => animal.adoptionStatus))) as number[];
      this.uniqueDatesOfBirth = Array.from(new Set(this.animals.filter(animal => animal.dateOfBirth !== undefined).map(animal => animal.dateOfBirth))).filter(date => date !== undefined) as Date[];
      this.uniqueColors = Array.from(new Set(this.animals.filter(animal => animal.color !== undefined).map(animal => animal.color))).filter(color => color !== undefined) as string[];
      this.uniqueVaccinationStatuses = Array.from(new Set(this.animals.filter(animal => animal.vaccinationStatus !== undefined).map(animal => animal.vaccinationStatus))).filter(status => status !== undefined) as boolean[];
    });
  }

  getDisplayedCards() {
    const filteredAnimals = this.animals.filter(animal => {
      return Object.values(animal).some(val => String(val).toLowerCase().includes(this.searchTerm));
    });
    const start = (this.currentPage - 1) * this.cardsPerPage;
    return filteredAnimals.slice(start, start + this.cardsPerPage);
  }

  gettotalPages(): number {
    return Math.ceil(this.animals.length / this.cardsPerPage);
  }

  nextPage() {
    if (this.currentPage < this.gettotalPages()) {
      this.currentPage++;
      this.totalPages = this.gettotalPages();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.totalPages = this.gettotalPages();
    }
  }

  searchFunction(event: any) {
    this.searchTerm = event.target.value.toLowerCase();
  }

  getTotalPagesArray(): number[] {
    return Array.from({ length: this.gettotalPages() }, (_, i) => i + 1);
  }

  goToPage(page: number): void {
    this.currentPage = page;
  }

  getVisiblePages(): number[] {
    let start = Math.max(this.currentPage - 2, 1);
    let end = Math.min(this.currentPage + 2, this.gettotalPages());
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  ngAfterViewInit(): void {
    // get the select element
    const selectElement = document.getElementById('animalTypes') as HTMLSelectElement;

    // gen options for animal types
    this.uniqueTypes.forEach(type => {
      const option = document.createElement('option');
      option.value = type;
      option.textContent = type;
      selectElement.appendChild(option);
    });
  }

  handleSelectChange(event: Event): void {
    // get the selected type
    const selectElement = event.target as HTMLSelectElement;
    const selectedType = selectElement.value;

    // update the search term based on the selected type
    this.searchTerm = selectedType;

    // reset the current page to 1
    this.currentPage = 1;

    // recalc the total pages based on the number of filtered results
    this.totalPages = Math.ceil(this.getDisplayedCards().length / this.cardsPerPage);
  }

  clearFilters(): void {
    // clear all filters
    this.searchTerm = '';

    // reset the current page to 1
    this.currentPage = 1;

    // recalc the total pages based on the number of filtered results
    this.totalPages = Math.ceil(this.getDisplayedCards().length / this.cardsPerPage);

    // conv HTMLCollectionOf<HTMLSelectElement> to an array and iterate over it
    const selectElements = Array.from(document.getElementsByTagName('select'));
    for (const selectElement of selectElements) {
      selectElement.value = '';
    }
  }

}
