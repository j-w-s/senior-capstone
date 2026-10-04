import { Component, OnInit } from '@angular/core';
import { DocumentReference } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize, Observable, Subject, takeUntil } from 'rxjs';
import Group from '../../models/group';
import GroupUser from '../../models/groupUsers';
import User from '../../models/user';
import { GroupsService } from '../services/groups.service';
import { LoginRegisterService } from '../services/login-register.service';

@Component({
  selector: 'app-groups-page',
  templateUrl: './groups-page.component.html',
  styleUrl: './groups-page.component.scss'
})
export class GroupsPageComponent implements OnInit {
  // Stores all the groups retrieved from the database
  groups: Group[] = [];
  users: User[] = [];
  //owner: User | null = null;
  selectedGroup: Group | null = null;
  userPerms!: GroupUser;
  creatingGroup = false;
  managePermissions = false;
  cachedGroup: Group | null = null;

  groupCreationForm: FormGroup;
  selectedGroupForm: FormGroup;
  selectingGroupPicture: boolean = false;
  tempImageUrl: string = '';
  defaultImages: string[] = [];
  usingDefaultImage = false;

  private destroy$ = new Subject<void>();

  
  constructor(
    private groupService: GroupsService, 
    private loginRegService: LoginRegisterService, 
    private fb: FormBuilder,
    private storage: AngularFireStorage,
    ) 
    {
      this.groupCreationForm = this.fb.group({
        groupName: ['', [Validators.required, Validators.minLength(3)]],
        groupDescription: ['', Validators.required],
        groupCity: ['', Validators.required],
        groupStreetAddress: ['', Validators.required],
        groupPhoneNumber: ['', [Validators.required, Validators.pattern('[0-9]{10}')]],
        groupEmail: ['', [Validators.required, Validators.email]],
      });

      this.selectedGroupForm = this.fb.group({
        groupName: ['', [Validators.required, Validators.minLength(3)]],
        groupDescription: ['', Validators.required],
        groupCity: ['', Validators.required],
        groupStreetAddress: ['', Validators.required],
        groupPhoneNumber: ['', [Validators.required, Validators.pattern('[0-9]{10}')]],
        groupEmail: ['', [Validators.required, Validators.email]],
      });

   }

  ngOnInit(): void {
    this.loadDefaultImages();
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
              break;
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
    await this.groupService.getUserData(group).then((users) => {
      this.users = users;
      //this.owner = owner;
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
    this.selectingGroupPicture = false;
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
  createGroup() {
    // Gets the document reference to the current signed in user to be the owner in the group
    const ownerDocRef = this.groupService.getOwnerDocRef()

    const firstUser: GroupUser = {
      addUserPerm: true,
      removeUserPerm: true,
      updateGroupPerm: true,
      deleteGroupPerm: true,
      updatePermissionsPerm: true,
      isOwner: true,
      userDocRef: ownerDocRef,
    }

    // Create a new Group to send and store in the database
    const newGroup: Group = {
      groupId: "",
      groupName: this.groupCreationForm.get('groupName')?.value,
      groupDescription: this.groupCreationForm.get('groupDescription')?.value,
      groupImage: this.tempImageUrl,
      groupCity: this.groupCreationForm.get('groupCity')?.value,
      groupStreetAddress: this.groupCreationForm.get('groupStreetAddress')?.value,
      groupPhoneNumber: this.groupCreationForm.get('groupPhoneNumber')?.value,
      groupEmail: this.groupCreationForm.get('groupEmail')?.value,
      groupBeacons: [],
      groupRating: [],
      groupUsers: [firstUser],
      groupDocumentTemplates: [],
    }

    // Calls service function to create the group
    // Sets the groupId fieldto the new group doc, and adds group doc ref to users userGroups field
    // Switches the user to the group page after creation
    this.groupService.createGroup(newGroup).then(newGroupDocRef => {
      this.groupService.setCreatedGroupId(newGroupDocRef);
      this.groupService.addGroupToOwnersDocument(ownerDocRef, newGroupDocRef);
    });
    this.creatingGroup = false;
    this.selectingGroupPicture = false;

  }

  updateGroup(groupData: Group) {
    // Checks the permission of the user or if they are the owner
    if(this.userPerms.isOwner == true || this.userPerms.updateGroupPerm == true) {
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
    if(this.userPerms.isOwner == true || this.userPerms.deleteGroupPerm == true) {

      console.log("Confirmation: ", confirmation);

      // Checks if you typed in 'delete' to delete a group
      if(confirmation == 'delete') {

        // Calls service function to remove the group from all user documents
        this.groupService.removeGroupFromUsers(group);
        // Calls the service function to delete the group
        this.groupService.deleteGroup(group);

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
    if(this.userPerms.isOwner == true || this.userPerms.addUserPerm == true) {
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
    if(this.userPerms.isOwner == true || this.userPerms.removeUserPerm == true) {
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
    if(this.userPerms.isOwner == true || this.userPerms.updatePermissionsPerm == true) {
      console.log('You have permission to update Permissions');

      // Store the updated group users
      const newGroupUsers: GroupUser[] = [];
      let prevOwner!: DocumentReference;
      let newOwner!: DocumentReference;

      // Checks if cachedGroup is null
      if(this.cachedGroup) {
        // Loops through the users in the group that was selected
        for(let i = 0; i < this.cachedGroup?.groupUsers.length; i++) {
          if(this.cachedGroup.groupUsers[i].isOwner === true) {
            prevOwner = this.cachedGroup.groupUsers[i].userDocRef;
          }

          // Creates a new user map with the updated permissions from the permissions page
          const newUserMap: GroupUser = {
            userDocRef: this.cachedGroup.groupUsers[i].userDocRef,
            addUserPerm: (document.getElementsByName(this.cachedGroup.groupUsers[i].userDocRef.path + '_addUserPerm')[0] as HTMLInputElement).checked,
            removeUserPerm: (document.getElementsByName(this.cachedGroup.groupUsers[i].userDocRef.path + '_removeUserPerm')[0] as HTMLInputElement).checked,
            updateGroupPerm: (document.getElementsByName(this.cachedGroup.groupUsers[i].userDocRef.path + '_updateGroupPerm')[0] as HTMLInputElement).checked,
            deleteGroupPerm: (document.getElementsByName(this.cachedGroup.groupUsers[i].userDocRef.path + '_deleteGroupPerm')[0] as HTMLInputElement).checked,
            updatePermissionsPerm: (document.getElementsByName(this.cachedGroup.groupUsers[i].userDocRef.path + '_updatePermissionsPerm')[0] as HTMLInputElement).checked,
            isOwner: (document.getElementsByName(this.cachedGroup.groupUsers[i].userDocRef.path + '_isOwnerPerm')[0] as HTMLInputElement).checked,
          }

          // Pushes new user map to an array
          newGroupUsers.push(newUserMap);
          if(newUserMap.isOwner == true) {
            newOwner = newUserMap.userDocRef;
          }
        }

        this.groupService.updateOwnedGroups(newOwner, this.cachedGroup.groupId, prevOwner)
        // Calls the service function to update the group users permissions
        this.groupService.updatePerms(newGroupUsers, this.cachedGroup.groupId)
      }
    }
    else {
      console.log('Insufficient permissions!');
    }
  }

  onOwnerCheckboxChange(event: Event, userId: string): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    if (isChecked) {
      if(this.cachedGroup)
      for(let i = 0; i < this.cachedGroup?.groupUsers.length; i++) {
        if(this.cachedGroup.groupUsers[i].userDocRef.path.split("/")[1] != userId) {
          (document.getElementsByName(this.cachedGroup.groupUsers[i].userDocRef.path + '_isOwnerPerm')[0] as HTMLInputElement).checked = false;
        }
      }
    } 
  }

  async onFileSelected(event: Event) {
    //this.usingDefaultImage = false;
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files.length >  0) {
      const file = fileInput.files[0];
      const filePath = `userGroupPhotos/${Date.now()}_${file.name}`;
      const fileRef = this.storage.ref(filePath);
      const task = fileRef.put(file);
  
      task.snapshotChanges().pipe(
        finalize(() => fileRef.getDownloadURL().subscribe(url => {
          console.log(url);
          if (this.tempImageUrl != '') {
            // If an image was previously selected, delete it
            if(this.usingDefaultImage == true)
            {
              
            }
            else {
              const existingImageRef = this.storage.refFromURL(this.tempImageUrl);
              existingImageRef.delete().subscribe(() => {
                console.log('Existing image deleted');
              }, error => {
                console.error('Error deleting existing image:', error);
              });
            }
            
          }
          this.tempImageUrl = url; // Update the temporary image URL
        }))
      ).subscribe();
    }
    // Save the img url to the group doc
  }

  loadDefaultImages() {
    const defaultImagesRef = this.storage.ref('defaultGroupPhotos');
    console.log('Trying...')
    defaultImagesRef.listAll().subscribe(res => {
      console.log(res)
      res.items.forEach(itemRef => {
        itemRef.getDownloadURL().then(url => {
          console.log('Image name:', itemRef.name); // Log the name of the image
          console.log(url)
          this.defaultImages.push(url);
        });
      });
    });
  }

  onImageSelected(imageUrl: string) {
    this.usingDefaultImage = true;
    this.tempImageUrl = imageUrl
    console.log('Changed url', imageUrl)
  }

  updatePhoto(event: Event) {
    const file = (event.target as HTMLInputElement)?.files?.[0];
    //let imageUrl!: string;
    if (file) {
      const filePath = `uploads/${Date.now()}_${file.name}`;
      const fileRef = this.storage.ref(filePath);
      const task = this.storage.upload(filePath, file);

      // Get notified when the download URL is available
      task.snapshotChanges().pipe(
        finalize(() => {
          fileRef.getDownloadURL().subscribe(url => {
            console.log('File available at', url);
            //this.profileForm?.get('userImage')?.setValue(url);
            if(this.selectedGroup)
            this.selectedGroup.groupImage = url;

            this.groupService.updateGroup(this.selectedGroup as Group, this.selectedGroup?.groupId as string)
          });
        })
      ).subscribe();
    }
    
  }
}
