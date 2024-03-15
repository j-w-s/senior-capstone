import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ForumService } from '../services/forum.service';
import Forum from '../../models/forum';
import Thread from '../../models/thread';
import Comment  from '../../models/comment';
import User from '../../models/user';
import { tap, take } from 'rxjs/operators';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { LoginRegisterService } from '../services/login-register.service';

@Component({
  selector: 'app-forums',
  templateUrl: './forums.component.html',
  styleUrls: ['./forums.component.scss']
})

export class ForumsComponent implements OnInit {
  selectedThread: Thread | null = null;
  forumThreads: Thread[] = [];
  newCommentContent: string = '';
  comments$: Observable<Comment[]>;
  newThreadForm!: FormGroup;
  isModalOpen = false;
  displayComments = false;
  primaryUser!: User;
  selectedThreadComments: any = [];

  openModal(): void {
    const modalToggle = document.getElementById('createThreadModal') as HTMLInputElement;
    modalToggle.checked = true;
  }

  closeModal(): void {
    const modalToggle = document.getElementById('createThreadModal') as HTMLInputElement;
    modalToggle.checked = false;
  }

  constructor(private forumService: ForumService,
    private formBuilder: FormBuilder, private loginRegService: LoginRegisterService) {
    this.comments$ = new Observable<Comment[]>();
    this.initNewThreadForm();
    this.newThreadForm.setValue({
      content: '',
      title: '',
      tags: '',
    });
  }

  async ngOnInit(): Promise<void> {
    this.loadForumData();
    this.initNewThreadForm();
    this.loadCurrentUser();
  }

  async loadCurrentUser(): Promise<void> {
    const userId = await this.loginRegService.getCurrentUser();
    const userDetails = await this.loginRegService.getUserDetails(userId);
    this.primaryUser = userDetails as User;
  }

  initNewThreadForm(): void {
    this.newThreadForm = this.formBuilder.group({
      title: ['', Validators.required],
      tags: ['', Validators.required],
      content: ['', Validators.required]
    });
  }

  loadForumData(): void {
    this.forumService.forum$.pipe(
      take(1),
      tap((forum: Forum) => {
        if (forum && forum.threads && forum.threads.length > 0) {
          this.forumThreads = forum.threads;
        } else {
          this.forumService.getThreads().subscribe((threads: Forum) => {
            this.forumThreads = threads.threads;
          });
        }
      })
    ).subscribe();
  }

  onRowClick(thread: Thread): void {
    this.selectedThread = thread;
    this.loadComments(this.selectedThread);
    this.displayComments = true;
    console.log(thread);
  }

  async addNewThread(): Promise<void> {
    try {
      if (this.newThreadForm.valid) {
        let userId = await this.loginRegService.getCurrentUser();
        const newThread: Thread = {
          id: '',
          publisher: this.primaryUser.userDisplayName,
          users: [],
          tags: this.newThreadForm.get('tags')?.value.split(','),
          title: this.newThreadForm.get('title')?.value,
          threadContent: this.newThreadForm.get('content')?.value,
          timeSent: new Date()
        };

        await this.forumService.addThread(newThread);
        this.resetForm();
      }
    } catch (error) {
      console.error('Error adding new thread:', error);
    }
  }

  resetSelection() {
    this.selectedThread = null;
    this.displayComments = false;
    this.selectedThreadComments = [];
  }

  async addComment(): Promise<void> {
    if (this.selectedThread && this.newCommentContent.trim() !== '') {
      let userId = await this.loginRegService.getCurrentUser as any
      const newComment: Comment = {
        userId: userId,
        commentId: '',
        messageContent: this.newCommentContent,
        timeSent: new Date(),
        isReply: false
      };

      this.forumService.addComment(this.selectedThread, newComment);
      this.newCommentContent = '';
    }
  }

  loadComments(thread: Thread): void {
    if (thread && thread.id) {
        //this.comments$ = this.forumService.getThreadComments(thread.id);
      this.selectedThreadComments = thread.comments;
    }
  }

  resetForm(): void {
    this.newThreadForm.reset();
  }

  formatTimestamp(timestamp: any): string {
    if (timestamp instanceof Date) {
      return timestamp.toLocaleString();
    }
    const date = timestamp ? new Date(timestamp.seconds * 1000) : null;
    return date ? date.toLocaleString() : '';
  }
}




