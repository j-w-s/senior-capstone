import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatMenuModule } from '@angular/material/menu';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [MatToolbarModule, MatButtonModule, MatIconModule, MatGridListModule, MatCardModule, FlexLayoutModule, MatExpansionModule, MatMenuModule, RouterModule, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  showPopup = false;
  menuListItems = [
    { menuLinkText: 'Settings', menuIcon: 'settings', isDisabled: true },
    { menuLinkText: 'About Us', menuIcon: 'people', isDisabled: true },
    { menuLinkText: 'Help', menuIcon: 'help', isDisabled: true },
    { menuLinkText: 'Contact', menuIcon: 'contact', isDisabled: true }
  ];
}
