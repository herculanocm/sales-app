export class EstoqueAlmoxarifadoDTO {
    id!: number;
    idAux!: number;
    nome!: string;
    sigla!: string;
    status!: boolean;
    apareceVendas!: boolean;
    roleAcesso!: string;
    permiteRomaneioDiferente!: boolean;
    constructor (id?: number) {
        if (id) {
            this.id = id;
        }
        this.apareceVendas = false;
        this.permiteRomaneioDiferente = false;
        this.status = true;
    }
}
