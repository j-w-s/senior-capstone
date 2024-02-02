import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../services/user.service';
import { takeUntil, Subject } from 'rxjs';
import { getDownloadURL, getStorage, ref } from 'firebase/storage';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { getAuth } from 'firebase/auth';



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
  


  constructor(private fb: FormBuilder, private userService: UserService, private db: AngularFirestore) {
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

    this.selectedTab = 'Profile';

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

        //this.userService.sleep(1000)

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
  //Allows users to change their FirstName on their account
  updateFirstName() {
    const firstNameControl = this.accountForm.get('userFirstName');

    if (firstNameControl) {
      const newFirstName = firstNameControl.value;
      const auth = getAuth();
      const user = auth.currentUser?.uid;
      console.log('ID: ', user);
      const userDoc = this.db.doc('/User/' + user);

      userDoc.update({
        userFirstName: newFirstName
      });
    } else {
      console.error("Could not find 'userFirstName' form control");
    }
  }
  //Allows users to change their LastName on their account
  updateLastName() {
    const lastNameControl = this.accountForm.get('userLastName');

    if (lastNameControl) {
      const newLastName = lastNameControl.value;
      const auth = getAuth();
      const user = auth.currentUser?.uid;
      console.log('ID: ', user);
      const userDoc = this.db.doc('/User/' + user);

      userDoc.update({
        userLastName: newLastName
      });
    } else {
      console.error("Could not find 'userLastName' form control");
    }
  }
  //Allows users to change their Email on their account
  updateEmail() {
    const emailControl = this.accountForm.get('userEmail');

    if (emailControl) {
      const newEmail = emailControl.value;
      const auth = getAuth();
      const user = auth.currentUser?.uid;
      console.log('ID: ', user);
      const userDoc = this.db.doc('/User/' + user);

      userDoc.update({
        userEmail: newEmail
      });
    } else {
      console.error("Could not find 'userEmail' form control");
    }
  }
  //Allows users to change their DisplayName on their account
  updateDisplayName() {
    const displayNameControl = this.profileForm.get('userDisplayName');

    if (displayNameControl) {
      const newDisplayName = displayNameControl.value;
      const auth = getAuth();
      const user = auth.currentUser?.uid;
      console.log('ID: ', user);
      const userDoc = this.db.doc('/User/' + user);

      userDoc.update({
        userDisplayName: newDisplayName
      });
    } else {
      console.error("Could not find 'userDisplayName' form control");
    }
  }
  //Allows users to change their Biography on their account
  updateBiography() {
    const biographyControl = this.profileForm.get('userBiography');

    if (biographyControl) {
      const newBiography = biographyControl.value;
      const auth = getAuth();
      const user = auth.currentUser?.uid;
      console.log('ID: ', user);
      const userDoc = this.db.doc('/User/' + user);

      userDoc.update({
        userBiography: newBiography
      });
    } else {
      console.error("Could not find 'userBiography' form control");
    }
  }
  //Allows users to change their profilepic on their account(Doesnt work)
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
