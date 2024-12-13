import { FuncionarioDTO } from "./funcionario";
import { FornecedorDTO } from "./fornecedor";
import { ClienteDTO } from "./cliente";
import { EstoqueAlmoxarifadoDTO, ItemDTO, ItemDescontoQtdDTO, ItemPrecoDTO, ItemUnidadeDTO } from "./item";
import { VeiculoDTO } from "./veiculo";

export class EstoqueItemSaldo {
    itemId!: number;
    qtdEntrada!: number;
    qtdSaida!: number;
    qtdSaldo!: number;
    qtdComprometido!: number;
    qtdDisponivel!: number;
}
export class ItemEstoqueStatus {
    flgBuscando!: number;
    msg!: string;
}
export class MovimentoOrigemDTO {
    id!: number;
    nome!: string;
}

export class MovimentoTipoDTO {
    id!: number;
    nome!: string;
    descricao!: string;
    status!: boolean;
    indTipo!: string | null;
    roleAcesso!: string;
}

export class ItemAlxs {
    itemId!: number;
    itemNome!: string;
    itemRuaNome!: string;
    itemUnidadeDTOs!: ItemUnidadeDTO[];
    itemUnidadeDTO!: ItemUnidadeDTO;
    qtd_alx1!: number;
    qtd_alx2!: number;
    dif!: number;
    itemIdAux!: number;
}
export class ProcuraItemAlxs {
    idAlx1!: number| null;
    idAlx2!: number| null;
    itemNome!: string | null;
}

export class MovimentoItemDTO {
    id!: number | null;
    numNotaFiscalItem!: string | null;
    fatorOriginal!: number;
    qtd!: number;
    qtdConvertido!: number;
    valor!: number;
    valorUnitario!: number;
    vlrMedio!: number;
    indGeraPreco!: boolean;
    indGeraEstoque!: boolean;
    indGeraValidade!: boolean | null;
    indBaixaEndereco!: boolean | null;
    dtaValidade!: Date | null;
    itemDTO!: ItemDTO;
    itemUnidadeDTO!: ItemUnidadeDTO | null;
    movimentoDTO_id!: number | null;
    ordemInclusaoTimestamp!: number;
    status!: string;

    constructor() {
        this.indGeraEstoque = true;
        this.itemUnidadeDTO = null;
        this.vlrMedio = 0;
    }
}

export class MovimentoDTO {
    id!: number;
    dtaInclusao!: Date;
    usuarioInclusao!: string | null;
    descricao!: string;
    numNotaFiscal!: string;
    preVendaId!: number;
    rotaId!: number;
    motoristaDTO!: FuncionarioDTO | null;
    conferenteDTO!: FuncionarioDTO | null;
    veiculoDTO!: VeiculoDTO | null;
    fornecedorDTO!: FornecedorDTO | null;
    clienteDTO!: ClienteDTO | null;
    estoqueAlmoxarifadoDTO!: EstoqueAlmoxarifadoDTO | null;
    movimentoTipoDTO!: MovimentoTipoDTO | null;
    movimentoOrigemDTO!: MovimentoOrigemDTO | null;
    movimentoItemDTOs!: MovimentoItemDTO[];
    indAtivo!: boolean;

    constructor() {
        this.indAtivo = true;
    }
}

export class MovimentoPesquisaDTO {
    movimentoDTO!: MovimentoDTO;
    pageNumber!: number;
    pageSize!: number;
    dtaInicialPesquisa!: string;
    dtaFinalPesquisa!: string;
    constructor() {
        this.pageNumber = 0;
        this.pageSize = 10;
    }
}

export class MovimentoTransfDTO {
    estoqueAlmoxarifadoOrigemDTO!: EstoqueAlmoxarifadoDTO | null;
    estoqueAlmoxarifadoDestinoDTO!: EstoqueAlmoxarifadoDTO | null;
    movimentoItemDTOs!: MovimentoItemDTO[];
    descricao!: string;
}

export class PageMovimento {
    content!: MovimentoDTO[];
    pageable!: any;
    last!: boolean;
    totalElements!: number;
    totalPages!: number;
    size!: number;
    numberOfElements!: number;
    first!: boolean;
}

export class MovimentoItemAuditoriaDTO {
    id!: number;
    qtd!: number;
    qtdConvertido!: number;
    tipoOriginal!: string;
    fatorOriginal!: number;
    valor!: number;
    valorUnitario!: number;
    dtaValidade!: Date;
    indGeraPreco!: boolean;
    indGeraEstoque!: boolean;
    indGeraValidade!: boolean;
    indBaixaEndereco!: boolean;
    itemUnidadeId!: number;
    itemId!: number;
    itemNome!: string;
    movimentoId!: number;
    dtaInclusao!: Date;
    usuarioInclusao!: string;
    numNotaFiscal!: string;
    movimentoTipoId!: number;
    movimentoTipoNome!: string;
    movimentoOrigemId!: number;
    movimentoOrigemNome!: string;
    estoqueAlmoxarifadoId!: number;
    estoqueAlmoxarifadoNome!: string;
    veiculoId!: number;
    veiculoNome!: string;
    motoristaFuncionarioId!: number;
    motoristaFuncionarioNome!: string;
    conferenteFuncionarioId!: number;
    conferenteFuncionarioNome!: string;
    fornecedorId!: number;
    fornecedorNome!: string;
    clienteId!: number;
    clienteNome!: string;
    qtdAnteriorEstoqueAtivo!: number;
    qtdEstoqueValidoAtual!: number;
    indAtivo!: boolean;

    isLoading?: boolean;
    constructor() {
        this.isLoading = false;
    }
}
export class ProcuraMovimentoItemAuditoria {
    dtaInicial!: string;
    dtaFinal!: string;
    itemDTO!: ItemDTO;
    estoqueAlmoxarifadoId!: number | null;
    movimentoTipoId!: number | null;
    constructor() {
        // this.dtaFinal = new Date();
        // this.dtaInicial = new Date();
    }
}

export class ItemAlmoxarifadoDTO {
    id!: number;
    idAux!: number;
    itemRuaNome!: string;
    nome!: string;
    vendaBloqueada!: boolean;
    movimentoBloqueado!: boolean;
    itemUnidadeDTOs!: ItemUnidadeDTO[];
    itemUnidadeDTO!: ItemUnidadeDTO;
    itemPrecoDTO!: ItemPrecoDTO;
    itemDescontoQtdDTOs!: ItemDescontoQtdDTO[];
    itemQtdAlmoxarifadoDTO!: EstoqueItemSaldo;
    nomeEmsys?: string;
    // tslint!:disable-next-line!:indent
	qtdEstoqueEmsys?: number;
    qtdEstoqueComprometidoEmsys?: number;
    isDiferente?: boolean;
    qtdEstoqueTotalSales?: number;
    qtdEstoqueTotalEmsys?: number;
}

export class MovimentoPosicaoItemAux {
    estoqueAlmoxarifadoId!: number | null;
    itemDTO!: ItemDTO;
    nomeItem!: string;
    almoxarifados!: EstoqueAlmoxarifadoDTO[];
}

export class AjusteMediasAux {
    item_id!: number;
    item_nome!: string;
    nro_anomes!: number;
    qtd_total_entrada!: number;
    qtd_total_saida!: number;
    vlr_max_unitario_entrada!: number;
    vlr_max_unitario_saida!: number;
    vlr_medio_unitario_entrada!: number;
    vlr_sub_entrada!: number;
    vlr_medio_unitario_saida!: number;
    vlr_min_unitario_entrada!: number;
    vlr_min_unitario_saida!: number;
    vlr_total_entrada!: number;
    vlr_total_saida!: number;
}

export class FiltroTabela {
    geraPreco!: number;
    isEntrada!: string;
    constructor() {
        this.geraPreco = 0;
        this.isEntrada = 'T';
    }
}
export class ResumoPrecoItem {
    id!: number;
    nome!: string;
    qtdEntrada!: number;
    vlrEntrada!: number;
    vlrMediaEntrada!: number;
    qtdSaida!: number;
    vlrSaida!: number;
    vlrMediaSaida!: number;
}