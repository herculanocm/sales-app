import { Component, OnInit, isDevMode } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ChildActivationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AppService } from './app.service';

@Component({
  selector: 'app-root',
  template: `
      <router-outlet></router-outlet>
    `,
})
export class AppComponent implements OnInit {
  constructor(public router: Router, private titleService: Title, private _appService: AppService) {
    console.log('Is dev mode? ' + isDevMode());
    this.router.events
      .pipe(filter((event) => event instanceof ChildActivationEnd))
      .subscribe((event) => {
        let snapshot = (event as ChildActivationEnd).snapshot;

        while (snapshot.firstChild !== null) {
          snapshot = snapshot.firstChild;
        }
        this.titleService.setTitle(snapshot.data['title'] || 'Sales');
      });
  }
  ngOnInit(): void {
    console.log('app component');
    if (this._appService.isLoggedAndConfigsSession() === false && // se já perdeu os dados da sessão
    this._appService.isLoggedAndConfigsLocal() // e existe os dados no local storage
    ) {
        // alert('copiando de local para session');
        //console.log('local para session');
        this._appService.localParaSession();
    }
  }
}
