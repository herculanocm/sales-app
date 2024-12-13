export interface LoginVM {
    username: string;
    password: string;
}
export interface TokenReturn {
    id_token: string;
}

export interface StoredSalesProfile {
    user: UserSales,
    token: string,
    tokenAux: any,
    funcionarioDTO: any,
    username: string
}

export interface UserSales {
    id: number;
    login: string;
    firstName: string;
    lastName: string;
    email: string;
    imageUrl: string;
    activated: boolean;
    langKey: string;
    createdBy: string;
    createdDate: Date;
    lastModifiedBy: string;
    lastModifiedDate: Date;
    authorityDTOs: RolesSales[];
}

export interface RolesSales {
    name: string;
    description: string;
    system: string;
}


export interface UserAccountAux {
    id: number;
    login: string;
    firstName: string;
    lastName: string;
    email: string;
    imageUrl: string;
    activated: boolean;
    langKey: string;
    createdBy: string;
    createdDate: Date;
    lastModifiedBy: string;
    lastModifiedDate: Date;
    authorities: string[];
    disabled: boolean;
    singinByApp: boolean;
    singinByMSF: boolean;
}
export interface JWTAux {
    auth: string;
    exp: number;
    iat: number;
    sub: string;
}
