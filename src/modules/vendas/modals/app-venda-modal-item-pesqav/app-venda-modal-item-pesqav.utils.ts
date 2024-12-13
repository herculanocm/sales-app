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
