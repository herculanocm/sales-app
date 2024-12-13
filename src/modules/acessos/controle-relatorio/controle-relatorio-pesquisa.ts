import { ConsultaRelatorioDTO } from './controle-relatorio';

export class ControleRelatorioPesquisaDTO {
    consultaRelatorioDTO!: ConsultaRelatorioDTO;
    pageNumber!: number;
    pageSize!: number;
    constructor() {
        this.pageNumber = 0;
        this.pageSize = 20;
    }
}

