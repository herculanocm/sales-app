export class ConfGeraisDTO {
    id!: number;
    caminhoGeracaoCSV!: string;
    clienteCGCDuplicado!: boolean;
    clienteCGCValido!: boolean;
    clienteCompraSaldoZerado!: boolean;
    clienteCompraPrazoSaldoZerado!: boolean;
    clienteCompraCondCadastro!: boolean;
    tipoMovimentoTransfDestino!: number;
    tipoMovimentoTransfOrigem!: number;
    vendaBloqueada!: boolean;
    vendaEstoqueAlmoxarifadoId!: number;
    vendaTituloBancoId!: number;
    valMinVenda!: number;
    idVendaTituloBancoId!: number;
    googleApiKey!: string;
    trocaSenha!: Date;


    constructor() {
        this.clienteCGCDuplicado = false;
        this.clienteCompraSaldoZerado = true;
        this.clienteCompraPrazoSaldoZerado = false;
        this.clienteCompraCondCadastro = false;
        this.vendaBloqueada = false;
        this.valMinVenda = 0;
    }
}
export interface TwilioSMSBodyAux {
    phoneTo: string | null;
    smsText: string | null;
} 
export interface ConfMsg {
    id: number;
    dtaInclusao: Date | null;
    usuarioInclusao: string | null;
    msg: string;
    alwaysOnLogin: boolean;
    firtOnly: boolean;
}
