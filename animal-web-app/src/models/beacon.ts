import { AngularFirestore, DocumentReference } from '@angular/fire/compat/firestore';
import BeaconMarker from './beacon-marker';

interface Beacon {
  beaconType: number;
  beaconColor: string;
  geoCoordinates: {_lat: number, _long: number};
  beaconInformation: any;
  beaconMarkerId: string;
}

export default Beacon;
