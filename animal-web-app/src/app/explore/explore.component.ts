import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { ExploreService } from '../services/explore.service';
import Animal from '../../models/animal';
import User from '../../models/user';
import { LoginRegisterService } from '../services/login-register.service';
import { finalize, Observable, Subscription } from 'rxjs';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { v4 as uuidv4 } from 'uuid';
import { AngularFireStorage } from '@angular/fire/compat/storage';

@Component({
  selector: 'app-explore',
  templateUrl: './explore.component.html',
  styleUrl: './explore.component.scss'
})
export class ExploreComponent implements OnInit, AfterViewInit{

  animals$!: Observable<Animal[]>;
  animalsSubscription: Subscription | undefined;
  animalCreateForm: FormGroup;

  animals: Animal[] = [];
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

  displayModal = false;
  showKebabModal = false;
  selectedAnimal: Animal | null = null;

  currentUserId!: string;
  currentUser!: any;

  dropdownVisible = false;

  isModalOpen = false;
  @ViewChild('addAnimalModal', { static: false }) addAnimalModal!: ElementRef;

  openModal(): void {
    this.addAnimalModal.nativeElement.checked = true;
 }

 closeModal(): void {
    this.addAnimalModal.nativeElement.checked = false;
    this.animalCreateForm = new FormGroup({
      animalId: new FormControl(this.generateUUID(), Validators.required),
      owner: new FormControl(this.currentUser.firstName + ' ' + this.currentUser.lastName, Validators.required),
      animalType: new FormControl('', Validators.required),
      animalBreed: new FormControl([''], Validators.required),
      animalName: new FormControl('', Validators.required),
      animalWeight: new FormControl(0, Validators.required),
      animalSex: new FormControl('', Validators.required),
      temperament: new FormControl([''], Validators.required),
      about: new FormControl('', Validators.required),
      images: new FormControl([], Validators.required),
      primaryImage: new FormControl(0, Validators.required),
      location: new FormControl('', Validators.required),
      zipCode: new FormControl(0, Validators.required),
      adoptionStatus: new FormControl(0, Validators.required),
      dateOfBirth: new FormControl(new Date(), Validators.required),
      color: new FormControl(''),
      vaccinationStatus: new FormControl(false)
    });
 }

  toggleDropdown() {
    this.dropdownVisible = !this.dropdownVisible;
  }

  constructor(private exploreService: ExploreService, private cdr: ChangeDetectorRef, private fb: FormBuilder, private loginRegService: LoginRegisterService,

    private storage: AngularFireStorage  ) {
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
      images: new FormControl([], Validators.required),
      primaryImage: new FormControl(0, Validators.required),
      location: new FormControl('', Validators.required),
      zipCode: new FormControl(0, Validators.required),
      adoptionStatus: new FormControl(0, Validators.required),
      dateOfBirth: new FormControl(new Date(), Validators.required),
      color: new FormControl(''),
      vaccinationStatus: new FormControl(false)
    });
    this.getDisplayedCards();
  }

  // for single breed types
  convertToArray(value: any): Array<any> {
    return Array.isArray(value) ? value : [value];
  }

  generateUUID(): string {
    return uuidv4() as string;
  }

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

  animalKebab(animal: Animal) {
    this.selectedAnimal = animal;
    this.showKebabModal = true;
  }

  closeKebabModal() {
    this.showKebabModal = false;
  }

  createNewSetup(): void {
    this.animalCreateForm = new FormGroup({
      animalId: new FormControl(this.generateUUID(), Validators.required),
      owner: new FormControl(this.currentUser.firstName + ' ' + this.currentUser.lastName, Validators.required),
      animalType: new FormControl('', Validators.required),
      animalBreed: new FormControl([''], Validators.required),
      animalName: new FormControl('', Validators.required),
      animalWeight: new FormControl(0, Validators.required),
      animalSex: new FormControl('', Validators.required),
      temperament: new FormControl([''], Validators.required),
      about: new FormControl('', Validators.required),
      images: new FormControl([], Validators.required),
      primaryImage: new FormControl(0, Validators.required),
      location: new FormControl('', Validators.required),
      zipCode: new FormControl(0, Validators.required),
      adoptionStatus: new FormControl(0, Validators.required),
      dateOfBirth: new FormControl(new Date(), Validators.required),
      color: new FormControl(''),
      vaccinationStatus: new FormControl(false)
    });
  }

  /*async handleFileInput(files: File[]) {
    const promises = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const filePath = `/images/${Date.now()}_${file.name}`;
      const fileRef = this.storage.ref(filePath);
      const task = this.storage.upload(filePath, file);

      promises.push(task.snapshotChanges().pipe(finalize(() => fileRef.getDownloadURL())).toPromise());
    }
    return Promise.all(promises);
  }*/

  async addAnimalToCollection(): Promise<void> {
    // get the form values
    const formValues = this.animalCreateForm.value;

    // ensure animalBreed and temperament are arrays
    let animalBreeds = Array.isArray(formValues.animalBreed) ? formValues.animalBreed : formValues.animalBreed.split(/[\s,]+/);
    let animalTemps = Array.isArray(formValues.temperament) ? formValues.temperament : formValues.temperament.split(/[\s,]+/);

    // get the image file from the event
    let imageFiles = formValues.images;

    // prepare an array to hold the image URLs
    const image = [imageFiles]

    // add the image URLs to the form values
    //formValues.images = imageUrls;

    delete formValues.animalBreed;
    delete formValues.temperament;
    delete formValues.images;

    this.exploreService.createAnimal({
      ...formValues,
      animalBreed: animalBreeds,
      temperament: animalTemps,
      images: image,
    });
  }



  async ngOnInit(): Promise<void> {
    this.currentUserId =  await this.loginRegService.getCurrentUser();
    this.currentUser = await this.loginRegService.getUserDetails(this.currentUserId);
    this.animals$ = this.exploreService.getAnimals();

    this.animalsSubscription = this.animals$.subscribe((animals: Animal[]) => {
      this.animals = animals;
      this.totalPages = Math.ceil(this.animals.length / this.cardsPerPage);

      // create a list of unique types for all categories
      this.uniqueTypes = Array.from(new Set(animals.map(animal => animal.animalType?.toLowerCase()))) as string[];      
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

      this.getDisplayedCards();
      console.log(this.animals$);
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

  //Function called by dropdown to actually filter cards shown
  dropdownFilter(event: any, type: any){
    console.log("Filter by: ",type);
    this.searchTerm = type;
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

  deleteAnimalFromCollection(animal: Animal): void {
    this.exploreService.deleteAnimal(animal).then(() => {
      console.log('Animal deleted successfully');
      this.animals = this.animals.filter(a => a.animalId !== animal.animalId);
      this.cdr.detectChanges();
    }).catch((error) => {
      console.error('Error deleting animal:', error);
    });
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

  filterThreads(search: string): void {
  }
}
