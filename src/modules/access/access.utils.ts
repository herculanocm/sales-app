export interface AuthoritiesAux {
    name: string;
}
export interface UserAux {
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
    authorities: AuthoritiesAux[];
    disabled: boolean;
    singinByApp: boolean;
    singinByMSF: boolean;
}
export interface AuthoritiesSelectAux {
    id: string;
    name: string;
}
export interface AdminUserDTO {
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
    organizations: Organization[];
}
export interface GenericPageable {
    page: number;
    size: number;
    sort: {
        field: string;
        direction: string;
    }
}
export interface Organization {
    id: number;
    name: string;
    description: string;
    enableState: boolean;
    userInclusion: string;
    userLastUpdate: string;
    dtaInclusion: Date;
    dtaLastUpdate: Date;
}
export interface KeyValueConfig {
    keyString: string;
    valueString: string;
    description: string;
    encrypted: boolean;
}
