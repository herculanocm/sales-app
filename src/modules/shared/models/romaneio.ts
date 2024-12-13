import { FuncionarioDTO } from "./funcionario";
import { VeiculoDTO } from "./veiculo";
import { VendaDTO } from "./venda";

export class Versoes {
    dta!: Date;
    usuario!: string;
    acao!: string;
}
export class VersoesList {
    versoes!: Versoes[];
}

export class RomaneioDTO {
    id!: number;
    descricao!: string;

    dtaInclusao!: Date;
    usuarioInclusao!: string;
    dtaUltAlteracao!: Date;
    usuarioUltAlteracao!: string;

    usuarioTransmissao!: string;
    dtaTransmissao!: Date;

    dtaEntrega!: Date;
    dtaCaixa!: Date;

    movimentoId!: number;
    indStatus!: string;

    qtdAlteracao!: number;

    estoqueAlmoxarifadoId!: number;

    estoqueAlmoxarifadoNome!: string;

    vlrTotal!: number;
    vlrTrocoDespesa!: number;
    vlrDiaria!: number;
    vlrAcessoria!: number;

    motoristaDTO!: FuncionarioDTO;
    veiculoDTO!: VeiculoDTO;


    condicoes!: any;
    vendas!: any;
    historicos!: any;
    versoes!: VersoesList;
}

export class CondicoesVlrAux {
    vlr!: number;
    nome!: string;
    ordem!: number;
}
export class AgrupamentoAux {
    qtd!: number;
    nome!: string;
}
export class CurrentUserSalesAppAux {
    username!: string;
    token!: string;
    user!: any;
    funcionarioDTO!: FuncionarioDTO;
}
export class BuscaRomaneioVendaId {
    romaneioId!: number;
    msg!: string;
    status!: boolean;
}
export class VendaStatusAux {
    vendaId!: number;
    sigla!: string;
    label!: string;
    flgFat!: number;
}
export class RepRomaneioAux {
    status!: boolean;
    msg!: string;
    romaneioDTO!: RomaneioDTO;
    vendaStatusAuxs!: VendaStatusAux[];
}
export class RomaneioHistorico {
    id!: number;
    descricao!: string;
    dtaInclusao!: Date;
    usuarioInclusao!: string;
    dtaUltAlteracao!: string;
    usuarioUltAlteracao!: string;
    dtaEntrega!: Date;
    dtaCaixa!: Date;
    usuarioAbertura!: string;
    dtaAbertura!: Date;
    movimentoId!: number;
    indStatus!: string;
    vlrTotal!: number;
    vlrTrocoDespesa!: number;
    vlrDiaria!: number;
    vlrAcessoria!: number;
    motoristaDTO!: any;
    veiculoDTO!: any;
    condicoes!: any;
    vendas!: any;
    agVenda!: any;
}
export class RomaneioHistoricoList {
    historicos!: RomaneioHistorico[];
}
export class CheckVendaDTO {
    vendaId!: number;
    romaneioId!: number;
    msg!: string;
    status!: boolean;
    vendaDTO!: VendaDTO;
}
export class SiteLocation {
    user_name!: string;
    funcionario_id!: number;
    funcionario_nome!: string;
    tipo!: string;
    dta_inclusao!: Date;
    lat!: number;
    lon!: number;
}
export class RepreLocation {
    id!: number;
    dta_inclusao!: Date;
    serial_fone!: string;
    dta_cell!: number;
    lat!: number;
    lon!: number;
    alt!: number;
    nome!: string;
    model!: string;
}

export class PageRomaneio {
    content!: RomaneioDTO[];
    pageable!: any;
    last!: boolean;
    totalElements!: number;
    totalPages!: number;
    size!: number;
    numberOfElements!: number;
    first!: boolean;
}

export class RomaneioPesquisaDTO {
    romaneioDTO!: RomaneioDTO;
    pageNumber!: number;
    pageSize!: number;
    dtaInicialPesquisa!: string;
    dtaFinalPesquisa!: string;
    dtaInicialEntrega!: string;
    dtaFinalEntrega!: string;
    vendaId!: number;
    clienteId!: number;
    constructor() {
        this.pageNumber = 0;
        this.pageSize = 10;
    }
}
