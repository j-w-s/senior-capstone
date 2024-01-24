import { Component, OnInit } from '@angular/core';
import { MessengerService } from '../services/messenger.service';
import { Observable, BehaviorSubject } from 'rxjs';
import { filter, map, take, tap } from 'rxjs/operators';
import Messages from '../../models/messages';
import Message from '../../models/message';
import User from '../../models/user';
import { ViewChild, ElementRef, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-messenger',
  templateUrl: './messenger.component.html',
  styleUrls: ['./messenger.component.scss']
})
export class MessengerComponent implements OnInit {
  @ViewChild('chatLog') chatLog!: ElementRef;
  conversations$: Observable<Messages[]>;
  selectedConversation$ = new BehaviorSubject<Messages | null>(null);
  selectedContact: User | null = null;
  messages: Message[] = [];
  newMessage: string = '';

  constructor(public messengerService: MessengerService, private renderer: Renderer2) {
    this.conversations$ = this.messengerService.conversations;
    this.selectedConversation$.subscribe(conversation => {
      if (conversation) {
        this.messages = conversation.messagesList;
      }
    });
  }

  ngOnInit(): void {
    this.conversations$.subscribe(conversations => {
    });
  }

  selectContact(contact: User) {
    this.selectedContact = contact;
    this.conversations$.pipe(
      map((conversations: Messages[]) => conversations.find((conversation: Messages) =>
        conversation.contactsList.some((contact: User) => contact.userId === this.selectedContact?.userId))
      ),
      filter(conversation => conversation !== undefined), // Exclude undefined values
      tap(conversation => {
        if (conversation === undefined) {
          console.error('No matching conversation found');
          // Handle the error appropriately here
        } else {
          console.log('Selected conversation:', conversation);
        }
      }),
      take(1)
    ).subscribe(result => {
      this.selectedConversation$.next(result || null);
    });
    setTimeout(() => {
      this.renderer.setProperty(this.chatLog.nativeElement, 'scrollTop', this.chatLog.nativeElement.scrollHeight);
    }, 0);
  }

  sendMessage(): void {
    if (this.newMessage && this.selectedContact) {

      const newMessage: Message = {
        userId: this.messengerService.dummyPrimaryUser.userId,
        messageContent: this.newMessage,
        timeSent: new Date(),
      };

      // push the new message to the messages array
      this.messages.push(newMessage);

      // clear
      this.newMessage = '';

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
