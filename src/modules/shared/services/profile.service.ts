import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Profile } from '@modules/pages/models/profile';

@Injectable()
export class ProfileService {
    private _API_URL_ENDPOINT?: string = '';
    private _profileUrl: string;
    private _accountUrl: string;

    constructor(private _httpClient: HttpClient) {
        this._API_URL_ENDPOINT = sessionStorage.getItem('urlEndPointSales')!;
        this._profileUrl = '/api/user/profile';
        this._accountUrl = '/api/account/change-password';
    }
    salvaProfile(user: Profile): Observable<Profile> {
        user.authorities = ['ROLE_USER'];
        return this._httpClient.put<Profile>(this._API_URL_ENDPOINT + this._profileUrl, user);
    }
    enviaImg(file: any): Observable<any> {
        return this._httpClient.post(this._API_URL_ENDPOINT + this._profileUrl + '/img', file);
    }
    getURL(): string {
        return (this._API_URL_ENDPOINT + this._profileUrl);
    }
    resetaPassword(password: string | null): Observable<any> {
        return this._httpClient.post<any>(this._API_URL_ENDPOINT + this._accountUrl, { password: password });
    }
}
