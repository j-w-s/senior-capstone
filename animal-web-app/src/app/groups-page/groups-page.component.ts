import { Component, OnInit } from '@angular/core';
import { DocumentReference } from '@angular/fire/compat/firestore';
import { doc, getFirestore } from 'firebase/firestore';
import { getDownloadURL, getStorage, ref } from 'firebase/storage';
import { Observable, Subject, Subscription, takeUntil } from 'rxjs';
import Animal from '../../models/animal';
import UserPreferences from '../../models/user-preferences';
import UserRating from '../../models/user-ratings';
import { GroupsService } from '../services/groups.service';
import { LoginRegisterService } from '../services/login-register.service';

export interface User {
  userId: string;
  userFirstName: string;
  userLastName: string;
  userPhoneNumber: string;
  userEmail: string;
  userDisplayName: string;
  userBiography: string;
  userImage: string;
  userAccountType?: number;
  userPreferences: UserPreferences;
  userRatings: UserRating[];
  petsOwned: Animal[];
  petsLost: Animal[];
  userGroups: DocumentReference[],
}

export interface GroupUser {
  userDocRef: DocumentReference,
  addUserPerm: boolean,
  removeUserPerm: boolean,
  updateGroupPerm: boolean,
  deleteGroupPerm: boolean,
  updatePermissionsPerm: boolean,
}

export interface Group {
  groupId: string,
  groupImage: string,
  groupName: string,
  groupDescription: string,
  groupCity: string,
  groupState: string,
  groupOwner: DocumentReference,
  groupUsers: GroupUser[],
}

@Component({
  selector: 'app-groups-page',
  templateUrl: './groups-page.component.html',
  styleUrl: './groups-page.component.scss'
})
export class GroupsPageComponent implements OnInit {
  // Stores all the groups retrieved from the database
  groups: Group[] = [];
  users: User[] = [];
  owner: User | null = null;
  selectedGroup: Group | null = null;
  userPerms!: GroupUser;
  creatingGroup = false;
  managePermissions = false;
  cachedGroup: Group | null = null;

  private destroy$ = new Subject<void>();

  
  constructor(private groupService: GroupsService, private loginRegService: LoginRegisterService) { }

  ngOnInit(): void {
    // Subscribes the listeners to get the groups from the databse
    // Returns the groups in the database whenever there is an update
    this.groupService.getGroups().then(async (observable$: Observable<Group[]>) => {
      
      await observable$.pipe(takeUntil(this.destroy$)).subscribe(async (groups: Group[]) => {
        // Returns all of the users groups
        console.log('Returned groups: ', groups)
        this.groups = groups

        // Reselects the group you were on if new group data is updated
        if(this.selectedGroup != null) {
          for(let i = 0; i < this.groups.length; i++) {
            if(this.groups[i].groupId == this.selectedGroup.groupId) {
              this.selectGroup(this.groups[i])
              console.log('Reselected Group')
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
    this.destroy$.next()
    this.destroy$.complete()
  }

  // Function to select a group and get its users
  async selectGroup(group: Group) {
    // Saves the selected group
    this.selectedGroup = group;

    // Gets and returns the users and owner of the group
    await this.groupService.getUserData(group).then(([users, owner]) => {
      this.users = users;
      this.owner = owner;
    });

    // Gets the group permissions of the user currently logged in
    let earlyExit = false;
    for(let i = 0; i < this.groups.length; i++) {
      if(this.groups[i].groupId == group.groupId) {
        for(let j = 0; j < this.groups[i].groupUsers.length; j++) {
          if(this.groups[i].groupUsers[j].userDocRef.path.split("/")[1] == this.loginRegService.currentUser) {
            this.userPerms = this.groups[i].groupUsers[j];
            earlyExit = true;
            break;
          }
        }
        if(earlyExit) {
          break;
        }
      }
    }
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
    this.selectedGroup = null;
    this.managePermissions = true;
    this.creatingGroup = false;
  }

  goBack3() {
    this.managePermissions = false;
    for(let i = 0; i < this.groups.length; i++)
    {
      if(this.groups[i].groupId == this.cachedGroup?.groupId)
      {
        // Reselects the selected group when using back button on permissons page
        this.selectGroup(this.groups[i])
      }
    }
  }

  // Function to create a group from the input fields in the Group Creation Section
  createGroup(name: string, description: string, city: string, state: string) {
    // Gets the document reference to the current signed in user to be the owner in the group
    const ownerDocRef = this.groupService.getOwnerDocRef()

    // Create a new Group to send and store in the database
    const newGroup: Group = {
      groupId: "",
      groupName: name,
      groupDescription: description,
      groupImage: "https://t4.ftcdn.net/jpg/03/03/72/11/360_F_303721150_Uo6hxtfQVe7B9uxjwPLbgJ0eStClh0r2.jpg",
      groupCity: city,
      groupState: state,
      groupOwner: ownerDocRef,
      groupUsers: [],
    }

    // Calls service function to create the group
    // Sets the groupId fieldto the new group doc, and adds group doc ref to users userGroups field
    // Switches the user to the group page after creation
    this.groupService.createGroup(newGroup).then(newGroupDocRef => {
      this.groupService.setCreatedGroupId(newGroupDocRef);
      this.groupService.addOwner(ownerDocRef, newGroupDocRef);
    });
    this.creatingGroup = false;

  }

  updateGroup(groupData: Group) {
    // Checks the permission of the user or if they are the owner
    if(this.owner?.userId == this.loginRegService.currentUser || this.userPerms.updateGroupPerm == true) {
        console.log('You have permission to update group information!')

        // Calls service function to update group data
        this.groupService.updateGroup(groupData, groupData.groupId);
    }
    else {
      console.log('Insufficient permissions!');
    }

  }

  deleteGroup(group: Group, confirmation: string) {
    // Checks the permission of the user or if they are the owner
    if(this.owner?.userId == this.loginRegService.currentUser || this.userPerms.deleteGroupPerm == true) {

      console.log("Confirmation: ", confirmation);

      // Checks if you typed in 'delete' to delete a group
      if(confirmation == 'delete') {

        // Calls the service function to delete the group
        this.groupService.deleteGroup(group);
        // Calls service function to remove the group from all user documents
        this.groupService.removeGroupFromUsers(group);

        // Sets the selected group to null to go back to groups selection page
        this.selectedGroup = null;
      }

    }
    else {
      console.log('Insufficient permissions!');
    }
  }

  addUser(group: Group, username: string) {
    // Checks the permission of the user or if they are the owner
    if(this.owner?.userId == this.loginRegService.currentUser || this.userPerms.addUserPerm == true) {
      console.log('You have permission to add users to the group!')

      // Calls the service function to add user to the group
      this.groupService.addUserToGroup(group.groupId, username);
    }
    else {
      console.log('Insufficient permissions!');
    }
  }

  removeUser(group: Group, username: string) {
    // Checks the permission of the user or if they are the owner
    if(this.owner?.userId == this.loginRegService.currentUser || this.userPerms.removeUserPerm == true) {
      console.log('You have permission to remove users')

      //Calls the service function to remove user from the group
      this.groupService.removeUser(group, username)
    }
    else {
      console.log('Insufficient permissions!');
    }
  }

  updateUserPermissions() {
    // Checks the permission of the user or if they are the owner
    if(this.owner?.userId == this.loginRegService.currentUser || this.userPerms.updatePermissionsPerm == true) {
      console.log('You have permission to update Permissions');

      // Store the updated group users
      const newGroupUsers: GroupUser[] = [];

      // Checks if cachedGroup is null
      if(this.cachedGroup) {
        // Loops through the users in the group that was selected
        for(let i = 0; i < this.cachedGroup?.groupUsers.length; i++) {

          // Creates a new user map with the updated permissions from the permissions page
          const newUserMap: GroupUser = {
            userDocRef: this.cachedGroup.groupUsers[i].userDocRef,
            addUserPerm: (document.getElementsByName(this.cachedGroup.groupUsers[i].userDocRef.path + '_addUserPerm')[0] as HTMLInputElement).checked,
            removeUserPerm: (document.getElementsByName(this.cachedGroup.groupUsers[i].userDocRef.path + '_removeUserPerm')[0] as HTMLInputElement).checked,
            updateGroupPerm: (document.getElementsByName(this.cachedGroup.groupUsers[i].userDocRef.path + '_updateGroupPerm')[0] as HTMLInputElement).checked,
            deleteGroupPerm: (document.getElementsByName(this.cachedGroup.groupUsers[i].userDocRef.path + '_deleteGroupPerm')[0] as HTMLInputElement).checked,
            updatePermissionsPerm: (document.getElementsByName(this.cachedGroup.groupUsers[i].userDocRef.path + '_updatePermissionsPerm')[0] as HTMLInputElement).checked,
          }

          // Pushes new user map to an array
          newGroupUsers.push(newUserMap);
        }

        // Calls the service function to update the group users permissions
        this.groupService.updatePerms(newGroupUsers, this.cachedGroup.groupId)
      }
    }
    else {
      console.log('Insufficient permissions!');
    }
  }

}
