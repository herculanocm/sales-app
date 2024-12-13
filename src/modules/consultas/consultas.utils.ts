export class ConsultaRelatorioAcessoDTO {
    id!: number | null;
    roleAcesso!: string;
    ConsultaRelatorioDTO_id!: number | null;
}
export class ConsultaRelatorioDTO {
    id!: number;
    nome!: string;
    descricao!: string;
    qry!: string;
    consultaRelatorioAcessoDTOs!: ConsultaRelatorioAcessoDTO[];
    status!: boolean;
    editavel!: boolean;
    area!: string;
}
