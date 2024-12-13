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

export class AuthoritysUserLoged {
    description!: string;
    name!: string;
    system!: string;
}

export class UserLoged {
    activated!: boolean;
    authorityDTOs!: AuthoritysUserLoged[];
    createdBy!: string;
    createdDate!: Date;
    email!: string;
    firstName!: string;
    id!: number;
    imageUrl!: string;
    langKey!: string;
    lastModifiedBy!: string;
    lastModifiedDate!: Date;
    lastName!: string;
    login!: string;
}

export class CurrentUserLoged {
    token!: string;
    user!: UserLoged;
    username!: string;
    tokenAux!: TokenAux;
    any!: any;
}

export class TokenAux {
    sub!: string;
    auth!: string;
    exp!: number;
    dat!: Date;
}

export class CurrentUserSalesAppAux {
    username!: string;
    token!: string;
    user!: any;
    funcionarioDTO!: any;
    tokenAux!: TokenAux;
}
export class Coords {
    accuracy!: number;
    altitude!: number;
    altitudeAccuracy!: number;
    heading!: any;
    latitude!: number;
    longitude!: number;
    speed!: number;
}
export class GeolocationPosition {
    coords!: Coords;
    timestamp!: number;
}
