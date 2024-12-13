export class DiaSemana {
    id!: number;
    nome!: string;
}
export class ClientePAv {
    id!: number;
    nome!: string;
    fantasia!: string;
    cgc!: string;
    cliente_status_label!: string;
    is_venda_bloqueada!: boolean;
    limite!: number;
    comprometido!: number;
    divida!: number;
    saldo!: number;
    vendedores!: VendedorPAv[];
    enderecos!: EnderecosPAv[];

    constructor() {
        this.limite = 0;
        this.comprometido = 0;
        this.divida = 0;
        this.saldo = 0;
    }
}
export class VendedorPAv {
    id!: number;
    domingo!: boolean;
    segunda!: boolean;
    terca!: boolean;
    quarta!: boolean;
    quinta!: boolean;
    sexta!: boolean;
    sabado!: boolean;
    funcionario_id!: number;
    cliente_id!: number;
    nome_vendedor!: string;
}
export class EnderecosPAv {
    logradouro!: string;
    num_logradouro!: number;
    bairro!: string;
    ind_entrega!: boolean;
    ind_prioritario!: boolean;
    municipio_id!: number;
    municipio_nome!: string;
}
