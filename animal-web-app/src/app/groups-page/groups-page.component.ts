import { Component, OnInit } from '@angular/core';
import { DocumentReference } from '@angular/fire/compat/firestore';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { GroupsService } from '../services/groups.service';

// Group interface
 export interface Group {
  name: string;
  description: string;
  city: string;
  state: string;
  users: DocumentReference[];
 }

@Component({
  selector: 'app-groups-page',
  templateUrl: './groups-page.component.html',
  styleUrl: './groups-page.component.scss'
})
export class GroupsPageComponent implements OnInit {
  // Stores all the groups retrieved from the database
  groups: any[] = [];
  // Stores the currently selected group from the carousel;
  // used to display the group info at the bottom
  selectedGroup: Group | null = null;
  // Stores the resolved usernames from the group.users DocRef array
  usernames: string[] | null = null;
  private destroy$ = new Subject<void>();
  private subscriptions: Array<Subscription> = [];
 
  constructor(private groupService: GroupsService) { }

  // Listener for document updates that the user is apart of.
  // Needs a listener to update what groups th user
  ngOnInit(): void {
    // Subscribes the listeners to get the groups from the databse
    // Returns the groups in the database whenever there is an update
    this.groupService.getGroups().then((observable$) => {
      observable$.pipe(takeUntil(this.destroy$)).subscribe(async (groups: any) => {
         console.log('Received groups:');
         groups.forEach(async (group: any) => {
           console.log('Group ID:', group.useId);
           //this.usernames = await this.groupService.resolveUsernames(group.users);
         });
         this.groups = groups;
      }, error => {
         console.error('Error getting groups:', error);
      });
     });
    
    // Makes sure ngDestroy is called before reloaded a page
    window.onbeforeunload = () => this.ngOnDestroy();
  }

  // Gets rid of the listeners when the page is destroyed (refreshed, unloaded, etc.)
  ngOnDestroy() {
    this.destroy$.next()
    this.destroy$.complete()
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
 

  // Sets the selected group from what was picked in the carousel
  // Resolves the usernames to display
  async selectGroup(group: Group) {
    this.selectedGroup = group;
    this.usernames = await this.groupService.resolveUsernames(group.users);
}
 
  // Creates a group using the input fields on the page
  createGroup(name: string, description: string, city: string, state: string) {
    // Creates a group to send and store in the database
     const newGroup: Group = {
       name: name,
       description: description,
       city: city,
       state: state,
       users: [],
     };
 
    // Calls the service function to create the group
    // Adss the 'owner' of the group
     this.groupService.createGroup(newGroup).then((groupRef) => {
       this.addOwner(newGroup, groupRef.path)
     });
  }
 
  // Adds a user to the group based on their username
  addUser(group: any, username: string) {
     this.groupService.addUserToGroup(group.useId, username);
  }

  // Adds the creator to the group using their userID
  addOwner(group: Group, docRef: string) {
    this.groupService.addOwner(docRef);
  }
 }
