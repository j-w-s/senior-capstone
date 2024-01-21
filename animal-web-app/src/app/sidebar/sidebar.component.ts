import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Location } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  closeMenu: boolean;
  currentUrl: string = "";

  constructor(private router: Router, private location: Location) {
    this.closeMenu = false;
  }

  ngOnInit() {
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
      this.currentUrl = this.location.path();
    });
  }

  handleCloseMenu(): void {
    this.closeMenu = !this.closeMenu;
  }

  getActiveClass(route: string): string {
    return this.currentUrl === route ? 'active' : '';
  }
}
