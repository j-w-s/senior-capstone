import { Component, AfterViewInit, OnInit } from '@angular/core';
import * as L from 'leaflet';
import { catchError, finalize, Observable, Subscription } from 'rxjs';
import Beacon from '../../models/beacon';
import BeaconMarker from '../../models/beacon-marker';
import { MapService } from '../services/map.service';
import { GroupsService } from '../services/groups.service';
import * as firebase from 'firebase/app';
import 'firebase/firestore';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import BusinessRating from '../../models/business-ratings';
import { v4 as uuidv4 } from 'uuid';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { getStorage, deleteObject } from "firebase/storage";
import { GeoPoint } from 'firebase/firestore';
import { Renderer2, ElementRef } from '@angular/core';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements AfterViewInit, OnInit {

  private map!: L.Map;
  private markers: L.Marker[] = [];

  beacons$!: Observable<Beacon[]>;
  beaconsSubscription!: Subscription;

  beaconMarkers$!: Observable<BeaconMarker[]>;
  beaconMarkersSubscription!: Subscription;

  beacons: Beacon[] = [];
  beaconMarkers: BeaconMarker[] = [];
  selectedBeaconData!: BeaconMarker;

  showModal: boolean = false;
  createBeaconForm!: FormGroup;

  currentSlideIndex = 0;
  images: string[] = [];
  ratings: BusinessRating[] = [];
  averageRating: number = 0;
  averageRatingStars: string[] = [];

  showForm: boolean = false;
  comment: string = '';
  rating: number = 1;
  commentForm: FormGroup;
  documentID: any;
  beaconColor: string = "";
  beaconType: number = 1;

  constructor(private mapService: MapService,
    private fb: FormBuilder,
    private firestore: AngularFirestore,
    private storage: AngularFireStorage,
    private groupsService: GroupsService,
    private renderer: Renderer2, private el: ElementRef
  ) {

    this.commentForm = this.fb.group({
      comment: ['', Validators.required],
      rating: [1, Validators.required] 
    });

    this.createBeaconForm = new FormGroup({
      beaconType: new FormControl(''),
      beaconColor: new FormControl(''),
      geoCoordinates: new FormControl('', Validators.required),
      markerId: new FormControl('', Validators.required),
      address: new FormControl('', Validators.required),
      images: this.fb.array([], Validators.required),
      contactInformation: new FormControl('', Validators.required),
      about: new FormControl('', Validators.required),
    });

  }

  async resetForm(): Promise<void> {
    await this.deleteImages();
    this.images = [];
    this.createBeaconForm = new FormGroup({
      beaconType: new FormControl(''),
      beaconColor: new FormControl(''),
      geoCoordinates: new FormControl('', Validators.required),
      markerId: new FormControl('', Validators.required),
      address: new FormControl('', Validators.required),
      images: this.fb.array([], Validators.required), // Initialize images as a FormArray
      contactInformation: new FormControl('', Validators.required),
      about: new FormControl('', Validators.required),
    });
    this.createNewGuid();
  }

  createNewGuid(): void {
    this.createBeaconForm.get('markerId')!.setValue(uuidv4());
  }

  async addNewBeacon(): Promise<void> {
    console.log(this.createBeaconForm);
    if (this.createBeaconForm.valid) {
      try {
        let coords = this.createBeaconForm.get('geoCoordinates')?.value;
        let beaconColor = this.createBeaconForm.get('beaconColor')?.value;
        let beaconType = this.createBeaconForm.get('beaconType')?.value;
        console.log(beaconColor);
        console.log(beaconType);
        coords = coords.split(", ");
        coords = { _lat: parseFloat(coords[0]), _long: parseFloat(coords[1]) };
        let markerId = this.createBeaconForm.get('markerId')?.value as string;
        const beaconMarker: BeaconMarker = {
          markerId: markerId,
          address: this.createBeaconForm.get('address')?.value,
          images: this.createBeaconForm.get('images')?.value,
          contactInformation: this.createBeaconForm.get('contactInformation')?.value,
          about: this.createBeaconForm.get('about')?.value,
          listings: [],
          ratings: [],
        };
        console.log(beaconMarker)
        this.mapService.addBeaconMarker(beaconMarker).then(beaconMarkerRef => {
          const beacon: Beacon = {
            beaconType: this.beaconType,
            beaconColor: this.beaconColor,
            geoCoordinates: coords,
            beaconInformation: beaconMarkerRef,
            beaconMarkerId: markerId,
          }
          this.mapService.addBeacon(beacon);
          console.log(beacon)
        });
      } catch {
      }
    }
  }
  openModal(): void {
    this.resetForm();
    const modalToggle = document.getElementById('createBeaconModalToggle') as HTMLInputElement;
    modalToggle.checked = true;
  }

  closeModal(): void {
    const modalToggle = document.getElementById('createBeaconModalToggle') as HTMLInputElement;
    modalToggle.checked = false;
    this.resetForm();
  }

  ngOnInit(): void {
    this.initializeBeaconSelections();
  }

  initializeBeaconSelections(): void {
    const beaconTypeSelect = this.el.nativeElement.querySelector('#beaconType');
    const beaconColorSelect = this.el.nativeElement.querySelector('#beaconColor');

    const updateClassVariables = (beaconType: string, beaconColor: string) => {
      this.beaconType = Number(beaconType); // Convert beaconType back to number after updating
      this.beaconColor = beaconColor;
    };

    this.renderer.listen(beaconTypeSelect, 'change', (event) => {
      const beaconType = (event.target as HTMLSelectElement).value;
      updateClassVariables(beaconType.toString(), this.beaconColor); // Convert beaconType to string before passing
    });

    this.renderer.listen(beaconColorSelect, 'change', (event) => {
      const beaconColor = (event.target as HTMLSelectElement).value;
      updateClassVariables(this.beaconType.toString(), beaconColor); // Convert beaconType to string before passing
    });
  }

  updatePhoto(event: Event) {
    console.log(event);
    const files = (event.target as HTMLInputElement)?.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const filePath = `uploads/${Date.now()}_${file.name}`;
        const fileRef = this.storage.ref(filePath);
        const task = this.storage.upload(filePath, file);

        task.snapshotChanges().pipe(
          finalize(() => {
            fileRef.getDownloadURL().subscribe(url => {
              console.log('File available at', url);
              // Push the URL into the FormArray
              const imagesArray = this.createBeaconForm.get('images') as FormArray;
              imagesArray.push(new FormControl(url));
            });
          })
        ).subscribe();
      }
    }
    console.log(this.createBeaconForm);
  }

  async deleteImages(): Promise<void> {
    try {
      for (let i = 0; i < this.images.length; i++) {
        this.storage.ref(this.images[i]).delete;
        console.log(this.storage.ref)
      }
    }
    catch {
    }
  }

  triggerFileInput(): void {
    const fileInput = document.getElementById('imageUpload') as HTMLInputElement;
    fileInput.click();
  }

  ngAfterViewInit(): void {
    this.beacons$ = this.mapService.getBeacons();
    this.beaconMarkers$ = this.mapService.getBeaconMarkers();

    this.beaconsSubscription = this.beacons$.subscribe((beacons: Beacon[]) => {
      this.beacons = beacons;
      console.log(this.beacons);
    });

    this.beaconMarkersSubscription = this.beaconMarkers$.subscribe((beaconMarkers: BeaconMarker[]) => {
      this.beaconMarkers = beaconMarkers;
      console.log(this.beaconMarkers);
      this.initMap();
    })
  }

  private initMap(): void {
    // overall northern border of louisiana
    var boundary: L.LatLngTuple[] = [
      [33.012559, -94.013723],
      [33.012559, -91.204038],
      [32.022943, -91.386837],
      [32.022943, -94.027264]
    ];

    this.map = L.map('map', {
      center: [32.529674, -92.640466],
      zoom: 15,
      maxBounds: boundary,
      maxBoundsViscosity: 1.0
    });

    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 20,
      minZoom: 8,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });

    tiles.addTo(this.map);

    // apply boundary to leaflet map
    L.polygon(boundary, {
      color: 'red', // border color
      weight: 8, // border thickness
      fillColor: 'transparent', // NO fill color
      fillOpacity: 0 // fill opacity
    }).addTo(this.map);

    // add beacons to the leaflet map
    /* we will eventually use a list of beacons populated by our database:
    var beaconCoords = [ [1, 2], [3, 4], [5, 6] ]; <-- this will have to be of type L.LatLngTuple[] as the border coordinates are

    // we can loop over the array and add each beacon to the map:
    for (var i = 0; i < beaconCoordsArray.length; i++) {
      L.marker(beaconCoords[i]).addTo(map);
    } */

    this.beacons.forEach(beacon => {
      console.log(beacon);
      const beaconIconURL = `assets/marker-${beacon.beaconColor}.png`;
      var beaconIcon = L.icon({
        iconUrl: beaconIconURL, // icon asset
        iconSize: [64, 64], // size of the icon
        iconAnchor: [32, 64], // point of the icon corresp. to marker's location
        popupAnchor: [0, -64] // point from which the popup should open relative to the iconAnchor
      });
      try {
        // Directly access the properties using dot notation
        var latitude = beacon.geoCoordinates._lat;
        var longitude = beacon.geoCoordinates._long;
        var beaconCoords: L.LatLngTuple = [latitude, longitude];
        var marker = new CustomMarker(beaconCoords, { icon: beaconIcon, beaconData: beacon as Beacon });
        marker.beaconData = beacon;
        marker.addTo(this.map);
        this.markers.push(marker);
        console.log(marker)
      }
      catch {

      }
    });

    // resize markers when zooming -> somehow functional...
    this.map.on('zoomend', () => {
      let zoomLevel = this.map.getZoom();
      let markerSize = 8 * zoomLevel / 2; // adjust this formula as needed

      // update each marker
      this.markers.forEach((marker) => {
        console.log(marker);
        console.log(marker);
        console.log((marker as CustomMarker).beaconData);

        var beaconData = (marker as CustomMarker).beaconData;
        var beaconIconURL = `assets/marker-.png`;
        if (beaconData) {
          beaconIconURL = `assets/marker-${beaconData.beaconColor}.png`;
        }

        marker.setIcon(L.icon({
          iconUrl: beaconIconURL,
          iconSize: [markerSize, markerSize],
          iconAnchor: [markerSize / 2, markerSize],
          popupAnchor: [0, -markerSize]
        }));
        console.log(marker);
      });
    });

    // click event on the marker
    this.markers.forEach(marker => {
      marker.on('click', (event) => {
        var clickedBeaconMarkerId = event.target.options.beaconData.beaconMarkerId;
        var clickedBeaconData = event.target.options.beaconData.beaconInformation;
        var beaconMarkerDocumentId = clickedBeaconData._delegate._key.path.segments[clickedBeaconData._delegate._key.path.segments.length - 1];
        var beaconMarkerObject = this.beaconMarkers.find(beaconMarker => beaconMarker.markerId === clickedBeaconMarkerId);
        if (beaconMarkerObject !== undefined) {
          this.selectedBeaconData = beaconMarkerObject;
          console.log(this.selectedBeaconData);
          this.showModal = true;
          this.currentSlideIndex = 0;
          this.images = this.selectedBeaconData.images;
          this.documentID = beaconMarkerDocumentId;
          console.log(this.documentID);
          this.firestore.collection('BusinessRating').doc(beaconMarkerDocumentId).ref.get().then(doc => {

            if (doc.exists) {
              var documentData = doc.data();
              console.log(documentData);
            } else {
              console.log("No such document!");
            }
          }).catch(error => {
            console.log("Error getting document:", error);
          });
        } else {
          console.error(`No BeaconMarker found with ID: ${beaconMarkerDocumentId}`);
        }
      });
    })



  }

  generateUUID(): void {
    //this.animalCreateForm.get('animalId')!.setValue(uuidv4());
  }

  changeSlide(direction: 'next' | 'prev') {
    if (direction === 'next') {
      this.currentSlideIndex = (this.currentSlideIndex + 1) % this.images.length;
    } else if (direction === 'prev') {
      this.currentSlideIndex = (this.currentSlideIndex - 1 + this.images.length) % this.images.length;
    }
  }

  // Method to open the form when a beacon is clicked
  openForm(): void {
    const modalToggle = document.getElementById('commentModalToggle') as HTMLInputElement;
    modalToggle.checked = true;
  }

  // Method to close the form
  closeForm(): void {
    const modalToggle = document.getElementById('commentModalToggle') as HTMLInputElement;
    modalToggle.checked = false;
    // Reset form values
    this.comment = '';
    this.rating = 1;
    this.commentForm = this.fb.group({
      comment: ['', Validators.required],
      rating: [1, Validators.required]
    });
  }

  calculateAverageRating(ratings: any[]): number {
    if (ratings.length === 0) {
      return 0;
    }
    let sum = 0;
    let counter = 0;
    for (let rating of ratings) { // Use 'ratings' parameter instead of 'this.selectedBeaconData.ratings'
      sum += Number(rating.ratingValue); // Explicitly cast to number
      counter += 1;
    }
    return sum / counter;
  }

  submitForm(): void {
    if (this.commentForm.valid) {
      const comment = this.commentForm.get('comment')?.value;
      const ratingValue = this.commentForm.get('rating')?.value;

      // Assuming you have a selected beacon data stored in this.selectedBeaconData
      if (this.selectedBeaconData) {
        const ratedBy = ''; // You need to specify the user who is rating, e.g., current user ID
        const timeSent = new Date(); // Current timestamp

        // Construct a new BusinessRating object
        const businessRating: BusinessRating = {
          ratingId: uuidv4(),
          ratedBy: ratedBy,
          ratingValue: ratingValue,
          comment: comment,
          timeSent: timeSent
        };
        // Update Firestore document with the new rating and comment
        this.mapService.addBusinessRating(this.documentID, businessRating)
          .then(() => {
            console.log('Comment and rating submitted successfully');
            // Reset the form after submission
            this.commentForm.reset();
          })
          .catch(error => {
            console.error('Error submitting comment and rating:', error);
          });
      }
    }
    this.closeForm();
  }
}

class CustomMarker extends L.Marker {
  beaconData: Beacon | undefined;

  constructor(latlng: L.LatLngExpression, options?: L.MarkerOptions & { beaconData?: Beacon }) {
    super(latlng, options);
    this.beaconData = options?.beaconData;

  }


}
