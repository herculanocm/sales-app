import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { CurrentUserSalesAppAux } from './app.utils';
import { environment } from '../environments/environment';

@Injectable()
export class AppService {
    private _API_URL_ENDPOINT: string;
    private _API_URL_ENDPOINT_NODEJS: string;
    private _url: string;

    constructor(private _http: HttpClient) {
        this._API_URL_ENDPOINT = sessionStorage.getItem('urlEndPointSales')!;
        this._API_URL_ENDPOINT_NODEJS = sessionStorage.getItem('urlEndPointNodejs')!;
        this._url = '';
    }

    getUrl(): Observable<object> {
        return this._http.get(this._API_URL_ENDPOINT + this._url);
    }

    removeTodosSessionStorage(): void {
        sessionStorage.removeItem('currentUserSalesApp');
        sessionStorage.removeItem('urlEndPointSales');
        sessionStorage.removeItem('urlEndPointNodejs');
    }

    removeTodosLocalStorage(): void {
        localStorage.removeItem('currentUserSalesApp');
        localStorage.removeItem('urlEndPointSales');
        localStorage.removeItem('urlEndPointNodejs');
    }

    sendPosition(data: any): Observable<any> {
        if (this._API_URL_ENDPOINT_NODEJS == null) {
            this._API_URL_ENDPOINT_NODEJS = environment.API_ENDPOINT_NODEJS;
        }
        return this._http.post(this._API_URL_ENDPOINT_NODEJS + '/api/site/send-location', data);
    }

    sendUserNavigation(data: any): Observable<any> {
        if (this._API_URL_ENDPOINT_NODEJS == null) {
            this._API_URL_ENDPOINT_NODEJS = environment.API_ENDPOINT_NODEJS;
        }
        return this._http.post(this._API_URL_ENDPOINT_NODEJS + '/api/site/user-navigation', data);
    }

    isLoggedAndConfigsSession(): boolean {
        let isLoggedAndConfigs = false;
        const currentUserSalesApp: CurrentUserSalesAppAux = JSON.parse(sessionStorage.getItem('currentUserSalesApp')!);

        if (currentUserSalesApp != null &&
            currentUserSalesApp.token != null && currentUserSalesApp.token.length > 0 &&
            currentUserSalesApp.user != null &&
            sessionStorage.getItem('urlEndPointSales') &&
            sessionStorage.getItem('urlEndPointNodejs')) {
            isLoggedAndConfigs = true;
        }

        return isLoggedAndConfigs;
    }

    isLoggedAndConfigsLocal(): boolean {
        let isLoggedAndConfigs = false;
        const currentUserSalesApp: CurrentUserSalesAppAux = JSON.parse(localStorage.getItem('currentUserSalesApp')!);
        if (currentUserSalesApp != null &&
            currentUserSalesApp.token != null && currentUserSalesApp.token.length > 0 &&
            currentUserSalesApp.user != null &&
            localStorage.getItem('urlEndPointSales') &&
            localStorage.getItem('urlEndPointNodejs')) {
            isLoggedAndConfigs = true;
        }
        return isLoggedAndConfigs;
    }

    localParaSession(): void {

        const currentUserSalesApp = localStorage.getItem('currentUserSalesApp')!;
        const urlEndPointSales = localStorage.getItem('urlEndPointSales')!;
        const urlEndPointNodejs = localStorage.getItem('urlEndPointNodejs')!;

        this.removeTodosSessionStorage();

        sessionStorage.setItem(
            'currentUserSalesApp',
            currentUserSalesApp,
        );

        sessionStorage.setItem(
            'urlEndPointSales',
            urlEndPointSales,
        );

        sessionStorage.setItem(
            'urlEndPointNodejs',
            urlEndPointNodejs,
        );
    }

    sessionParaLocal(): void {

        const currentUserSalesApp = sessionStorage.getItem('currentUserSalesApp')!;
        const urlEndPointSales = sessionStorage.getItem('urlEndPointSales')!;
        const urlEndPointNodejs = sessionStorage.getItem('urlEndPointNodejs')!;

        this.removeTodosSessionStorage();

        localStorage.setItem(
            'currentUserSalesApp',
            currentUserSalesApp,
        );

        localStorage.setItem(
            'urlEndPointSales',
            urlEndPointSales,
        );

        localStorage.setItem(
            'urlEndPointNodejs',
            urlEndPointNodejs,
        );
    }
}
