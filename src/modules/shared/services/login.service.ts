import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { timeout } from 'rxjs/operators';
import { environment } from 'environments/environment';


@Injectable()
export class LoginService {
    private _urlUtils = '/api/utils/data-atual';

    constructor(private _httpClient: HttpClient) {
        this._urlUtils = '/api/utils/data-atual';
    }

    clearStorages(): void {
        localStorage.clear();
        sessionStorage.clear();
    }

    getDataAtualServidorLocal(): Observable<any> {
        const time = 1000;
        return this._httpClient.get<any>(environment.API_ENDPOINT_LOCAL + this._urlUtils)
            .pipe(
                timeout(2000)
            );
    }

    setUrlEndPointSales2(): void {
        sessionStorage.removeItem('urlEndPointSales');
        sessionStorage.removeItem('urlEndPointNodejs');
        sessionStorage.removeItem('urlEndPointAirflow');
        localStorage.removeItem('urlEndPointSales');
        localStorage.removeItem('urlEndPointNodejs');
        localStorage.removeItem('urlEndPointAirflow');
        localStorage.clear();
        sessionStorage.clear();

        sessionStorage.setItem(
            'urlEndPointSales',
            environment.API_ENDPOINT2
        );
        sessionStorage.setItem(
            'urlEndPointNodejs',
            environment.API_ENDPOINT_NODEJS2
        );
        sessionStorage.setItem(
            'urlEndPointAirflow',
            environment.API_ENDPOINT_AIRFLOW
        );

        localStorage.setItem(
            'urlEndPointSales',
            environment.API_ENDPOINT2
        );
        localStorage.setItem(
            'urlEndPointNodejs',
            environment.API_ENDPOINT_NODEJS2
        );
        localStorage.setItem(
            'urlEndPointAirflow',
            environment.API_ENDPOINT_AIRFLOW
        );
    }

    logout(): void {
        console.log('logout');
        sessionStorage.removeItem('currentUserSalesApp');
        localStorage.removeItem('currentUserSalesApp');
    }

    setUrlEndPointSales(): void {

        sessionStorage.removeItem('urlEndPointSales');
        sessionStorage.removeItem('urlEndPointNodejs');

        localStorage.removeItem('urlEndPointSales');
        localStorage.removeItem('urlEndPointNodejs');
  
        sessionStorage.setItem(
            'urlEndPointSales',
            environment.API_ENDPOINT
        );
        sessionStorage.setItem(
            'urlEndPointNodejs',
            environment.API_ENDPOINT_NODEJS
        );
       

        localStorage.setItem(
            'urlEndPointSales',
            environment.API_ENDPOINT
        );
        localStorage.setItem(
            'urlEndPointNodejs',
            environment.API_ENDPOINT_NODEJS
        );
    }

    login(username: string, password: string): Observable<object> {
        return this._httpClient.post(
            sessionStorage.getItem('urlEndPointSales') + '/api/authenticate',
            JSON.stringify(
                {
                    username: username,
                    password: password,
                },
            ),
        );
    }

    getFuncionarioByUsuario(id: number): Observable<object> {
        return this._httpClient.get(sessionStorage.getItem('urlEndPointSales') + '/api/funcionarios/' + id);
    }

    isNeededChangePass(id: number): Observable<any> {
        return this._httpClient.get<any>(sessionStorage.getItem('urlEndPointSales') + '/api/users/needed-reset/' + id);
    }
}
