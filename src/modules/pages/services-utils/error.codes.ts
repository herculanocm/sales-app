interface Error {
    code: string;
    ptbr: string;
}
export const errors: Error[] = [
    {
        code: '10001',
        ptbr: 'Esta entidade está relacionada com outra e não pode ser excluida'
    },
    {
        code: '10002',
        ptbr: 'Erro ao executar ação - cod: 10002'
    },
    {
        code: '10100',
        ptbr: 'Erro - Email não existe'
    },
    {
        code: '10101',
        ptbr: 'Erro usuário não existe'
    },
]