import { Injectable } from '@angular/core';
import {
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpInterceptor,
    HttpResponse,
    HttpErrorResponse,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { environment } from '../environments/environment';
import { AppRootModalAlertSuccessComponent } from './dialog/app-root-modal-alert-success/app-root-modal-alert-success.component';
import { AppRootModalAlertErrorComponent } from './dialog/app-root-modal-alert-error/app-root-modal-alert-error.component';

export class CurrentUserSalesApp {
    username: string;
    token: string;
    constructor(username: string, token: string) {
        this.username = username;
        this.token = token;
    }
}


@Injectable()
export class TokenInterceptor implements HttpInterceptor {

    constructor(
        private _modalService: NgbModal,
        public _router: Router,
    ) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        let currentUserSalesApp: CurrentUserSalesApp = JSON.parse(sessionStorage.getItem('currentUserSalesApp')!);
        if (currentUserSalesApp == null) {
            currentUserSalesApp = new CurrentUserSalesApp('NullUsername', 'NullToken');
        }

        if (request.url.substr(0, 27).trim() !== 'https://maps.googleapis.com' &&
            request.url.indexOf(environment.API_ENDPOINT_AIRFLOW) === -1 && 
            request.url.indexOf(environment.API_WEB_ROTA) === -1) {
            request = request.clone({
                setHeaders: {
                    'Authorization': 'Bearer ' + currentUserSalesApp.token,
                    'Content-Type': 'application/json; charset=utf-8',
                },
            });
        } else if (request.url.indexOf(environment.API_ENDPOINT_AIRFLOW) > -1) {
            console.log('entrou airflow');
            request = request.clone({
                setHeaders: {
                    'Authorization': 'Basic ' + environment.AIRFLOW_API_KEY,
                    'Content-Type': 'application/json; charset=utf-8',
                },
            });
        }



        return next.handle(request)
            .pipe(
                tap((event: HttpEvent<any>) => {
                    if (event instanceof HttpResponse) {
                        // console.log('---> status:', event.status);
                        // console.log('---> filter:', request.params.get('filter'));
                        const message = event.headers.get('x-salesapp-message');
                        if (message != null && message.length > 0) {
                            const activeModal = this._modalService.open(AppRootModalAlertSuccessComponent);
                            activeModal.componentInstance.modalHeader = 'INFORMAÇÃO - Retorno do Servidor',
                                activeModal.componentInstance.modalContent = '' + message;
                            activeModal.result.then((result) => {
                                console.log(result);
                            }, err => {
                                console.log(err);
                            });
                        }
                    }
                }, (error: any) => {
                    // console.log('err');
                    if (error instanceof HttpErrorResponse) {
                        // console.log(error);
                        const URL_ESTOQUE_ITEM = '/api/itens/estoques/';
                        const mes = error.headers.get('x-salesapp-message');
                        const strErrorCode = error.headers.get('x-salesapp-code');
                        const strLogout = error.headers.get('x-salesapp-logout');

                        let errorCode = -1;
                        let isLogout = false;

                        if (strErrorCode != null && strErrorCode.length > 0) {
                            errorCode = Number(strErrorCode);
                        }

                        if (strLogout != null && strLogout.length > 0 && Number(strLogout) === 1) {
                            isLogout = true;
                        }

                        if (error.url!.indexOf(URL_ESTOQUE_ITEM) === -1 && error.status === 400 && mes != null && mes.length > 0) {

                            console.log('message ' + mes);
                            console.log('error code ' + errorCode);
                            console.log('logout ' + isLogout);

                            const activeModal = this._modalService.open(AppRootModalAlertErrorComponent);
                            activeModal.componentInstance.modalHeader = 'ATENÇÃO - Erro ao realizar Requisição',
                                activeModal.componentInstance.modalContent = '' + mes;
                            activeModal.result.then((result) => {
                                console.log(result);
                            }, err => {
                                console.log(err);
                            });

                            if (isLogout) {
                                this._router.navigate(['login']);
                            }
                        }
                    }
                })
            );
    }
}
