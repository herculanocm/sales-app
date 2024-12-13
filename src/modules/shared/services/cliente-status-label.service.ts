import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ClienteStatusLabelDTO } from '../models/cliente';


@Injectable()
export class ClienteStatusLabelService {
    private _API_URL_ENDPOINT: string;
    private _url: string;

    constructor(private _http: HttpClient) {
        this._API_URL_ENDPOINT = sessionStorage.getItem('urlEndPointSales')!;
        this._url = '/api/cliente-status-labels';
    }

    getUrl(): Observable<object> {
        return this._http.get(this._API_URL_ENDPOINT + this._url);
    }

    getAll(): Observable<ClienteStatusLabelDTO[]> {
        return this._http.get<ClienteStatusLabelDTO[]>(this._API_URL_ENDPOINT + this._url);
    }

    getAllActive(): Observable<ClienteStatusLabelDTO[]> {
        return this._http.get<ClienteStatusLabelDTO[]>(this._API_URL_ENDPOINT + this._url + '/all-active');
    }

    findByName(nome: string): Observable<ClienteStatusLabelDTO[]> {
        return this._http.get<ClienteStatusLabelDTO[]>(
            this._API_URL_ENDPOINT + this._url + '/busca-nome/' + nome);
    }

    find(clienteStatus: ClienteStatusLabelDTO): Observable<ClienteStatusLabelDTO[]> {
        return this._http.post<ClienteStatusLabelDTO[]>(
            this._API_URL_ENDPOINT + this._url + '/busca',
            clienteStatus);
    }

    postOrPut(clienteStatus: ClienteStatusLabelDTO, status: number): Observable<ClienteStatusLabelDTO> {
        if (status === 1) {
            return this._http.post<ClienteStatusLabelDTO>(this._API_URL_ENDPOINT + this._url, clienteStatus);
        } else {
            return this._http.put<ClienteStatusLabelDTO>(this._API_URL_ENDPOINT + this._url, clienteStatus);
        }
    }

    del(id: number): Observable<string> {
        return this._http.delete<string>(this._API_URL_ENDPOINT + this._url + '/' + id);
    }
}
