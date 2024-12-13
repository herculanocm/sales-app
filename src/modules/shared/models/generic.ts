import { FuncionarioDTO } from "./funcionario";
import { ItemGrupoDTO, ItemMarcaDTO, ItensAux } from "./item";
import { VeiculoDTO } from "./veiculo";
import { VendaPesquisaDTO, VendaStatusMotivoDTO } from "./venda";

export interface BodyPostIds {
    ids: number[];
    vendaPesquisaDTO: VendaPesquisaDTO;
}

export interface IndicadoresVendaAux {
    cod: number;
    nome: string;
    ordem: number;
    qtd_convertido: number;
    vlr: number;
}

export interface MesAnoFiltros {
    id: number;
    ano: number;
    mes: string;
    anomes: string;
    monthstart: Date;
}

export interface PageGeneric<T> {
    content: T[];
    pageable: any;
    last: boolean;
    totalElements: number;
    totalPages: number;
    size: number;
    numberOfElements: number;
    first: boolean;
}

export interface GenericPesquisaDTO<T> {
    object: T | null;
    pageNumber: number | null;
    pageSize: number | null;
    dtaInicialPesquisa: Date | null;
    dtaFinalPesquisa: Date | null;
    dtaReferenciaInicial: Date | null;
    dtaReferenciaFinal: Date | null;
    usuarioInclusao: string | null;
    valorInicial: number | null;
    valorFinal: number | null;
}


export class RequestServerJust {
    idPedido!: number | null;
    justificativa!: string | null;
    vendaStatusMotivoDTO?: VendaStatusMotivoDTO;
}
export class DeviceAccess {
    deviceInfo!: DeviceInfo;
    isMobile!: boolean;
    isDesktop!: boolean;
    constructor() {
        this.isMobile = false;
        this.isDesktop = false;
    }
}
export class DeviceInfo {
    browser!: string;
    browser_version!: string;
    device!: string;
    os!: string;
    os_version!: string;
    userAgent!: string;
}
export class CurrentUserSalesAppAux {
    username!: string;
    token!: string;
    user!: any;
    funcionarioDTO!: FuncionarioDTO;
}
export class PermitVendaServer {
    dataAtual!: Date;
    dataAtualFormatada!: string;
    vendaBloqueada!: boolean;
    msg!: string;
    contador!: number;
    statusConsultando!: boolean;
    constructor() {
        this.dataAtual = new Date();
        this.vendaBloqueada = false;
        this.msg = 'Buscando Servidor';
        this.contador = 30;
        this.statusConsultando = false;
    }
}
export class MsgDescontoAplicado {
    msg!: string;
    status!: boolean;
    tipo!: number;
}
export class MsgValorDigitado {
    msg!: string;
    status!: boolean;
    tipo!: number;
}
export class MessageAlertList {
    erro!: string;
    message!: string;
}

export class MsgValidacaoCliente {
    isErro!: boolean;
    messageAlertList!: MessageAlertList[];
}
export class MsgValidacaoItem {
    isErro!: boolean;
    messageAlertList!: MessageAlertList[];
}
export class ControleTopItens {
    clienteId!: number;
    clienteNome!: number;
    vendedorNome!: string | null;
    topItensCliente!: TopItensCliente[];
}
export class TopItensCliente {
    item_id!: number;
    item_nome!: string;
    item_unidade_nome!: string;
    dta_ultima_compra!: Date;
    qtd_ultima_compra!: number;
    qtd_compra_total!: number;
    qtd_compra_media!: number;
    posicaoRank!: number;
}
export class BuscaReport {
    dtaEmissaoInicial!: Date;
    dtaEmissaoFinal!: Date;
    idFuncionario!: number;
}
export class RetornoStatus {
    label!: string;
    qtd_pedido!: number;
    val_total!: number;
}
export class RetornoClientes {
    cliente_id!: number;
    cliente_nome!: string;
    qtd_pedido!: number;
    val_total!: number;
}
export class RetornoItens {
    item_id!: number;
    item_nome!: string;
    qtd_pedido!: number;
    qtd_vendido!: number;
    val_total!: number;
}
export class RetornoPedidos {
    venda_id!: number;
    dta_emissao!: Date;
    dta_inclusao!: Date;
    cliente_id!: number;
    cliente_nome!: string;
    vendedor_id!: number;
    vendedor_nome!: string;
    condicao_pagamento_id!: number;
    condicao_pagamento_nome!: string;
    label_status!: string;
    val_total!: number;
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

export class ReportItensAgrupadoDetalhe {
    supervisor_id!: number;
    supervisor_nome!: string;
    vendedor_id!: number;
    vendedor_nome!: string;
    item_id!: number;
    item_nome!: string;
    fator!: number;
    item_unidade_nome!: string;
    qtd!: number;
    vlr!: number;
}
export class ReportItensAgrupadoSupervisor {
    supervisor_id!: number;
    supervisor_nome!: string;
    item_id!: number;
    item_nome!: string;
    fator!: number;
    qtd!: number;
    vlr!: number;
    vendedores_array!: ReportItensAgrupadoDetalhe[];
}
export class ReportItensAgrupado {
    item_id!: number;
    item_nome!: string;
    fator!: number;
    qtd!: number;
    vlr!: number;
    supervisores_array!: ReportItensAgrupadoSupervisor[];
}
export class FormItensReport {
    dtaEmissaoInicial!: string;
    dtaEmissaoFinal!: string;
    nomeItem!: string;
    usuario!: string;
    itens!: ItensAux[];
}

export class ItemCliente {
    cliente_id!: number;
    cliente_nome!: string;
    qtd_venda!: number;
}
export class FormPesquisa {
    dtaEmissaoInicial!: string;
    dtaEmissaoFinal!: string;
    vendedor!: FuncionarioDTO;
    grupo!: ItemGrupoDTO;
    marcas!: ItemMarcaDTO[];
}



export class CheckListVeiculoItemDTO {
    id!: number;
    nome!: string;
    status!: boolean;
}
export class CheckListVeiculoItemMovDTO {
    id!: number;
    saida1!: boolean;
    chegada1!: boolean;

    checkListVeiculoItemDTO!: CheckListVeiculoItemDTO;

    checkListVeiculoDTO_id!: number;
}
export class CheckListVeiculoDTO {
    id!: number;

    dtaInclusao!: Date;
    usuarioInclusao!: string;

    usuarioUltAlteracao!: string;
    dtaUltAlteracao!: Date;

    dtaCheckList!: Date;

    origem!: string;
    destino!: string;

    kmSaida!: number;
    hrSaida!: string;

    kmChegada!: number;
    hrChegada!: string;

    pneuDianteiroLD!: string;
    pneuDianteiroLE!: string;
    pneuTraseiroLD!: string;
    pneuTraseiroLE!: string;

    caixaEcobier!: number;
    caixaPetropolis!: number;
    caixaPaletes!: number;
    caixaSocorro!: number;
    caixaHeinekenVerde!: number;
    caixaChapatex!: number;

    dtaRota!: Date;

    descricao!: string;

    motoristaDTO!: FuncionarioDTO;

    veiculoDTO!: VeiculoDTO;

    checkListVeiculoItemMovDTOs!: CheckListVeiculoItemMovDTO[];
}
export class CheckListVeiculoImageDTO {
    id!: number;

    dtaInclusao!: Date;
    usuarioInclusao!: string;

    descricao!: string;
    extencao!: string;
    imgBase64!: string;
    fileType!: string;
    fileName!: string;

    nome!: string;

    checkListVeiculoDTO_id!: number;

    getStrImg(): string {
        return ('data!:' + this.fileType + ';base64,' + this.imgBase64);
    }
}


export class CheckListVeiculoPesquisaDTO {
    checkListVeiculoDTO!: CheckListVeiculoDTO;
    pageNumber!: number;
    pageSize!: number;
    dtaInicialPesquisa!: string;
    dtaFinalPesquisa!: string;
    constructor() {
        this.pageNumber = 0;
        this.pageSize = 20;
    }
}

export class PageCheckListVeiculo {
    content!: CheckListVeiculoDTO[];
    pageable!: any;
    last!: boolean;
    totalElements!: number;
    totalPages!: number;
    size!: number;
    numberOfElements!: number;
    first!: boolean;
}

export class BancoFebrabanDTO {
    codBanco!: number;
    desBanco!: string;
}
