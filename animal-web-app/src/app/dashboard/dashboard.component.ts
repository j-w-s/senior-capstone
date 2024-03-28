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
  public primaryUser: User | null = null;
  notifications: string[][] = [];

  constructor(
    public messengerService: MessengerService,
    private groupsService: GroupsService,
    public loginReg: LoginRegisterService
  ) { }


  async ngOnInit() {
    this.listenForNewMessages();
    this.loginReg.userData$.subscribe((user: User | null): void => { 
      if (user) { 
        this.primaryUser = user;
        console.log(user);
        this.resolveUserImage();
      }
    });
  }

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
