import { BancoFebrabanDTO } from "@modules/configuracoes/banco-febraban";
import { FuncionarioDTO } from "./funcionario";
import { ClienteDTO, ClienteEmissorDTO } from "./cliente";
import { FornecedorDTO } from "./fornecedor";

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
export class Cmc7Validator {
    validate(typedValue: string): boolean {
        if (typedValue === undefined || typedValue === null) {
            return false;
        }
        typedValue = typedValue.replace(/\s/g, '');
        if (!typedValue) {
            return false;
        }

        const pieces = {
            firstPiece: typedValue.substr(0, 7)
            , secondPiece: typedValue.substr(8, 10)
            , thirdPiece: typedValue.substr(19, 10)
        };


        const digits = {
            firstDigit: parseInt(typedValue.substr(7, 1), 10)
            , secondDigit: parseInt(typedValue.substr(18, 1), 10)
            , thirdDigit: parseInt(typedValue.substr(29, 1), 10)
        };

        const calculatedDigits = {
            firstDigit: this.module10(pieces.firstPiece)
            , secondDigit: this.module10(pieces.secondPiece)
            , thirdDigit: this.module10(pieces.thirdPiece)
        };

        // console.log(digits);
        // console.log(calculatedDigits);

        if ((calculatedDigits.secondDigit !== digits.firstDigit)
            || (calculatedDigits.firstDigit !== digits.secondDigit)
            || (calculatedDigits.thirdDigit !== digits.thirdDigit)) {
            return false;
        }
        return true;
    }
    module10(str: any): number {
        if (str === undefined || str === null) {
            return 0;
        }
        const size = str.length - 1;
        let result = 0;
        let weight = 2;

        for (let i = size; i >= 0; i--) {
            const total = str.substr(i, 1) * weight;
            if (total > 9) {
                result = result + 1 + (total - 10);
            } else {
                result = result + total;
            }
            if (weight === 1) {
                weight = 2;
            } else {
                weight = 1;
            }
        }
        let dv = 10 - this.mod(result, 10);
        if (dv === 10) {
            dv = 0;
        }
        return dv;
    }
    mod(dividend: number, divisor: number): number {
        return Math.round(dividend - (Math.floor(dividend / divisor) * divisor));
    }
}
export interface TituloCSVImportAux {
    rowNum: number;
    pagadorPlan: string;
    seuNumeroPlan: string;
    nossoNumeroPlan: number;
    dataVencimentoPlan: Date | null;
    valorTituloPlan: number;
    valorTituloPgtoPlan: number;
    dataPagamentoPlan: Date | null;

    nossonumbcoWinthor?: string;
    numpedWinthor?: number;
    numtransvendaWinthor?: number;
    flpago?: number;
    prest?: string;

    vendaIdSales?: number;
    tituloIdSales?: number;
    indStatusSales?: string;
    indStatusCompletoSales?: string;
    dtaVencimentoSales?: Date;
    vlrTotalSales?: number;

    indBaixar?: boolean;

}
export interface BanckingTitNossoNumeroAux {
    lst: number[];
}
export interface VendaTituloV1Aux {
    venda_id: number;
    num_ped_totvs: number;
    titulo_id: number;
    ind_status: string;
    dta_vencimento: Date;
    vlr_total: number;
}
export interface WinthorTitAuxIn {
    numped: number;
    numtransvenda: number;
    nossonumbco: string;
    nossonum: number;
    flpago: number;
    prest: string;
}
export interface SalesTituloRetCsvAux {
    nossoNumeroCsv: number;
    vendaTituloV1Aux: VendaTituloV1Aux;
    winthorTitAuxIn: WinthorTitAuxIn;
}


export class VendaTituloAuxDTO {
    id!: number;
    vlrTotal!: number;
    numPedTotvs!: number;
    vendedorDTO!: FuncionarioDTO;
}

export class TituloReceberDTO {
    id!: number;
    dtaInclusao!: Date;
    usuarioInclusao!: string;
    dtaUltAlteracao!: Date;
    usuarioUltAlteracao!: string;
    usuarioBaixa!: string;
    numTitulo!: string;
    descricao!: string;
    dtaEmissao!: Date;
    dtaVencimento!: Date;
    dtaLiquidacao!: Date;
    vlrOriginal!: number;
    vlrTotal!: number;
    vlrLiquidado!: number;
    vlrJuros!: number;
    vlrMulta!: number;
    vlrDesconto!: number;
    vlrTaxaCobranca!: number;
    vlrDespesaAcessoria!: number;
    numTituloCNAB!: string;
    indStatus!: string;
    indTipoBaixa!: string;
    tituloTipoDTO!: TituloTipoDTO;
    bancoFebrabanDTO!: BancoFebrabanDTO;
    vendaDTO_id!: number;
    clienteDTO!: ClienteDTO;

    clienteEmissorDTO!: ClienteEmissorDTO;
    cmc7!: string;
    numCheque!: number;
    agenciaCheque!: string;
    contaCheque!: string;

    chequeRecebidoId!: number;

    // calulos
    diasLiquidacaoVencimento!: number;

    diasAtraso!: number;

    vendaTituloAuxDTO!: VendaTituloAuxDTO;

    constructor() {
        this.diasLiquidacaoVencimento = 0;
        this.diasAtraso = 0;
    }
}
export class TituloTipoDTO {
    id!: number;
    nome!: string;
    descricao!: string;
    status!: boolean;
}
export class NossoNumeroUpdateAux {
    tituloReceberDTO_id!: number;
    numTituloCNAB!: string;
    mensagem!: string;
}

export class TituloReceberPesquisaDTO {
    tituloReceberDTO!: TituloReceberDTO;
    pageNumber!: number;
    pageSize!: number;
    dtaInicialPesquisa!: string;
    dtaFinalPesquisa!: string;

    dtaEmissaoInicial!: string;
    dtaEmissaoFinal!: string;

    dtaVencimentoInicial!: string;
    dtaVencimentoFinal!: string;

    dtaLiquidacaoInicial!: string;
    dtaLiquidacaoFinal!: string;

    prevendaId!: number;

    constructor() {
        this.pageNumber = 0;
        this.pageSize = 20;
    }
}

export class PageTituloReceber {
    content!: TituloReceberDTO[];
    pageable!: any;
    last!: boolean;
    totalElements!: number;
    totalPages!: number;
    size!: number;
    numberOfElements!: number;
    first!: boolean;
}

export class TituloDespesaDTO {
    id!: number;
    dtaInclusao!: Date;
    usuarioInclusao!: string;
    dtaUltAlteracao!: Date;
    usuarioUltAlteracao!: string;
    usuarioBaixa!: string;
    dtaBaixa!: Date;
    numTitulo!: string;
    descricao!: string;
    dtaEmissao!: Date;
    dtaVencimento!: Date;
    dtaLiquidacao!: Date;
    vlrOriginal!: number;
    vlrTotal!: number;
    vlrLiquidado!: number;
    vlrJuros!: number;
    vlrMulta!: number;
    vlrDesconto!: number;
    vlrTaxaCobranca!: number;
    vlrDespesaAcessoria!: number;

    indStatus!: string;
    indTipoBaixa!: string;
    tituloTipoDTO!: TituloTipoDTO;
    fornecedorDTO!: FornecedorDTO;
    subGrupoDespesaDTO!: SubGrupoDespesaDTO;
    // calulos
    diasLiquidacaoVencimento!: number;

    diasAtraso!: number;

    constructor() {
        this.diasLiquidacaoVencimento = 0;
        this.diasAtraso = 0;
    }
}

export class SubGrupoDespesaDTO {
    id!: number;
    codSubgrupoDespesa!: number;
    nome!: string;
    dtaInclusao!: Date;
    usuarioInclusao!: string;
    descricao!: string;
    status!: boolean;
    grupoDespesaDTO!: GrupoDespesaDTO | null;
}

export class GrupoDespesaDTO {
    id!: number;
    codGrupoDespesa!: number;
    nome!: string;
    dtaInclusao!: Date;
    usuarioInclusao!: string;
    descricao!: string;
    status!: boolean;
}

export class TituloDespesaPesquisaDTO {
    tituloDespesaDTO!: TituloDespesaDTO;
    pageNumber!: number;
    pageSize!: number;
    dtaInicialPesquisa!: string;
    dtaFinalPesquisa!: string;

    dtaEmissaoInicial!: string;
    dtaEmissaoFinal!: string;

    dtaVencimentoInicial!: string;
    dtaVencimentoFinal!: string;

    dtaLiquidacaoInicial!: string;
    dtaLiquidacaoFinal!: string;

    constructor() {
        this.pageNumber = 0;
        this.pageSize = 20;
    }
}

export class PageTituloDespesa {
    content!: TituloDespesaDTO[];
    pageable!: any;
    last!: boolean;
    totalElements!: number;
    totalPages!: number;
    size!: number;
    numberOfElements!: number;
    first!: boolean;
}

export class ChequeRecebidosByTitulos {
    cheque_recebido_id!: number;
    cmc7!: string;
    dta_inclusao!: Date;
    dta_prog_baixa_cheque!: Date;
    titulo_receber_id!: number;
    usuario_inclusao!: string;
    vlr!: number;
}
export class TituloReceberChequeDTO extends TituloReceberDTO {
    vlrBaixar!: number;
    dtaBaixar!: string;
    indBaixar!: boolean;
}
export class ValidaTituloAux {
    valido!: boolean;
    msg!: string;

    constructor(valido: boolean, msg: string) {
        this.valido = valido;
        this.msg = msg;
    }
}

export class ChequeRecebidoDTO {
    id!: number;
    vendaDTOId!: number;
    romaneioId!: number;
    tituloReceberDTOId!: number;

    dtaInclusao!: Date;
    usuarioInclusao!: string;

    dtaUltAlteracao!: Date;
    usuarioUltAlteracao!: string;

    usuarioFinanceiro!: string;
    dtaFinanceiro!: Date;

    descricao!: string;
    dtaRecebimento!: Date;
    dtaProgBaixaCheque!: Date;
    vlr!: number;
    bancoFebrabanDTO!: BancoFebrabanDTO;
    clienteDTO!: ClienteDTO;

    clienteEmissorDTO!: ClienteEmissorDTO;
    cmc7!: string;
    numCheque!: number;
    agenciaCheque!: string;
    contaCheque!: string;

    compensado!: boolean;
}

export class PageChequeRecebidos {
    content!: ChequeRecebidoDTO[];
    pageable!: any;
    last!: boolean;
    totalElements!: number;
    totalPages!: number;
    size!: number;
    numberOfElements!: number;
    first!: boolean;
}

export class ChequeRecebidoPesquisaDTO {
    chequeRecebidoDTO!: ChequeRecebidoDTO;
    dtaInicialPesquisa!: string;
    dtaFinalPesquisa!: string;
    dtaRecebimentoInicial!: string;
    dtaRecebimentoFinal!: string;
    dtaProgBaixaInicial!: string;
    dtaProgBaixaFinal!: string;
    pageNumber!: number;
    pageSize!: number;
    constructor() {
        this.pageNumber = 0;
        this.pageSize = 20;
    }
}

export class TituloTOTVSDTO {

    tituloId!: number;
    tituloTipoNome!: string;
    dtaEmissao!: Date;
    dtaVencimento!: Date;
    dtaLiquidacao!: Date;
    clienteId!: number;
    clienteNome!: string;
    cgc!: string;
    indStatus!: string;
    vlrOriginal!: number;
    vlrLiquidado!: number;
    vendaId!: number;

    numTransVenda!: number;
    prest!: string;
    dtEmissao!: Date;
    dtVenc!: Date;
    dtPag!: Date;
    dtInclusao!: Date;
    codCli!: number;
    nmCliente!: string;
    cgcEnt!: string;
    nossoNumBco!: string;
    valor!: number;
    vpago!: number;

    indBaixar!: boolean;
    vlrBaixar!: number;
    dtaBaixar!: Date;
}
export class FormAux {
    clienteDTO!: any;
    clienteId!: number;
    dtaEmissao!: Date;
    dtaVencimento!: Date;
    indStatus!: boolean;
    tituloTipoDTO!: any;
}

export class PesquisaTitulosSmallDTO {
    dtaInicialEmissaoPesquisa!: Date;
    dtaFinalEmissaoPesquisa!: Date;
    dtaInicialVencPesquisa!: Date;
    dtaFinalVencPesquisa!: Date;
    vlrInicial!: number;
    vlrFinal!: number;
    nossoNumero!: string;
    cgc!: string;
    nome!: string;
}