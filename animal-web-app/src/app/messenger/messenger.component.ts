import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";
import { MessengerService } from "../services/messenger.service";
import Message from "../../models/message";
import User from "../../models/user";
import { ViewChild, ElementRef, Renderer2 } from "@angular/core";
import { v4 as uuidv4 } from "uuid";
import { Observable, Subject, Subscription, takeUntil, from, forkJoin, of, BehaviorSubject, combineLatest } from "rxjs";
import { GroupsService } from "../services/groups.service";
import { LoginRegisterService } from "../services/login-register.service";
import Messages from "../../models/messages";
import { doc, getDoc } from "firebase/firestore";
import { ActivatedRoute, Router } from '@angular/router';
import { map, switchMap, tap } from 'rxjs/operators';

@Component({
  selector: "app-messenger",
  templateUrl: "./messenger.component.html",
  styleUrls: ["./messenger.component.scss"],
})
export class MessengerComponent implements OnDestroy, OnInit {
  @ViewChild("chatLog") chatLog!: ElementRef;
  selectedContact: User | null = null;
  newMessage: string = "";

  private destroy$ = new Subject<void>();
  private messages: Message[] = [];
  public contacts$: Observable<any[]> = of([]);
  public contactsList: any[] = [];
  public selectedConversation: any[] = [];
  public notifications = new BehaviorSubject<string[]>([]);
  private searchQuery$ = new BehaviorSubject<string>('');
  initialSearchQuery: string = '';

  messages$!: Observable<any>;
  messagesSubscription: Subscription | undefined;
  filteredMessages$!: Observable<Message[]>;

  selectedConversation$: Observable<Message[]> | undefined;
  public primaryUser!: User;
  isLoading: boolean = true;

  constructor(
    public messengerService: MessengerService,
    private cdr: ChangeDetectorRef,
    private renderer: Renderer2,
    private groupsService: GroupsService,
    public loginReg: LoginRegisterService,
    private cdRef: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router: Router,
  ) { }

 ngOnDestroy(): void {
    // Complete the destroy$ Subject to trigger the completion of all subscriptions that depend on it
    this.destroy$.next();
    this.destroy$.complete();

    // Unsubscribe from the messages$ subscription if it exists
    if (this.messagesSubscription) {
      this.messagesSubscription.unsubscribe();
   }
 }

  async ngOnInit(): Promise<void> {
    const setup = await this.setUpMessenger();
  }

  async setUpMessenger(): Promise<void> {

    this.loginReg.userData$.subscribe((user: User | null): void => {
      if (user) {
        this.primaryUser = user;
      }
    });

    this.messages$ = this.messengerService.messages.pipe(
      switchMap((messages: any) => {
        return from(this.messengerService.getMessages());
      }),
      tap((messagesData: any) => {
        if (messagesData) {
          this.messages = messagesData.messagesList;
          const userObservables: Observable<User | null>[] = messagesData.contactsList.map((contact: any) => {
            let desiredString = contact._key.path.segments[6];
            return from(this.messengerService.getUserById(desiredString));
          });

          this.contacts$ = forkJoin(userObservables).pipe(
            map((users: (User | null)[]) => users.filter((user): user is User => user !== null)) // Filter out null values
          );

          this.contacts$.pipe(takeUntil(this.destroy$)).subscribe((contacts: User[]) => {
            if (contacts.length > 0 && !this.selectedContact) {
              this.selectContact(contacts[0]);
            }
          });
        }
      })
    );

    this.messagesSubscription = this.messages$.subscribe({
      error: (err) => {
        console.error("Error fetching messages:", err);
      }
    });

    const navigation = this.router.getCurrentNavigation();
    if (navigation) {
      const state = navigation.extras.state as { userId: string };
      if (state && state.userId) {
        console.log('Navigation state with userId:', state.userId);
        this.messengerService.getUserById2(state.userId).then(sender => {
          if (sender) {
            console.log('Selected contact set:', sender);
            this.selectedContact = sender;
          } else {
            console.error('No user found with the given userId:', state.userId);
          }
        }).catch(error => {
          console.error('Error fetching user:', error);
        });
      }
    }

    this.cdr.detectChanges();
    this.filterMessages(this.initialSearchQuery);
    this.isLoading = false;
  }

  // used to add a new contact to the users contact list
  addContact(user: string) {
    this.messengerService.addContact(user);
  }

  // selects the contact and gets the messages between the users
  selectContact(contact: User | null): void {
    this.selectedContact = contact;
    this.cdRef.detectChanges();
    this.selectedConversation$ = this.filterMessagesForSelectedContact();
    this.scrollDown();
  }

  filterMessages(search: string): void {
    const trimmedSearch = search.trim();
    // Filter messages based on the search query
    this.filteredMessages$ = this.messages$.pipe(
      map(messagesData => {
        if (trimmedSearch === '') {
          return messagesData.messagesList;
        } else {
          return messagesData.messagesList.filter((message: Message) =>
            message.messageContent.toLowerCase().includes(trimmedSearch.toLowerCase())
          );
        }
      })
    );
    this.updateSearchQuery(search);
  }


  // Function to update the search query
  updateSearchQuery(searchQuery: string): void {
    this.searchQuery$.next(searchQuery);
  }

  // Helper function to filter messages for the selected contact
  filterMessagesForSelectedContact(): Observable<Message[]> {
    return of(this.messages.filter(
      (message) =>
        message.senderId === this?.selectedContact?.userId ||
        message.receiverId === this?.selectedContact?.userId
    ));
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
        senderId: this.primaryUser.userId,
        receiverId: this.selectedContact.userId,
        messageContent: this.newMessage,
        timeSent: new Date(),
      };

      // store a reference to the selected contact
      const selContact = this.selectedContact;

      // send the message and update the messages array
      this.messengerService.addMessage(newMessage, this.selectedContact.userId).then(() => {
        this.selectedConversation.push(newMessage);
        this.newMessage = '';

        // subscribe to the updated contacts$ Observable and call selectContact
        this.contacts$.subscribe(updatedContacts => {
          const updatedContact = updatedContacts.find(contact => contact.userId === selContact.userId);
          if (updatedContact) {
            this.selectContact(updatedContact);
          }
        });
      });
    }
    console.log("Message Sent");
  }

  trackByFn(index: number, contact: User): string {
    return contact.userId; // unique identifier for the contact
  }
}
