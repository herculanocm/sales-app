export class ItemPrecoDTO {
    id!: number;
    dtaInclusao!: Date;
    dtaIniValidade!: Date;
    usuarioInclusao!: string;
    preco!: number;
    flAtual!: boolean;
    itemDTO_id!: number | null;

    constructor() {
        this.preco = 0;
    }
}
export class ItemUnidadeDTO {
    id!: number;
    nome!: string;
    sigla!: string;
    descricao!: string;
    fator!: number;
    status!: boolean;
}
export class ItemImagemDTO {
    id!: number;
    imgBase64!: string | null;
    extencao!: string;
    fileType!: string;
    fileName!: string;
    srcImg!: string;
    itemDTO_id!: number;
}
export interface ItemFornecedorPadraoDTO {
    id: number | null;
    nome: string | null;
    status: boolean | null;
}
export class ItemSubCategoriaDTO {
    id!: number;
    nome!: string;
    descricao!: string;
    status!: boolean;
    itemCategoriaDTO!: ItemCategoriaDTO | null;
}

export class ItemCategoriaDTO {
    id!: number;
    nome!: string;
    descricao!: string;
    status!: boolean;
}

export class EstoqueAlmoxarifadoDTO {
    id!: number;
    idAux!: number;
    nome!: string;
    sigla!: string;
    status!: boolean;
    apareceVendas!: boolean;
    roleAcesso!: string;
    permiteRomaneioDiferente!: boolean;
    constructor(id?: number) {
        if (id) {
            this.id = id;
        }
        this.apareceVendas = false;
        this.permiteRomaneioDiferente = false;
        this.status = true;
    }
}

export class ItemAlxPrecoDTO {
    id!: number;
    dtaInclusao!: Date;
    usuarioInclusao!: string;
    vlr!: number;
    estoqueAlmoxarifadoDTO_id!: number | null;
    itemDTO_id!: number | null;
    estoqueAlmoxarifadoDTO!: EstoqueAlmoxarifadoDTO | null;
}
export interface ItemAlxPrecoEstoqueRetDTO {
    vlr: number;
    estoqueAlmoxarifadoDTO_id: number;
    itemDTO_id: number;
    estoqueAlmoxarifadoDTO: EstoqueAlmoxarifadoDTO;
    qtdDisponivel: number;
}
export class ItemAlxDescontoDTO {
    id!: number;
    dtaInclusao!: Date;
    usuarioInclusao!: string;

    percDesc!: number;
    itemUnidadeDTO!: ItemUnidadeDTO;
    itemUnidadeDTO_id!: number;
    fatorUnidadeOriginal!: number;
    qtd!: number;
    qtdConvertido!: number;
    estoqueAlmoxarifadoDTO_id!: number;
    itemDTO_id!: number;
    estoqueAlmoxarifadoDTO!: EstoqueAlmoxarifadoDTO | null;
    flAtivo!: boolean;
    dtaValidade!: Date;
}
export class ItemAlxVendDescontoDTO {
    id!: number;
    dtaInclusao!: Date;
    usuarioInclusao!: string;

    percDesc!: number;
    itemUnidadeDTO!: ItemUnidadeDTO;
    itemUnidadeDTO_id!: number;
    fatorUnidadeOriginal!: number;
    qtd!: number;
    qtdConvertido!: number;
    estoqueAlmoxarifadoDTO_id!: number;
    itemDTO_id!: number;
    estoqueAlmoxarifadoDTO!: EstoqueAlmoxarifadoDTO;
    flAtivo!: boolean;
    vendedorId!: number;
    dtaValidade!: Date;
}


export class ItemRuaDTO {
    id!: number;
    nome!: string;
}

export class ItemSeparadorDTO {
    id!: number;
    nome!: string;
}




export class ItemGrupoDTO {
    id!: number;
    nome!: string;
    descricao!: string;
    status!: boolean;
    percMaxDesc!: number;
}

export class ItemDescontoQtdDTO {
    id!: number | null;
    dtaInclusao!: Date;
    usuarioInclusao!: string;
    dtaIniValidade!: Date;
    percDesc!: number;
    itemUnidadeDTO!: ItemUnidadeDTO | null;
    fatorUnidadeOriginal!: number;
    qtd!: number;
    qtdConvertido!: number;
    itemDTO_id!: number;
    flAtivo!: boolean;

    // Uso no cliente
    precoProposto!: number;

    constructor() {
        this.itemUnidadeDTO = null;
        this.precoProposto = 0;
    }
}
export class ItemNivelDTO {
    id!: number;
    nome!: string;
}

export class ItemPredioDTO {
    id!: number;
    nome!: string;
}

export class ItemMarcaDTO {
    id!: number;
    nome!: string;
    descricao!: string;
    status!: boolean;
}

export class ItemDTO {
    id!: number;
    idAux!: number;
    codigoBarras!: string;
    nome!: string;
    descricao!: string;
    dtaInclusao!: Date;
    usuarioInclusao!: string;
    dtaUltAlteracao!: Date;
    usuarioUltAlteracao!: string;
    percMaxDesc!: number;
    percMarkup!: number;

    itemPrecoDTOs!: ItemPrecoDTO[];
    itemDescontoQtdDTOs!: ItemDescontoQtdDTO[];
    itemImagemDTOs!: ItemImagemDTO[];
    itemUnidadeDTOs!: ItemUnidadeDTO[];
    itemGrupoDTOs!: ItemGrupoDTO[];

    itemMarcaDTO!: ItemMarcaDTO | null;
    itemSubCategoriaDTO!: ItemSubCategoriaDTO | null;
    itemRuaDTO!: ItemRuaDTO | null;
    itemSeparadorDTO!: ItemSeparadorDTO | null;
    itemNivelDTO!: ItemNivelDTO | null;
    itemPredioDTO!: ItemPredioDTO | null;
    itemFornecedorPadraoDTO!: ItemFornecedorPadraoDTO | null;

    minEstoqueAceitavelUN!: number | null;
    monitoraEstoqueAceitavelUN!: boolean | null;


    vendaBloqueada!: boolean;
    movimentoBloqueado!: boolean;
    comodato!: boolean;

    qtdEntrada!: number;
    qtdSaida!: number;

    estoqueAlmoxarifadoId!: number; // usado nas vendas

    qtdSaldo!: number; // já calculado saida - entrada
    qtdComprometido!: number; // item compromeitdos de pedidos não faturados
    qtdDisponivel!: number; // qtdSaldo - qtdComprometido

    precoAtual!: ItemPrecoDTO;

    itemAlxVendDescontoDTOs!: ItemAlxVendDescontoDTO[];
    itemAlxDescontoDTOs!: ItemAlxDescontoDTO[];
    itemAlxPrecoDTO!: ItemAlxPrecoDTO;

    /*
    Campos para calculo de venda
    */
    qtd!: number;
    vlr!: number;
    vlrTotal!: number;

    constructor() {
        this.vendaBloqueada = false;
        this.movimentoBloqueado = false;
        this.comodato = false;
        this.qtdSaldo = 0;
        this.qtdComprometido = 0;
        this.qtdDisponivel = 0;

        this.qtd = 0;
        this.vlr = 0;
        this.vlrTotal = 0;
    }
}

export class ItemPesquisaDTO {
    itemDTO!: ItemDTO;
    pageNumber!: number;
    pageSize!: number;
    dtaInicialPesquisa!: string;
    dtaFinalPesquisa!: string;
    constructor() {
        this.pageNumber = 0;
        this.pageSize = 20;
    }
}

export class ItensAux {
    id!: number;
    nome!: string;
}

export class PageItem {
    content!: ItemDTO[];
    pageable!: any;
    last!: boolean;
    totalElements!: number;
    totalPages!: number;
    size!: number;
    numberOfElements!: number;
    first!: boolean;
}

export class ItemResumoDTO {
    id!: number;
    nome!: string;
    constructor(obj: any) {
        this.id = obj.id;
        this.nome = obj.nome;
    }
}

export class ItemGrupo {
    item_id!: number;
    item_nome!: string;
    qtd_venda!: number;
    vlr_venda!: number;
}