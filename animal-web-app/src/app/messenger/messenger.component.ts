import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";
import { MessengerService } from "../services/messenger.service";
import Message from "../../models/message";
import User from "../../models/user";
import { ViewChild, ElementRef, Renderer2 } from "@angular/core";
import { v4 as uuidv4 } from "uuid";
import { Observable, Subject, Subscription, takeUntil, from, forkJoin, of } from "rxjs";
import { GroupsService } from "../services/groups.service";
import { LoginRegisterService } from "../services/login-register.service";
import Messages from "../../models/messages";
import { doc, getDoc } from "firebase/firestore";
import { map, switchMap, tap } from 'rxjs/operators';

@Component({
  selector: "app-messenger",
  templateUrl: "./messenger.component.html",
  styleUrls: ["./messenger.component.scss"],
})
export class MessengerComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild("chatLog") chatLog!: ElementRef;
  selectedContact: User | null = null;
  newMessage: string = "";

  private destroy$ = new Subject<void>();
  private messages: Message[] = [];
  public contacts$: Observable<any[]> = of([]); 
  public contactsList: any[] = [];
  public selectedConversation: any[] = [];

  messages$!: Observable<any>;
  messagesSubscription: Subscription | undefined;

  constructor(
    public messengerService: MessengerService,
    private renderer: Renderer2,
    private groupsService: GroupsService,
    private loginReg: LoginRegisterService,
    private cdRef: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.messages$ = this.messengerService.messages.pipe(
      switchMap((messages: any) => {
        // Convert the Promise to an Observable
        return from(this.messengerService.getMessages());
      }),
      tap((messagesData: any) => {
        if (messagesData) {
          this.messages = messagesData.messagesList;

          // Create an array of Observables to fetch user details
          const userObservables: Observable<User | null>[] = messagesData.contactsList.map((contact: any) => {
            let desiredString = contact._key.path.segments[6];
            // Return an Observable that fetches the user and sets the profile picture
            return from(this.messengerService.getUserById(desiredString));
          });

          // Combine all user detail Observables using forkJoin
          this.contacts$ = forkJoin(userObservables).pipe(
            map((users: (User | null)[]) => users.filter((user): user is User => user !== null)) // Filter out null values
          );

          // Select the first contact if there are any
          this.contacts$.pipe(takeUntil(this.destroy$)).subscribe((contacts: User[]) => {
            if (contacts.length > 0 && !this.selectedContact) {
              this.selectContact(contacts[0]);
            }
          });
        }
      })
    );

    // Subscribe to the messages$ Observable
    this.messagesSubscription = this.messages$.subscribe({
      error: (err) => {
        console.error("Error fetching messages:", err);
      }
    });
  }

  firestore(firestore: any, arg1: string, desiredString: any) {
    throw new Error("Method not implemented.");
  }

  // gets rid of the listeners when the page is destroyed (refreshed, unloaded, etc.)
  ngOnDestroy() {
  }

  async ngAfterViewInit(): Promise<void> {
  }

  // used to add a new contact to the users contact list
  addContact(user: string) {
    this.messengerService.addContact(user);
  }

  // selects the contact and gets the messages between the users
  selectContact(contact: User | null): void {
    this.selectedContact = contact;
    this.cdRef.detectChanges();
    this.filterMessagesForSelectedContact();
    this.scrollDown();
  }

  // Helper function to filter messages for the selected contact
  filterMessagesForSelectedContact(): void {
    this.selectedConversation = this.messages.filter(
      (message) =>
        message?.senderId === this.selectedContact?.userId ||
        message?.receiverId === this.selectedContact?.userId
    );
    console.log(this.selectedConversation);
  }

  // Function to scroll down to the latest message
  scrollDown(): void {
    setTimeout(() => {
      this.renderer.setProperty(
        this.chatLog.nativeElement,
        "scrollTop",
        this.chatLog.nativeElement.scrollHeight
      );
    }, 0);
  }

  // sends the new message object to be stored in the database
  sendMessage(): void {
    if (this.newMessage && this.selectedContact) {

      const newMessage: Message = {
        messageId: uuidv4(),
        senderId: this.messengerService.demoPrimaryUserId,
        receiverId: this.selectedContact.userId,
        messageContent: this.newMessage,
        timeSent: new Date(),
      };

      // store a reference to the selected contact
      const selContact = this.selectedContact;

      // send the message and update the messages array
      this.messengerService.addMessage(newMessage, this.selectedContact.userId).then(() => {
        // clear the input field
        this.newMessage = '';

        // subscribe to the updated contacts$ Observable and call selectContact
        this.contacts$.subscribe(updatedContacts => {
          // find the newly updated contact and select it
          const updatedContact = updatedContacts.find(contact => contact.userId === selContact.userId);
          if (updatedContact) {
            this.selectContact(updatedContact);
          }
        });
      });
    }
  }


  trackByFn(index: number, contact: User): string {
    return contact.userId; // unique identifier for the contact
  }
}
