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
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { getDownloadURL, getStorage, ref } from 'firebase/storage';
import { map, combineLatest, switchMap, filter, mergeMap, catchError, tap } from 'rxjs/operators';

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
      const docRef = await this.firestore.collection('Thread').add(thread);
      const threadId = docRef.id; // Get the Firestore-assigned document ID
      console.log('Thread added successfully with ID:', threadId);
      // Update the thread document with the Firestore-assigned ID
      await this.firestore.collection('Thread').doc(threadId).update({ id: threadId });
      this.refreshForum();
    } catch (error) {
      console.error('Error adding thread:', error);
    }
  }


  async addComment(selectedThread: Thread, comment: Comment): Promise<void> {
    try {
      // Add the comment to the 'Comments' collection
      const docRef = await this.firestore.collection('Comment').add(comment);
      const commentId = docRef.id;

      // Update the selected thread to include the reference to the newly added comment
      if (!selectedThread.comments) {
        selectedThread.comments = [];
      }

      // Obtain the reference to the comment document
      const commentRef = this.firestore.doc<Comment>(`Comment/${commentId}`).ref;

      // Push the comment reference to the array of comment references
      selectedThread.comments.push(commentRef);

      // Update the Firestore document representing the thread to reflect the updated comments array
      await this.firestore.collection('Thread').doc(selectedThread.id).update({
        comments: selectedThread.comments
      });

      console.log('Comment added successfully.');
      this.refreshForum();
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

  getCommentsData(commentReferences: DocumentReference<Comment>[]): Observable<Comment[]> {
    const commentObservables: Observable<Comment | undefined>[] = commentReferences.map((commentRef: DocumentReference<Comment>) => {
      const commentDoc: AngularFirestoreDocument<Comment> = this.firestore.doc<Comment>(commentRef.path);
      return commentDoc.valueChanges();
    });

    if (commentObservables.length === 0) {
      return of([]); // Return an empty observable if there are no comments
    }

    return forkJoin(commentObservables).pipe(
      tap((commentsArray: (Comment | undefined)[]) => {
        console.log('Comments array before filtering:', commentsArray);
      }),
      map(commentsArray => commentsArray.filter(comment => !!comment) as Comment[]),
      tap(filteredComments => {
        console.log('Filtered comments:', filteredComments);
      })
    );
  }
}
