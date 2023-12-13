import { RouterModule, Routes } from '@angular/router';
import { ExplorePageFrameComponent } from "../../src/app/components/explore-page/explore-page-frame/explore-page-frame.component";
import { LandingPageComponent } from './components/landing-page/landing-page.component';

export const routes: Routes = [
  { path: 'explore', component: ExplorePageFrameComponent },
  { path: ' ', component: LandingPageComponent },
];

export const routing = RouterModule.forRoot(routes);
