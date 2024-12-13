import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from './login.service';

@Component({
  selector: 'app-logout',
  template: '<h2>Deslogando com segurança, aguarde........</h2>'
})
export class LogoutComponent implements OnInit {

  constructor(
    private router: Router,
    private _loginService: LoginService,
  ) { }

  ngOnInit() {
    this._loginService.clearStorages();
    this.router.navigate(['login']);
  }
}
