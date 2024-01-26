import { Component, OnInit } from '@angular/core';
import { MessengerService } from '../services/messenger.service';
import { Observable, BehaviorSubject } from 'rxjs';
import { filter, map, take, tap } from 'rxjs/operators';
import Messages from '../../models/messages';
import Message from '../../models/message';
import User from '../../models/user';
import { ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-messenger',
  templateUrl: './messenger.component.html',
  styleUrls: ['./messenger.component.scss']
})
export class MessengerComponent implements OnInit {
  @ViewChild('chatLog') chatLog!: ElementRef;
  conversations$: Observable<Message[]>;
  selectedConversation$ = new BehaviorSubject<Messages | null>(null);
  selectedContact: User | null = null;
  newMessage: string = '';

  userMessages$: Observable<Messages | null>;
  contacts: User[] = [];
  messages: Message[] = [];
  selectedConversation: Message[] = [];
  loading: boolean = true;

  constructor(public messengerService: MessengerService, private renderer: Renderer2) {
    this.conversations$ = this.messengerService.conversations;
    
    this.userMessages$ = this.messengerService.messages;
    this.userMessages$.subscribe(messages => {
      if (messages !== null) {
        console.log('FROM THIS SHITHOLE', messages);
        this.messages = messages.messagesList;
        this.contacts = messages.contactsList;
        this.loading = false;
        if (this.selectedContact) {
          this.selectContact(this.selectedContact);
        }
      }
    });
  }

  ngOnInit(): void {
    this.userMessages$ = this.messengerService.messages;
    this.userMessages$.subscribe(messages => {
      if (messages !== null) {
        console.log('FROM THIS SHITHOLE', messages);
        this.messages = messages.messagesList;
        this.contacts = messages.contactsList;
      }
    });

    this.conversations$.subscribe(conversations => {
    });
  }

  selectContact(contact: User) {
    this.selectedContact = contact;
    this.userMessages$.pipe(
      map((messages: Messages | null) => {
        if (messages !== null) {
          return messages.messagesList.filter((message: Message) =>
            message.senderId === contact.userId || message.receiverId === contact.userId
          );
        }
        return [];
      }),
      tap(messages => {
        if (messages.length === 0) {
          console.log('MESSAGES FILTERED', messages);
          console.error('No matching messages found');
          // handle the error appropriately here
        } else {
          console.log('Selected messages:', messages);
          this.selectedConversation = messages;
          // scroll down
          setTimeout(() => {
            this.renderer.setProperty(this.chatLog.nativeElement, 'scrollTop', this.chatLog.nativeElement.scrollHeight);
          }, 0);
        }
      }),
      take(1)
    ).subscribe();
  }

  sendMessage(): void {
    if (this.newMessage && this.selectedContact) {
      const newMessage: Message = {
        messageId: uuidv4(),
        senderId: this.messengerService.demoPrimaryUserId,
        receiverId: this.selectedContact.userId,
        messageContent: this.newMessage,
        timeSent: new Date(),
      };

      // push the new message to the messages array
      this.messengerService.addMessage(newMessage);

      // clear
      this.newMessage = '';

      this.selectContact(this.selectedContact);

      // scroll down
      setTimeout(() => {
        this.renderer.setProperty(this.chatLog.nativeElement, 'scrollTop', this.chatLog.nativeElement.scrollHeight);
      }, 0);
    }
  }

  filterConversations = (conversation: any) => {
    return conversation.contactsList.some((contact: any) => contact.userId === this.messengerService.currentUser.userId);
  };

}
