import User from './user';
import Comment from './comment';

interface Thread {
  publisher: string;
  users: User[];
  comments: Comment[];
  tags: string[];
  title: string;
  threadContent: string;
  timeSent: Date;
}
export default Thread;
