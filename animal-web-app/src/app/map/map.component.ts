import { Component, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
import { Observable, Subscription } from 'rxjs';
import Beacon from '../../models/beacon';
import BeaconMarker from '../../models/beacon-marker';
import { MapService } from '../services/map.service';
import * as firebase from 'firebase/app';
import 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

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
  createMapForm!: FormGroup;

  constructor(private mapService: MapService,
    private fb: FormBuilder) {


    this.createMapForm = new FormGroup({
      beaconType: new FormControl('', Validators.required),
      beaconColor: new FormControl('', Validators.required),
      geoCoordinates: new FormControl('', Validators.required),
      markerId: new FormControl('{uuidv4()}', Validators.required),
      address: new FormControl('', Validators.required),
      images: new FormControl('', Validators.required),
      contactInformation: new FormControl('', Validators.required),
      about: new FormControl('', Validators.required),
    });

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
          this.showModal = true;
        } else {
          console.error(`No BeaconMarker found with ID: ${beaconMarkerDocumentId}`);
        }
      });
    })

  }

  generateUUID(): void {
    //this.animalCreateForm.get('animalId')!.setValue(uuidv4());
  }

}


class CustomMarker extends L.Marker {
  beaconData: Beacon | undefined;

  constructor(latlng: L.LatLngExpression, options?: L.MarkerOptions & { beaconData?: Beacon }) {
    super(latlng, options);
    this.beaconData = options?.beaconData;
  }
}
