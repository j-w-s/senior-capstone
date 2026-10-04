import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { map } from 'rxjs/operators';
import { arrayUnion } from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {

  constructor(private firestore: AngularFirestore) { }

  sendUserNotification(senderId: string, receiverId: string, senderMessage: string, senderImage: any, senderName: string, notificationId: string): Promise<void> {
    const notification = {
      userId: senderId,
      userImage: senderImage,
      userName: senderName,
      notificationMessage: senderMessage,
      disabled: false,
      notificationId: notificationId,
    };
    return this.firestore.collection('User').doc(receiverId).update({
      notifications: arrayUnion(notification)
    });
  }

  getUserNotifications(userId: string): Observable<any[]> {
    return this.firestore.collection('User', ref => ref.where('userId', '==', userId))
      .snapshotChanges()
      .pipe(
        map(actions => actions.map(a => {
          const data = a.payload.doc.data() as any;
          if (!data.notifications) {
            // Initialize notifications as an empty array if it doesn't exist
            data.notifications = [{}];
            this.firestore.collection('User').doc(a.payload.doc.id).update({ notifications: data.notifications });
          }
          return data.notifications;
        }))
      );
  }

  addContact(userId: string): void {

  }
}
