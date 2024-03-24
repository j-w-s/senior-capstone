import { Component, OnInit } from '@angular/core';
import { DocumentReference } from '@angular/fire/compat/firestore';
import { doc, getFirestore } from 'firebase/firestore';
import { getDownloadURL, getStorage, ref } from 'firebase/storage';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { GroupsService } from '../services/groups.service';
import { LoginRegisterService } from '../services/login-register.service';

// Group interface
 export interface Group {
  name: string;
  description: string;
  city: string;
  state: string;
  users: DocumentReference[];
  owner: DocumentReference | null;
 }

export interface Use {
  firstname: string;
  lastname: string;
  email: string;
  phonenumber: string;
  username: string;
  groups: DocumentReference[];
  image: string;
  perms: string[][];
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
  selectedGroup: any | null = null;
  creatingGroup = false;

  managePermissions = false;
  cachedGroup: any = null;
  // Stores the resolved usernames from the group.users DocRef array
  users: any[] = [];
  owner: any | null = null;
  currentPerms: any = [];
  img: HTMLElement | null = null;
  private destroy$ = new Subject<void>();
  private subscriptions: Array<Subscription> = [];
  currentIndex = 0; // Initialize the current index
  i!: number;
 
  constructor(private groupService: GroupsService, private loginRegService: LoginRegisterService) { }

  // Listener for document updates that the user is apart of.
  // Needs a listener to update what groups th user
  ngOnInit(): void {
    // Subscribes the listeners to get the groups from the databse
    // Returns the groups in the database whenever there is an update
    this.groupService.getGroups().then(async (observable$) => {
      await observable$.pipe(takeUntil(this.destroy$)).subscribe(async (groups: any) => {
         console.log('Received groups:');
         groups.forEach(async (group: any) => {
           console.log('Group ID:', group.useId);
          
         });
         this.groups = groups;   

         if(this.selectedGroup != null)
         {
          for(let i = 0; i < groups.length; i++)
          {
            if(groups[i].useId == this.selectedGroup.useId)
            {
              this.selectGroup(groups[i])
              console.log('Reselected Groups')
            }
          }
          
         }
      }, error => {
         console.error('Error getting groups:', error);
      });
     });
    
    // Makes sure ngDestroy is called before reloaded a page
    window.onbeforeunload = () => this.ngOnDestroy();
  }

  // Gets rid of the listeners when the page is destroyed (refreshed, unloaded, etc.)
  ngOnDestroy() {
    //this.selectedGroup = null;
    this.destroy$.next()
    this.destroy$.complete()
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
 

  // Sets the selected group from what was picked in the carousel
  // Resolves the usernames to display
  async selectGroup(group: any) {
    this.selectedGroup = group;

    await this.groupService.resolveUsernames(group.users, group).then(([one,two]) => {
      this.users = one;
      this.owner = two;
    });

    console.log('Got the users in the group: ', this.users)
    // GET THE users from the group but keep in mind the perms as well

    //console.log('Got the users in the group: ', this.users)
    // GET THE users from the group but keep in mind the perms as well


    const storage = getStorage();
    for(let i = 0; i < this.users.length; i++)
    {
      if((this.users[i].userId == this.loginRegService.currentUser) || (this.owner?.userId == this.loginRegService.currentUser))
      {
        for(let j = 0; j < group.users.length; j++)
        {
          const split = String(group.users[j].user.path).split("/")
          const split2 = String(group.owner.path).split("/")
          //console.log('THE SPLIT: ', split)
          if(split[1] == this.loginRegService.currentUser) {
            console.log('GETTING THE RIGHT PERMS')
            console.log(group.users[j])
            this.currentPerms = group.users[j]
          }
          else if(split2[1] == this.loginRegService.currentUser)
          {
            console.log('ALL PERMS')
            this.currentPerms = 'Owner';
          }
        }
        const t = group.users
        console.log('addUserPerm', )
      }

    }
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
       owner: null,
     };
 
    // Calls the service function to create the group
    // Adss the 'owner' of the group
     this.groupService.createGroup(newGroup).then((groupRef) => {
       this.addOwner(newGroup, groupRef.path)
     });
     this.creatingGroup = false;
  }

  updateGroup(group: any) {
    if(this.currentPerms == 'Owner' || this.currentPerms.editInfoPerm == true)
    {
      console.log('You have permission to change the Group Info')
      const updatedGroup: Group = {
        name: group.name,
        description: group.description,
        city: group.city,
        state: group.state,
        users: group.users,
        owner: group.owner,
      }
      const docId = group.useId;
      
      this.groupService.updateGroup(updatedGroup, docId) 
    }
    else {
      console.log('Insufficient Permissions!');
    }
    
  }

  deleteGroup(group: any, confirmation: string) {
    if(this.currentPerms == 'Owner' || this.currentPerms.deleteGroupPerm == true)
    {
      console.log('You have permission to delete the group')
      console.log(group);
      console.log("Confirmation: ", confirmation);

      if(confirmation == 'delete') {
        
        this.groupService.deleteGroup(group);
        this.groupService.removeGroupFromUsers(group);
        //this.groupService.removeGroupFromOwner(group);
        this.selectedGroup = null;
      }
    }
    else{
      console.log('Insufficient Permissions!');
    }
  }
 
  // Adds a user to the group based on their username
  addUser(group: any, username: string) {
    if(this.currentPerms == 'Owner' || this.currentPerms.addUserPerm == true)
    {
      console.log('You have permission to add users')
      this.groupService.addUserToGroup(group.useId, username);
    }
    else {
      console.log('Insufficient Permissions!');
    }
  }

  // Adds the creator to the group using their userID
  addOwner(group: Group, docRef: string) {
    this.groupService.addOwner(docRef);
  }

  removeUser(group: any, username: string) {
    if(this.currentPerms == 'Owner' || this.currentPerms.removeUserPerm == true)
    {
      console.log('You have permission to remove users')
      this.groupService.removeUser(group, username);

      console.log('Removed User')
    }
    else {
      console.log('Insufficient Permissions!');
    }
  }

  prev(index: number) {
    this.currentIndex = (index + this.groups.length - 1) % this.groups.length;
  }

  next(index: number) {
    this.currentIndex = (index + 1) % this.groups.length;
  }

  trackByGroups(index: number, group: any): string {
    return group.name;
  }

  goBack() {
    this.selectedGroup = null;
  }

  goBack2() {
    this.creatingGroup = false;
  }

  gotoCreateGroup() {
    this.creatingGroup = true;
  }

  gotoPermissions() {
    this.cachedGroup = this.selectedGroup;
    this.selectedGroup = false;
    this.managePermissions = true;
  }

  goBack3() {
    this.managePermissions = false;
    for(let i = 0; i < this.groups.length; i++)
    {
      if(this.groups[i].useId == this.cachedGroup.useId)
      {
        //this.selectedGroup = this.groups[i];
        this.selectGroup(this.groups[i])
      }
    }
    //this.selectedGroup = this.cachedGroup;
  }

  updatePerms() {
    if(this.currentPerms == 'Owner' || this.currentPerms.updatePermsPerm == true)
    {
      console.log('You have permission to update Permissions')
      const newUserArray = [];

      for(let i = 0; i < this.users.length; i++)
      {
          //console.log('LOOPING USER: ', this.users[i])
          const db = getFirestore();
          const path = doc(db, 'User/'+this.users[i].userId)
          const newMap = {
            user: path,
            addUserPerm: (document.getElementsByName(this.users[i].username + '_' + 0)[0] as HTMLInputElement).checked,
            removeUserPerm: (document.getElementsByName(this.users[i].username + '_' + 1)[0] as HTMLInputElement).checked,
            editInfoPerm: (document.getElementsByName(this.users[i].username + '_' + 2)[0] as HTMLInputElement).checked,
            deleteGroupPerm: (document.getElementsByName(this.users[i].username + '_' + 3)[0] as HTMLInputElement).checked,
            updatePermsPerm: (document.getElementsByName(this.users[i].username + '_' + 4)[0] as HTMLInputElement).checked,
        }
        newUserArray.push(newMap);
      }

      //console.log('NEW USER ARRAY: ', newUserArray);
      //this.groupService.updateGroup(newUserArray, this.selectedGroup.useId)
      //console.log('WTF GROUP: ', this.cachedGroup)
      if(this.cachedGroup != null)
      {
        this.groupService.updatePerms(newUserArray, this.cachedGroup.useId)
      }
    }
    else {
      console.log('Insufficient Permissions!');
    }
    
  }



}
