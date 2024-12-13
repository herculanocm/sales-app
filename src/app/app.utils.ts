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
    any!: any;
    tokenAux!: TokenAux;
}
export class DeviceInfo {
    browser!: string;
    browser_version!: string;
    device!: string;
    os!: string;
    os_version!: string;
    userAgent!: string;
}
export class DeviceAccess {
    deviceInfo!: DeviceInfo;
    isMobile!: boolean;
    isDesktop!: boolean;
    constructor() {
        this.isMobile = false;
        this.isDesktop = false;
    }
}
export class Coords {
    accuracy!: number;
    altitude!: number;
    latitude!: number;
    longitude!: number;
}
export class TrackerUserAux {
    userId!: number;
    username!: string;
    firstName!: string;
    funcionarioId!: number;
    funcionarioNome!: string;
    deviceAccess!: DeviceAccess;
    coords!: Coords;
    timestamp!: number;
}
export class GoogleGeometryComponents {
    long_name!: string;
    short_name!: string;
    types!: string[];
}
export class GoogleGeometryLocation {
    lat!: number;
    lng!: number;
}
export class GoogleGeometry {
    location!: GoogleGeometryLocation;
    location_type!: string;
    viewport!: any;
}
export class GoogleGeometryReturn {
    place_id!: string;
    partial_match!: boolean;
    types!: string;
    formatted_address!: string;
    address_components!: GoogleGeometryComponents[];
    geometry!: GoogleGeometry;
    plus_code!: any;
}
export class GoogleGeometryCompleteReturn {
    results!: GoogleGeometryReturn[];
    status!: string;
}
export class UtilBodyPOST {
    arg1!: string;
}
export class RotaAux {
    id!: number;
    dta_inclusao!: Date;
    motorista_id!: number;
    motorista_nome!: string;
    usuario_inclusao!: string;
    veiculo_id!: number;
    veiculo_nome!: string;
    limite!: number;
    descricao!: string;
}
