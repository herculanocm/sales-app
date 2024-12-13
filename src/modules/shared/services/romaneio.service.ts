import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { StorageMap } from '@ngx-pwa/local-storage';
import { CustomHttpParamEncoder, GoogleGeometryCompleteReturn } from '@modules/clientes/encoder.utils';
import { environment } from 'environments/environment';
import { CheckVendaDTO, PageRomaneio, RepRomaneioAux, RomaneioDTO, RomaneioPesquisaDTO } from '../models/romaneio';
import { VendaDTO } from '../models/venda';

@Injectable()
export class RomaneioService {
    private _API_URL_ENDPOINT: string;
    private _url: string;
    private _urlMovRomaneio: string;
    private _GOOGLE_API_KEY: string;
    private _GOOGLE_API_URL: string;
    private encode: CustomHttpParamEncoder;
    constructor(private _http: HttpClient,
        private storage: StorageMap
        ) {
        this._API_URL_ENDPOINT = sessionStorage.getItem('urlEndPointSales')!;
        this._url = '/api/romaneios';
        this._GOOGLE_API_KEY = environment.GOOGLE_API_KEY;
        this._GOOGLE_API_URL = environment.GOOGLE_API_URL;
        this.encode = new CustomHttpParamEncoder();
        this._urlMovRomaneio = '/api/movimentos';
    }
    storageSet(chave: string, valor: any): Observable<any> {
        return this.storage.set(chave, valor);
    }
    getUrl(): Observable<object> {
        return this._http.get(this._API_URL_ENDPOINT + this._url);
    }
    find(romaneioPesquisaDTO: RomaneioPesquisaDTO): Observable<PageRomaneio> {
        return this._http.post<PageRomaneio>(this._API_URL_ENDPOINT + this._url + '/busca', romaneioPesquisaDTO);
    }
    postOrPut(romaneioDTO: RomaneioDTO, status: number): Observable<RepRomaneioAux> {
        if (status === 1) {
            romaneioDTO.historicos = { historicos: [] };
            return this._http.post<RepRomaneioAux>(
                this._API_URL_ENDPOINT + this._url,
                romaneioDTO,
            );
        } else {
            return this._http.put<RepRomaneioAux>(
                this._API_URL_ENDPOINT + this._url,
                romaneioDTO,
            );
        }
    }
    del(id: number): Observable<string> {
        return this._http.delete<string>(this._API_URL_ENDPOINT + this._url + '/' + id);
    }
    convertEndToStringURLGoogle(logradouro: string, numLogradouro: number,
        municipio: string, estado: string): string {
        let urlString = '';

        if (numLogradouro != null && numLogradouro > 0) {
            urlString += numLogradouro;
        }

        urlString += ' ' + logradouro;

        if (municipio != null && municipio.length > 0) {
            urlString += ',' + municipio;
        }

        if (estado != null && estado.length > 0) {
            urlString += ',' + estado;
        }

        urlString += '&components=country:BR';
        urlString = this.encode.encodeValue(urlString);
        urlString = this._GOOGLE_API_URL + 'address=' + urlString + '&key=' + this._GOOGLE_API_KEY;
        return urlString;
    }
    getLatLongGoogleDirect(uri: string): Observable<GoogleGeometryCompleteReturn> {
        return this._http.get<GoogleGeometryCompleteReturn>(uri);
    }
    generateMovimentoByRota(alxId: number, romaneioId: number): Observable<any> {
        const obj = {
            romaneioId: romaneioId,
            estoqueAlmoxarifadoId: alxId,
        };
        return this._http.post<any>(this._API_URL_ENDPOINT + this._urlMovRomaneio + '/romaneio-movimento', obj);
    }
    getRomaneioIdByVenda(vendaId: number, romaneioId: number): Observable<any> {
        return this._http.get<any>(this._API_URL_ENDPOINT + this._url + '/venda/' + vendaId + '/' +
        (romaneioId == null ? -1 : romaneioId));
    }
    getVendasDTOs(romaneioId: number): Observable<VendaDTO[]> {
        return this._http.get<VendaDTO[]>(this._API_URL_ENDPOINT + this._url + '/venda/atualiza/' + romaneioId);
    }
    fechaRomaneio(romaneioId: number): Observable<RepRomaneioAux> {
        return this._http.get<RepRomaneioAux>(this._API_URL_ENDPOINT + this._url + '/fechamento/' + romaneioId);
    }
    reabrirRomaneio(romaneioId: number): Observable<RepRomaneioAux> {
        return this._http.get<RepRomaneioAux>(this._API_URL_ENDPOINT + this._url + '/reabrir/' + romaneioId);
    }
    updateLatLngPreVendaEEnd(vendaId: any, enderecoId: any, lat: any, lng: any): Observable<VendaDTO> {
        const obj = {
            vendaId: vendaId,
            enderecoId,
            lat: lat,
            lng: lng
        };
        console.log(obj);
        return this._http.post<VendaDTO>(this._API_URL_ENDPOINT + this._url + '/update-lat-lng', obj);
    }

    updateRomaneioTransmitidoWebRota(romaneioId: number): Observable<any> {
        return this._http.get<any>(this._API_URL_ENDPOINT + this._url + '/transmitido-web-rota/' + romaneioId);
    }

    checkVenda(vendaId: number, romaneioId: number): Observable<CheckVendaDTO> {
        return this._http.get<CheckVendaDTO>(this._API_URL_ENDPOINT + this._url + '/check-venda/' + vendaId + '/' + romaneioId);
    }

    checkVendas(vendas: number[], romaneioId: number): Observable<CheckVendaDTO[]> {
        return this._http.post<CheckVendaDTO[]>(this._API_URL_ENDPOINT + this._url + '/check-vendas', {
            vendas: vendas,
            romaneioId: romaneioId
        });
    }

    loginWebRota(): Observable<any> {
        const obj = {
            username: "integracaoti",
            parent_username: "10734930000122",
            password: "integracaoti",
            realm: "F"
        };
        return this._http.post<any>((environment.API_WEB_ROTA + '/auth/login'), obj);
    }

    // async tokenWebRota(): Promise<Observable<any>> {
    //     let headers = new HttpHeaders();
    //     // headers = headers.set('Content-Type', 'application/json; charset=utf-8');
    //     const ret = await this.loginWebRota().toPromise();
    //     return this._http.post<any>('https://api.webrota.com.br/auth/login', null, { headers: headers });
    // }

    routePlanWebRota(plano: any, token: string): Observable<any> {
        let headers = new HttpHeaders();
        headers = headers.set('Content-Type', 'application/json; charset=utf-8');
        headers = headers.set('Authorization', ('Bearer ' + token));
        console.log(headers);
        return this._http.post<any>((environment.API_WEB_ROTA + '/import/route_plan'), plano, { headers: headers });
    }

}
