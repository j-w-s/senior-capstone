interface Comment {
  userId: string;
  commentId: string;
  messageContent: string;
  timeSent: Date;
  isReply: boolean;
  replyTo?: string;
  commenter: string;
}
export default Comment;
