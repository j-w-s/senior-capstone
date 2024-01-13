import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { AngularFireModule } from '@angular/fire/compat';
import { environment } from '../environments/environment';
import { initializeApp } from 'firebase/app'
import { LoginRegisterService } from './services/login-register.service';

@NgModule({
  imports: [BrowserModule, AngularFireModule.initializeApp(environment.firebase)],
  declarations: [AppComponent],
  bootstrap: [AppComponent],
  providers: [LoginRegisterService],
})
export class AppModule { }
