import { AngularFirestore, DocumentReference } from '@angular/fire/compat/firestore';
import BeaconMarker from './beacon-marker';
import comment from './comment';

interface Beacon {
  beaconType: number;
  beaconColor: string;
  geoCoordinates: {_lat: number, _long: number};
  beaconInformation: any;
  beaconMarkerId: string;
  comments?: Comment[]
  beaconRatings?: string[];
}

export default Beacon;
