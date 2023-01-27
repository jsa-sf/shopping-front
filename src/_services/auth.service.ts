import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, of} from 'rxjs';
import {User} from '../models/user';
import {shareReplay, switchMap} from 'rxjs/operators';
import {Token} from '../models/token';
import {TokenStorageService} from './token-storage.service';
import {EventBusService} from '../_shared/event-bus.service';
import {EventData} from '../_shared/event-data';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private http: HttpClient,
    private tokenStorageService: TokenStorageService,
    private eventBusService: EventBusService
  ) {
  }

  login(username: string, password: string): Observable<User>  {
    return this.http.post<Token>('/api/login', {username, password}).pipe(
      shareReplay(1),
      switchMap((response: Token) => {
        this.tokenStorageService.saveToken(response.token);
        this.tokenStorageService.saveRefreshToken(response.refresh_token);
        return this.me();
      }),
    );
  }

  me(): Observable<User> {
    return this.http.get<User>('/api/me').pipe(
      switchMap(user => {
        this.tokenStorageService.saveUser(user);
        this.eventBusService.emit(new EventData('login', null));
        return of(user);
      })
    );
  }

  refreshToken(token: string): Observable<Token> {
    return this.http.post<Token>('/api/token/refresh', {refresh_token: token});
  }

  register(email: string, password: string): Observable<User>  {
    return this.http.post<User>('/api/users', {email, password});
  }
}
