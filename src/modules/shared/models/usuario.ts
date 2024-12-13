export class AuthorityDTO {
    name!: string;
    description!: string;
    system!: string;
}

export class UserDTO {
    id!: number;
    login!: string;
    firstName!: string;
    lastName?: string;
    password!: string;
    email!: string;
    imageUrl!: string;
    activated!: boolean;
    langKey!: string;
    createdBy!: string;
    createdDate!: string;
    lastModifiedBy!: string;
    authorityDTOs!: AuthorityDTO[];
    idVendedor!: number;
    neededChangePass!: boolean;
}

