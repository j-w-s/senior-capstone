import { AfterViewInit, Component, OnInit } from '@angular/core';
import { MessengerService } from '../services/messenger.service';
import { NotificationsService } from '../services/notifications.service';
import { getAuth } from 'firebase/auth';
import User from '../../models/user';
import { GroupsService } from '../services/groups.service';
import { AlertsService } from '../services/alerts.service';
import Glide from '@glidejs/glide';
import { LoginRegisterService } from '../services/login-register.service';
import { Router } from '@angular/router';
import Message from '../../models/message';
import { v4 as uuidv4 } from "uuid";

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
    userImage: string, disabled: boolean, notificationId: string}[] = [];

  constructor(
    public messengerService: MessengerService,
    private groupsService: GroupsService,
    public loginReg: LoginRegisterService,
    public notService: NotificationsService,
    private router: Router,
    private alertsService: AlertsService,
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

  async addContact(notification: any): Promise<void> {
    const userId = notification.userId;
    const newMessage: Message = {
      messageId: uuidv4(),
      senderId: userId,
      receiverId: this.primaryUser ? this.primaryUser.userId : "", 
      messageContent: notification.notificationMessage,
      timeSent: new Date(),
    };
    try {
      await this.messengerService.addContactById(userId, newMessage);
      this.alertsService.show('success', 'Contact added successfully. Redirecting you to the messenger.');
      setTimeout(() => {
        
        this.router.navigate(['/messenger'], { state: { userId: userId } });
      }, 3000);
    } catch (error) {
      this.alertsService.show('error', 'There was an error adding the contact. Please try again.');
    }
  }

}
