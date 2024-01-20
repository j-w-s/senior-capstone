import { Component, OnInit } from '@angular/core';

interface Card {
 username: string;
 previewText: string;
 imageUrl: string;
}

@Component({
 selector: 'app-messenger',
 templateUrl: './messenger.component.html',
 styleUrls: ['./messenger.component.scss']
})
export class MessengerComponent implements OnInit {
 cards: Card[] = [];

 ngOnInit(): void {
   for (let i = 0; i < 10; i++) {
     this.cards.push({
       username: 'Username ' + (i + 1),
       previewText: 'Preview Text',
       imageUrl: './assets/pugster.webp',
     });
   }
 }
}
