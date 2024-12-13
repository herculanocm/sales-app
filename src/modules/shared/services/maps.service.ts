import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { RepreLocation, SiteLocation } from '../models/romaneio';


@Injectable()
export class MapsService {
    // private _API_URL_ENDPOINT: string;
    // private _FILE_DOWNLOAD_RESOURCE: string;
    private _API_URL_ENDPOINT_NODEJS: string;


    constructor(
        private _http: HttpClient,
    ) {
        // this._API_URL_ENDPOINT = sessionStorage.getItem('urlEndPointSales');
        // this._FILE_DOWNLOAD_RESOURCE = sessionStorage.getItem('urlEndPointSales') + '/api/files';
        this._API_URL_ENDPOINT_NODEJS = sessionStorage.getItem('urlEndPointNodejs')!;
    }

    getRepreLocations(): Observable<RepreLocation[]> {
        return this._http.get<RepreLocation[]>(this._API_URL_ENDPOINT_NODEJS + '/api/android/get-location');
    }
    getImgBase64(): string {
        return environment.imgMarkerBase64;
    }
    getImgTruckBase64(): string {
        return environment.imgMarkerTruckBase64;
    }
    getSiteLocations(): Observable<SiteLocation[]> {
        return this._http.get<SiteLocation[]>(this._API_URL_ENDPOINT_NODEJS + '/api/site/get-location');
    }
    getImgBase64Vermelho(): string {
        return environment.imgMarkerBase64Vermelho;
    }
    getImgBase64Laranja(): string {
        return environment.imgMarkerBase64Laranja;
    }
}
