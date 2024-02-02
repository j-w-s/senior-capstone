import { Component, OnInit } from '@angular/core';
import { MessengerService } from '../services/messenger.service';
import Message from '../../models/message';
import User from '../../models/user';
import { ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import { Subject, takeUntil } from 'rxjs';
import { GroupsService } from '../services/groups.service';

@Component({
  selector: 'app-messenger',
  templateUrl: './messenger.component.html',
  styleUrls: ['./messenger.component.scss']
})
export class MessengerComponent implements OnInit {
  @ViewChild('chatLog') chatLog!: ElementRef;
  selectedContact: User | null = null;
  newMessage: string = '';

  private destroy$ = new Subject<void>();
  private messages: Message[] = [];
  public contacts: any[] = [];
  public selectedConversation: any[] = [];
  

  constructor(public messengerService: MessengerService, private renderer: Renderer2, private groupsService: GroupsService ) { }

  async ngOnInit(): Promise<void> {

    await this.groupsService.sleep(1000)

    // Updates our data any time there is a change in the document for the current users Messages
    this.messengerService.getMessages().then((observable$) => {
      observable$.pipe(takeUntil(this.destroy$)).subscribe(async (messages: any) => {
        console.log('Gotten mess: ', messages)
        this.contacts = []
        this.messages = messages.messagesList

        for(let i = 0; i < messages.contactsList.length; i++)
        {
          this.messengerService.getUserById(messages.contactsList[i].path.split('/')[1]).then(async (user) => {
            if (user && user.userImage) {
              user.userImage = await this.messengerService.resolveProfilePicture(user)
             }
            
            this.contacts.push(user);
          });
        }

        if(this.selectedContact)
        {
          for(let i = 0; i < messages.contactsList.length; i++)
          {
            if(messages.contactsList[i].path.split('/')[1] == this.messengerService.prevContact)
            {
              
              this.messengerService.getUserById(messages.contactsList[i].path.split('/')[1]).then(user => {
                this.selectContact(user);
              })
              
              break;
            }
          }
        }
        
        
      }, error => {
         console.error('Error getting groups:', error);
      });
    });

    //this.messengerService.t();

    // Makes sure ngDestroy is called before reloaded a page
    window.onbeforeunload = () => this.ngOnDestroy();
  }

  // Gets rid of the listeners when the page is destroyed (refreshed, unloaded, etc.)
  ngOnDestroy() {
    this.destroy$.next()
    this.destroy$.complete()
  }

  // Used to add a new contact to the users contact list
  addContact(user: string) {
    this.messengerService.addContact(user)
  }

  // Selects the contact and gets the messages between the users
  selectContact(contact: User | null) {
    //this.selectedConversation = [];
    if(contact != undefined)
    {
      this.messengerService.getUserById(contact?.userId).then(async (user) => {
        if (user && user.userImage) {
          user.userImage = await this.messengerService.resolveProfilePicture(user)
         }
        
         this.selectedContact = user;
       
      });
    }
  
    if(contact == null)
    {
      throw 'contact is null'
    }
    this.messengerService.setContact(contact.userId)

    let selConv2 = []

    for(let i = 0; i < this.messages.length; i++)
    {
      
      if(this.messages[i] != null && 
        ((this.messages[i].receiverId == this.messengerService.demoPrimaryUserId && this.messages[i].senderId == contact.userId)
        || (this.messages[i].senderId == this.messengerService.demoPrimaryUserId && this.messages[i].receiverId == contact.userId))) {

          
          selConv2.push(this.messages[i]);
         
      }
    }

    this.selectedConversation = [...selConv2]

    // scroll down
    setTimeout(() => {
      this.renderer.setProperty(this.chatLog.nativeElement, 'scrollTop', this.chatLog.nativeElement.scrollHeight);
    }, 0);
    
 
  }

  // Sends the new message object to be stored in the database
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
      this.messengerService.addMessage(newMessage, this.selectedContact.userId);

      // clear
      this.newMessage = '';

      this.selectContact(this.selectedContact);

      // scroll down
      setTimeout(() => {
        this.renderer.setProperty(this.chatLog.nativeElement, 'scrollTop', this.chatLog.nativeElement.scrollHeight);
      }, 0);
    }
  }

}
