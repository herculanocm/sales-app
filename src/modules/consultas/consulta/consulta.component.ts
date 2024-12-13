import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ConsultaService } from './consulta.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { CurrentUserSalesAppAux, RetornoConsultaQueryAux, ConsultaQueryAux } from './consulta-utils';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-consulta',
    templateUrl: './consulta.component.html',
    styleUrls: ['./consulta.component.scss'],
})
export class ConsultaComponent implements OnInit {

    consultaForm!: FormGroup;
    currentUserSalesApp!: CurrentUserSalesAppAux;
    retornoConsultaQueryAux!: RetornoConsultaQueryAux;

    constructor(
        private _consultaService: ConsultaService,
        private toastr: ToastrService,
        private spinner: NgxSpinnerService,
        private cdr: ChangeDetectorRef,
    ) { }
    initDefaults(): void {
        this.retornoConsultaQueryAux = new RetornoConsultaQueryAux();
        this.retornoConsultaQueryAux.msg = 'Realize a execução da query';
    }
    createForm(): void {
        this.consultaForm = new FormGroup({
            id: new FormControl(''),
            qryText: new FormControl('', Validators.required),
        });
    }
    ngOnInit(): void {
        this.currentUserSalesApp = JSON.parse(sessionStorage.getItem('currentUserSalesApp')!);
        this._consultaService.getUrl();
        this.createForm();
        this.iniciaObjs();
        // console.log(this.currentUserSalesApp);
    }

    async iniciaObjs(): Promise<void> {
        this.initDefaults();
    }
    arredondaNum(numero: number): number {
        return Math.round(numero * 100) / 100;
    }
    isNullorUndefinedNumber(value: any): number {
        if (value == null || typeof (value) === 'undefined' || isNaN(value)) {
            return 0;
        } else {
            return value;
        }
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

    onExecuta(): void {
        this.spinner.show('fullSpinner');

        const consultaQueryAux = new ConsultaQueryAux();
        consultaQueryAux.query = this.consultaForm.controls['qryText'].value;
        consultaQueryAux.username = this.currentUserSalesApp.username;

        this._consultaService.executeQuery(consultaQueryAux)
            .subscribe({
                next: (data) => {
                    this.retornoConsultaQueryAux = data;

                    if (this.retornoConsultaQueryAux.status === false) {
                        this.spinner.hide('fullSpinner');
                        this.pop('error', 'ERRO', this.retornoConsultaQueryAux.msg);
                    } else {
                        this.spinner.hide('fullSpinner');
                        this.retornoConsultaQueryAux.msg = 'Arquivo gerado com id : ' + this.retornoConsultaQueryAux.id;

                        const urlDownload = this._consultaService.getUrlDownload() + '/' + this.retornoConsultaQueryAux.id;

                        window.open(urlDownload);

                        /*
                        this._consultaService.donwloadCSV(this.retornoConsultaQueryAux.id)
                        .subscribe((data) => {
                            console.log(data);
                            this.spinner.hide('fullSpinner');
                        }, (error) => {
                            console.log(error);
                            this.retornoConsultaQueryAux.msg = 'Erro ao buscar arquivo';
                            this.spinner.hide('fullSpinner');
                            this.pop('error', 'Erro ao realizar requisição', '');
                        });
                        */

                    }
                    this.cdr.detectChanges();
                },
                error: () => {
                    this.spinner.hide('fullSpinner');
                    this.pop('error', 'Erro ao realizar requisição', '');
                    this.cdr.detectChanges();
                }
            });
    }
    onLimpa(): void {
        this.consultaForm.reset();
        this.initDefaults();
        this.pop('success', 'Limpo com sucesso', '');
        this.cdr.detectChanges();
    }
}
