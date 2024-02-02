import { Component } from '@angular/core';
import { MessengerService } from '../services/messenger.service';
import { getAuth } from 'firebase/auth';
import User from '../../models/user';
import { GroupsService } from '../services/groups.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {

  // Stores the primary User that is logged in
  public primaryUser!: User;

  days = Array.from({ length: 5 }, (_, i) => Array.from({ length: 7 }, (__, j) => i * 7 + j + 1));

  constructor(public messengerService: MessengerService, private groupsService: GroupsService) { }

  // Gets the user logged in and resolves their userImage
  async ngOnInit() {
    await this.groupsService.sleep(1000)

    const auth = getAuth();
    const user = auth.currentUser?.uid

    if(user != null)
    {
      this.messengerService.getUserById2(user).then(async (userAccount) => {
        this.primaryUser = userAccount;
        this.primaryUser.userImage = await this.messengerService.resolveProfilePicture(this.primaryUser)
        console.log('New Image: ', this.primaryUser.userImage)
      });
    }

  }

}
