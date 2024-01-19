import { Component } from '@angular/core';
import { GroupsService } from '../services/groups.service';
import { LoginRegisterService } from '../services/login-register.service';

@Component({
  selector: 'app-groups-page',
  templateUrl: './groups-page.component.html',
  styleUrl: './groups-page.component.scss'
})
export class GroupsPageComponent {

  constructor(private groupsService: GroupsService, private loginRegService: LoginRegisterService) { }

  ngOnInit() {
    
  }

  isLoggedIn() {
    return this.loginRegService.isLoggedIn
  }

}
