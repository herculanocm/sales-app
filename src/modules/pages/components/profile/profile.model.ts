export class Profile {
    id: number;
    login: string;
    firstName: string;
    lastName?: string;
    email: string;
    authorities?: string[];
    senhaNova?: string;
    senhaNova2?: string;
    senhaAtual?: string;

    constructor(id: number,
        login: string,
        firstName: string,
        lastName: string,
        email: string, authorities?: string[], senhaAtual?: string, senhaNova?: string, senhaNova2?: string) {
        this.id = id;
        this.login = login;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.authorities = authorities;
        this.senhaAtual = senhaAtual;
        this.senhaNova = senhaNova;
        this.senhaNova2 = senhaNova2;
    }
}
