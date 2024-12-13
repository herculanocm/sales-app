import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { RelatorioService } from './relatorio.service';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { AppConsultaModalAlertComponent } from '../modals/app-consulta-modal-alert/app-consulta-modal-alert.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConsultaService } from '../consulta/consulta.service';
import { ConsultaQueryAux, RetornoConsultaQueryAux } from '../consulta/consulta-utils';
import { CurrentUserSalesAppAux } from '@app/app.utils';
import { ToastrService } from 'ngx-toastr';
import { ConsultaRelatorioDTO } from '../consultas.utils';

@Component({
    selector: 'app-report',
    templateUrl: './relatorio.component.html',
    styleUrls: ['./relatorio.component.scss'],
})
export class RelatorioComponent implements OnInit {

    ColumnMode: any;
    submitted: boolean;
    statusForm: number;
    currentUserSalesApp!: CurrentUserSalesAppAux;
    consultaRelatorioDTOs: ConsultaRelatorioDTO[];
    retornoConsultaQueryAux!: RetornoConsultaQueryAux;
    reportForm!: FormGroup;

    constructor(
        private _relatorioService: RelatorioService,
        private cdr: ChangeDetectorRef,
        private toastr: ToastrService,
        private spinner: NgxSpinnerService,
        private _consultaService: ConsultaService,
        private _modalService: NgbModal,
    ) {
        this.submitted = false;
        this.statusForm = 1;
        this.ColumnMode = ColumnMode;
        this.consultaRelatorioDTOs = [];
    }
    ngOnInit(): void {
        this.createForm();
        this.initialize();
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
    buscaConsultasPorUsuario(usuario: string): void {
        this.spinner.show('fullSpinner');
        this._relatorioService.buscaConsultaPorUsuario(usuario)
            .subscribe({
                next: (data) => {
                    this.spinner.hide('fullSpinner');
    
                    this.consultaRelatorioDTOs = data.sort((c1, c2) => {
                        const p1 = c1.area + c1.nome;
                        const p2 = c2.area + c2.nome;
                        if (p1 > p2) {
                            return 1;
                        }
                        if (p1 < p2) {
                            return -1;
                        }
                        return 0;
                    });
                    this.cdr.detectChanges();
                },
                error: (error) => {
                    this.spinner.hide('fullSpinner');
                    console.log(error);
                    this.cdr.detectChanges();
                }
            });
    }

    onExecuta(): void {
        this.submitted = true;

        if (this.reportForm.invalid) {
            this.msgAlerta('Atenção', 'Existe campos que ainda precisam ser preenchidos', 'error');
        } else {

            const consultaQueryAux = new ConsultaQueryAux();

            consultaQueryAux.query = this.reportForm.controls['qry'].value;
            consultaQueryAux.username = this.currentUserSalesApp.username;

            this.spinner.show('fullSpinner');
            this._consultaService.executeQuery(consultaQueryAux)
                .subscribe({
                    next: (data) => {
                        this.spinner.hide('fullSpinner');
                        this.retornoConsultaQueryAux = data;

                        if (this.retornoConsultaQueryAux.status === false) {
                            this.pop('error', 'ERRO', this.retornoConsultaQueryAux.msg);
                        } else {
                            this.retornoConsultaQueryAux.msg = 'Arquivo gerado com id : ' + this.retornoConsultaQueryAux.id;

                            const urlDownload = this._consultaService.getUrlDownload() + '/' + this.retornoConsultaQueryAux.id;

                            window.open(urlDownload);

                            this.onLimpa();

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
    }

    msgAlerta(titulo: string, conteudo: string, tipo: string): void {
        const activeModal = this._modalService.open(
            AppConsultaModalAlertComponent, { backdrop: true });
        activeModal.componentInstance.modalHeader = titulo;
        activeModal.componentInstance.modalContent = conteudo;
        activeModal.componentInstance.modalType = tipo;
        activeModal.result.then((result) => {
            console.log(result);
        }, (error) => {
            console.log(error);
        });
    }

    isConsultaSelecionada(): boolean {
        const consulta: ConsultaRelatorioDTO = this.reportForm.controls['consulta'].value;

        if (consulta != null && consulta.id != null && consulta.id > 0) {
            return true;
        } else {
            return false;
        }
    }
    getDescricaoConsulta(): string {
        const consulta: ConsultaRelatorioDTO = this.reportForm.controls['consulta'].value;

        if (consulta != null && consulta.id != null && consulta.id > 0) {
            return consulta.descricao;
        } else {
            return '';
        }
    }

    isEditavel(): boolean {
        const consulta: ConsultaRelatorioDTO = this.reportForm.controls['consulta'].value;

        if (consulta != null && consulta.id != null && consulta.id > 0) {
            return consulta.editavel;
        } else {
            return false;
        }
    }

    getIdConsulta(): number {
        const consulta: ConsultaRelatorioDTO = this.reportForm.controls['consulta'].value;

        if (consulta != null && consulta.id != null && consulta.id > 0) {
            return consulta.id;
        } else {
            return -1;
        }
    }


    get f() { return this.reportForm.controls; }
    onLimpa(): void {
        this.reportForm.reset();
        this.initialize();
    }
    initialize(): void {
        this.submitted = false;
        this.statusForm = 1;
        this.ColumnMode = ColumnMode;

        this.consultaRelatorioDTOs = [];


        this.retornoConsultaQueryAux = new RetornoConsultaQueryAux();
        this.retornoConsultaQueryAux.msg = 'Realize a execução da query';


        this.currentUserSalesApp = JSON.parse(sessionStorage.getItem('currentUserSalesApp')!);
        this.buscaConsultasPorUsuario(this.currentUserSalesApp.username);
    }
    createForm(): void {
        this.reportForm = new FormGroup({
            consulta: new FormControl(null, [Validators.required]),
            qry: new FormControl(null, [Validators.required]),
        });
    }
    consultaSelecionada(): void {
        const consulta: ConsultaRelatorioDTO = this.reportForm.controls['consulta'].value;
        this.reportForm.controls['qry'].disable();

        // console.log(consulta);
        if (consulta != null && consulta.id != null && consulta.id > 0) {
            this.reportForm.controls['qry'].setValue(consulta.qry);

            if (consulta.editavel) {
                this.reportForm.controls['qry'].enable();
            }
        }
    }
}
