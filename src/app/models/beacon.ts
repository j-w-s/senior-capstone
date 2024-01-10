import BeaconMarker from './beacon-marker';

interface Beacon {
  beaconType: number;
  beaconColor: string;
  geoCoordinates: [latitude: number, longitude: number];
  beaconInformation: BeaconMarker;
}
export default Beacon;
