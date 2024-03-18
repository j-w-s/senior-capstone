import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { AngularFirestore, DocumentReference } from '@angular/fire/compat/firestore';
import BeaconMarker from '../../models/beacon-marker';
import Beacon from '../../models/beacon';
import { doc } from 'firebase/firestore';

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

  async addBeaconMarker(beaconMarker: BeaconMarker): Promise<void> {
    console.log(beaconMarker);

    const beaconMarkerRef = await this.firestore.collection('Beacon-Marker').add(beaconMarker);
    await this.firestore.collection('Beacon').add(beaconMarkerRef);
  }


}
