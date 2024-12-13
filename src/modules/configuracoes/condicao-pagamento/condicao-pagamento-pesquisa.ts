import { CondicaoPagamentoDTO } from "@modules/shared/models/condicao-pagamento";

export class CondicaoPagamentoPesquisaDTO {

    condicaoPagamentoDTO!: CondicaoPagamentoDTO;

    dtaInclusaoInicial!: string;
    dtaInclusaoFinal!: string;

    pageNumber!: number;
    pageSize!: number;

    constructor() {
        this.pageNumber = 0;
        this.pageSize = 20;
    }
}
