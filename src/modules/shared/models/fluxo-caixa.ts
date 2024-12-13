import { ClienteDTO } from "./cliente";
import { CondicaoPagamentoDTO } from "./condicao-pagamento";

export interface FluxoCaixaTipoDTO {
    id: number | null;
    nome: string | null;
    descricao: string | null;
    status: boolean | null;
   
    usuarioInclusao: string | null;
    dtaInclusao: string | null;
    usuarioUltAlteracao: string | null;
    dtaUltAlteracao: string | null;

    tipo: string | null;
}

export interface FluxoCaixaCentroDTO {
    id: number | null;
    nome: string | null;
    descricao: string | null;
    status: boolean | null;
   
    usuarioInclusao: string | null;
    dtaInclusao: string | null;
    usuarioUltAlteracao: string | null;
    dtaUltAlteracao: string | null;

    codigo:  string | null;
}

export interface ClienteFluxoCaixaDTO {
    id: number | null;
  
    descricao: string | null;
    dtaReferencia: Date | null;

   
    usuarioInclusao: string | null;
    dtaInclusao: string | null;
    usuarioUltAlteracao: string | null;
    dtaUltAlteracao: string | null;

    valor: number | null;
    clienteDTO: ClienteDTO | null;
    condicaoPagamentoDTO: CondicaoPagamentoDTO | null;
    vendaId: number | null;
    fluxoCaixaTipoDTO: FluxoCaixaTipoDTO | null;
    fluxoCaixaCentroDTO: FluxoCaixaCentroDTO | null;
}

export interface VendaDTOAuxResumoValor {
    id: number | null;
    dtaEmissao: Date | null;
    dtaInclusao: Date | null;
    usuarioInclusao: string | null;
    estoqueAlmoxarifadoId: number | null;
    clienteId: number | null;
    condicaoPagamentoId: number | null;
    vlrTotal: number | null;
    romaneioId: number | null;
    condicaoPagamentoDTO: CondicaoPagamentoDTO | null;
}

export interface ClienteFluxoTransactions {
    ordem: number;
    dta_referencia: Date;
    id: number;
    cliente_id: number;
    cliente_nome: string;
    condicao_pagamento_id: number;
    ind_tipo_pagamento: string;
    condicao_nome: string;
    tipo_tipo: string;
    tipo_nome: string;
    centro_id: number;
    centro_nome: string;
    venda_id: number | null;
    dta_inclusao: string;
    usuario_inclusao: string;
    descricao: string;
    valor_receita: number;
    valor_despesa: number;
    valor_receita_ant: number;
    valor_despesa_ant: number;
    saldo_ant: number;
    saldo: number;
  }
  
  export interface ClienteFluxoSintetico {
    centro_id: number;
    centro_nome: string;
    cliente_id: number;
    cliente_nome: string;
    transactions: ClienteFluxoTransactions[];
  }
  
  export interface StorageGetClienteFluxoSintetico {
    id: string;
    data: ClienteFluxoSintetico[];
  }