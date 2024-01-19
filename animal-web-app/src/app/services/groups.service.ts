import { Injectable } from '@angular/core';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { addDoc, collection, doc, getFirestore, runTransaction, setDoc } from '@angular/fire/firestore';
import { LoginRegisterService } from './login-register.service';
import { DocumentSnapshot, updateDoc } from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class GroupsService {

  constructor() { }

}
