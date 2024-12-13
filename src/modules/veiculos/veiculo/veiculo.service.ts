import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { VeiculoDTO } from './veiculo';

@Injectable()
export class VeiculoService {
    private _API_URL_ENDPOINT: string;
    private _url: string;

    constructor(private _http: HttpClient) {
        this._API_URL_ENDPOINT = sessionStorage.getItem('urlEndPointSales')!;
        this._url = '/api/veiculos';
    }

    getAll(): Observable<VeiculoDTO[]> {
        return this._http.get<VeiculoDTO[]>(this._API_URL_ENDPOINT + this._url);
    }

    postOrPut(veiculo: VeiculoDTO, status: number): Observable<VeiculoDTO> {
        if (status === 1) {
            return this._http.post<VeiculoDTO>(this._API_URL_ENDPOINT + this._url, veiculo);
        } else {
            return this._http.put<VeiculoDTO>(this._API_URL_ENDPOINT + this._url, veiculo);
        }
    }

    del(id: number): Observable<string> {
        return this._http.delete<string>(this._API_URL_ENDPOINT + this._url + '/' + id);
    }

    getAllActive(): Observable<VeiculoDTO[]> {
        return this._http.get<VeiculoDTO[]>(this._API_URL_ENDPOINT + this._url + '/all-active');
    }

    findByName(nome: string): Observable<VeiculoDTO[]> {
        return this._http.get<VeiculoDTO[]>(
            this._API_URL_ENDPOINT + this._url + '/busca-nome/' + nome);
    }

    find(veiculo: VeiculoDTO): Observable<VeiculoDTO[]> {
        return this._http.post<VeiculoDTO[]>(
            this._API_URL_ENDPOINT + this._url + '/busca',
            veiculo);
    }
}
