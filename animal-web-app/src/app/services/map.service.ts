import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { AngularFirestore, DocumentReference, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import BeaconMarker from '../../models/beacon-marker';
import Beacon from '../../models/beacon';
import { getFirestore, collection, addDoc, onSnapshot, doc, arrayUnion } from 'firebase/firestore';
import BusinessRating from '../../models/business-ratings';

@Injectable({
  providedIn: 'root'
})
export class MapService {
  private beaconsSubject = new BehaviorSubject<Beacon[]>([]);
  public beacons$ = this.beaconsSubject.asObservable();

  private beaconMarkersSubject = new BehaviorSubject<BeaconMarker[] | null>(null);
  public beaconMarkers$ = this.beaconMarkersSubject.asObservable();

  constructor(private firestore: AngularFirestore) {
    this.getBeacons();
  }

  getBeacons(): Observable<Beacon[]> {
    return this.firestore.collection<Beacon>('Beacon').valueChanges().pipe(
      tap((beacons: Beacon[]) => {
        this.beaconsSubject.next(beacons);
      })
    );
  }

  getBeaconMarkers(): Observable<BeaconMarker[]> {
    return this.firestore.collection<BeaconMarker>('Beacon-Marker').valueChanges().pipe(
      tap((beaconMarkers: BeaconMarker[]) => {
        this.beaconMarkersSubject.next(beaconMarkers);
      })
    );
  }

  async addBeaconMarker(beaconMarker: BeaconMarker): Promise<any> {
    console.log(beaconMarker);
    const beaconMarkerRef = await this.firestore.collection('Beacon-Marker').add(beaconMarker);
    return beaconMarkerRef;
  }

  async addBeacon(beacon: Beacon): Promise<void> {
    console.log(beacon);
    await this.firestore.collection('Beacon').add(beacon);
  }

  async addBusinessRating(beaconMarkerId: string, rating: BusinessRating): Promise<void> {
    try {
      const docRef = this.firestore.collection('Beacon-Marker').doc(beaconMarkerId);

      // Subscribe to the Observable to get the DocumentSnapshot
      docRef.get().subscribe(docSnapshot => {
        if (docSnapshot.exists) {
          // Use a type assertion to tell TypeScript that the data is of type BeaconMarker
          const docData = docSnapshot.data() as BeaconMarker;

          // Now you can safely access the ratings property
          if (!docData.ratings) {
            // If the document does not have the 'ratings' attribute,
            // initialize it with an empty array
            docRef.set({ ratings: [] }, { merge: true });
          }

          // Now, add the new rating to the 'ratings' array
          docRef.update({
            ratings: arrayUnion(rating)
          });

          console.log('Rating added successfully.');
        } else {
          console.error('Document not found');
        }
      }, error => {
        console.error('Error adding rating:', error);
      });
    } catch (error) {
      console.error('Error adding rating:', error);
      throw error; // Rethrow the error to handle it in the component
    }
  }
}

