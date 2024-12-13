import { HttpParameterCodec } from '@angular/common/http';
export class CustomHttpParamEncoder implements HttpParameterCodec {
  encodeKey(key: string): string {
    return encodeURIComponent(key);
  }
  encodeValue(value: string): string {
    return encodeURIComponent(value);
  }
  decodeKey(key: string): string {
    return decodeURIComponent(key);
  }
  decodeValue(value: string): string {
    return decodeURIComponent(value);
  }
}
export class GoogleGeometryComponents {
  long_name!: string;
  short_name!: string;
  types!: string[];
}
export class GoogleGeometryLocation {
  lat!: string;
  lng!: string;
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
