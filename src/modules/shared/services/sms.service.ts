import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { TwilioSMSBodyAux } from '../models/configuracoes';

@Injectable()
export class TwilioSMSService {
    private _API_URL_ENDPOINT: string;
    private _url: string;

    constructor(private _http: HttpClient) {
        this._API_URL_ENDPOINT = sessionStorage.getItem('urlEndPointSales')!;
        this._url = '/api/twilio';
    }
    getUrl(): Observable<object> {
        return this._http.get(this._API_URL_ENDPOINT + this._url);
    }
    sendSMS(smsBody: TwilioSMSBodyAux): Observable<any> {
        return this._http.post<any>(
            this._API_URL_ENDPOINT + this._url + '/send-sms',
            smsBody,
        );

    }
}
