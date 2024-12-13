import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AuthorityDTO, UserDTO } from '../models/usuario';

@Injectable()
export class UsuarioService {
    private _API_URL_ENDPOINT: string;
    private _usuarioUrl: string;

    constructor(private _http: HttpClient) {
        this._API_URL_ENDPOINT = sessionStorage.getItem('urlEndPointSales')!;
        this._usuarioUrl = '/api/users';
    }

    getAllAuthorities(): Observable<AuthorityDTO[]> {
        return this._http.get<AuthorityDTO[]>(this._API_URL_ENDPOINT + this._usuarioUrl + '/authorities');
    }

    getUsers(): Observable<UserDTO[]> {
        return this._http.get<UserDTO[]>(this._API_URL_ENDPOINT + this._usuarioUrl);
    }

    postGetUsers(usuario: UserDTO): Observable<UserDTO[]> {
        return this._http.post<UserDTO[]>(this._API_URL_ENDPOINT + this._usuarioUrl + '/busca', usuario);
    }

    postOrPutUser(usuario: UserDTO, status: number): Observable<UserDTO> {
        if (status === 1) {
            return this._http.post<UserDTO>(this._API_URL_ENDPOINT + this._usuarioUrl, usuario);
        } else {
            return this._http.put<UserDTO>(this._API_URL_ENDPOINT + this._usuarioUrl, usuario);
        }
    }

    delUser(id: number): Observable<string> {
        return this._http.delete<string>(this._API_URL_ENDPOINT + this._usuarioUrl);
    }

    delUserByLogin(login: string): Observable<string> {
        return this._http.delete<string>(this._API_URL_ENDPOINT + this._usuarioUrl + '/' + login);
    }
}
