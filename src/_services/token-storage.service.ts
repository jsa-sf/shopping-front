import { Injectable } from '@angular/core';
import {User} from '../models/user';
import {Subscription} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TokenStorageService {

  constructor() { }

  saveToken(token: string): void {
    window.sessionStorage.removeItem('auth-token');
    window.sessionStorage.setItem('auth-token', token);

    const user = this.getUser();
    if (user.id) {
      this.saveUser({...user, accessToken: token});
    }
  }

  getToken(): string {
    return window.sessionStorage.getItem('auth-token');
  }

  saveRefreshToken(token: string): void {
    window.sessionStorage.removeItem('auth-refreshtoken');
    window.sessionStorage.setItem('auth-refreshtoken', token);
  }

  getRefreshToken(): string {
    return window.sessionStorage.getItem('auth-refreshtoken');
  }

  saveUser(user: User): void {
    window.sessionStorage.removeItem('auth-user');
    window.sessionStorage.setItem('auth-user', JSON.stringify(user));
  }

  getUser(): any {
    const user = window.sessionStorage.getItem('auth-user');

    if (user) {
      return JSON.parse(user);
    }

    return {};
  }

  signOut(): void {
    window.sessionStorage.clear();
  }
}
