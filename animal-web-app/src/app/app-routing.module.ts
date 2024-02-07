import { NgModule } from '@angular/core';
import { RouterModule, Routes, ExtraOptions } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { LoginRegisterComponent } from './login-register/login-register.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { MessengerComponent } from './messenger/messenger.component';
import { ExploreComponent } from './explore/explore.component';
import { SettingsComponent } from './settings/settings.component';
import { GroupsPageComponent } from './groups-page/groups-page.component';
import { HomeComponent } from './home/home.component';
import { ForumsComponent } from './forums/forums.component';
import { MapComponent } from './map/map.component';
import { AuthguardService } from './services/authguard.service';
import { AuthGuard } from './auth/auth.guard';
import { UnathorizedComponent } from './unathorized/unathorized.component';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard], data: { expectedRole: "1" } },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'messenger', component: MessengerComponent },
  { path: 'explore', component: ExploreComponent },
  { path: 'settings', component: SettingsComponent },
  { path: 'groups', component: GroupsPageComponent },
  { path: 'forums', component: ForumsComponent },
  { path: 'map', component: MapComponent },
  { path: 'unauthorized', component: UnathorizedComponent },
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
