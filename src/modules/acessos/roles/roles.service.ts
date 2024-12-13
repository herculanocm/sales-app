import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AuthorityDTO } from './authorities';

@Injectable()
export class RolesService {
    private _API_URL_ENDPOINT: string;
    private _url: string;
    private _urlAuth: string;

    constructor(private _http: HttpClient) {
        this._API_URL_ENDPOINT = sessionStorage.getItem('urlEndPointSales')!;
        this._url = '/api/users';
        this._urlAuth = '/api/authority';
    }

    getAllAuthorities(): Observable<AuthorityDTO[]> {
        return this._http.get<AuthorityDTO[]>(this._API_URL_ENDPOINT + this._url + '/authorities');
    }

    salvaAuthority(authorityDTO: AuthorityDTO): Observable<AuthorityDTO> {
        return this._http.post<AuthorityDTO>(this._API_URL_ENDPOINT + this._urlAuth, authorityDTO);
    }

    atualizaAuthority(authorityDTO: AuthorityDTO): Observable<AuthorityDTO> {
        return this._http.put<AuthorityDTO>(this._API_URL_ENDPOINT + this._urlAuth, authorityDTO);
    }

    salvaOuAtualizaAuthority(authorityDTO: AuthorityDTO, statusForm: number): Observable<AuthorityDTO> {
        if (statusForm === 1) {
            return this.salvaAuthority(authorityDTO);
        } else {
            return this.atualizaAuthority(authorityDTO);
        }
    }

    deleteAuthority(authorityName: string): Observable<string> {
        return this._http.delete<string>(this._API_URL_ENDPOINT + this._urlAuth + '/' + authorityName);
    }
}
