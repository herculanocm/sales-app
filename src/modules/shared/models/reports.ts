import { FuncionarioDTO } from "./funcionario";
import { ItemGrupoDTO, ItemMarcaDTO } from "./item";

export interface SupervisorAux {
    supervisor_id: number;
    supervisor_nome: string;
}

export interface RepresentanteAux {
    vendedor_id: number;
    vendedor_nome: string;
}

export interface SupervisorRepresentanteAux {
    supervisor_id: number;
    supervisor_nome: string;
    vendedores: RepresentanteAux[];
}

export interface ReportUserWithLevelAccessSupervisor {
    level_access: number;
    login: string;
    supervisores: SupervisorRepresentanteAux[]
}

export interface ReportPostBodySuperVend {
    dtaEmissaoInicial: Date;
    dtaEmissaoFinal: Date;
    vendedorId: number;
    supervisorId: number;
}

export interface ReportQuad1 {
    indicador_quad_1: number;
    des_ind: string;
    ord_ind: number;
    vlr: number;
}

export class ItemGrupo {
    item_id!: number;
    item_nome!: string;
    qtd_venda!: number;
    vlr_venda!: number;
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


export class ItensAux {
    id!: number;
    nome!: string;
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
