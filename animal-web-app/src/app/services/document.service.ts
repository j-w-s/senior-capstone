import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentData, DocumentReference } from '@angular/fire/compat/firestore';
import { FormGroup } from '@angular/forms';
import { getAuth } from 'firebase/auth';
import { arrayUnion, doc, getFirestore, onSnapshot } from 'firebase/firestore';
import { combineLatest, filter, Observable, of, switchMap } from 'rxjs';
import DocumentTemplate from '../../models/document-template';
import Group from '../../models/group';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {

  constructor(private db: AngularFirestore) { }

  async getGroupDocumentTemplates(groupId: string): Promise<Observable<DocumentTemplate[]>> {

    const userDocRef = this.db.firestore.collection('Groups').doc(groupId);

    // Gets an observable to update your current groups if the user is added to one
    const groupDoc$ = new Observable<DocumentData>(observer => {
      const unsubscribe = onSnapshot(userDocRef, (groupDoc) => {
        if(!groupDoc.exists()) {
          throw new Error('No such document.')
        }
        observer.next(groupDoc.data());
      });
      return unsubscribe;
    });

    // Create an observable that emits the user's groups
    const groups$ = groupDoc$.pipe(
      switchMap(groupData => {
        const groupDocRefArray = groupData['groupDocumentTemplates'];
        console.log('The Ref array: ', groupDocRefArray)
        let groupObservables;
        if(groupDocRefArray) {
          groupObservables = groupDocRefArray.map((groupRef: DocumentReference) => {
            return new Observable<DocumentTemplate>(observer => {
              const unsubscribe = onSnapshot(doc(getFirestore(), groupRef.path), (doc) => {
                observer.next(doc.data() as DocumentTemplate);
              });
              return unsubscribe;
            });
          });
        }
        return combineLatest(groupObservables) as Observable<DocumentTemplate[]>;
        
      })
    );

    return groups$
  }

  async getUserDocumentTemplates(): Promise<Observable<DocumentTemplate[]>> {
    const auth = getAuth();
    const user = auth.currentUser?.uid;

    const userDocRef = this.db.firestore.collection('User').doc(user);

    // Gets an observable to update your current groups if the user is added to one
    const userDoc$ = new Observable<DocumentData>(observer => {
      const unsubscribe = onSnapshot(userDocRef, (userDoc) => {
        if(!userDoc.exists()) {
          throw new Error('No such document.')
        }
        observer.next(userDoc.data());
      });
      return unsubscribe;
    });

    // Create an observable that emits the user's groups
    const groups$ = userDoc$.pipe(
      switchMap(userData => {
        const groupDocRefArray = userData['userDocumentTemplates'];
        let groupObservables;
        if(groupDocRefArray) {
          groupObservables = groupDocRefArray.map((userRef: DocumentReference) => {
            return new Observable<DocumentTemplate>(observer => {
              const unsubscribe = onSnapshot(doc(getFirestore(), userRef.path), (doc) => {
                observer.next(doc.data() as DocumentTemplate);
              });
              return unsubscribe;
            });
          });
        }
        return combineLatest(groupObservables) as Observable<DocumentTemplate[]>;
      })
    );

    return groups$
  }

  createNewGroupDocumentTemplate(templateData: FormGroup, groupId: string) {
    return this.db.collection('DocumentTemplates').add({
      ...templateData.value,
      type: 'group'
    }).then(docRef => {
      // Update the Groups document with the new template reference
      return this.db.collection('Groups').doc(groupId).update({
        groupDocumentTemplates: arrayUnion(docRef)
      });
    });
  }

  createNewUserDocumentTemplate(templateData: FormGroup) {
    const auth = getAuth();
    const user = auth.currentUser?.uid;
    return this.db.collection('DocumentTemplate').add({
      ...templateData.value,
      ownerId: user,
      type: 'user'
    }).then(docRef => {
      // Update the Groups document with the new template reference
      return this.db.collection('User').doc(user).update({
        userDocumentTemplates: arrayUnion(docRef)
      });
    });
  }
}
