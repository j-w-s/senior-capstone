import { Component, OnInit } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { ForumService } from '../services/forum.service'
import Forum from '../../models/forum';
import Thread from '../../models/thread';
import User from '../../models/user';
import { ViewChild, ElementRef, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-forums',
  templateUrl: './forums.component.html',
  styleUrl: './forums.component.scss'
})
export class ForumsComponent implements OnInit {
  forum$: Observable<Forum[]>;
  selectedThread: Thread | null = null;
  forum: Forum[] = [];

  constructor(public forumService: ForumService) {
    this.forum$ = this.forumService.thread;
  }

  ngOnInit() {
    this.forum$.subscribe(forumData => {
      this.forum = forumData;
    });
  }

  onRowClick(thread: Thread) {
    this.selectedThread = thread;
  }

  resetSelection() {
    this.selectedThread = null;
  }
}
