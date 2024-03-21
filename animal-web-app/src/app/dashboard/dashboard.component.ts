import { AfterViewInit, Component, OnInit } from '@angular/core';
import { MessengerService } from '../services/messenger.service';
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
export class DashboardComponent implements OnInit, AfterViewInit{

  // stores the primary User that is logged in
  public primaryUser!: User;

  days = Array.from({ length: 5 }, (_, i) => Array.from({ length: 7 }, (__, j) => i * 7 + j + 1));

  notifications: string[][] = [];
  constructor(
    public messengerService: MessengerService,
    private groupsService: GroupsService,
    private loginReg: LoginRegisterService
  ) { }


  // gets the user logged in and resolves their userImage
  async ngOnInit() {
    this.listenForNewMessages();
    const currentUserId = this.loginReg.currentUser;
    try {
      const userDetails = await this.loginReg.getUserDetails(currentUserId);
      this.primaryUser = userDetails as User;

      // resolve the user image
      //this.primaryUser.userImage = await this.messengerService.resolveProfilePicture(this.primaryUser);
      console.log('Primary User: ', this.primaryUser);
    } catch (error) {
      console.error('Error loading user details or profile picture: ', error);
    }

    this.messengerService.getNotifications().subscribe(notifications => {
      this.notifications = notifications;
      console.log('Notifications: ', notifications);
    })

  }

  // using glidejs to handle this now because my marquee version
  // would sometimes flicker and required a lot of transformations
  // on the front-end
  ngAfterViewInit() {
    var glide = new Glide('.glide', {
      type: 'carousel',
      autoplay: 1,
      animationDuration: 4500,
      animationTimingFunc: 'linear',
      perView:2.5,
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

 listenForNewMessages() {
    this.messengerService.getMessages().subscribe(async(messages) => {
      const mess = messages.messagesList[messages.messagesList.length - 1];
      console.log('MessageSender', mess.senderId)
      
      await this.messengerService.getUserById2(mess.senderId).then((user) => {
        console.log('UserGot:', user)
        this.messengerService.addNotification(mess.messageContent, user.userDisplayName);
      })
      //this.messengerService.addNotification(mess.messageContent);
    })
  }

}
