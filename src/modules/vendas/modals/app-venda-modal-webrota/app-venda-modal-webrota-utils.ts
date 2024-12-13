export class RoutePoints {
    order!: number;
    name!: string;
    address!: string;
    type!: string;
    latitude!: number;
    longitude!: number;
}
export class Route {
    date_time_start!: Date;
    date_time_end!: Date;
    vehicle_plate!: string;
    document_number!: string;
    external_code!: string;
    route_points!: RoutePoints[];
}
export class RouteWebRota {
    optimize!: boolean;
    geocoding!: boolean;
    source!: string;
    data!: Route;
}
