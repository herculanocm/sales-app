import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { MovimentoItemAuditoriaDTO } from '../models/movimento';

@Injectable()
export class MovimentoItemAuditoriaService {
    private _API_URL_ENDPOINT: string;
    private _url: string;

    constructor(private _http: HttpClient) {
        this._API_URL_ENDPOINT = sessionStorage.getItem('urlEndPointSales')!;
        this._url = '/api/movimento-itens';
    }

    getUrl(): Observable<object> {
        return this._http.get(this._API_URL_ENDPOINT + this._url);
    }

    getAuditoriaItem(idEstoqueAlmoxarifado: number,
        idItem: number
        , dtaInicial: string, dtaFinal: string, movTipoId: number | null): Observable<MovimentoItemAuditoriaDTO[]> {
            let urlWithOptions = '?idEstoqueAlmoxarifado=' + idEstoqueAlmoxarifado
            + '&dtaInicial=' + dtaInicial + '&dtaFinal=' + dtaFinal + '&movTipoId=' + (movTipoId !== null && movTipoId > 0 ? movTipoId : -1);
            if (idItem != null && idItem > 0) {
                urlWithOptions += '&idItem=' + idItem;
            }

        return this._http.get<MovimentoItemAuditoriaDTO[]>(this._API_URL_ENDPOINT + this._url + '/auditoria' + urlWithOptions);
    }

    postAuditoriaItem(movimentoItemAuditoriaDTO: MovimentoItemAuditoriaDTO): Observable<MovimentoItemAuditoriaDTO> {
        return this._http.post<MovimentoItemAuditoriaDTO>(this._API_URL_ENDPOINT + this._url
            + '/atualizacao-preco', movimentoItemAuditoriaDTO);
    }
}
