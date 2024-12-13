import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import 'moment/locale/pt-br';
import { AppVendaModalAlertComponent } from '../modals/app-venda-modal-alert/app-venda-modal-alert.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { ItensAux } from '@modules/shared/models/item';
import { CurrentUserSalesAppAux } from '@modules/shared/models/generic';
import { FormItensReport, ReportItensAgrupado } from '@modules/shared/models/reports';
import { FuncionarioService, VendaService } from '@modules/shared/services';
import { FuncionarioAux } from '@modules/shared/models/funcionario';

@Component({
    selector: 'app-venda-report-itens',
    templateUrl: './report-itens.component.html',
    styleUrls: ['./report-itens.component.scss'],
})
export class ReportItensComponent implements OnInit {

    ColumnMode!: ColumnMode;
    submitted: boolean;
    statusForm!: number;
    buscaForm!: FormGroup;
    itens: ItensAux[] | any;
    currentUserSalesApp!: CurrentUserSalesAppAux;
    reportItensAgrupado: ReportItensAgrupado[];
    constructor(
        private toastr: ToastrService,
        private cdr: ChangeDetectorRef,
        private _vendaService: VendaService,
        private _modalService: NgbModal,
        private _funcionarioService: FuncionarioService,
        private spinner: NgxSpinnerService,
    ) {
        this.submitted = false;
        this.itens = [];
        this.reportItensAgrupado = [];
    }
    async ngOnInit(): Promise<void> {
        this.currentUserSalesApp = JSON.parse(sessionStorage.getItem('currentUserSalesApp')!);

        this.createForm();
        await this.iniciaObjs();
        this.cdr.detectChanges();
    }

    isArray(value: any): boolean {
        return Array.isArray(value);
    }
    
    async iniciaObjs(): Promise<void> {
        this.itens = await this._vendaService.buscaItensAuxAllActiveNode().toPromise();
        this.itens!.sort((i1: any, i2: any) => {
            if (i1.nome < i2.nome) {
                return -1;
            }
            if (i1.nome > i2.nome) {
                return 1;
            }
            return 0;
        });
        this.cdr.detectChanges();
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
    compareItemAux(v1: ItensAux, v2: ItensAux): boolean {
        return v1 && v2 ? v1.id === v2.id : v1 === v2;
    }
    compareVendedor(v1: FuncionarioAux, v2: FuncionarioAux): boolean {
        return v1 && v2 ? v1.id === v2.id : v1 === v2;
    }
 
    onLimpa(): void {
        this.submitted = false;
        this.buscaForm.reset();
        this.buscaForm.patchValue({
            dtaEmissaoInicial: this.convertDate(new Date(), 0),
            dtaEmissaoFinal: this.convertDate(new Date(), 0),
        });
        this.reportItensAgrupado = [];
        this.cdr.detectChanges();
    }

    onPesquisa(): void {
        this.submitted = true;
        if (this.buscaForm.invalid) {
            // console.log(this.getFormValidationErrorsV2(this.pedidoForm));
            // console.log(this.getFormValidationErrorsV2(formCliente));
            this.msgAlerta('Atenção', `Existe campos que ainda precisam ser preenchidos`, 'error');
        } else {
            const nomeItem: string = this.buscaForm.controls['nomeItem'].value;
            const itens: ItensAux[] = this.buscaForm.controls['itens'].value;

            if ((itens == null || itens.length === 0) && (nomeItem == null || nomeItem.length === 0)) {
                this.msgAlerta('Atenção', `Adicione um nome ou item para procura`, 'error');
            } else {
                this.buscaForm.patchValue({
                    usuario: this.currentUserSalesApp.username,
                });
                const form: FormItensReport = this.buscaForm.getRawValue();

                this.spinner.show('fullSpinner');
                this._vendaService.buscaReportItensAgrupado(form)
                    .subscribe((data) => {
                        this.spinner.hide('fullSpinner');
                        this.reportItensAgrupado = data;
                        this.reportItensAgrupado.forEach(el => {
                            el.supervisores_array.sort((s1, s2) => {
                                if (s1.vlr > s2.vlr) {
                                    return -1;
                                }
                                if (s1.vlr < s2.vlr) {
                                    return 1;
                                }
                                return 0;
                            });
                            el.supervisores_array.forEach(el2 => {
                                el2.vendedores_array.sort((v1, v2) => {
                                    if (v1.vlr > v2.vlr) {
                                        return -1;
                                    }
                                    if (v1.vlr < v2.vlr) {
                                        return 1;
                                    }
                                    return 0;
                                });
                            });
                        });
                        this.cdr.detectChanges();
                    }, (error) => {
                        this.spinner.hide('fullSpinner');
                        this.msgAlerta('Atenção', `Erro ao buscar os itens`, 'error');
                        this.cdr.detectChanges();
                    });
            }
        }
    }
    createForm(): void {
        this.buscaForm = new FormGroup({
            dtaEmissaoInicial: new FormControl(this.convertDate(new Date(), 0), [Validators.required]),
            dtaEmissaoFinal: new FormControl(this.convertDate(new Date(), 0), [Validators.required]),
            nomeItem: new FormControl(null),
            usuario: new FormControl(null),
            itens: new FormControl(null),
        });
    }
    get f() { return this.buscaForm.controls; }

    convertDate(inputFormat: any, dia: any) {
        function pad(s: any) {
            return (s < 10) ? '0' + s : s;
        }
        const d = new Date(inputFormat);
        return [d.getFullYear(), pad(d.getMonth() + 1), pad(d.getDate() + dia)].join('-');
    }

    msgAlerta(titulo: string, conteudo: string, tipo: string): void {
        const activeModal = this._modalService.open(
            AppVendaModalAlertComponent, { backdrop: true });
        activeModal.componentInstance.modalHeader = titulo;
        activeModal.componentInstance.modalContent = conteudo;
        activeModal.componentInstance.modalType = tipo;
        activeModal.result.then((result) => { console.log(result) }, (error) => { console.log(error) });
    }
}
