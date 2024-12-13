export class ComodatoAux {
    id!: number;
    descricao!: string;
    usuario_inclusao!: string;
    dta_inclusao!: Date;
    cliente_id!: number;
    cliente_nome!: string;
    item_id!: number;
    item_nome!: string;
    estoque_almoxarifado_id!: number;
    estoque_almoxarifado_nome!: string;
    agrupamento_id!: number;
    agrupamento_nome!: string;
    dta_emprestimo!: Date;
    qtd!: number;
    qtd_convertido!: number;
    fator_original!: number;
}
export class EstoqueComodatoAux {
    item_id!: number;
    qtd_disponivel_estoque!: number;
    qtd_convertido_comodato!: number;
    qtd_disponivel_comodato!: number;

    constructor() {
        this.qtd_disponivel_estoque = 0;
        this.qtd_convertido_comodato = 0;
        this.qtd_disponivel_comodato = 0;
    }
}
