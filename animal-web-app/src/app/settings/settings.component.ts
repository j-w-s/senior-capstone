import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators} from '@angular/forms';

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
      userFirstName: ['', Validators.required],
      userLastName: ['', Validators.required],
      userPhoneNumber: ['', Validators.required],
      userEmail: ['', [Validators.required, Validators.email]],
      userDisplayName: ['', Validators.required],
      userBiography: ['', Validators.required],
      userImage: ['https://www.shutterstock.com/image-photo/photo-cheerful-joyful-mixedrace-woman-260nw-1563641263.jpg', Validators.required]
    });

    this.accountForm = this.fb.group({
      userPassword: ['', Validators.required],
      userFirstName: ['', Validators.required],
      userLastName: ['', Validators.required],
      userEmail: ['', [Validators.required, Validators.email]],
      userDisplayName: ['', Validators.required],
      userBiography: ['', Validators.required]

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

  updatePhoto(event: Event) {
    const file = (event.target as HTMLInputElement)?.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        this.profileForm.get('userImage')?.setValue((reader.result as string) ?? '');
      };
      reader.readAsDataURL(file);
    }
  }

}
