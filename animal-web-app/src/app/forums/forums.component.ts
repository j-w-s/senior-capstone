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

  ngOnInit(): void {
    this.loadForumData();
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
  }

  async addNewThread(): Promise<void> {
    const newThread: Thread = {
      id: '',
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

  resetSelection() {
    this.selectedThread = null;
  }

  addComment(): void {
    if (this.selectedThread && this.newCommentContent.trim() !== '') {
      const newComment: Comment = {
        userId: 'userId123',
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
        this.comments$ = this.forumService.getThreadComments(thread.id);
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




