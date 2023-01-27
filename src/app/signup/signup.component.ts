import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import {AuthService} from '../../_services/auth.service';
import {TitleService} from '../../_services/title.service';
import {catchError, map, shareReplay, switchMap} from 'rxjs/operators';
import {Router} from '@angular/router';
import {throwError} from 'rxjs';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  signupForm = this.fb.group({
    username: [null, [Validators.required, Validators.email]],
    password: [null, Validators.required],
  });
  errorSignupMessage = '';
  loading = false;
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private titleService: TitleService,
    private router: Router
  ) {
    titleService.setTitle('Créer un nouveau compte');
  }

  submit(): void {
    const value = this.signupForm.value;
    if (this.signupForm.valid && value.username && value.password) {
      this.loading = true;
      this.authService.register(value.username, value.password).pipe(
        switchMap(() => {
          return this.authService.login(value.username, value.password);
        }),
        catchError(err => {
          this.errorSignupMessage = err.message;
          return throwError(err);
        })
      ).subscribe(() => {
        this.router.navigate(['/products']);
      }).add(() => {
        this.loading = false;
      });
    }
  }
}
