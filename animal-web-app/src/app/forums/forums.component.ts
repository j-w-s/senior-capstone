import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ForumService } from '../services/forum.service';
import Forum from '../../models/forum';
import Thread from '../../models/thread';
import Comment  from '../../models/comment';
import User from '../../models/user';
import { tap, take } from 'rxjs/operators';

@Component({
  selector: 'app-forums',
  templateUrl: './forums.component.html',
  styleUrls: ['./forums.component.scss']
})

export class ForumsComponent implements OnInit {
  selectedThread: Thread | null = null;
  newThreadTitle: string = '';
  newThreadTags: string = '';
  newThreadContent: string = '';
  forumThreads: Thread[] = [];
  newCommentContent: string = '';
  comments$: Observable<Comment[]>;

  constructor(private forumService: ForumService) {
    this.comments$ = new Observable<Comment[]>();

  }

  ngOnInit() {
    if (this.selectedThread !== null) {
      this.onRowClick(this.selectedThread);
    }
    this.forumService.forum$.pipe(
      take(1),
      tap((forum: Forum) => {
        if (forum && forum.threads && forum.threads.length > 0) {
          this.forumThreads = forum.threads;
        } else {
          // Fetch threads explicitly if not available
          this.forumService.getThreads().subscribe((threads: Forum) => {
            this.forumThreads = threads.threads;
          });
        }
      })
    ).subscribe();
  }




  onRowClick(thread: Thread) {
    this.selectedThread = thread;
    if (this.selectedThread && this.selectedThread.comments) {
      const commentReferences = this.selectedThread.comments;
      // Call the service method to fetch comments data and subscribe to the observable
      this.comments$ = this.forumService.getCommentsData(commentReferences);

      // Subscribe to the comments$ observable to receive the emitted comments
      this.comments$.subscribe(comments => {
        console.log('Received comments:', comments);
        // Perform any further actions with the received comments
      });
    }
  }

  resetSelection() {
    this.selectedThread = null;
  }

  async addNewThread(): Promise<void> {
    const newThread: Thread = {
      id: '', // Assign the generated ID to the new thread
      publisher: 'userId123',
      users: [],
      tags: this.newThreadTags.split(','),
      title: this.newThreadTitle,
      threadContent: this.newThreadContent,
      timeSent: new Date()
    };

    await this.forumService.addThread(newThread);
    this.resetForm();
  }

  addComment(): void {
    if (this.selectedThread && this.newCommentContent.trim() !== '') {
      const newComment: Comment = {
        userId: 'userId123', // Replace with actual user ID
        commentId: '', // Generate a unique ID for the comment
        messageContent: this.newCommentContent,
        timeSent: new Date(),
        isReply: false // For simplicity, assuming it's not a reply
      };

      // Call the service method to add the comment
      this.forumService.addComment(this.selectedThread, newComment);
      // Clear the comment content after adding
      this.newCommentContent = '';
    }
  }


  resetForm(): void {
    this.newThreadTitle = '';
    this.newThreadTags = '';
    this.newThreadContent = '';
  }

  formatTimestamp(timestamp: any): string {
    if (timestamp instanceof Date) {
      return timestamp.toLocaleString();
    }
    const date = timestamp ? new Date(timestamp.seconds * 1000) : null;
    return date ? date.toLocaleString() : '';
  }
}




