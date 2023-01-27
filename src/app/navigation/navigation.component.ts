import {Component, OnInit} from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import {Observable, Subscription} from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import {TitleService} from '../../_services/title.service';
import {TokenStorageService} from '../../_services/token-storage.service';
import {EventBusService} from '../../_shared/event-bus.service';
import {User} from '../../models/user';
import {Router} from '@angular/router';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent implements OnInit {

  title: string;
  isLoggedIn = false;
  currentUser?: User;
  eventBusSub?: Subscription;
  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  constructor(
    private breakpointObserver: BreakpointObserver,
    private titleService: TitleService,
    private tokenStorageService: TokenStorageService,
    private eventBusService: EventBusService,
    private routerService: Router
  ) {}

  ngOnInit(): void {
    this.titleService.title$.subscribe(title => {
      this.title = title;
    });

    this.login();

    this.eventBusSub = this.eventBusService.on('logout', () => {
      this.logout();
    });
    this.eventBusSub = this.eventBusService.on('login', () => {
      this.login();
    });
    if (this.tokenStorageService.getToken()) {
      this.routerService.navigate(['products']);
    } else {
      this.routerService.navigate(['login']);
    }
  }

  login(): void {
    this.isLoggedIn = !!this.tokenStorageService.getToken();

    if (this.isLoggedIn) {
      this.currentUser = this.tokenStorageService.getUser();
    }
  }

  logout(): void {
    this.tokenStorageService.signOut();

    this.isLoggedIn = false;
  }

}
