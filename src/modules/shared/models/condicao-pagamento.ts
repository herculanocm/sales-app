import { TituloTipoDTO } from "./titulo";

export class CondicaoPagamentoPesquisaDTO {

    condicaoPagamentoDTO!: CondicaoPagamentoDTO;

    dtaInclusaoInicial!: string;
    dtaInclusaoFinal!: string;

    pageNumber!: number;
    pageSize!: number;

    constructor() {
        this.pageNumber = 0;
        this.pageSize = 20;
    }
}

export class PageCondicaoPagamento {
    content!: CondicaoPagamentoDTO[];
    pageable!: any;
    last!: boolean;
    totalElements!: number;
    totalPages!: number;
    size!: number;
    numberOfElements!: number;
    first!: boolean;
}

export class CondicaoPagamentoDTO {
    id!: number;
    idAux!: number;
    nome!: string;
    tipoPagamento!: string;
    fatorReajuste!: number;
    vlrAcrescimoFixo!: number;
    carencia!: number;
    intervalo!: number;
    status!: boolean;
    geraTitulo!: boolean;
    geraComissaoRepresentante!: boolean;
    tituloTipoDTO!: TituloTipoDTO | null;
    codBancoFebraban!: number;
    numAcrescimoPerc!: number;
    roleName!: string;
}