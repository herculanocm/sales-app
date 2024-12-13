import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import 'moment/locale/pt-br';
import { AppVendaModalAlertComponent } from '../modals/app-venda-modal-alert/app-venda-modal-alert.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { EstoqueAlmoxarifadoService } from '../../estoques/estoque-almoxarifado/estoque-almoxarifado.service';
import { EstoqueAlmoxarifadoDTO } from '../../estoques/estoque-almoxarifado/estoque-almoxarifado';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { ToastrService } from 'ngx-toastr';
import { CurrentUserSalesAppAux, VendasRepre } from '@modules/shared/models/generic';
import { VendaService } from '@modules/shared/services';

@Component({
    selector: 'app-venda-venda-repre',
    templateUrl: './venda-repre.component.html',
    styleUrls: ['./venda-repre.component.scss'],
})
export class VendaRepreComponent implements OnInit {

    ColumnMode!: ColumnMode;
    submitted: boolean;
    statusForm!: number;
    buscaForm!: FormGroup;
    currentUserSalesApp!: CurrentUserSalesAppAux;
    vendasRepre: VendasRepre[];
    vendasRepreAB: VendasRepre[];
    vendasRepreAP: VendasRepre[];
    vendasRepreFA: VendasRepre[];
    vendasRepreCC: VendasRepre[];
    ealxs!: EstoqueAlmoxarifadoDTO[] | undefined;
    activeNav: number;

    constructor(
        private toastr: ToastrService,
        private cdr: ChangeDetectorRef,
        private _vendaService: VendaService,
        private _modalService: NgbModal,
        private spinner: NgxSpinnerService,
        private _estoqueAlmoxarifado: EstoqueAlmoxarifadoService,
    ) {
        this.submitted = false;
        this.activeNav = 1;
        this.vendasRepre = [];
        this.vendasRepreFA = [];
        this.vendasRepreAP = [];
        this.vendasRepreAB = [];
        this.vendasRepreCC = [];
    }
    ngOnInit(): void {
        this.currentUserSalesApp = JSON.parse(sessionStorage.getItem('currentUserSalesApp')!);

        this.createForm();
        this.iniciaObjs();
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

    async iniciaObjs(): Promise<void> {
        this.ealxs = await this._estoqueAlmoxarifado.getAll().toPromise();
        this.cdr.detectChanges();
    }

    onLimpa(): void {
        this.submitted = false;
        this.activeNav = 1;
        this.vendasRepre = [];
        this.vendasRepreFA = [];
        this.vendasRepreAP = [];
        this.vendasRepreAB = [];
        this.vendasRepreCC = [];
    }

    onPesquisa(): void {
        this.submitted = true;
        if (this.buscaForm.invalid) {
            // console.log(this.getFormValidationErrorsV2(this.pedidoForm));
            // console.log(this.getFormValidationErrorsV2(formCliente));
            this.msgAlerta('Atenção', `Existe campos que ainda precisam ser preenchidos`, 'error');
        } else {

            this.buscaForm.patchValue({
                usuario: this.currentUserSalesApp.username,
            });
            const rawValues = this.buscaForm.getRawValue();
            console.log(rawValues);
            this.cdr.detectChanges();
            this.spinner.show('fullSpinner');
            this._vendaService.buscaReportRepresentantes(rawValues)
            .subscribe((data) => {
                this.spinner.hide('fullSpinner');
                this.vendasRepre = this.numberArray(data);
                console.log(this.vendasRepre);


                if (this.vendasRepre.length === 0 ) {
                    this.msgAlerta('Atenção', `Não foi encontrado resultados com esses termos de pesquisa`, 'error');
                } else {
                    this.pop('success', 'Encontrado com sucesso', '');

                    this.vendasRepreFA = this.vendasRepre.filter(dadosFA => {
                        return dadosFA.flg_fat === 1;
                    });

                    /*
                    this.vendasRepreAP = this.vendasRepre.filter(dadosAP => {
                        return dadosAP.venda_status_label_sigla === 'AAE' ||
                        dadosAP.venda_status_label_sigla === 'AAF' ||
                        dadosAP.venda_status_label_sigla === 'AFA';
                    });
                    */

                   this.vendasRepreAP = this.vendasRepre.filter(dadosAP => {
                    return dadosAP.venda_status_label_sigla === 'AGA';
                    });

                    this.vendasRepreAB = this.vendasRepre.filter(dadosAB => {
                        return dadosAB.venda_status_label_sigla === 'AB';
                    });

                    this.vendasRepreCC = this.vendasRepre.filter(dadosCC => {
                        return dadosCC.venda_status_label_sigla === 'CC';
                    });

                    this.vendasRepreFA = this.ordenaArray(this.vendasRepreFA);
                    this.vendasRepreAP = this.ordenaArray(this.vendasRepreAP);
                    this.vendasRepreAB = this.ordenaArray(this.vendasRepreAB);
                    this.vendasRepreCC = this.ordenaArray(this.vendasRepreCC);
                    this.cdr.detectChanges();
                }
            }, (error) => {
                this.spinner.hide('fullSpinner');
                this.msgAlerta('Atenção', `Erro ao buscar as informações,
                contate o administrador`, 'error');
                this.cdr.detectChanges();
            });
        }
    }

    isArray(value: any): boolean {
        return Array.isArray(value);
    }

    valorTotal(): number {
            let val = 0;
            this.vendasRepre.forEach(vr => {
                val += parseFloat(vr.val_total.toString().trim());
            });
            return val;
    }

    qtdTotal(): number {
        if (this.vendasRepre.length > 0) {
            let val = 0;
            this.vendasRepre.forEach(vr => {
                val += vr.qtd_pedido;
            });
            return val;
        } else {
            return 0;
        }
    }

    createForm(): void {
        this.buscaForm = new FormGroup({
            dtaEmissaoInicial: new FormControl(this.convertDate(new Date(), 0), [Validators.required]),
            dtaEmissaoFinal: new FormControl(this.convertDate(new Date(), 0), [Validators.required]),
            usuario: new FormControl(''),
            estoqueAlmoxarifadoId: new FormControl(null),
        });
    }
    get f() { return this.buscaForm.controls; }

    convertDate(inputFormat: any, dia: any) {
        function pad(s: number) {
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

    getValueArray(vendaRepre: VendasRepre[]): number {
        let vlr = 0;
        vendaRepre.forEach(vr => {
            vlr = vlr + (vr.val_total * 1);
        });
        return vlr;
    }

    numberArray(vendaRepre: VendasRepre[]): VendasRepre[] {
        vendaRepre.forEach(vr => {
            vr.val_total = Number(vr.val_total);
        });
        return vendaRepre;
    }
    ordenaArray(vendaRepre: VendasRepre[]): VendasRepre[] {
        vendaRepre.forEach(vr => {

            vr.vendedores_array.sort((c1, c2) => {
                if (c1.val_total < c2.val_total) {
                    return 1;
                }
                if (c1.val_total > c2.val_total) {
                    return -1;
                }
                return 0;
            });

        });

        vendaRepre.sort((c1, c2) => {
            if (c1.val_total < c2.val_total) {
                return 1;
            }
            if (c1.val_total > c2.val_total) {
                return -1;
            }
            return 0;
        });

        // console.log(vendaRepre);

        return vendaRepre;
    }
}
