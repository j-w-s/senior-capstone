interface Comment {
  userId: string;
  commentId: string;
  messageContent: string;
  timeSent: Date;
  isReply: boolean;
  replyTo?: string;
}
export default Comment;
