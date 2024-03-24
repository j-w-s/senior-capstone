import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ForumService } from '../services/forum.service';
import Forum from '../../models/forum';
import Thread from '../../models/thread';
import Comment  from '../../models/comment';
import User from '../../models/user';
import { tap, take } from 'rxjs/operators';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { LoginRegisterService } from '../services/login-register.service';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-forums',
  templateUrl: './forums.component.html',
  styleUrls: ['./forums.component.scss']
})

export class ForumsComponent implements OnInit {
  selectedThread: Thread | null = null;
  forumThreads: Thread[] = [];
  newCommentContent: string = '';
  newThreadForm!: FormGroup;
  isModalOpen = false;
  displayComments = false;
  primaryUser!: User;
  selectedThreadComments: any = [];
  originalForumThreads!: Thread[];
  private commentsSubject = new BehaviorSubject<Comment[]>([]);
  comments$: Observable<Comment[]> = this.commentsSubject.asObservable();

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
    this.originalForumThreads = [...this.forumThreads];
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
          this.originalForumThreads = [...this.forumThreads]; 
        } else {
          this.forumService.getThreads().subscribe((threads: Forum) => {
            this.forumThreads = threads.threads;
            this.originalForumThreads = [...this.forumThreads]; 
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
        const threadData: Thread = {
          id: this.selectedThread ? this.selectedThread.id : '', // Use existing ID if editing
          publisher: this.primaryUser.userDisplayName,
          users: [],
          tags: this.newThreadForm.get('tags')?.value.split(','),
          title: this.newThreadForm.get('title')?.value,
          threadContent: this.newThreadForm.get('content')?.value,
          timeSent: new Date()
        };
        await this.forumService.addThread(threadData);

        this.resetForm();
        this.closeModal();
      }
    } catch (error) {
      console.error('Error adding/updating thread:', error);
    }
  }

  resetSelection() {
    this.selectedThread = null;
    this.displayComments = false;
    this.selectedThreadComments = [];
  }

  async addComment(event: Event): Promise<void> {
    event.preventDefault(); // Prevent default form submission
    if (this.selectedThread && this.newCommentContent.trim() !== '') {
      try {
        // Correctly await the getCurrentUser method to get the user ID
        let userId = await this.loginRegService.getCurrentUser();
        console.log("made it!")
        const newComment: Comment = {
          userId: userId,
          commentId: uuidv4() as string,
          messageContent: this.newCommentContent,
          timeSent: new Date(),
          isReply: false
        };

        if (!this.selectedThread.comments) {
          this.selectedThread.comments = [];
        }

        await this.forumService.addComment(this.selectedThread, newComment);
        this.selectedThread.comments.push(newComment);
        this.newCommentContent = '';
      } catch (error) {
        console.error('Error getting current user:', error);
      }
    }
  }


  loadComments(thread: Thread): void {
    console.log(thread);
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

  filterThreads(search: string): void {
    const trimmedSearch = search.trim();

    this.forumThreads = this.forumThreads.filter((thread: Thread) =>
      thread.title.toLowerCase().includes(trimmedSearch.toLowerCase())
    );

    if (trimmedSearch === '') {
      this.forumThreads = [...this.originalForumThreads];
    }
  }
  editThread(): void {
    const thread = this.selectedThread!;

    this.newThreadForm.patchValue({
      title: thread.title,
      tags: thread.tags.join(','), // Assuming tags is an array
      content: thread.threadContent
    });

    // Open the modal to edit the thread
    this.openModal();
  }
}




