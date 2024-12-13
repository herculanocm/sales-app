export class FornecedorDTO {
    id!: number;
    nome!: string;
    fantasia!: string;
    cgc!: string;
    email!: string;
    celular1!: string;
    celular2!: string;
    fone1!: string;
    fone2!: string;
    dtaInclusao!: Date;
    usuarioInclusao!: string;
    fornecedorGrupoDTOs!: FornecedorGrupoDTO[];
    fornecedorEnderecoDTO!: FornecedorEnderecoDTO;
    status!: boolean;

    constructor() {
        this.fornecedorEnderecoDTO = new FornecedorEnderecoDTO();
        this.status = true;
        this.fornecedorGrupoDTOs = [];
    }
}

export class FornecedorGrupoDTO {
    id!: number;
    nome!: string;
    descricao!: string;
    status!: boolean;
}

export class FornecedorEnderecoDTO {
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

export class PageFornecedor {
    content!: FornecedorDTO[];
    pageable!: any;
    last!: boolean;
    totalElements!: number;
    totalPages!: number;
    size!: number;
    numberOfElements!: number;
    first!: boolean;
}

export class FornecedorPesquisaDTO {
    fornecedorDTO!: FornecedorDTO;
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
