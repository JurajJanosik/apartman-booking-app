
import { Injectable } from '@angular/core';
import {
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';

import { auth } from './firebase.config';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  async login(email: string, password: string) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  async logout() {
    return signOut(auth);
  }
}
