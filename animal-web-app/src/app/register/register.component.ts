import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoginRegisterService } from '../services/login-register.service';
import { Location } from '@angular/common';
import { EventEmitter } from '@angular/core';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit{

  registerForm: FormGroup;

  constructor(private fb: FormBuilder, private loginRegService: LoginRegisterService, private router: Router, private location: Location) {
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      email: ['', Validators.required],
      phonenumber: ['', Validators.required],
      firstname: ['', Validators.required],
      lastname: ['', Validators.required],
    });
  }

  ngOnInit(): void {

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
        this.loginRegService.loginUser(email, password).then(() => {
          // login after creating an account
          this.router.navigate(['/dashboard']);

        }).catch((error) => {
          // Handle login error
        });
      }).catch((error) => {
        // Handle registration error
      });
    } else {
      console.error('Email or password is not a string');
    }

  }

}
