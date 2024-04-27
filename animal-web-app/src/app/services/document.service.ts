import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentData, DocumentReference } from '@angular/fire/compat/firestore';
import { FormGroup } from '@angular/forms';
import { getAuth } from 'firebase/auth';
import { arrayRemove, arrayUnion, doc, getDoc, getFirestore, onSnapshot } from 'firebase/firestore';
import { combineLatest, filter, Observable, of, switchMap } from 'rxjs';
import DocumentStructure from '../../models/document-structure';
import DocumentStructureFields from '../../models/document-structure-fields';
import DocumentTemplate from '../../models/document-template';
import Group from '../../models/group';
import User from '../../models/user';

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
        //console.log('The Ref array: ', groupDocRefArray)
        let groupObservables;
        if(groupDocRefArray) {
          groupObservables = groupDocRefArray.map((groupRef: DocumentReference) => {
            return new Observable<DocumentTemplate>(observer => {
              const unsubscribe = onSnapshot(doc(getFirestore(), groupRef.path), (doc) => {
                //console.log('Got new doc template: ', doc.data())
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

  async createNewGroupDocumentTemplate(templateData: FormGroup, groupId: string) {
    const newDocumentRef = this.db.collection('DocumentTemplates').doc();
    await newDocumentRef.set({
      ...templateData.value,
      type: 'group'
    });

    await newDocumentRef.update({
      templateId: newDocumentRef.ref.id
    });

    await this.db.collection('Groups').doc(groupId).update({
      groupDocumentTemplates: arrayUnion(newDocumentRef.ref)
    });
  }

  createNewUserDocumentTemplate(templateData: FormGroup) {
    const auth = getAuth();
    const user = auth.currentUser?.uid;
    const newDocumentRef = this.db.collection('DocumentTemplates').doc();
    newDocumentRef.set({
      ...templateData.value,
      ownerId: user,
      type: 'user'
    });

    this.db.collection('User').doc(user).update({
      userDocumentTemplates: arrayUnion(newDocumentRef.ref)
    });

    return newDocumentRef.update({
      templateId: newDocumentRef.ref.id
    });
  }

  async sendDocumentTemplateToUser(username: string, form: DocumentTemplate) {
    let userDocRef: DocumentReference | any = null;
    // Gets User DocumentReference based on their username
    await this.db.collection('User').ref.where('userDisplayName', '==', username).get().then(querySnapshot => {
      let docData = querySnapshot.docs[0];
      userDocRef = docData.ref;
    });

    this.db.doc(userDocRef).update({
      receivedDocumentTemplates: arrayUnion(form.templateId) 
    });

    this.db.collection('DocumentTemplates').doc(form.templateId).update({
      sentTemplateToUser: arrayUnion(userDocRef)
    });
  }

  async getUserWhoReceivedTemplate(docRef: DocumentReference): Promise<User> {
    const docSnap = await getDoc(docRef);
    return docSnap.data() as User;
  }

  async fetchUserTemplatesAndDocs(docIds: string[], type: string): Promise<DocumentTemplate[]> {
    let templates: any[] = []
    if(docIds != null)
    for(let i = 0; i < docIds.length; i++) {
      if(type == "templates") {
        const docRefs = doc(this.db.firestore, "DocumentTemplates", docIds[i]);
        const docs = await getDoc(docRefs);

        templates.push(docs.data() as DocumentTemplate);
      }
      else if(type == "working") {
        const docRefs = doc(this.db.firestore, "Documents", docIds[i]);
        const docs = await getDoc(docRefs);

        templates.push(docs.data() as DocumentStructure);
      }
      else if(type == "submitted") {
        const docRefs = doc(this.db.firestore, "Documents", docIds[i]);
        const docs = await getDoc(docRefs);

        templates.push(docs.data() as any);
      }
    }
    return templates
  }

  async generateDocumentFromTemplate(template: DocumentTemplate) {
    const auth = getAuth();
    const user = auth.currentUser?.uid;

    // Step 1: Extract Fields from the Template
    const fields = template.fields; // This is an array of field objects

    // Step 2: Create a Document Structure
    let documentStructureFields: DocumentStructureFields[] = [];
    fields.forEach(field => {
    switch (field.type) {
        case 'Text':
          documentStructureFields.push({ name: field.name, type: 'text', value: '' }); // Empty string for text fields
          break;
        case 'Number':
          documentStructureFields.push({ name: field.name, type: 'number', value: null }); // Null for number fields, indicating no value yet
          break;
        case 'Checkbox':
          documentStructureFields.push({ name: field.name, type: 'checkbox', value: [] }); // Empty array for checkbox fields
          break;
        // Add more cases as needed for other field types
        default:
          documentStructureFields.push({ name: field.name, type: 'text', value: '' }); // Default to empty string for unrecognized types
    }
    });

    const newDocumentRef = this.db.collection('Documents').doc();

    console.log('Gened fields: ', documentStructureFields)

    const documentStructure: DocumentStructure = {
      generatedFromTemplate: template.templateId,
      documentId: newDocumentRef.ref.path.split("/")[1],
      documentName: template.templateName,
      documentDescription: template.templateDescription,
      documentSentBy: template.ownerId,
      type: template.type,
      documentEditor: user as string,
      documentSubmitted: false,
      fields: documentStructureFields
    }
    console.log('Final Document: ', documentStructure)

    // Step 3: Store the Document
    await newDocumentRef.set({
      ...documentStructure, // Include the document structure
    });

    // Step 4: Update the User's Document Reference
    if (user) {
      await this.db.collection('User').doc(user).update({
        workingOnDocuments: arrayUnion(newDocumentRef.ref.path.split("/")[1]),
        receivedDocumentTemplates: arrayRemove(template.templateId)
      });
    }
 }

 updateDocument(document: DocumentStructure) {
  this.db.collection('Documents').doc(document.documentId).update(document);
 }

 async submitDocumentToSender(document: DocumentStructure) {
  const auth = getAuth();
  const user = auth.currentUser?.uid;
  const userRef = this.db.collection('User').doc(user);

  if (user) {
    await userRef.update({
      workingOnDocuments: arrayRemove(document.documentId),
      submittedDocuments: arrayUnion(document.documentId)
    });
  }

  this.db.collection('DocumentTemplates').doc(document.generatedFromTemplate).update({
    receivedDocumentFromUser: arrayUnion(userRef.ref)
  })
 }
}
