import {Component, OnInit} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {TitleService} from '../../_services/title.service';
import {AuthService} from '../../_services/auth.service';
import {Router} from '@angular/router';
import {TokenStorageService} from '../../_services/token-storage.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm = this.fb.group({
    username: [null, Validators.required],
    password: [null, Validators.required],
  });
  errorLoginMessage = '';
  loading = false;
  constructor(
    private fb: FormBuilder,
    private titleService: TitleService,
    private authService: AuthService,
    private router: Router,
  ) {
    this.titleService.setTitle('Connexion');
  }

  submit(): void {
    const value = this.loginForm.value;
    if (value.username && value.password) {
      this.loading = true;
      this.authService.login(value.username, value.password).subscribe(() => {
        this.router.navigate(['/products']);
      }, error => {
        this.errorLoginMessage = error.error ? error.error.message : error.message;
      }).add(() => {
        this.loading = false;
      });
    }
  }

  ngOnInit(): void {
  }
}
