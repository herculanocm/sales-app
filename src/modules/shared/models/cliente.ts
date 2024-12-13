import { CondicaoPagamentoDTO } from "./condicao-pagamento";
import { FuncionarioDTO } from "./funcionario";

export class ClienteGrupoDTO {
    id!: number;
    nome!: string;
    descricao!: string;
    status!: boolean;
}

export class ReigaoDTO {
    id!: number;
    nome!: string;
}
export class EstadoDTO {
    id!: number;
    codUf!: number;
    nome!: string;
    uf!: string;
    regiaoDTO!: ReigaoDTO;
}
export class MunicipioDTO {
    id!: number;
    nome!: string;
    codigo!: number;
    estadoDTO!: EstadoDTO | null;
}

export class SetorDTO {
    id!: number;
    nome!: string;
    descricao!: string;
    status!: boolean;
}
export class ClienteSetorDTO {
    id!: number;
    clienteDTO_id!: number;
    setorDTO_id!: number;
    setorDTO!: SetorDTO | null;
    dtaInclusao!: Date;
    usuarioInclusao!: string;
    dtaUltAlteracao!: Date;
    usuarioUltAlteracao!: string;
    constructor() { this.setorDTO = null; }
}


export class ClienteEnderecoDTO {
    id!: number | undefined;
    clienteDTO_id!: number;
    indResidencial!: boolean;
    indEntrega!: boolean;
    indTrabalho!: boolean;
    indOutros!: boolean;
    indPrioritario!: boolean;
    cep!: string;
    codigoPostal!: string;
    logradouro!: string;
    complemento!: string;
    numLogradouro!: number;
    municipioDTO!: MunicipioDTO;
    bairro!: string;
    cidade!: string;
    estado!: string;
    latitude!: string;
    longitude!: string;
    uf!: string;

    constructor(id?: number) {
        this.id = id;
        this.cep = '';
        this.indPrioritario = false;
        this.indEntrega = true;
        this.indOutros = true;
    }
}

export class ClienteLimiteDTO {
    id!: number;
    limite!: number;
    descricao!: string;
    dtaInclusao!: Date;
    usuarioInclusao!: string;
    clienteDTO_id!: number;

    constructor() {
        this.limite = 0;
    }
}

export class ClienteStatusDTO {
    id!: number;
    dtaInclusao!: Date | null;
    usuarioInclusao!: string | null;
    obs!: string;
    clienteStatusLabelDTO!: ClienteStatusLabelDTO | null;
    clienteDTO_id!: number;
}

export class ClienteConsultaCreditoDTO {
    id!: number | null;
    orgao!: string;
    descricao!: string;
    dtaInclusao!: Date;
    usuarioInclusao!: string;
    clienteDTO_id!: number;
}

export class ClienteStatusLabelDTO {
    id!: number;
    status!: boolean;
    sigla!: string;
    label!: string;
    isVendaBloqueada!: boolean;
    isMovimentoBloqueado!: boolean;
    descricao!: string;
    constructor() {
        this.isVendaBloqueada = false;
        this.isMovimentoBloqueado = false;
    }
}

export class ClienteCategoriaDTO {
    id!: number;
    nome!: string;
    descricao!: string;
    status!: boolean;
}



export class ClienteDividaComproLimiteSaldoDTO {
    clienteDTO_id!: number;
    comprometido!: number;
    limite!: number;
    divida!: number;
    saldo!: number;

    constructor() {
        this.limite = 0;
        this.divida = 0;
        this.saldo = 0;
    }
}

export class ClienteEmissorDTO {
    id!: number;
    nome!: string;
    cgc!: string;
    fone!: string;
    email!: string;
    clienteDTO_id!: number;
}

export class ClienteDTO {
    id!: number;
    idAux!: number;
    nome!: string;
    fantasia!: string;
    cgc!: string;
    rgie!: string;
    email!: string;
    celular1!: string;
    celular2!: string;
    telefone1!: string;
    telefone2!: string;
    dtaNasc!: Date;
    dtaAdmissao!: Date;
    dtaDemissao!: Date;
    dtaInclusao!: Date;
    clienteLimiteDTO!: ClienteLimiteDTO;
    usuarioInclusao!: string;
    codCondicaoPagamento!: number;
    vendedorResumoDTOs!: VendedorResumoDTO[];
    condicaoPagamentoDTOs!: CondicaoPagamentoDTO[];
    clienteEnderecoDTOs!: ClienteEnderecoDTO[];
    clienteGrupoDTOs!: ClienteGrupoDTO[];
    clienteSetorDTO!: ClienteSetorDTO | null;
    clienteSetorHistoricoDTOs!: ClienteSetorDTO[];
    clienteCategoriaDTO!: ClienteCategoriaDTO | null;
    clienteLimiteHistoricoDTOs!: ClienteLimiteDTO[];
    clienteStatusHistoricoDTOs!: ClienteStatusDTO[];
    clienteStatusDTO!: ClienteStatusDTO;
    clienteConsultaCreditoDTOs!: ClienteConsultaCreditoDTO[];
    clienteConsultaCreditoDTO!: ClienteConsultaCreditoDTO;
    clienteVendedorDTOs!: ClienteVendedorDTO[];
    clienteEmissorDTOs!: ClienteEmissorDTO[];

    clienteEnderecoDTO!: ClienteEnderecoDTO;
    qtdEndereco!: number;
    endereco!: string;
    vendedor!: VendedorResumoDTO;
    qtdVendedor!: number;
    vend!: string | null;

    clienteDividaComproLimiteSaldoDTO!: ClienteDividaComproLimiteSaldoDTO;
    titulosPercAtrasoClienteDTO!: any;

    constructor() {
        this.clienteDividaComproLimiteSaldoDTO = new ClienteDividaComproLimiteSaldoDTO();
        this.titulosPercAtrasoClienteDTO = {};
    }
}

export class PageCliente {
    content!: ClienteDTO[];
    pageable!: any;
    last!: boolean;
    totalElements!: number;
    totalPages!: number;
    size!: number;
    numberOfElements!: number;
    first!: boolean;
}

export class ClientePesquisaDTO {
    clienteDTO!: ClienteDTO;
    pageNumber!: number;
    pageSize!: number;
    dtaInicialPesquisa!: string | null;
    dtaFinalPesquisa!: string | null;
    municipioDTO!: MunicipioDTO;
    clienteStatusLabelDTO!: ClienteStatusDTO | null;
    vendedorDTO!: FuncionarioDTO | null;
    endereco!: string;
    constructor() {
        this.pageNumber = 0;
        this.pageSize = 20;
        this.dtaInicialPesquisa = null;
        this.dtaFinalPesquisa = null;
        this.clienteStatusLabelDTO = null;
        this.vendedorDTO = null;
    }
}



export class VendedorResumoDTO {
    id!: number;
    nome!: string;
    status!: boolean;
    indVendedor!: boolean;
    indMotorista!: boolean;
    indConferente!: boolean;
    indSupervisor!: boolean;
}

export class ClienteVendedorDTO {
    id!: number;
    funcionarioDTO!: VendedorResumoDTO | null;
    segunda!: boolean;
    terca!: boolean;
    quarta!: boolean;
    quinta!: boolean;
    sexta!: boolean;
    sabado!: boolean;
    domingo!: boolean;
    clienteDTO_id!: number;

    constructor() {
        this.funcionarioDTO = null;
        this.segunda = false;
        this.terca = false;
        this.quarta = false;
        this.quinta = false;
        this.sexta = false;
        this.sabado = false;
        this.domingo = false;
    }
}
