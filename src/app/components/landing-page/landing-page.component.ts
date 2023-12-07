import {Component} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatToolbarModule} from '@angular/material/toolbar';

@Component({
  selector: 'landing-page.component',
  templateUrl: 'landing-page.component.html',
  styleUrls: ['landing-page.component.scss'],
  imports: [MatToolbarModule, MatButtonModule, MatIconModule],
})
export class LandingPageComponent { }
