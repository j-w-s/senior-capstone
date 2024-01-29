interface Message {
  messageId: string;
  senderId: string;
  receiverId: string;
  messageContent: string;
  timeSent: Date;
}
export default Message;
