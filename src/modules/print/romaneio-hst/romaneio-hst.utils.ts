export class PrintObjectRota {
    id!: string;
    data!: any;
    rotaId!: number;
    agrupamentos!: AgrupamentoAux[];
    condicoes!: CondicoesVlrAux[];
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
export class AgrupamentoVendaAux {
    idItem!: number;
    item!: string;
    qtd!: number;
    idUnidade!: number;
    fatorUnidade!: number;
    unidade!: string;
    ordem2!: number;
}
export class Versoes {
    dta!: Date;
    usuario!: string;
    acao!: string;
}
export class VersoesList {
    versoes!: Versoes[];
}
