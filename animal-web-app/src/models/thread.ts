import User from './user';
import Comment from './comment';
import { AngularFirestoreDocument, DocumentReference } from '@angular/fire/compat/firestore';

interface Thread {
  id: string;
  publisher: string;
  users: User[];
  comments?: Comment[];
  tags: string[];
  title: string;
  threadContent: string;
  timeSent: Date;
  Edited: Boolean;
  EditDate?: Date;
}
export default Thread;
