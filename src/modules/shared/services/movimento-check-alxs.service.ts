import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ItemAlxs, ProcuraItemAlxs } from '../models/movimento';


@Injectable()
export class MovimentoCheckAlxsService {
    private _API_URL_ENDPOINT: string;

    constructor(private _http: HttpClient) {
        this._API_URL_ENDPOINT = sessionStorage.getItem('urlEndPointSales')!;
    }
    getCheckAlx(procura: ProcuraItemAlxs): Observable<ItemAlxs[]> {
        return this._http.get<ItemAlxs[]>(this._API_URL_ENDPOINT + '/api/itens/estoques/checklist/'
            + procura.idAlx1 + '/' + procura.idAlx2 + '/' +
            (procura.itemNome == null || procura.itemNome.length === 0 ? '-1' : procura.itemNome));
    }
}
