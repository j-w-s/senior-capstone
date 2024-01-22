import { Component, OnInit } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { ExploreService } from '../services/explore.service';
import Animal from '../../models/animal';
import { LoginRegisterService } from '../services/login-register.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-explore',
  templateUrl: './explore.component.html',
  styleUrl: './explore.component.scss'
})
export class ExploreComponent implements OnInit {

  animals$!: Observable<Animal[]>;

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
  currentPage = 1;
  cardsPerPage = 8;
  totalPages = 0;

  constructor(private exploreService: ExploreService) { }

  ngOnInit(): void {
    this.exploreService.getAnimals().subscribe(animals => {
      this.animals = animals;
      this.totalPages = Math.ceil(this.animals.length / this.cardsPerPage);
    });
  }

  getDisplayedCards() {
    const start = (this.currentPage - 1) * this.cardsPerPage;
    return this.animals.slice(start, start + this.cardsPerPage);
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
    console.log(event.target.value);
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

}
