import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { Route, RoutePoints, RouteWebRota } from './app-venda-modal-webrota-utils';
import { ToastrService } from 'ngx-toastr';
import { RomaneioDTO } from '@modules/shared/models/romaneio';
import { RomaneioService } from '@modules/shared/services/romaneio.service';
import { VendaDTO } from '@modules/shared/models/venda';


@Component({
    selector: 'app-venda-modal-webrota',
    templateUrl: './app-venda-modal-webrota.component.html',
    styleUrls: ['./app-venda-modal-webrota.component.scss'],
})
export class AppVendaModalWebRotaComponent implements OnInit {
    @Input() romaneioDTO!: RomaneioDTO;
    rotaForm!: FormGroup;
    submitted!: boolean;
    routeWebRota: RouteWebRota;
    route_points: RoutePoints[] = [];
    msgErro!: string;
    msgPayload!: string;


    constructor(public activeModal: NgbActiveModal,
        private toastr: ToastrService, private _service: RomaneioService,
        private cdr: ChangeDetectorRef,
        private spinner: NgxSpinnerService) {
        this.routeWebRota = new RouteWebRota();
        this.routeWebRota.optimize = true;
        this.routeWebRota.geocoding = true;
        this.routeWebRota.source = 'G';
        this.routeWebRota.data = new Route();
        this.routeWebRota.data.route_points = [];
        this.route_points = [];
    }

    get f() { return this.rotaForm.controls; }
    createForm(): void {
        this.rotaForm = new FormGroup({
            date_time_start: new FormControl(null, [Validators.required]),
            date_time_end: new FormControl(null, [Validators.required]),
            vehicle_plate: new FormControl('', [Validators.required]),
            document_number: new FormControl('', [Validators.required]),
            external_code: new FormControl('', [Validators.required])
        });
    }

    isArray(value: any): boolean {
        return Array.isArray(value);
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

    ngOnInit(): void {
        this.createForm();
        this.rotaForm.patchValue({
            vehicle_plate: this.getPlacaVeiculo(this.romaneioDTO),
            document_number: (this.romaneioDTO.motoristaDTO != null ? this.romaneioDTO.motoristaDTO.cpf : null),
            external_code: ('Romaneio_Id_' + this.romaneioDTO.id)
        });
        this.rotaForm.controls['external_code'].disable();
        this.rotaForm.controls['vehicle_plate'].disable();
        this.rotaForm.controls['document_number'].disable();

        if (this.romaneioDTO.vendas != null && typeof (this.romaneioDTO.vendas.vendas) != 'undefined' &&
            this.romaneioDTO.vendas.vendas != null && this.romaneioDTO.vendas.vendas.length > 0) {

            const routePointPartida = new RoutePoints();
            routePointPartida.order = 0;
            routePointPartida.name = 'Partida';
            routePointPartida.address = 'R. do Corredor, 0 - MANSOUR - UBERLÂNDIA - Minas Gerais, Brasil';
            routePointPartida.type = 'PARTIDA';
            routePointPartida.latitude = -18.936034;
            routePointPartida.longitude = -48.372579;
            this.route_points.push(routePointPartida);

            this.romaneioDTO.vendas.vendas.forEach((vd: VendaDTO) => {
                const routePoints = new RoutePoints();
                const end = this.getAddress(vd.logradouroEntrega!, vd.numEntrega!, vd.bairroEntrega!, vd.municipioEntrega!, vd.estadoEntrega!);
                // console.log(end);

                routePoints.order = this.route_points.length + 1;
                routePoints.name = ('Venda_Id_' + vd.id);
                routePoints.address = end;
                routePoints.type = 'ENTREGA';
                routePoints.latitude = Number(vd.latEntrega);
                routePoints.longitude = Number(vd.lngEntrega);
                this.route_points.push(routePoints);
            });


            const routePointChegada = new RoutePoints();
            routePointChegada.order = this.route_points.length + 1;
            routePointChegada.name = 'Chegada'
            routePointChegada.address = 'R. do Corredor, 0 - MANSOUR - UBERLÂNDIA - Minas Gerais, Brasil';
            routePointChegada.type = 'CHEGADA';
            routePointChegada.latitude = -18.936034;
            routePointChegada.longitude = -48.372579;
            this.route_points.push(routePointChegada);


        }
    }

    getPlacaVeiculo(romaneioDTO: RomaneioDTO): string | null {
        if (romaneioDTO.veiculoDTO != null && romaneioDTO.veiculoDTO.placa != null &&
            romaneioDTO.veiculoDTO.placa.length > 0) {
            return this.romaneioDTO.veiculoDTO.placa;
        } else {
            return null;
        }
    }

    getAddress(logradouro: string, numLogradouro: number, bairro: string,
        municipio: string, estado: string): string {
        let urlString = '';
        urlString += logradouro;

        if (numLogradouro != null && numLogradouro > 0) {
            urlString += ', ' + numLogradouro;
        }

        if (bairro != null && bairro.length > 0) {
            urlString += ' - ' + bairro;
        }

        if (municipio != null && municipio.length > 0) {
            urlString += ' - ' + municipio;
        }

        if (estado != null && estado.length > 0) {
            urlString += ' - ' + estado;
        }

        urlString += ', Brasil';
        return urlString;
    }

    enviaWebRota(): void {
        this.submitted = true;
        if (this.rotaForm.invalid) {
            this.pop('error', 'Atenção aos campos faltantes', '');
        } else {
            this.routeWebRota.data = this.rotaForm.getRawValue();
            this.routeWebRota.data.route_points = this.route_points;

            this.spinner.show('fullSpinner');
            this._service.loginWebRota()
                .subscribe((data) => {

                    this._service.routePlanWebRota(this.routeWebRota, data.access_token)
                        .subscribe((data2) => {
                            this.spinner.hide('fullSpinner');
                            console.log(data2);
                            this.activeModal.close({ status: 'OK' });
                        }, (error2) => {
                            this.spinner.hide('fullSpinner');
                            if (typeof (error2.error) != 'undefined' && error2.error != null) {
                                this.msgErro = JSON.stringify(error2.error);
                            } else {
                                this.msgErro = JSON.stringify(error2);
                            }
                            this.msgPayload = JSON.stringify(this.routeWebRota);
                            console.log(error2);
                        });

                }, (error) => {
                    this.spinner.hide('fullSpinner');
                    this.pop('error', 'Error ao logar no WEB rota com usuário e senha, contate o administrador', '');
                });

        }
    }
}
