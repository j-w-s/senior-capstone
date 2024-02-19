import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoginRegisterService } from '../services/login-register.service';
import { Location } from '@angular/common';
import { EventEmitter } from '@angular/core';
import { ExploreService } from '../services/explore.service';
import Animal from '../../models/animal';
import { sendPasswordResetEmail } from 'firebase/auth';
import { v4 as uuidv4 } from 'uuid';
import { AlertsService } from '../services/alerts.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;
  forgotPasswordForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private loginRegService: LoginRegisterService,
    private router: Router,
    private location: Location,
    private alertService: AlertsService,
  )
  {
    this.loginForm = this.fb.group({
      usernameoremail: ['', Validators.required],
      password: ['', Validators.required]
    });

    this.forgotPasswordForm = this.fb.group({
      email: ['', Validators.required],
    });

  }

  ngOnInit(): void {

  }

  onLoginSubmit() {
    const usernameOrEmail = this.loginForm?.get('usernameoremail')?.value;
    const password = this.loginForm?.get('password')?.value;

    if (typeof usernameOrEmail === 'string' && typeof password === 'string') {
      this.loginRegService.loginUser(usernameOrEmail, password).then(() => {
        this.alertService.show('success', 'Successfully logged in. Redirecting you to the dashboard.');
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 3000);
      }).catch((error) => {
      });
    } else {
      this.alertService.show('error', 'There was an error signing you in. Check your credentials again and re-submit.');
    }
  }

  onForgotSubmit() {
    const email = this.forgotPasswordForm?.get('email')?.value;
    const auth = this.loginRegService.auth;

    sendPasswordResetEmail(auth, email)
      .then(() => {
        this.alertService.show('success', 'Password reset instructions have been sent to your email!');
        this.alertService.closeModal('forgot_modal');
      })
      .catch((error) => {
        this.alertService.show('error', 'There was an error sending the password reset instructions.');
      });
  }

}
