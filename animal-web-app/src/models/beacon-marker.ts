import Animal from './animal';
import BusinessRating from './business-ratings';

interface BeaconMarker {
	markerId: string;
	address: string;
	images: string[];
	contactInformation: string[];
	about: string;
	listings: Animal[];
	ratings: BusinessRating[];
}
export default BeaconMarker;
