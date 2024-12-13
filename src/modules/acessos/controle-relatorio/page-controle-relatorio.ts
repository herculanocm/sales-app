import { ConsultaRelatorioDTO } from './controle-relatorio';

export class PageControleRelatorio {
    content!: ConsultaRelatorioDTO[];
    pageable!: any;
    last!: boolean;
    totalElements!: number;
    totalPages!: number;
    size!: number;
    numberOfElements!: number;
    first!: boolean;
}
