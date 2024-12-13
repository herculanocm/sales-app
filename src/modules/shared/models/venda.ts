import { ClienteDTO, MunicipioDTO } from "./cliente";
import { CondicaoPagamentoDTO } from "./condicao-pagamento";
import { FuncionarioDTO } from "./funcionario";
import { EstoqueAlmoxarifadoDTO, ItemDTO, ItemUnidadeDTO } from "./item";

export interface FaturarVendaItemReturn {
    vendaId: number;
    mensagem: string;
    status: boolean;

    imprimir?: boolean;
}
export interface FaturarVendaReturn {
    faturarVendaItemReturns: FaturarVendaItemReturn[];
    page: PageVenda;
}

export class VendaPesquisaDTO {
    vendaDTO!: VendaDTO;
    pageNumber!: number;
    pageSize!: number;
    dtaInicialPesquisa!: string;
    dtaFinalPesquisa!: string;
    vendaStatusLabelDTOs!: VendaStatusLabelDTO[];
    origemSales!: string | null;
    municipioDTOs!: MunicipioDTO[];

    dtaEmissaoInicial?: Date | null;
    dtaEmissaoFinal?: Date | null;
    dtaEntregaInicial?: Date | null;
    dtaEntregaFinal?: Date | null;

    vendedor?: FuncionarioDTO | null;
    estoqueAlmoxarifadoDTO?: EstoqueAlmoxarifadoDTO | null;
    
    constructor() {
        this.origemSales = null;
        this.pageNumber = 0;
        this.pageSize = 20;
        this.vendaStatusLabelDTOs = [];
    }
}

export class PageVenda {
    content!: VendaPag[];
    pageable!: any;
    last!: boolean;
    totalElements!: number;
    totalPages!: number;
    size!: number;
    numberOfElements!: number;
    first!: boolean;
}

export class DiaSemana {
    id!: number;
    nome!: string;
}
export class ItemPAv {
    id!: number;
    nome!: string;
    venda_bloqueada!: boolean;
    
    msg_status!: string;
    
    agrupamentos!: ItemUnidadePAv[];
    unidade!: ItemUnidadePAv;
    estoque_venda!: any[];
}
export class ItemUnidadePAv {
    item_unidade_id!: number;
    item_unidade_nome!: string;
    item_unidade_fator!: number;
}

export class RotaAux {
    id!: number;
    dta_inclusao!: Date;
    motorista_id!: number;
    motorista_nome!: string;
    usuario_inclusao!: string;
    veiculo_id!: number;
    veiculo_nome!: string;
    limite!: number;
    descricao!: string;
}

export class VendaDTO {
    id!: number | null;
    estoqueAlmoxarifadoId!: number | null;
    estoqueAlmoxarifadoDTO?: EstoqueAlmoxarifadoDTO;
    codPreVenda!: string | null;
    dtaInclusao!: Date;
    usuarioInclusao!: string;
    dtaEmissao!: Date | string | null;
    dtaEntrega!: Date | string | null;
    dtaValidade!: Date | null;

    usuarioCaixa!: string | null;
    dtaCaixa!: Date | null;

    clienteDTO!: ClienteDTO | null;
    vendedorDTO!: FuncionarioDTO | null;
    condicaoPagamentoDTO!: CondicaoPagamentoDTO | null;

    municipioDTO!: MunicipioDTO | null;
    idEnderecoCliente!: number | null | undefined;
    cepEntrega!: string | null;
    logradouroEntrega!: string | null;
    numEntrega!: number | null;
    bairroEntrega!: string | null;
    municipioEntrega!: string | null;
    estadoEntrega!: string | null;

    latEntrega!: string | null;
    lngEntrega!: string | null;

    vendaItemDTOs!: VendaItemDTO[];
    vendaStatusDTOs!: VendaStatusDTO[];
    vendaStatusAtualDTO!: VendaStatusAtualDTO;
    tituloReceberDTO!: any;

    // vendaStatusDTO!: VendaStatusDTO; // aplicado apos o filtro, somente para alteração de AB
    browserAcesso!: string;
    deviceAcesso!: string;
    osAcesso!: string;

    vlrFrete!: number | null;
    vlrDespAcessoria!: number | null;
    vlrAcrescimoFixoCondicao!: number;
    vlrProdutos!: number;
    vlrProdutosSDesconto!: number;
    vlrDescontoProdutos!: number;
    vlrDescontoGeral!: number | null;
    descricao!: string | null;

    /* campos de usuários dos status calculados */

    statusConfirmacao!: VendaStatusDTO | null;
    statusAprovacao!: VendaStatusDTO | null;
    statusFaturamento!: VendaStatusDTO | null;

    /* Campos calculados pelos itens */

    vlrTotal!: number;
    vlrDescontoItens!: number;

    vlrProdutosSDescontoCalc!: number;

    imprime?: boolean;

    nf?: string;

    rotas!: RotaAux[];

    romaneioId!: number;

    dtaTransfTotvs!: Date;
	
	usuarioTransfTotvs!: string;
	
	indTransfTotvs!: boolean;
	
	numPedTotvs!: number;

    romaneioEntrega?: RomaneioEntrega;

    origem!: string;

    numNotaNfTotvs!: number;
    dataNfTotvs!: Date;
    vlTotalNotaNfTotvs!: number;

    constructor() {
        this.vendaItemDTOs = [];
    }
}

export interface RomaneioEntrega {
    id: number;
    motorista_id: number;
    motorista_nome: string;
    veiculo_id: number;
    veiculo_nome: string;
}

export class VendaItemDTO {
    id!: number;
    vendaDTO_id!: number;
    itemDTO!: ItemDTO;
    estoqueAlmoxarifadoDTO!: EstoqueAlmoxarifadoDTO;
    estoqueAlmoxarifadoId!: number;
    vlr!: number;
    vlrOrig!: number;
    vlrUnitario!: number;
    vlrDesconto!: number;
    vlrUnitarioOrig!: number;
    qtd!: number;
    qtdConvertido!: number;
    itemUnidadeDTO!: ItemUnidadeDTO;
    fatorInclusao!: number;
    percDesconto!: number;
    indPrecoAlterado!: boolean;

    vlrOrigCalc!: number; // Utilizado no print, quando a venda foi acima do cadastrado no sistema

    qtdEstoqueAtual!: number;

    constructor() {
        this.qtdEstoqueAtual = 0;
    }
}
export class VendaStatusLabelDTO {
    sigla!: string;
    label!: string;
    descricao!: string;
    status!: boolean;
    ordem!: number;
    flgFat!: number;
    flgLogistica!: boolean;
}
export class VendaStatusMotivoDTO {
    id!: number;
    nome!: string;
    tipo!: string;
    status!: boolean;
    ordem!: number;
}
export class VendaStatusDTO {
    id!: number;
    dtaInclusao!: Date;
    usuarioInclusao!: string;
    descricao!: string;
    vendaStatusLabelDTO!: VendaStatusLabelDTO;
    vendaStatusMotivoDTO!: VendaStatusMotivoDTO;
    vendaDTO_id!: number;
    flAtual!: boolean;
    roleName!: string;
}
export class VendaStatusAtualDTO {
    id!: number;
    dtaInclusao!: Date;
    usuarioInclusao!: string;
    descricao!: string;
    vendaStatusLabelDTO!: VendaStatusLabelDTO;
    vendaStatusMotivoDTO!: VendaStatusMotivoDTO;
    roleName!: string;
}

export class VendaRotaStatus {
    venda_id!: number;
    dta_emissao!: Date;
    dta_inclusao!: Date;
    venda_status!: string;
    venda_status_sigla!: string;
    flg_fat!: number;
    cliente_nome!: string;
    vendedor_nome!: string;
    val_total!: number;
    rota_id!: number;
    rota_dta_inclusao!: Date;
    motorista_nome!: string;
    veiculo_placa!: string;
    veiculo_nome!: string;
}

export class VendedorRepre {
    supervisor_id!: number;
    supervisor_nome!: string;
    vendedor_id!: number;
    vendedor_nome!: string;
    role_acesso_vendas!: string;
    label_status!: string;
    venda_status_label_sigla!: string;
    flg_fat!: number;
    qtd_pedido!: number;
    val_total!: number;
}
export class VendasRepre {
    supervisor_id!: number;
    supervisor_nome!: string;
    label_status!: string;
    venda_status_label_sigla!: string;
    flg_fat!: number;
    qtd_pedido!: number;
    val_total!: number;
    vendedores_array!: VendedorRepre[];
}

export interface MesAnoFiltros {
    id: number;
    ano: number;
    mes: string;
    anomes: string;
    monthstart: Date;
}

export interface PesqVendaArrayBody {
    ids: number[];
}

export interface VendaPag {
    id: number;
	dtaInclusao: Date;
	usuarioInclusao: string;
	dtaEmissao: Date | string | null;
	dtaEntrega: Date | string | null;
	estoqueAlmoxarifadoId: number | null;
	estoqueAlmoxarifadoNome: string | undefined;
	status: string;
	condicaoPagamentoId: number;
	condicaoPagamentoNome: string;
	clienteId: number;
	clienteNome: string;
	vendedorId: number;
	vendedorNome: string;
    vlrTotal: number;
    roleName: string;
    statusSigla: string;
    imprime?: boolean;
    origem: string;
    municipioNome: string;
}

export class VendaPagina implements VendaPag {
	id!: number;
	dtaInclusao!: Date;
	usuarioInclusao!: string;
	dtaEmissao!: Date | string | null;
	dtaEntrega!: Date | string | null;
	estoqueAlmoxarifadoId!: number | null;
	estoqueAlmoxarifadoNome!: string;
	status!: string;
	condicaoPagamentoId!: number;
	condicaoPagamentoNome!: string;
	clienteId!: number;
	clienteNome!: string;
	vendedorId!: number;
	vendedorNome!: string;
	vlrTotal!: number;
	roleName!: string;
	statusSigla!: string;
    origem!: string;
    municipioNome!: string;
}