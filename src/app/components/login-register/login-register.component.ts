import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-login-register',
  imports: [ MatFormFieldModule,
    MatInputModule,
    MatButtonModule,     CommonModule,
    ReactiveFormsModule],
    standalone: true,
  templateUrl: './login-register.component.html',
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

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
  }

}
