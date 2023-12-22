import { Component, OnInit } from '@angular/core'; import { trigger, state, style, animate, transition } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { NgIf } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-login-register',
  standalone: true,
  imports: [NgIf, CommonModule, ReactiveFormsModule, MatInputModule,
    MatButtonModule, MatFormFieldModule],
  animations: [
    trigger('slideInOut', [
      state('in', style({
        'max-height': '500px',
        opacity: '1',
        visibility: 'visible'
      })),
      state('out', style({
        'max-height': '0px',
        opacity: '0',
        visibility: 'hidden'
      })),
      transition('in => out', [animate('400ms ease-in-out')]),
      transition('out => in', [animate('400ms ease-in-out')])
    ])
  ],
  templateUrl: './login-register.component.html',
  styleUrl: './login-register.component.scss'
})
export class LoginRegisterComponent {
  formType: string = 'login';
  loginForm!: FormGroup;
  registerForm!: FormGroup;

  constructor(private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      usernameOrEmail: ['', Validators.required],
      password: ['', Validators.required]
    });

    this.registerForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      usernameOrEmail: ['', Validators.required],  
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }


  onSubmit() {
    if (this.formType === 'login') {
      if (this.loginForm.invalid) {
        return;
      }

    } else {
      if (this.registerForm.invalid) {
        return;
      }

    }
  }

  toggleForm() {
    this.formType = this.formType === 'login' ? 'register' : 'login';
  }
}
