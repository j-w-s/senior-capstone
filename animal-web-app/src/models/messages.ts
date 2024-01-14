import User from './user';
import Message from './message';

interface Messages {
  userId: string;
  messagesList: Message[];
  contactsList: User[];
}
export default Messages;
