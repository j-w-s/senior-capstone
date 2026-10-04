import { AfterViewInit, Component, OnInit } from '@angular/core';
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
import { ChangeDetectorRef } from '@angular/core';
import { and } from 'firebase/firestore/lite';
import { AlertsService } from '../services/alerts.service';

@Component({
  selector: 'app-forums',
  templateUrl: './forums.component.html',
  styleUrls: ['./forums.component.scss']
})

export class ForumsComponent implements OnInit, AfterViewInit {
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
  editCommentForm!: FormGroup;
  selectedComment: Comment | null = null;
  isEditCommentModalActive = false;
  isCreateThreadModalActive = false;

  openModal(): void {
    const modalToggle = document.getElementById('createThreadModal') as HTMLInputElement;
    modalToggle.checked = true;
    this.isCreateThreadModalActive = true;
  }

  closeModal(): void {
    const modalToggle = document.getElementById('createThreadModal') as HTMLInputElement;
    modalToggle.checked = false;
    this.isCreateThreadModalActive = false;
    this.isEditCommentModalActive = false;
  }

  constructor(private forumService: ForumService,
    public alertsService: AlertsService,
    private formBuilder: FormBuilder, private loginRegService: LoginRegisterService) {
    this.comments$ = new Observable<Comment[]>();
    this.initNewThreadForm();
    this.initEditCommentForm();
    this.newThreadForm.setValue({
      content: '',
      title: '',
      tags: '',
    });
  }

  initEditCommentForm(): void {
    this.editCommentForm = this.formBuilder.group({
      content: ['', Validators.required]
    });
  }

  async ngOnInit(): Promise<void> {

  }

  async ngAfterViewInit(): Promise<void> {
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
    this.isCreateThreadModalActive = true;
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
          timeSent: new Date(),
          Edited: false
        };
        await this.forumService.addThread(threadData);
        this.alertsService.show('success', 'Thread created successfully.');
        setTimeout(() => {
          this.resetForm();
          this.closeModal();
        }, 3000);
      }
    } catch (error) {
      console.error('Error adding/updating thread:', error);
      this.alertsService.show('error', 'There was an error creating your thread. Please try again.');
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
          isReply: false,
          commenter: this.primaryUser.userDisplayName,
        };

        if (!this.selectedThread.comments) {
          this.selectedThread.comments = [];
        }

        await this.forumService.addComment(this.selectedThread, newComment);
        this.selectedThread.comments.push(newComment);
        this.newCommentContent = '';

        // Show success alert and reset form
        this.alertsService.show('success', 'Comment added successfully.');
        setTimeout(() => {
          // Reset the form or perform any other action after a delay
          this.newCommentContent = ''; // Reset the comment content
        }, 3000);
      } catch (error) {
        console.error('Error getting current user:', error);
        // Show error alert
        this.alertsService.show('error', 'There was an error adding your comment. Please try again.');
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
    console.log("Filtered content")
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

  openEditCommentModal(comment: Comment): void {
    this.selectedComment = comment;
    this.isEditCommentModalActive = true;
    this.editCommentForm.setValue({
      content: comment.messageContent
    });
    const modalToggle = document.getElementById('editCommentModal') as HTMLInputElement;
    modalToggle.checked = true;
    this.isCreateThreadModalActive = false;
  }

  closeEditCommentModal(): void {
    this.selectedComment = null;
    this.editCommentForm.reset();
    this.isEditCommentModalActive = false;
    const modalToggle = document.getElementById('editCommentModal') as HTMLInputElement;
    modalToggle.checked = false;
  }

  async updateComment(): Promise<void> {
    if (this.editCommentForm.valid) {
      try {
        if (this.selectedComment != null) {
          const updatedComment: Comment = {
            ...this.selectedComment,
            messageContent: this.editCommentForm.get('content')?.value
          };
          await this.forumService.updateComment(this.selectedThread!, updatedComment);
          // Show success alert
          this.alertsService.show('success', 'Comment updated successfully.');
          setTimeout(() => {
            // Close the edit comment modal and perform any other UI updates
            this.closeEditCommentModal();
            // Optionally, refresh the UI to reflect the changes
          }, 3000);
        }
      } catch (error) {
        console.error('Error updating comment:', error);
        // Show error alert
        this.alertsService.show('error', 'There was an error updating your comment. Please try again.');
      }
    }
  }
}




