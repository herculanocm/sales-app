
export class CaixaSubTipoMovDTO {
    id!: number;
    nome!: string;
    sigla!: string;
}
export class CaixaTipoMovDTO {
    id!: number;
    nome!: string;
    status!: boolean;
    caixaSubTipoMovDTO!: CaixaSubTipoMovDTO;
}
export class CaixaMovDTO {
    id!: number;
    qtd!: number;
    
    vlrDinheiro!: number;
    vlrBoleto!: number;
    vlrCheque!: number;
    vlrCartao!: number;
    vlrPix!: number;
    vlrNota!: number;
    vlrTroca!: number;
    vlrBonificacao!: number;
    vlrOutros!: number;

    referencia!: Referencia | null;

    caixaTipoMovDTO!: CaixaTipoMovDTO;
    dtaInclusao!: Date | null;
    usuarioInclusao!: string;
    usuarioCaixa!: string;
    descricao!: string;
    ativo!: boolean;
    dtaRef!: Date;
    caixaDTO_id!: number;
    ordem!: number;
}
export class CaixaDTO {
    id!: number;

    totalCheques?: number;

    dtaReferencia!: Date;

    dtaInclusao!: Date;
    usuarioInclusao!: string;

    usuarioUltAlteracao!: string;
    dtaUltAlteracao!: Date;

    descricao!: string;
    caixaMovDTOs!: CaixaMovDTO[];
    caixaResultado!: ObjCaixaResultado;
}
export class CaixaTipoAux {
    sigla!: string;
    nome!: string;
}
export class Referencia {
    tipo!: string;
    ids!: number[];
    estoque!: number;
    estoqueNome!: string;
    formato!: any;
    dtaRef!: Date;
}
export class CaixaResultado {
    ordem!: number;
    condicao!: string;
    vlrEntrada!: number;
    vlrSaida!: number;
    vlrDif!: number;
}
export class ObjCaixaResultado {
    caixaResultado!: CaixaResultado[]
}

export class PageCaixa {
    content!: CaixaDTO[];
    pageable!: any;
    last!: boolean;
    totalElements!: number;
    totalPages!: number;
    size!: number;
    numberOfElements!: number;
    first!: boolean;
}

export class CaixaPesquisaDTO {
    caixaDTO!: CaixaDTO;
    pageNumber!: number;
    pageSize!: number;
    dtaInicialPesquisa!: string;
    dtaFinalPesquisa!: string;
    constructor() {
        this.pageNumber = 0;
        this.pageSize = 20;
    }
}