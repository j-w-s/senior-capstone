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
import { getFirestore, collection, addDoc, onSnapshot, doc } from 'firebase/firestore';
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

  constructor(private firestore: AngularFirestore, private loginRegService: LoginRegisterService) {
}

  async addThread(thread: Thread): Promise<void> {
    try {
      // Threads collection doc ref
      const docRef = await this.firestore.collection('Thread').add(thread);
      const threadId = docRef.id; // Get the Firestore-assigned document ID
      console.log('Thread added successfully with ID:', threadId);

      // Update the thread document with the Firestore-assigned ID
      await docRef.update({ id: threadId });

      // Assuming you have a function to refresh the forum, call it here
      this.refreshForum();
    } catch (error) {
      console.error('Error adding thread:', error);
    }
  }


  async addComment(selectedThread: Thread, comment: Comment): Promise<void> {
    try {
      // Comments doc ref
      const docRef = this.firestore.collection('Thread').doc(selectedThread.id);
      const docSnapshot = await docRef.get().toPromise();
      const commentAsCommentList: Comment[] = [];
      commentAsCommentList.push(comment);
      // check if the document exists
      if (docSnapshot?.exists) {
        // if it exists, fetch the existing 'Thread' object
        const existingThread: Thread = docSnapshot.data() as Thread;

        // append the new comments to the existing 'comments' array
        if (!existingThread.comments) {
          existingThread.comments = [];
        }
        existingThread.comments = [...existingThread.comments, ...commentAsCommentList];

        // save the updated 'Thread' object back to Firestore
        await docRef.update(existingThread);

        console.log('Comment added successfully.');
        // Assuming you have a function to refresh the forum, call it here
        this.refreshForum();
      } else {
        console.error('Thread not found.');
      }
    } catch (error) {
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
}
