import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { LandingPageComponent } from './components/landing-page/landing-page.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatExpansionModule } from '@angular/material/expansion';
import { NavbarComponent } from '../../src/app/components/navbar/navbar.component'
import { MatMenuModule } from '@angular/material/menu';
import { RouterModule } from '@angular/router';
import { ExplorePageFrameComponent } from "../../src/app/components/explore-page/explore-page-frame/explore-page-frame.component";
import { MatTabsModule } from '@angular/material/tabs';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, LandingPageComponent, MatToolbarModule, MatButtonModule,
    MatIconModule, MatGridListModule, MatCardModule, FlexLayoutModule, MatExpansionModule, NavbarComponent, MatMenuModule,
    RouterModule, ExplorePageFrameComponent, MatTabsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})

export class AppComponent {
  title = 'Animal Adopt';
}
