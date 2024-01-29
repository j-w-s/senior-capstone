//import { Component } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';

@Component({
  selector: 'app-explore-create-post',
  templateUrl: './explore-create-post.component.html',
  styleUrl: './explore-create-post.component.scss'
})
export class ExploreCreatePostComponent implements OnInit {

  animalCreateForm: FormGroup;
  constructor(private fb: FormBuilder) {
    this.animalCreateForm = new FormGroup({
      animalId: new FormControl('', Validators.required),
      owner: new FormControl(''),
      animalType: new FormControl('', Validators.required),
      animalBreed: new FormControl('', Validators.required),
      animalName: new FormControl('', Validators.required),
      animalWeight: new FormControl('', Validators.required),
      animalSex: new FormControl('', Validators.required),
      temperament: new FormControl('', Validators.required),
      about: new FormControl('', Validators.required),
      images: new FormControl('', Validators.required),
      primaryImage: new FormControl('', Validators.required),
      location: new FormControl('', Validators.required),
      zipCode: new FormControl('', Validators.required),
      adoptionStatus: new FormControl('', Validators.required),
      dateOfBirth: new FormControl('', Validators.required),
      color: new FormControl('', Validators.required),
      vaccinationStatus: new FormControl('', Validators.required)
    });
  }

  ngOnInit(): void { }


}




