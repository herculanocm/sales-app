import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ToastrModule } from 'ngx-toastr';
import { AuthUtilsService } from '@modules/auth-utils/auth-utils.service';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgxSpinnerModule } from 'ngx-spinner';
import { registerLocaleData } from '@angular/common';
import localePtBr from '@angular/common/locales/br';
import { AppService } from './app.service';
import { AppRootModalAlertSuccessComponent } from './dialog/app-root-modal-alert-success/app-root-modal-alert-success.component';
import { AppRootModalAlertErrorComponent } from './dialog/app-root-modal-alert-error/app-root-modal-alert-error.component';
import { TokenInterceptor } from './app.interceptor';

@NgModule({
  declarations: [
    AppComponent,
    AppRootModalAlertSuccessComponent,
    AppRootModalAlertErrorComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    ToastrModule.forRoot(),
    NgxSpinnerModule,
  ],
  providers: [
    AppService,
    AuthUtilsService,
    { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {
  constructor() {
    registerLocaleData(localePtBr, 'pt-BR');
  }
}

