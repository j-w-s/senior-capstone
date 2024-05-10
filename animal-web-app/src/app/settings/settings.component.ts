import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../services/user.service';
import { takeUntil, Subject, finalize } from 'rxjs';
import { getDownloadURL, getStorage, ref } from 'firebase/storage';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { getAuth } from 'firebase/auth';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { LoginRegisterService } from '../services/login-register.service';
import User from '../../models/user';
import { AlertsService } from '../services/alerts.service';

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
  currentModal: string = '';
  user!: User;

  openModal(modalType: string) {
    this.currentModal = modalType;
    const modalToggle = document.getElementById('modal-toggle') as HTMLInputElement;
    if (modalToggle) {
      modalToggle.checked = true;
    }
  }

  closeModal() {
    this.currentModal = '';
    const modalToggle = document.getElementById('modal-toggle') as HTMLInputElement;
    if (modalToggle) {
      modalToggle.checked = false;
    }
  }

  constructor(private fb: FormBuilder,
    private userService: UserService,
    private db: AngularFirestore,
    private storage: AngularFireStorage,
    private loginRegService: LoginRegisterService,
    private alertsService: AlertsService  ) {

    this.profileForm = this.fb.group({
      userDisplayName: ['', Validators.required],
      userBiography: ['', Validators.required],
      userImage: ['', Validators.required]
    });

    this.accountForm = this.fb.group({
      userFirstName: ['', Validators.required],
      userLastName: ['', Validators.required],
      userEmail: ['', [Validators.required, Validators.email]],
      userZipcode: ['', Validators.required]
    });

    this.selectedTab = 'Profile';

  }

  async updateProfileSettings() {
    const userDisplayName = this.profileForm?.get('userDisplayName')?.value;
    const userBiography = this.profileForm?.get('userBiography')?.value;
    const userImage = this.profileForm?.get('userImage')?.value;
    this.currentModal = '';
    this.userService.updateUserProfileInformation(this.user, userDisplayName, userBiography, userImage).then(() => {
      this.alertsService.show('success', 'Your profile information has been updated successfully.');
      this.loginRegService.updateDetails(this.user.userId);
      setTimeout(() => {
        this.currentModal = '';
      }, 3000);
    }).catch((error) => {
      this.alertsService.show('error', 'There was an error updating your profile information.');
    });
  }

  async updateAccountSettings() {
    const userFirstName = this.accountForm?.get('userFirstName')?.value;
    const userLastName = this.accountForm?.get('userLastName')?.value;
    const userEmail = this.accountForm?.get('userEmail')?.value;
    const userZipCode = this.accountForm?.get('userZipCode')?.value;
    this.currentModal = '';
    this.userService.updateUserAccountInformation(this.user, userFirstName, userLastName, userEmail, userZipCode).then(() => {
      this.alertsService.show('success', 'Your account information has been updated successfully.');
      this.loginRegService.updateDetails(this.user.userId);
      setTimeout(() => {
        this.currentModal = '';
      }, 3000);
    }).catch((error) => {
      this.alertsService.show('error', 'There was an error updating your account information.');
    });
  }

  ngOnInit(): void {
    // don't know why this isn't just using the loginreg service
    this.userService.getUserData().then(observable$ => {
      observable$.pipe(takeUntil(this.destroy$)).subscribe(async (value: any) => {
        const storage = getStorage();
        getDownloadURL(ref(storage, value.userImage)).then(url => {
          console.log('URL: ', url)
          this.imgUrl = url
        })

        this.user = value;

        this.profileForm = this.fb.group({
          userDisplayName: [value.userDisplayName, Validators.required],
          userBiography: [value.userBiography, Validators.required],
          userImage: [value.userImage, Validators.required]
        });

        this.accountForm = this.fb.group({
          userFirstName: [value.userFirstName, Validators.required],
          userLastName: [value.userLastName, Validators.required],
          userEmail: [value.userEmail, [Validators.required, Validators.email]],
          userZipcode: [value.userZipcode, Validators.required]
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
      const filePath = `uploads/${Date.now()}_${file.name}`;
      const fileRef = this.storage.ref(filePath);
      const task = this.storage.upload(filePath, file);

      // Get notified when the download URL is available
      task.snapshotChanges().pipe(
        finalize(() => {
          fileRef.getDownloadURL().subscribe(url => {
            console.log('File available at', url);
            this.profileForm?.get('userImage')?.setValue(url);
            this.imgUrl = url;
          });
        })
      ).subscribe();
    }
  }

  saveUrlToFirestore(url: string) {
    const userId = this.user.userId;
    console.log(url);
    this.db.collection('User').doc(userId).update({
      userImage: url
    });
  }

}
