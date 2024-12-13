export class UserForm {
    username!: string;
    password!: string;
    loginbebidas!: boolean;
}
export class User {
    id!: number;
    login!: string;
    firstName!: string;
    lastName!: string;
    email!: string;
    idVendedor!: number;
    imageUrl!: string;
    activated!: boolean;
}
export class TokenAux {
    sub!: string;
    auth!: string;
    exp!: number;
    dat!: Date;
}
export class ObjUpdate {
    isUpdated!: boolean;
    dtaUpdate!: Date;
}
export class DeviceAccess {
    deviceInfo!: DeviceInfo;
    isMobile!: boolean;
    isDesktop!: boolean;
    isChrome!: boolean;
    constructor() {
        this.isMobile = false;
        this.isDesktop = false;
        this.isChrome = false;
    }
}
export class DeviceInfo {
    browser!: string;
    browser_version!: string;
    device!: string;
    os!: string;
    os_version!: string;
    userAgent!: string;
}
