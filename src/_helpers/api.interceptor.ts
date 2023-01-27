import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor, HttpErrorResponse
} from '@angular/common/http';
import {BehaviorSubject, Observable, throwError} from 'rxjs';
import {environment} from '../environments/environment';
import {catchError, filter, switchMap, take} from 'rxjs/operators';
import {TokenStorageService} from '../_services/token-storage.service';
import {AuthService} from '../_services/auth.service';
import {Token} from '@angular/compiler';
import {error} from 'protractor';

@Injectable()
export class APIInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(
    private tokenService: TokenStorageService,
    private authService: AuthService
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let apiRequest = request.clone({url: `${environment.baseUrl}${request.url}`});

    const token = this.tokenService.getToken();
    if (token != null) {
      apiRequest = this.addTokenHeader(apiRequest, token);
    }

    return next.handle(apiRequest).pipe(catchError(err => {
      if (err instanceof HttpErrorResponse && !apiRequest.url.includes('api/login') && err.status === 401) {
        return this.handle401Error(apiRequest, next);
      }

      return throwError(err);
    })) ;
  }

  private addTokenHeader(request: HttpRequest<any>, token: string): HttpRequest<any> {
    if (!request.url.includes('/token/refresh')) {
      return request.clone({headers: request.headers.set('Authorization', 'Bearer ' + token)});
    }
    return request;
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      const token = this.tokenService.getRefreshToken();

      if (token) {
        return this.authService.refreshToken(token).pipe(
          switchMap(response => {
            this.isRefreshing = false;

            this.tokenService.saveToken(response.token);
            this.tokenService.saveRefreshToken(response.refresh_token);
            this.refreshTokenSubject.next(response.token);

            return next.handle(this.addTokenHeader(request, response.token));
          }),
          catchError(err => {
            this.isRefreshing = false;
            this.tokenService.signOut();
            return throwError(err);
          })
        );
      }
    }

    return this.refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap(token => next.handle(this.addTokenHeader(request, token)))
    );
  }
}
