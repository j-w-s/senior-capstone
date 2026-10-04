import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, arrayUnion, doc, getDocs, collection, where, query, setDoc } from 'firebase/firestore';
import User from '../../models/user';
import Appointment from '../../models/appointment';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Injectable({
  providedIn: 'root'
})
export class SchedulerService {
  constructor(private firestore: AngularFirestore) { }

  async createAppointment(appointment: Appointment): Promise<any> {
    try {
      const userQuery = this.firestore.collection('User', ref => ref.where('userDisplayName', '==', appointment.userDisplayName));

      let userDocRef = null;

      await userQuery.get().toPromise().then((querySnapshot: any) => {
        if (!querySnapshot.empty) {
          let docData = querySnapshot.docs[0];
          userDocRef = docData.ref;
          console.log('User found: ', docData.data());
        } else {
          console.log('No user found with the given display name!');
        }
      }).catch((error) => {
        console.error('Error querying user: ', error);
      });

      if (userDocRef) {
        setDoc(userDocRef, {
          appointments: arrayUnion(appointment)
        }, { merge: true })
          .then(() => {
            console.log('Document successfully updated or created for the user!');
          })
          .catch((error) => {
            console.error('Error updating or creating document: ', error);
          });
      }

      const creatorQuery = this.firestore.doc('User/' + appointment.appointmentCreator);
      let creatorDocRef: any = null;

      await creatorQuery.get().toPromise().then((docSnapshot: any) => {
        if (docSnapshot.exists) {
          console.log('Creator found: ', docSnapshot.data());
          creatorDocRef = docSnapshot.ref;
        } else {
          console.log('No creator found with the given userId!');
        }
      }).catch((error) => {
        console.error('Error querying creator: ', error);
      });

      if (creatorDocRef) {
        creatorDocRef.set({
          appointments: arrayUnion(appointment)
        }, { merge: true }).then(() => {
          console.log('Document successfully updated or created for the creator!');
        }).catch((error: any) => {
          console.error('Error updating or creating document: ', error);
        });
      }

      return { success: true, message: 'Appointment added successfully.' };
    } catch (error) {
      console.error('Error creating appointment: ', error);
      return { success: false, message: 'Failed to create appointment.', error };
    }
  }

}
