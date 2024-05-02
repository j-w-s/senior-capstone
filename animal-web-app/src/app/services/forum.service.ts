import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from, of, forkJoin } from 'rxjs';
import Forum from '../../models/forum';
import Thread from '../../models/thread';
import User from '../../models/user';
import Comment from '../../models/comment';
import UserPreferences from '../../models/user-preferences';
import { AngularFirestore, DocumentReference, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { LoginRegisterService } from './login-register.service';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, addDoc, onSnapshot, doc, arrayUnion } from 'firebase/firestore';
import { getDownloadURL, getStorage, ref } from 'firebase/storage';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ForumService {
  private forumSource = new BehaviorSubject<Forum>({ threads: [] });
  private selectedThreadSource = new BehaviorSubject<Thread | null>(null);
  public PrimaryUser!: User;
  public ThreadUsers: User[] = [];
  forum$ = this.forumSource.asObservable();
  selectedThread$ = this.selectedThreadSource.asObservable();
  private commentsSubject = new BehaviorSubject<Comment[]>([]);
comments$: Observable<Comment[]> = this.commentsSubject.asObservable();

  constructor(private firestore: AngularFirestore, private loginRegService: LoginRegisterService) {
}

  async addThread(thread: Thread): Promise<void> {
    try {
      if (thread.id) {
        // If the thread has an ID, it's an update operation
        const threadRef = this.firestore.collection('Thread').doc(thread.id);
        await threadRef.update({
          title: thread.title,
          tags: thread.tags,
          threadContent: thread.threadContent,
          Edited: true,
          EditDate: new Date()
          // Include any other fields you want to update
        });
        console.log('Thread updated successfully.');
      } else {
        // If the thread does not have an ID, it's a new thread
        const docRef = await this.firestore.collection('Thread').add(thread);
        const threadId = docRef.id; // Get the Firestore-assigned document ID
        await docRef.update({ comments: [] });
        console.log('Thread added successfully with ID:', threadId);

        // Update the thread document with the Firestore-assigned ID
        await docRef.update({ id: threadId });
      }

      // Assuming you have a function to refresh the forum, call it here
      this.refreshForum();
    } catch (error) {
      console.error('Error adding/updating thread:', error);
    }
  }

  async addComment(selectedThread: Thread, comment: Comment): Promise < void> {
    try {
      const docRef = this.firestore.collection('Thread').doc(selectedThread.id);
      console.log(selectedThread, comment)
      // Subscribe to the Observable to get the DocumentSnapshot
      docRef.get().subscribe(docSnapshot => {
        if (docSnapshot.exists) {
          // Use a type assertion to tell TypeScript that the data is of type Thread
          const docData = docSnapshot.data() as Thread;

          // Now you can safely access the comments property
          if (!docData.comments) {
            // If the document does not have the 'comments' attribute,
            // initialize it with an empty array
            docRef.set({ comments: [] }, { merge: true });
          }

          // Now, add the new comment to the 'comments' array
          docRef.update({
            comments: arrayUnion(comment)
          });

          console.log('Comment added successfully.');
          this.refreshForum();
        } else {
          console.error('Document not found');
        }
      }, error => {
        console.error('Error adding comment:', error);
      });
    } catch(error) {
      console.error('Error adding comment:', error);
    }
  }

  private refreshForum(): void {
    this.getThreads().subscribe(forum => {
      this.forumSource.next(forum);
    });
  }

  updateSelectedThread(thread: Thread) {
    this.selectedThreadSource.next(thread);
  }

  getThreads(): Observable<Forum> {
    return this.firestore.collection<Thread>('Thread', ref => ref.orderBy('timeSent', 'desc')).snapshotChanges()
      .pipe(
        map(actions => {
          const threads = actions.map(action => {
            const data = action.payload.doc.data() as Thread;
            const id = action.payload.doc.id;
            return { ...data }; // Include the document ID along with the thread data
          });
          return { threads } as Forum; // Create a Forum object with the threads array
        })
      );
  }

  getThreadComments(threadId: string): Observable<Comment[]> {
    const threadDocRef = doc(getFirestore(), 'Threads', threadId);

    return new Observable(observer => {
      const unsubscribe = onSnapshot(threadDocRef, async (threadDoc) => {
        const data = { ...threadDoc.data() };
        observer.next(data['comments'] || []); // Assuming comments is an array in your Thread model
      });
      return unsubscribe;
    });
  }

  async updateComment(selectedThread: Thread, comment: Comment): Promise<void> {
    try {
      // Get the reference to the thread document
      const threadRef = this.firestore.collection('Thread').doc(selectedThread.id);

      // Fetch the current state of the thread document
      const threadDoc = await threadRef.get().toPromise();

      if (threadDoc!.exists) {
        // Retrieve the current comments array
        const currentComments = (threadDoc!.data() as Thread).comments || [];

        // Find the index of the comment to be updated
        const commentIndex = currentComments.findIndex(c => c.commentId === comment.commentId);

        if (commentIndex !== -1) {
          // Update the comment at the found index
          currentComments[commentIndex] = comment;

          // Update the thread document with the modified comments array
          await threadRef.update({ comments: currentComments });

          console.log('Comment updated successfully.');
          this.refreshForum();
        } else {
          console.error('Comment not found in the thread.');
        }
      } else {
        console.error('Thread document not found.');
      }
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  }
}
