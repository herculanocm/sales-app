import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ClientePcCliente, CondicaoPcplgpag, ItemAlxPreco, ItemPcProdut, PcFilial, RespAuxIntCliente, RespAuxIntCondicao, RespAuxIntItem, RespAuxTransfVendas, VendaIntPesquisa, VendaIntTotvs, VendaIntTransfObjTotvs } from '@modules/shared/models/totvs';

@Injectable()
export class TotvsService {
    private _API_URL_ENDPOINT: string;
    private _url: string;

    constructor(private _http: HttpClient) {
        this._API_URL_ENDPOINT = sessionStorage.getItem('urlEndPointSales')!;
        this._url = '/api/sales-totvs-integration';
    }
    getClientePcClientes(): Observable<ClientePcCliente[]> {
        return this._http.get<ClientePcCliente[]>(this._API_URL_ENDPOINT + this._url + '/clientes');
    }
    getAllPcFilials(): Observable<PcFilial[]> {
        return this._http.get<PcFilial[]>(this._API_URL_ENDPOINT + this._url + '/filiais');
    }
    getItemPcProdut(): Observable<ItemPcProdut[]> {
        return this._http.get<ItemPcProdut[]>(this._API_URL_ENDPOINT + this._url + '/itens');
    }
    getCondicaoPcplgpag(): Observable<CondicaoPcplgpag[]> {
        return this._http.get<CondicaoPcplgpag[]>(this._API_URL_ENDPOINT + this._url + '/condicoes');
    }
    updateClientes(): Observable<RespAuxIntCliente> {
        return this._http.get<RespAuxIntCliente>(this._API_URL_ENDPOINT + this._url + '/update-clientes');
    }
    updateItens(): Observable<RespAuxIntItem> {
        return this._http.get<RespAuxIntItem>(this._API_URL_ENDPOINT + this._url + '/update-itens');
    }
    updateCondicoes(): Observable<RespAuxIntCondicao> {
        return this._http.get<RespAuxIntCondicao>(this._API_URL_ENDPOINT + this._url + '/update-condicoes');
    }

    findClienteByNameResumo(nome: string): Observable<any[]> {
        return this._http.get<any[]>(this._API_URL_ENDPOINT + '/api/clientes' + '/busca-nome-resumo/' + nome);
    }

    findVendasIntAux(vip: VendaIntPesquisa): Observable<VendaIntTotvs[]> {
        return this._http.post<VendaIntTotvs[]>(this._API_URL_ENDPOINT + this._url + '/busca-vendas', vip);
    }
    transferVendas(vi: VendaIntTransfObjTotvs): Observable<RespAuxTransfVendas> {
        return this._http.post<RespAuxTransfVendas>(this._API_URL_ENDPOINT + this._url + '/transfer-vendas', vi);
    }

    fetchItensPrecos(etId: number): Observable<ItemAlxPreco[]> {
        return this._http.get<ItemAlxPreco[]>(this._API_URL_ENDPOINT + '/api/item-alx-preco/items/' + etId);
    }
    postItensPrecosWinthor(items: ItemAlxPreco[]): Observable<any> {
        return this._http.post<any>(this._API_URL_ENDPOINT + '/api/item-alx-preco/items', items);
    }
}
