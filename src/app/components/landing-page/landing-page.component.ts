import {Component} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatExpansionModule } from '@angular/material/expansion';
import { Routes } from '@angular/router';

@Component({
  selector: 'landing-page',
  templateUrl: 'landing-page.component.html',
  styleUrls: ['landing-page.component.scss'],
  imports: [MatToolbarModule, MatButtonModule, MatIconModule, MatGridListModule, MatCardModule, FlexLayoutModule, MatExpansionModule],
  standalone: true
})
export class LandingPageComponent {

}
