export class CurrentUserSalesAppAux {
    username!: string;
    token!: string;
    user!: any;
    funcionarioDTO!: any;
}
export class ConsultaQueryAux {
    username!: string;
    query!: string;
}
export class RetornoConsultaQueryAux {
    id!: number;
    status!: boolean;
    error!: any;
    duration!: number;
    msg!: string;
}
