import { AfterViewInit, Component, OnInit } from '@angular/core';
import { MessengerService } from '../services/messenger.service';
import { NotificationsService } from '../services/notifications.service';
import { getAuth } from 'firebase/auth';
import User from '../../models/user';
import { GroupsService } from '../services/groups.service';
import Glide from '@glidejs/glide';
import { LoginRegisterService } from '../services/login-register.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements AfterViewInit{

  // stores the primary User that is logged in
  public primaryUser: User | null = null;
  public notifications: {
    userId: string, notificationMessage: string, userName: string,
    userImage: string, }[] = [];

  constructor(
    public messengerService: MessengerService,
    private groupsService: GroupsService,
    public loginReg: LoginRegisterService,
    public notService: NotificationsService,
  ) { }

  async resolveUserImage() {
    try {
      if (this.primaryUser) {
        this.primaryUser.userImage = await this.messengerService.resolveProfilePicture(this.primaryUser);
        console.log('Primary User: ', this.primaryUser);
      }
    } catch (error) {
      console.error('Error loading user details or profile picture: ', error);
    }
  }

  async ngAfterViewInit() {

    //this.listenForNewMessages();
    this.loginReg.userData$.subscribe((user: User | null): void => {
      if (user) {
        this.primaryUser = user;
        this.resolveUserImage();
        this.notService.getUserNotifications(this.primaryUser.userId).subscribe(notifications => {
          this.notifications = [].concat(...notifications);
          console.log(this.notifications);
        });
      }
    });

    var glide = new Glide('.glide', {
      type: 'carousel',
      autoplay: 1,
      animationDuration: 4500,
      animationTimingFunc: 'linear',
      perView: 2.5,
      breakpoints: {
        1024: {
          perView: 2
        },
        640: {
          perView: 1,
          gap: 36
        }
      },
    });

    glide.mount();

    const slides = document.querySelectorAll('.glide__slide');

    slides.forEach((slide) => {
      slide.addEventListener('mouseover', () => {
        glide.pause();
      });

      slide.addEventListener('mouseout', () => {
        glide.play();
      });
    });
  }

  addContact(userId: string): void {
    this.messengerService.addContactById(userId);
  }

}
