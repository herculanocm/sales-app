import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ItemAlxDescontoDTO, ItemAlxPrecoDTO, ItemAlxPrecoEstoqueRetDTO, ItemAlxVendDescontoDTO, ItemDTO, ItemFornecedorPadraoDTO, ItemImagemDTO, ItemNivelDTO, ItemPesquisaDTO, ItemPredioDTO, ItemResumoDTO, ItemRuaDTO, ItemSeparadorDTO, PageItem } from '../models/item';
import { FuncionarioDTO } from '../models/funcionario';

@Injectable()
export class ItemService {
    private _API_URL_ENDPOINT: string;
    private _API_URL_ENDPOINT_NODEJS: string;
    private _url: string;
    private _urlItemRuas: string;
    private _url_nodejs_find_item_nome: string;

    constructor(private _http: HttpClient) {
        this._API_URL_ENDPOINT = sessionStorage.getItem('urlEndPointSales')!;
        this._API_URL_ENDPOINT_NODEJS = sessionStorage.getItem('urlEndPointNodejs')!;
        this._url = '/api/itens';
        this._urlItemRuas = '/api/item-ruas';
        this._url_nodejs_find_item_nome = '/api/itens/nome';
    }

    getUrl(): Observable<object> {
        return this._http.get(this._API_URL_ENDPOINT + this._url);
    }
    getAll(): Observable<ItemDTO[]> {
        return this._http.get<ItemDTO[]>(this._API_URL_ENDPOINT + this._url);
    }

    find(itemPesquisaDTO: ItemPesquisaDTO): Observable<PageItem> {
        return this._http.post<PageItem>(this._API_URL_ENDPOINT + this._url + '/busca', itemPesquisaDTO);
    }

    findRuas(rua: ItemRuaDTO): Observable<ItemRuaDTO[]> {
        return this._http.get<ItemRuaDTO[]>(this._API_URL_ENDPOINT + '/api/item-ruas');
    }

    findSeparadores(separador: ItemSeparadorDTO): Observable<ItemSeparadorDTO[]> {
        return this._http.get<ItemSeparadorDTO[]>(this._API_URL_ENDPOINT + '/api/item-separadors');
    }

    findNivels(nivel: ItemNivelDTO): Observable<ItemNivelDTO[]> {
        return this._http.get<ItemNivelDTO[]>(this._API_URL_ENDPOINT + '/api/item-nivels');
    }

    findPredios(predio: ItemPredioDTO): Observable<ItemPredioDTO[]> {
        return this._http.get<ItemPredioDTO[]>(this._API_URL_ENDPOINT + '/api/item-predios');
    }

    postOrPutRuas(rua: ItemRuaDTO, status: number): Observable<ItemRuaDTO> {
        if (status === 1) {
            return this._http.post<ItemRuaDTO>(
                this._API_URL_ENDPOINT + '/api/item-ruas',
                rua,
            );
        } else {
            return this._http.put<ItemRuaDTO>(
                this._API_URL_ENDPOINT + '/api/item-ruas',
                rua,
            );
        }
    }

    postOrPutSeparadores(separador: ItemSeparadorDTO, status: number): Observable<ItemSeparadorDTO> {
        if (status === 1) {
            return this._http.post<ItemSeparadorDTO>(
                this._API_URL_ENDPOINT + '/api/item-separadors',
                separador,
            );
        } else {
            return this._http.put<ItemSeparadorDTO>(
                this._API_URL_ENDPOINT + '/api/item-separadors',
                separador,
            );
        }
    }

    postOrPutNivel(nivel: ItemNivelDTO, status: number): Observable<ItemNivelDTO> {
        if (status === 1) {
            return this._http.post<ItemNivelDTO>(
                this._API_URL_ENDPOINT + '/api/item-nivels',
                nivel,
            );
        } else {
            return this._http.put<ItemNivelDTO>(
                this._API_URL_ENDPOINT + '/api/item-nivels',
                nivel,
            );
        }
    }

    postOrPutPredio(predio: ItemPredioDTO, status: number): Observable<ItemPredioDTO> {
        if (status === 1) {
            return this._http.post<ItemPredioDTO>(
                this._API_URL_ENDPOINT + '/api/item-predios',
                predio,
            );
        } else {
            return this._http.put<ItemPredioDTO>(
                this._API_URL_ENDPOINT + '/api/item-predios',
                predio,
            );
        }
    }

    delRua(id: number): Observable<any> {
        return this._http.delete<any>(this._API_URL_ENDPOINT + '/api/item-ruas/' + id);
    }

    delSeparador(id: number): Observable<any> {
        return this._http.delete<any>(this._API_URL_ENDPOINT + '/api/item-separadors/' + id);
    }

    delNivel(id: number): Observable<any> {
        return this._http.delete<any>(this._API_URL_ENDPOINT + '/api/item-nivels/' + id);
    }

    delPredio(id: number): Observable<any> {
        return this._http.delete<any>(this._API_URL_ENDPOINT + '/api/item-predios/' + id);
    }

    findByName(nome: string): Observable<ItemRuaDTO[]> {
        return this._http.get<ItemDTO[]>(this._API_URL_ENDPOINT + this._url + '/busca-nome/' + nome);
    }

    nodejsFindByName(nome: string): Observable<ItemResumoDTO[]> {
        return this._http.get<ItemDTO[]>(this._API_URL_ENDPOINT_NODEJS + this._url_nodejs_find_item_nome + '/' + nome);
    }

    getItemRuas(): Observable<ItemRuaDTO[]> {
        return this._http.get<ItemRuaDTO[]>(this._API_URL_ENDPOINT + this._urlItemRuas);
    }

    getItemSeparadores(): Observable<ItemSeparadorDTO[]> {
        return this._http.get<ItemSeparadorDTO[]>(this._API_URL_ENDPOINT + '/api/item-separadors');
    }

    getItemSaldoEstoque(idEstoqueAlmoxarifado: number, idItem: number): Observable<any> {
        return this._http.get<any>(this._API_URL_ENDPOINT + this._url + '/estoques/' + idEstoqueAlmoxarifado + '/' + idItem);
    }

    findById(id: number): Observable<ItemDTO> {
        return this._http.get<ItemDTO>(this._API_URL_ENDPOINT + this._url + '/' + id);
    }

    findByIdAux(idAux: number): Observable<ItemDTO[]> {
        return this._http.get<ItemDTO[]>(this._API_URL_ENDPOINT + this._url + '/idaux/' + idAux);
    }

    postImagens(itemImageDTOs: ItemImagemDTO[]): Observable<ItemImagemDTO[]> {
        return this._http.post<ItemImagemDTO[]>(this._API_URL_ENDPOINT + this._url + '/imagens', itemImageDTOs);
    }

    getImagens(idItem: number): Observable<ItemImagemDTO[]> {
        // return this._http.get<ItemImagemDTO[]>(this._API_URL_ENDPOINT + this._url + '/imagem/' + idItem);
        return this._http.get<ItemImagemDTO[]>(this._API_URL_ENDPOINT_NODEJS + '/api/itens/imagens/' + idItem);
    }

    postImagem(itemImageDTO: ItemImagemDTO): Observable<ItemImagemDTO> {
        return this._http.post<ItemImagemDTO>(this._API_URL_ENDPOINT + this._url + '/imagem', itemImageDTO);
    }

    delImagem(idImagem: number): Observable<any> {
        return this._http.delete<any>(this._API_URL_ENDPOINT + this._url + '/imagem/' + idImagem);
    }

    postOrPut(itemDTO: ItemDTO, status: number): Observable<ItemDTO> {
        if (status === 1) {
            return this._http.post<ItemDTO>(
                this._API_URL_ENDPOINT + this._url,
                itemDTO,
            );
        } else {
            return this._http.put<ItemDTO>(
                this._API_URL_ENDPOINT + this._url,
                itemDTO,
            );
        }
    }

    del(id: number): Observable<string> {
        return this._http.delete<string>(this._API_URL_ENDPOINT + this._url + '/' + id);
    }

    getAllItemAlxPrecos(itemId: number): Observable<ItemAlxPrecoDTO[]> {
        return this._http.get<ItemAlxPrecoDTO[]>(this._API_URL_ENDPOINT + '/api/item-alx-preco/' + itemId);
    }
    saveItemAlxPrecos(itemAlxPrecoDTO: ItemAlxPrecoDTO): Observable<ItemAlxPrecoDTO> {
        return this._http.post<ItemAlxPrecoDTO>(this._API_URL_ENDPOINT + '/api/item-alx-preco', itemAlxPrecoDTO);
    }
    deleteItemAlxPrecos(itemid: number): Observable<any> {
        return this._http.delete<any>(this._API_URL_ENDPOINT + '/api/item-alx-preco/' + itemid);
    }

    getAllItemAlxDescontos(itemId: number): Observable<ItemAlxDescontoDTO[]> {
        return this._http.get<ItemAlxDescontoDTO[]>(this._API_URL_ENDPOINT + '/api/item-alx-desconto/' + itemId);
    }
    saveItemAlxDesconto(itemAlxDescontoDTO: ItemAlxDescontoDTO): Observable<ItemAlxDescontoDTO> {
        return this._http.post<ItemAlxDescontoDTO>(this._API_URL_ENDPOINT + '/api/item-alx-desconto', itemAlxDescontoDTO);
    }
    saveItemAlxVendDesconto(itemAlxVendDescontoDTO: ItemAlxVendDescontoDTO): Observable<ItemAlxVendDescontoDTO> {
        return this._http.post<ItemAlxVendDescontoDTO>(this._API_URL_ENDPOINT + '/api/item-alx-vend-desconto', itemAlxVendDescontoDTO);
    }
    getItemAlxVendDescontos(itemId: number): Observable<ItemAlxVendDescontoDTO[]> {
        return this._http.get<ItemAlxVendDescontoDTO[]>(this._API_URL_ENDPOINT + '/api/item-alx-vend-desconto/' + itemId);
    }
    deleteItemAlxVendDesconto(itemid: number): Observable<any> {
        return this._http.delete<any>(this._API_URL_ENDPOINT + '/api/item-alx-vend-desconto/' + itemid);
    }
    deleteItemAlxDesconto(itemid: number): Observable<any> {
        return this._http.delete<any>(this._API_URL_ENDPOINT + '/api/item-alx-desconto/' + itemid);
    }

    getPrecoByItemIdAndEstoqueId(itemId: number, estoqueAlmoxarifadoId: number): Observable<ItemAlxPrecoDTO> {
        return this._http.get<ItemAlxPrecoDTO>(this._API_URL_ENDPOINT + '/api/item-alx-preco/' + itemId + '/' + estoqueAlmoxarifadoId);
    }

    getItemAlxPrecoEstoque(itemId: number, estoqueAlmoxarifadoId: number): Observable<ItemAlxPrecoEstoqueRetDTO> {
        return this._http.get<ItemAlxPrecoEstoqueRetDTO>(this._API_URL_ENDPOINT + '/api/item-alx-preco-estoque/' + itemId + '/' + estoqueAlmoxarifadoId);
    }

    getDescontosByItemIdAndEstoqueId(itemId: number, estoqueAlmoxarifadoId: number): Observable<ItemAlxDescontoDTO[]> {
        return this._http.get<ItemAlxDescontoDTO[]>(this._API_URL_ENDPOINT + '/api/item-alx-desconto/' + itemId + '/' + estoqueAlmoxarifadoId);
    }
    getDescontosByItemIdAndEstoqueIdAndVendedorId(itemId: number, estoqueAlmoxarifadoId: number, vendedorId: number): Observable<ItemAlxVendDescontoDTO[]> {
        return this._http.get<ItemAlxVendDescontoDTO[]>(this._API_URL_ENDPOINT + '/api/item-alx-vend-desconto/' + itemId + '/' + estoqueAlmoxarifadoId + '/' + vendedorId);
    }
    getAllActiveVendedor(): Observable<FuncionarioDTO[]> {
        return this._http.get<FuncionarioDTO[]>(
            this._API_URL_ENDPOINT + '/api/funcionarios' + '/all-active/vendedores');
    }

    postOrPutItemFornecedorPadrao(itemFornecedorPadraoDTO: ItemFornecedorPadraoDTO, status: number): Observable<ItemFornecedorPadraoDTO> {
        if (status === 1) {
            return this._http.post<ItemFornecedorPadraoDTO>(
                this._API_URL_ENDPOINT + '/api/item-fornecedor-padrao',
                itemFornecedorPadraoDTO,
            );
        } else {
            return this._http.put<ItemFornecedorPadraoDTO>(
                this._API_URL_ENDPOINT + '/api/item-fornecedor-padrao',
                itemFornecedorPadraoDTO,
            );
        }
    }

    getItemFornecedorPadrao(itemId: number): Observable<ItemFornecedorPadraoDTO> {
        return this._http.get<ItemFornecedorPadraoDTO>(this._API_URL_ENDPOINT + '/api/item-fornecedor-padrao/' + itemId);
    }

    getAllItemFornecedorPadrao(): Observable<ItemFornecedorPadraoDTO[]> {
        return this._http.get<ItemFornecedorPadraoDTO[]>(this._API_URL_ENDPOINT + '/api/item-fornecedor-padrao');
    }

    getAllItemFornecedorActivePadrao(): Observable<ItemFornecedorPadraoDTO[]> {
        return this._http.get<ItemFornecedorPadraoDTO[]>(this._API_URL_ENDPOINT + '/api/item-fornecedor-padrao/active');
    }

    deleteItemFornecedorPadrao(itemId: number | null): Observable<any> {
        return this._http.delete<any>(this._API_URL_ENDPOINT + '/api/item-fornecedor-padrao/' + itemId);
    }
}
