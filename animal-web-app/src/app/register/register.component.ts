import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoginRegisterService } from '../services/login-register.service';
import { Location } from '@angular/common';
import { EventEmitter } from '@angular/core';
import { AlertsService } from '../services/alerts.service';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { getAuth } from 'firebase/auth';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit{

  tempImageUrl: string = '';
  defaultImages: string[] = [];
  usingDefaultImage = false;
  profileSetupToggle = false;
  registerForm: FormGroup;

  constructor(private fb: FormBuilder,
    private loginRegService: LoginRegisterService,
    private router: Router,
    private alertService: AlertsService,
    private location: Location,
    private storage: AngularFireStorage,
    private db: AngularFirestore,
    private authService: AngularFireAuth) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      email: ['', [Validators.required, Validators.email]],
      phonenumber: ['', [Validators.required, Validators.pattern('[0-9]{10}')]],
      firstname: ['', Validators.required],
      lastname: ['', Validators.required],
    });
  }

  userImageID = '';

  ngOnInit(): void {
    this.loadDefaultImages();
    console.log('Loading defaults')
  }

  onRegisterSubmit() {
    const email = this.registerForm?.get('email')?.value;
    const password = this.registerForm?.get('password')?.value;
    const firstname = this.registerForm?.get('firstname')?.value;
    const lastname = this.registerForm?.get('lastname')?.value;
    const phonenumber = this.registerForm?.get('phonenumber')?.value;
    const username = this.registerForm?.get('username')?.value;

    if (typeof email === 'string' && typeof password === 'string' && typeof firstname == 'string' && typeof lastname == 'string' && typeof phonenumber == 'string' && typeof username == 'string') {
      this.loginRegService.registerUser(email, password, firstname, lastname, phonenumber, username, this.tempImageUrl).then(() => {
        this.loginRegService.loginUser(email, password).then(() => {
          this.alertService.show('success', 'Successfully created your account. Redirecting you to the dashboard.');
          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 3000); 
        }).catch((error) => {
          this.alertService.show('error', 'Your account was created, but we were unable to log you in. Log in manually.');
        });
      }).catch((error) => {
        this.alertService.show('error', 'Your account could not be created. Check your credentials and try again.');
      });

    } else {
      console.error('Email or password is not a string');
    }

  }

  async onFileSelected(event: Event) {
    //this.usingDefaultImage = false;
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files.length >  0) {
      const file = fileInput.files[0];
      const filePath = `userAccountPhotos/${Date.now()}_${file.name}`;
      const fileRef = this.storage.ref(filePath);
      const task = fileRef.put(file);
  
      task.snapshotChanges().pipe(
        finalize(() => fileRef.getDownloadURL().subscribe(url => {
          console.log(url);
          if (this.tempImageUrl != '') {
            // If an image was previously selected, delete it
            if(this.usingDefaultImage == true)
            {
              
            }
            else {
              const existingImageRef = this.storage.refFromURL(this.tempImageUrl);
              existingImageRef.delete().subscribe(() => {
                console.log('Existing image deleted');
              }, error => {
                console.error('Error deleting existing image:', error);
              });
            }
            
          }
          this.tempImageUrl = url; // Update the temporary image URL
        }))
      ).subscribe();
    }
  }

  loadDefaultImages() {
    const defaultImagesRef = this.storage.ref('defaultAccountPhotos');
    console.log('Trying...')
    defaultImagesRef.listAll().subscribe(res => {
      console.log(res)
      res.items.forEach(itemRef => {
        itemRef.getDownloadURL().then(url => {
          console.log('Image name:', itemRef.name); // Log the name of the image
          console.log(url)
          this.defaultImages.push(url);
        });
      });
    });
  }

  onImageSelected(imageUrl: string) {
    this.usingDefaultImage = true;
    this.tempImageUrl = imageUrl
    console.log('Changed url', imageUrl)
  }

  isRegisterButtonDisabled(): boolean {
    return !this.tempImageUrl && !this.usingDefaultImage;
  }

}
