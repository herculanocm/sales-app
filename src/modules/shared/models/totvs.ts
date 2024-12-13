import { EstoqueAlmoxarifadoDTO, ItemDTO } from "./item";

export class TituloStatus {
    sigla!: string;
    nome!: string;
}
export class TituloTipoBaixa {
    sigla!: string;
    nome!: string;
}
export class TransacoesTituloHeaderPg {
    id!: number;
    dtaGravacaoArquivo!: Date;
    dtaInclusao!: Date;
    caminho!: string;
}
export class TitulosCNAB {
    cgcLimpo!: string;
    dataLiquidacao!: Date;
    dataVencimento!: Date;
    idHeader!: number;
    indStatusSales!: string;
    nomPessoaSales!: string;
    nossoNumero!: string;
    vlrTotalSales!: number;
    valorRecebido!: number;
    valorTitulo!: number;
    idTituloSales!: number;
    msgStatus!: string;
    baixar!: boolean;
    podeBaixar!: boolean;
    constructor() {
        this.baixar = true;
    }
}
export class TitulosPercClienteDTO {
    clienteId!: number;
    qtdTitulosAdim!: number;
    qtdTitulosInadim!: number;
    perc!: number;

    constructor() {
        this.qtdTitulosAdim = 0;
        this.qtdTitulosInadim = 0;
        this.perc = 0;
    }
}
export class TitulosPercAtrasoClienteDTO {
    clienteId!: number;
    qtdTitulosEmDia!: number;
    qtdTitulosEmAtraso!: number;
    perc!: number;

    constructor() {
        this.qtdTitulosEmDia = 0;
        this.qtdTitulosEmAtraso = 0;
        this.perc = 0;
    }
}
export interface PcFilial {
    codigo: string;
    razaosocial: string;
    cgc: string;
}
export class VendaIntTotvs {
    id!: number;
    codPreVenda!: string;
    estoqueAlmoxarifadoId!: number;
    estoqueAlmoxarifadoNome!: string;
    dtaEmissao!: Date;
    usuarioInclusao!: string;
    dtaInclusao!: Date;
    clienteId!: number;
    clienteNome!: string;
    vendedorId!: number;
    vendedorNome!: string;
    condicaoPagamentoId!: number;
    condicaoPagamentoNome!: string;
    statusLabel!: number;
    statusSigla!: string;
    flgFat!: number;
    valFrete!: number;
    valDespAcessoria!: number;
    valAcrescimoFixoCondicao!: number;
    valProdutos!: number;
    valProdutosSDesconto!: number;
    valDescontoProdutos!: number;
    valTotal!: number;
    romaneioId!: number;
    tituloId!: number;
    dtaTransfTotvs!: Date;
    usuarioTransfTotvs!: string;
    indTransfTotvs!: boolean;
    numPedTotvs!: number;
    filialTotvs!: string;
    destinoTipoTotvs!: string;
    origem!: string;

    acaoTransf!: boolean;

    numnf!: number;
}
export class VendaIntPesquisa {
    dtaEmissao!: Date | null;
    statusVenda!: any[];
    clienteId!: number;
    transferido!: string;
    vendedorId!: number;
    vendaId!: number;
    estoqueAlmoxarifadoId!: number;
}
export class VendaIntTransfTotvs {
    indTransfTotvs!: boolean;
    id!: number;
    msg!: string;

    acaoTransf!: boolean;

    usuarioTransfTotvs!: string;
    dtaTransfTotvs!: Date;
    numPedTotvs!: number;
    destinoTipoTotvs!: string;
    numnf!: number;
}
export class VendaIntTransfObjTotvs {
    vendas!: VendaIntTransfTotvs[];
    codigo!: string;
    destinoTipo!: string;
}
export class RespAuxTransfVendas {
    vendas!: VendaIntTransfTotvs[];
    status!: boolean;
    msg!: string;
    code!: number;
    codigo!: string;
}
export class ItemPcProdut {
    id!: number;
    idAux!: number;
    codigoBarras!: string;
    nome!: string;
    codProd!: number;
    idSales!: number;
    descricao!: string;
    embalagem!: string;
    unidade!: string;
    codAuxiliar!: string;
    qtunit!: number;
    qtUnitcx!: number;
    dtCadastro!: Date;
    dtUltAlter!: Date;
    codBarrasTotvs!: string;
}
export class RespAuxIntItem {
    status!: boolean;
    msg!: string;
    code!: number;
    lista!: ItemPcProdut[];
}
export class CondicaoPcplgpag {
    id!: number;
    idAux!: number;
    nome!: string;
    indTipoPagamento: any;
    geraTitulo!: string;
    tipoTitulo!: string;
    codplpag!: number;
    descricao!: string;
    numdias!: number;
    tipoprazo!: string;
    tipovenda!: string;
}
export class RespAuxIntCondicao {
    status!: boolean;
    msg!: string;
    code!: number;
    lista!: CondicaoPcplgpag[];
}
export class ClientePcCliente {
    id!: number;
    idAux!: number;
    nome!: string;
    fantasia!: string;
    cgc!: string;
    limite!: number;
    status!: string;
    dtaNasc!: Date;
    dtaInclusao!: Date;
    cliente!: string;
    fantasiaTOTVS!: string;
    bloqueio!: string;
    limCred!: number;
}
export class RespAuxIntCliente {
    status!: boolean;
    msg!: string;
    code!: number;
    lista!: ClientePcCliente[];
}

export interface ItemAlxPreco {
    codprod: number;
    descricao: string;
    vlr: number;
    dtaInclusao: Date;
    usuarioInclusao: string;
    itemId: number;
    estoqueAlmoxarifadoId: number;
    itemNome: string;
    pvenda: number;
    acaoTransf: boolean;
}