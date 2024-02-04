import { Component, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
import Beacon from '../../models/beacon';
import BeaconMarker from '../../models/beacon-marker';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements AfterViewInit {

  private map!: L.Map;
  private markers: L.Marker[] = [];

  constructor() { }

  ngAfterViewInit(): void {
    this.initMap();
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

    // one beacon for demoing
    var beaconCoords: L.LatLngTuple = [32.529674, -92.640466];

    // beacon data (EXAMPLE -- WE WOULD BE CREATING
    // BEACON COORDS FROM ACTUAL BEACON DATA, SO THIS WOULD NEED TO BE
    // FETCHED PRIOR TO THE PREVIOUS STEP, THE COORDINATES CONVERTED
    var beaconData: Beacon = {
      beaconType: 1,
      beaconColor: 'red',
      geoCoordinates: [32.529674, -92.640466],
      beaconInformation: {
        markerId: '1',
        address: '123 Main St',
        images: ['https://www.usnews.com/dims4/USNEWS/38840fc/17177859217/resize/800x540%3E/quality/85/?url=https%3A%2F%2Fwww.usnews.com%2Fcmsmedia%2Fc4%2Fae%2F16a52c474a07a1ce45fd3a71b1dc%2Fdji-0109.jpg'],
        contactInformation: ['email@example.com'],
        about: 'This is a beacon',
        listings: [],
        ratings: []
      }
    };

    // create a marker for it and add it to the map
    var marker = new CustomMarker(beaconCoords, { icon: beaconIcon, beaconData: beaconData });
    marker.beaconData = beaconData;
    marker.addTo(this.map);
    this.markers.push(marker);

    // resize markers when zooming -> somehow functional...
    this.map.on('zoomend', () => {
      let zoomLevel = this.map.getZoom();
      let markerSize =  8 * zoomLevel / 2; // adjust this formula as needed

      // update each marker
      this.markers.forEach((marker) => {
        marker.setIcon(L.icon({
          iconUrl: 'assets/marker.png',
          iconSize: [markerSize, markerSize],
          iconAnchor: [markerSize/2, markerSize],
          popupAnchor: [0, -markerSize]
        }));
      });
    });

    // click event on the marker
    marker.on('click', function (event) {
      var clickedBeaconData = event.target.options.beaconData;
      console.log(clickedBeaconData);
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
