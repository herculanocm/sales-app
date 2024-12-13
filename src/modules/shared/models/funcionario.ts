import { EstoqueAlmoxarifadoDTO } from "./item";

export class FuncionarioGrupoDTO {
    id!: number;
    nome!: string;
    descricao!: string;
    status!: boolean;
}

export class FuncionarioEnderecoDTO {
    id!: number;
    cep!: string;
    codigoPostal!: string;
    logradouro!: string;
    complemento!: string;
    complemento2!: string;
    numLogradouro!: number;
    bairro!: string;
    cidade!: string;
    estado!: string;
    municipioDTO!: any;
    latitude!: number;
    longitude!: number;
    uf!: string;
}

export class FuncionarioDTO {
    id!: number;
    idAux!: number;
    importaBalcaoTotvs!: boolean;
    nome!: string;
    cpf!: string;
    rg!: string;
    email!: string;
    celular1!: string;
    celular2!: string;
    fone1!: string;
    fone2!: string;
    dtaNasc!: Date;
    dtaAdmissao!: Date;
    dtaDemissao!: Date;
    dtaInclusao!: Date;
    usuarioInclusao!: string;
    indVendedor!: boolean;
    indMotorista!: boolean;
    indConferente!: boolean;
    indSupervisor!: boolean;
    hrIniEmissaoVendaAm!: string;
    hrFimEmissaoVendaAm!: string;
    hrIniEmissaoVendaPm!: string;
    hrFimEmissaoVendaPm!: string;
    roleAcessoVendas!: string;
    valMinVenda!: number;
    userDTO!: any | null;
    funcionarioGrupoDTOs!: FuncionarioGrupoDTO[];
    funcionarioEnderecoDTO!: FuncionarioEnderecoDTO;
    supervisorDTO!: FuncionarioDTO | null;
    status!: boolean;
    estoqueAlmoxarifadoDTOs!: EstoqueAlmoxarifadoDTO[];

    constructor() {
        this.indConferente = false;
        this.indMotorista = false;
        this.indSupervisor = false;
        this.indVendedor = false;
        this.funcionarioEnderecoDTO = new FuncionarioEnderecoDTO();
        this.userDTO = null;
        this.status = true;
        this.funcionarioGrupoDTOs = [];
        this.hrIniEmissaoVendaAm = '';
        this.hrFimEmissaoVendaAm = '';
        this.hrIniEmissaoVendaPm = '';
        this.hrFimEmissaoVendaPm = '';
    }
}
export class FuncionarioAux {
    id!: number;
    nome!: string;
    indSupervisor!: boolean;
    indVendedor!: boolean;
}

export class FuncionarioPesquisaDTO {
    funcionarioDTO!: FuncionarioDTO;
    pageNumber!: number;
    pageSize!: number;

    dtaAdmissaoInicial!: string;
    dtaAdmissaoFinal!: string;

    dtaDemissaoInicial!: string;
    dtaDemissaoFinal!: string;

    dtaInclusaoInicial!: string;
    dtaInclusaoFinal!: string;

    constructor() {
        this.pageNumber = 0;
        this.pageSize = 20;
    }
}

export class PageFuncionario {
    content!: FuncionarioDTO[];
    pageable!: any;
    last!: boolean;
    totalElements!: number;
    totalPages!: number;
    size!: number;
    numberOfElements!: number;
    first!: boolean;
}
