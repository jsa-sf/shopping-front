import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TitleService {
  private title = new BehaviorSubject('Liste de courses');
  constructor() {
    this.title$.subscribe();
  }

  get title$(): Observable<string>{
    return this.title as Observable<string>;
  }

  setTitle(title: string): void {
    this.title.next(title);
  }
}
