import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { VendaDTO } from '@modules/shared/models/venda';
import { MapsService } from '@modules/shared/services/maps.service';
import { RomaneioService } from '@modules/shared/services/romaneio.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-venda-modal-map',
    templateUrl: './app-venda-modal-map.component.html',
    styleUrls: ['./app-venda-modal-map.component.scss'],
})
export class AppVendaModalMapComponent implements OnInit, AfterViewInit {
    @Input() vendaDTO!: VendaDTO;
    gmap!: ElementRef;
    @ViewChild('mapContainerChild', { static: false }) set content(content: ElementRef) {
        if (content) {
            this.gmap = content;
        }
    }
    map!: google.maps.Map;
    lat = -18.913664;
    lng = -48.266560;

    latn!: number;
    lngn!: number;

    coordinates!: google.maps.LatLng;
    mapOptions!: google.maps.MapOptions;
    markers: any[] = [];
    
    constructor(public activeModal: NgbActiveModal,public _mapsService: MapsService,
        private toastr: ToastrService,
        private _service: RomaneioService,
        private spinner: NgxSpinnerService) { }

    ngOnInit(): void {
        console.log('modal');
        console.log(this.vendaDTO);

        if ((this.vendaDTO.latEntrega != null && this.vendaDTO.lngEntrega != null) &&
            (this.vendaDTO.latEntrega.length > 0 && this.vendaDTO.lngEntrega.length > 0)
        ) {
            this.lat = Number(this.vendaDTO.latEntrega);
            this.lng = Number(this.vendaDTO.lngEntrega);
        }

        this.coordinates = new google.maps.LatLng(this.lat, this.lng);


        this.mapOptions = {
            center: this.coordinates,
            zoom: 8,
            styles: [
                {
                    featureType: 'poi.business',
                    stylers: [{ visibility: 'off' }]
                },
                {
                    featureType: 'transit',
                    elementType: 'labels.icon',
                    stylers: [{ visibility: 'off' }]
                }
            ],
        };
    }
    ngAfterViewInit(): void {
        this.mapInitializer();
        this.refreshMarkers();
    }

    pop(tipo: string, titulo: string, msg: string): void {
        if (tipo === 'error') {
            this.toastr.error(msg, titulo);
        } else if (tipo === 'success') {
            this.toastr.success(msg, titulo);
        } else if (tipo === 'warning') {
            this.toastr.warning(msg, titulo);
        } else {
            this.toastr.info(msg, titulo);
        }
    }

    refreshMarkers(): void {
        this.removeMarkers();
        if ((this.lat != null && this.lng != null) && 
            (this.lat != 0 && this.lng != 0) &&
            (Math.abs(this.lat) > 0 && Math.abs(this.lng) > 0)
        ) {
            this.addMarker(this.lat, this.lng, 'Original', this._mapsService.getImgBase64Vermelho());
        }
    }

    removeMarkers(): void {
        if (this.markers != null && this.markers.length > 0) {
            this.markers.forEach((markerInfo: any) => {
                markerInfo.setMap(null);
            });
            this.markers = [];
        }
    }

    mapInitializer() {

        this.map = new google.maps.Map(document.getElementById("mapChild")!, this.mapOptions);
    }
    addMap(): void {
        this.mapInitializer();
    }

    addNewLatLng(): void {
        if ((this.latn != null && this.lngn != null) && 
            (this.latn != 0 && this.lngn != 0) &&
            (Math.abs(this.latn) > 0 && Math.abs(this.lngn) > 0)
        ) {
            this.refreshMarkers();
            this.addMarker(this.latn, this.lngn, 'Novo', this._mapsService.getImgBase64Laranja());
        } else {
            this.pop('error', 'Erro', 'Atenção aos novos parâmetros de Lat e Long');
        }
    }

    fecharAlterar(): void {
        if ((this.latn != null && this.lngn != null) && 
            (this.latn != 0 && this.lngn != 0) &&
            (Math.abs(this.latn) > 0 && Math.abs(this.lngn) > 0)
        ) {
            // this.activeModal.close({tipo: 'confirm', justificativa: justificativa, motivo: motivo});
            this.spinner.show('fullSpinner');
            this._service.updateLatLngPreVendaEEnd(this.vendaDTO.id, this.vendaDTO.idEnderecoCliente, this.latn, this.lngn)
            .subscribe((data) => {
                this.spinner.hide('fullSpinner');
                this.activeModal.close({tipo: 'confirm', vendaDTO: data});
            }, (error) => {
                this.spinner.hide('fullSpinner');
                this.pop('error', 'Erro', 'Erro ao alterar');
            });
        } else {
            this.pop('error', 'Erro', 'Atenção aos novos parâmetros de Lat e Long');
        }
    }

    addMarker(lat: any, lng: any, label: any, img: any): void {
       
            const markerObj = {
                position: new google.maps.LatLng(lat, lng),
                map: this.map,
                title: 'titulo',
                label: {
                    text: label,
                    color: 'black',
                    fontSize: '16px',
                    fontWeight: 'bold',
                },
                // animation: google.maps.Animation.DROP,
                icon: {
                    url: img,
                    fillColor: '#ea4435',
                    scaledSize: new google.maps.Size(40, 60),
                    labelOrigin: new google.maps.Point(15, -10)
                }
            };

            const marker: google.maps.Marker | never = new google.maps.Marker({
                ...markerObj
            });

            // Adding marker to google map
            marker.setMap(this.map);


            this.markers.push(marker);
    }
}
