import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  profileForm: FormGroup;
  accountForm: FormGroup;
  selectedTab: string;

  constructor(private fb: FormBuilder) {
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      title: ['', Validators.required],
      place: ['', Validators.required],
      about: ['', Validators.required],
      language: ['', Validators.required],
      timezone: ['', Validators.required],
      syncData: [false, Validators.requiredTrue]
    });

    this.accountForm = this.fb.group({
      name: ['', Validators.required],
    });

    this.selectedTab = 'profile';

  }

  ngOnInit(): void { }

  onSubmit(): void {
    if (this.profileForm.valid) {
      console.log(this.profileForm.value);
    }
    if (this.accountForm.valid) {
      console.log(this.accountForm.value);
    }
  }
}
