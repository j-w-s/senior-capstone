import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { LoginRegisterService } from '../services/login-register.service';
import { Location } from '@angular/common';
import { EventEmitter } from '@angular/core';

@Component({
  selector: 'app-login-register',
  templateUrl: './login-register.component.html',
  styleUrls: ['./login-register.component.scss']
})
export class LoginRegisterComponent implements OnInit {
  action!: string;
  formType: string = 'login';

  loginForm = this.fb.group({
    usernameoremail: ['', Validators.required],
    password: ['', Validators.required]
  });

  registerForm = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
    email: ['', Validators.required],
    phonenumber: ['', Validators.required],
    firstname: ['', Validators.required],
    lastname: ['', Validators.required],
  });

  constructor(private fb: FormBuilder, private loginRegService: LoginRegisterService, private router: Router, private location: Location) { }

  ngOnInit(): void {
    const state = this.location.getState() as Record<string, unknown>;
    this.action = state ? (state['action'] as string) : 'login';
    this.formType = this.action;
    console.log(this.formType); // Add this line
  }

  onLoginSubmit() {
    const usernameOrEmail = this.loginForm?.get('usernameoremail')?.value;
    const password = this.loginForm?.get('password')?.value;
   
    if (typeof usernameOrEmail === 'string' && typeof password === 'string') {
    this.loginRegService.loginUser(usernameOrEmail, password).then(() => {
      // Handle successful login
      if (this.loginRegService.tabIndex === 9) {
        this.loginRegService.tabIndex = 0;
      } else {
        this.loginRegService.tabIndex = 9;
      }
    }).catch((error) => {
      // Handle login error
    });
    } else {
    console.error('Username or email or password is not a string');
    }
   }
   
  onRegisterSubmit() {
    const email = this.registerForm?.get('email')?.value;
    const password = this.registerForm?.get('password')?.value;
    const firstname = this.registerForm?.get('firstname')?.value;
    const lastname = this.registerForm?.get('lastname')?.value;
    const phonenumber = this.registerForm?.get('phonenumber')?.value;
    const username = this.registerForm?.get('username')?.value;

    if (typeof email === 'string' && typeof password === 'string' && typeof firstname == 'string' && typeof lastname == 'string' && typeof phonenumber == 'string' && typeof username == 'string') {
      this.loginRegService.registerUser(email, password, firstname, lastname, phonenumber, username).then(() => {
        // Handle successful registration
      }).catch((error) => {
        // Handle registration error
      });
     } else {
      console.error('Email or password is not a string');
     }
     
  }
}
