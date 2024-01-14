import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { LoginRegisterService } from '../services/login-register.service';

@Component({
  selector: 'app-login-register',
  templateUrl: './login-register.component.html',
  styleUrl: './login-register.component.scss'
})
export class LoginRegisterComponent implements OnInit {
  formType = 'login';

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

  constructor(private fb: FormBuilder, private loginRegService: LoginRegisterService, private router: Router) { }

  ngOnInit(): void {
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
