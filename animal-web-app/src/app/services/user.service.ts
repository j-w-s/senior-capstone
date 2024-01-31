import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { getAuth } from 'firebase/auth';
import { doc, DocumentData, getDoc, getFirestore, onSnapshot } from 'firebase/firestore';


@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private database: AngularFirestore) { }

  async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getUserData(): Promise<Observable<unknown>> {
    await this.sleep(1000);
    const auth = getAuth();
    const user = auth.currentUser?.uid;

    const userDocRef = doc(getFirestore(), 'User/' + user);

    return new Observable(observer => {
      const unsubscribe = onSnapshot(userDocRef, async (userDoc) => observer.next({ ...userDoc.data()}));
      return unsubscribe;
      
    });

  }

}

