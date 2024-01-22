import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoginRegisterService } from '../services/login-register.service';
import { Location } from '@angular/common';
import { EventEmitter } from '@angular/core';
import { ExploreService } from '../services/explore.service';
import Animal from '../../models/animal';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private loginRegService: LoginRegisterService,
    private router: Router,
    private location: Location,  ) {
    this.loginForm = this.fb.group({
      usernameoremail: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

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

}
