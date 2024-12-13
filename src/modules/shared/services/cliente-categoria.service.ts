import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ClienteCategoriaDTO } from '../models/cliente';

@Injectable()
export class ClienteCategoriaService {
    private _API_URL_ENDPOINT: string;
    private _categoriaClienteUrl: string;

    constructor(private _http: HttpClient) {
        this._API_URL_ENDPOINT = sessionStorage.getItem('urlEndPointSales')!;
        this._categoriaClienteUrl = '/api/cliente-categorias';
    }

    getUrl(): Observable<object> {
        return this._http.get(this._API_URL_ENDPOINT + this._categoriaClienteUrl);
    }

    getAll(): Observable<ClienteCategoriaDTO[]> {
        return this._http.get<ClienteCategoriaDTO[]>(
            this._API_URL_ENDPOINT + this._categoriaClienteUrl);
    }

    getAllActive(): Observable<ClienteCategoriaDTO[]> {
        return this._http.get<ClienteCategoriaDTO[]>(
            this._API_URL_ENDPOINT + this._categoriaClienteUrl + '/all-active');
    }

    findByName(nome: string): Observable<ClienteCategoriaDTO[]> {
        return this._http.get<ClienteCategoriaDTO[]>(
            this._API_URL_ENDPOINT + this._categoriaClienteUrl + '/busca-nome/' + nome);
    }

    find(categoriaCliente: ClienteCategoriaDTO): Observable<ClienteCategoriaDTO[]> {
        return this._http.post<ClienteCategoriaDTO[]>(
            this._API_URL_ENDPOINT + this._categoriaClienteUrl + '/busca',
            categoriaCliente);
    }

    postOrPut(grupoCliente: ClienteCategoriaDTO, status: number): Observable<ClienteCategoriaDTO> {
        if (status === 1) {
            return this._http.post<ClienteCategoriaDTO>(
                this._API_URL_ENDPOINT + this._categoriaClienteUrl, grupoCliente);
        } else {
            return this._http.put<ClienteCategoriaDTO>(
                this._API_URL_ENDPOINT + this._categoriaClienteUrl, grupoCliente);
        }
    }

    del(id: number): Observable<string> {
        return this._http.delete<string>(this._API_URL_ENDPOINT + this._categoriaClienteUrl + '/' + id);
    }

}
