import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../services/user.service';
import { takeUntil, Subject } from 'rxjs';
import { getDownloadURL, getStorage, ref } from 'firebase/storage';


@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  profileForm: FormGroup;
  accountForm: FormGroup;
  selectedTab: string;
  private destroy$ = new Subject<void>();
  imgUrl = '';
  


  constructor(private fb: FormBuilder, private userService: UserService) {
    this.profileForm = this.fb.group({
      userDisplayName: ['', Validators.required],
      userBiography: ['', Validators.required],
      userImage: ['https://www.shutterstock.com/image-photo/photo-cheerful-joyful-mixedrace-woman-260nw-1563641263.jpg', Validators.required]
    });

    this.accountForm = this.fb.group({
      userFirstName: ['', Validators.required],
      userLastName: ['', Validators.required],
      userEmail: ['', [Validators.required, Validators.email]],

    });

    this.selectedTab = 'profile';

  }

  ngOnInit(): void {
    this.userService.getUserData().then(observable$ => {
      observable$.pipe(takeUntil(this.destroy$)).subscribe(async (value: any) => {
        //resolve image
        //let imgUrl = '';
        const storage = getStorage();
        getDownloadURL(ref(storage, value.userImage)).then(url => {
          console.log('URL: ', url)
          this.imgUrl = url
        })

        this.userService.sleep(1000)

        this.profileForm = this.fb.group({
          userDisplayName: [value.userDisplayName, Validators.required],
          userBiography: [value.userBiography, Validators.required],
          userImage: [this.imgUrl, Validators.required]
        });

        this.accountForm = this.fb.group({
          userFirstName: [value.userFirstName, Validators.required],
          userLastName: [value.userLastName, Validators.required],
          userEmail: [value.userEmail, [Validators.required, Validators.email]],

        });

        
      })
    })

    window.onbeforeunload = () => this.ngOnDestroy();
  }

  ngOnDestroy() {
    this.destroy$.next()
    this.destroy$.complete()
  }

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
