import { Component, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
import { finalize, Observable, Subscription } from 'rxjs';
import Beacon from '../../models/beacon';
import BeaconMarker from '../../models/beacon-marker';
import { MapService } from '../services/map.service';
import * as firebase from 'firebase/app';
import 'firebase/firestore';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import BusinessRating from '../../models/business-ratings';
import { v4 as uuidv4 } from 'uuid';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { getStorage, deleteObject } from "firebase/storage";


@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements AfterViewInit {

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

  constructor(private mapService: MapService,
    private fb: FormBuilder,
    private firestore: AngularFirestore,
    private storage: AngularFireStorage,
  ) {

    this.createBeaconForm = new FormGroup({
      beaconType: new FormControl('', Validators.required),
      beaconColor: new FormControl('', Validators.required),
      geoCoordinates: new FormControl('', Validators.required),
      markerId: new FormControl('', Validators.required),
      address: new FormControl('', Validators.required),
      images: this.fb.array([], Validators.required), // Initialize images as a FormArray
      contactInformation: new FormControl('', Validators.required),
      about: new FormControl('', Validators.required),
    });

  }

  async resetForm(): Promise<void> {
    await this.deleteImages();
    this.images = [];
    this.createBeaconForm = new FormGroup({
      beaconType: new FormControl('', Validators.required),
      beaconColor: new FormControl('', Validators.required),
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

  addNewBeacon(): void {
    if (this.createBeaconForm.valid) {
      try {
        const beaconMarker: BeaconMarker = {
          markerId: this.createBeaconForm.get('markerId')?.value,
          address: this.createBeaconForm.get('address')?.value,
          images: this.createBeaconForm.get('images')?.value,
          contactInformation: this.createBeaconForm.get('contactInformation')?.value,
          about: this.createBeaconForm.get('about')?.value,
          listings: [], // Assuming you have a way to populate this, otherwise leave it as an empty array
          ratings: [], // Assuming you have a way to populate this, otherwise leave it as an empty array
        };
        this.mapService.addBeaconMarker(beaconMarker);
      }
      catch {
        //pass
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

    // define beacon icon
    var beaconIcon = L.icon({
      iconUrl: 'assets/marker.png', // icon asset
      iconSize: [64, 64], // size of the icon
      iconAnchor: [32, 64], // point of the icon corresp. to marker's location
      popupAnchor: [0, -64] // point from which the popup should open relative to the iconAnchor
    });

    this.beacons.forEach(beacon => {
      console.log(beacon);

      // Directly access the properties using dot notation
      var latitude = beacon.geoCoordinates._lat;
      var longitude = beacon.geoCoordinates._long;
      console.log(latitude, longitude);

      var beaconCoords: L.LatLngTuple = [latitude, longitude];
      var marker = new CustomMarker(beaconCoords, { icon: beaconIcon, beaconData: beacon });
      marker.beaconData = beacon;
      marker.addTo(this.map);
      this.markers.push(marker);
    });

    // resize markers when zooming -> somehow functional...
    this.map.on('zoomend', () => {
      let zoomLevel = this.map.getZoom();
      let markerSize = 8 * zoomLevel / 2; // adjust this formula as needed

      // update each marker
      this.markers.forEach((marker) => {
        marker.setIcon(L.icon({
          iconUrl: 'assets/marker.png',
          iconSize: [markerSize, markerSize],
          iconAnchor: [markerSize / 2, markerSize],
          popupAnchor: [0, -markerSize]
        }));
      });
    });

    // click event on the marker
    this.markers.forEach(marker => {
      marker.on('click', (event) => {
        var clickedBeaconData = event.target.options.beaconData.beaconInformation;
        var beaconMarkerDocumentId = clickedBeaconData._delegate._key.path.segments[clickedBeaconData._delegate._key.path.segments.length - 1];
        var beaconMarkerObject = this.beaconMarkers.find(beaconMarker => beaconMarker.markerId === beaconMarkerDocumentId);
        if (beaconMarkerObject !== undefined) {
          this.selectedBeaconData = beaconMarkerObject;
          console.log(this.selectedBeaconData);
          this.showModal = true;
          this.currentSlideIndex = 0;
          this.images = this.selectedBeaconData.images;
          this.updateStars();
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

  async calculateAverageRating() {

  }

  updateStars() {
    this.calculateAverageRating().then(averageRating => {
      this.averageRating = 4;
      this.averageRatingStars = Array(Math.round(this.averageRating)).fill("★");
    });
  }

}

class CustomMarker extends L.Marker {
  beaconData: Beacon | undefined;

  constructor(latlng: L.LatLngExpression, options?: L.MarkerOptions & { beaconData?: Beacon }) {
    super(latlng, options);
    this.beaconData = options?.beaconData;
  }
}
