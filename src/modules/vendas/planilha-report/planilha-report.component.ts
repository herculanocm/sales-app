import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import 'moment/locale/pt-br';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { EstoqueAlmoxarifadoService } from '../../estoques/estoque-almoxarifado/estoque-almoxarifado.service';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { ToastrService } from 'ngx-toastr';
import { CurrentUserSalesAppAux } from '@modules/shared/models/generic';
import { ReportsService, VendaService } from '@modules/shared/services';
import { FuncionarioAux, FuncionarioDTO } from '@modules/shared/models/funcionario';
import { SupervisorRepresentanteAux, SupervisorAux, RepresentanteAux, ReportUserWithLevelAccessSupervisor, ReportPostBodySuperVend, ReportQuad1 } from '@modules/shared/models/reports';
import { lastValueFrom } from 'rxjs';

@Component({
    selector: 'app-venda-planilha-report',
    templateUrl: './planilha-report.component.html',
    styleUrls: ['./planilha-report.component.scss'],
})
export class PlanilhaReportComponent implements OnInit {

    ColumnMode!: ColumnMode;
    currentUserSalesApp: CurrentUserSalesAppAux = JSON.parse(sessionStorage.getItem('currentUserSalesApp')!);
    submitted = false;
    supervisoresFiltered: SupervisorRepresentanteAux[] = [];

    rUserAcess!: ReportUserWithLevelAccessSupervisor;

    supervisorId = -1;
    vendedorId = -1;

    resultQuad1: ReportQuad1[] =[];

    buscaForm = new FormGroup({
        supervisor: new FormControl<SupervisorRepresentanteAux | null>(null),
        vendedor: new FormControl<RepresentanteAux | null>(null),
        dtaEmissaoInicial: new FormControl(this.convertDateMonth(new Date()), [Validators.required]),
        dtaEmissaoFinal: new FormControl(this.convertDate(new Date(), 0), [Validators.required]),
    });

    constructor(
        private toastr: ToastrService,
        private cdr: ChangeDetectorRef,
        private _vendaService: VendaService,
        private _modalService: NgbModal,
        private spinner: NgxSpinnerService,
        private _estoqueAlmoxarifado: EstoqueAlmoxarifadoService,
        private _reportsService: ReportsService
    ) { }

    getRepresentantesFiltered(): RepresentanteAux[] {
        const supervisor: SupervisorRepresentanteAux | null = this.buscaForm.get('supervisor')!.value;
        if (supervisor != null && supervisor.vendedores != null && supervisor.vendedores.length > 0) {
            return supervisor.vendedores;
        } else {
            return [];
        }
    }

    async ngOnInit(): Promise<void> {

        if (this.currentUserSalesApp.funcionarioDTO != null) {
            if (this.currentUserSalesApp.funcionarioDTO.indSupervisor === true) {
                this.supervisorId = this.currentUserSalesApp.funcionarioDTO.id;
            }

            if (this.currentUserSalesApp.funcionarioDTO.indVendedor === true) {
                this.vendedorId = this.currentUserSalesApp.funcionarioDTO.id;
            }
        }

        const rUserAcessArray = await lastValueFrom(this._reportsService.find_sellers(this.currentUserSalesApp.username));
        if (rUserAcessArray.length > 0) {
            this.rUserAcess = rUserAcessArray[0];
        } else {
            this.rUserAcess = {
                level_access: 0,
                login: this.currentUserSalesApp.username,
                supervisores: []
            };
        }
        console.log(this.rUserAcess);
        this.setFormAccess();
    }

    setFormAccess(): void {
        if (this.rUserAcess != null) {
            this.supervisoresFiltered = [...this.rUserAcess.supervisores];

            if (this.rUserAcess.level_access === 2) {
                const filterSupervisores = this.rUserAcess.supervisores.filter((supervisor: SupervisorRepresentanteAux) => {
                    return supervisor.supervisor_id === this.supervisorId;
                });
                if (filterSupervisores.length > 0) {
                    this.buscaForm.get('supervisor')!.setValue(filterSupervisores[0]);
                    this.buscaForm.get('supervisor')!.disable();
                }
            } else if (this.rUserAcess.level_access === 1) {
                const filterVendedor = this.rUserAcess.supervisores[0].vendedores.filter((vendedor: RepresentanteAux) => {
                    return vendedor.vendedor_id === this.vendedorId;
                });

                if (filterVendedor.length > 0) {
                    this.buscaForm.get('supervisor')!.setValue(this.rUserAcess.supervisores[0]);
                    this.buscaForm.get('supervisor')!.disable();
                    this.buscaForm.get('vendedor')!.setValue(filterVendedor[0]);
                    this.buscaForm.get('vendedor')!.disable();
                }
            } else if (this.rUserAcess.level_access === 0) {
                this.toastr.error('Usuário sem funcionário representante configurado', 'Erro');
            }
        } else {
            this.toastr.error('Usuário sem funcionário representante configurado', 'Erro');
            this.buscaForm.get('supervisor')!.disable();
            this.buscaForm.get('vendedor')!.disable();
        }

        this.cdr.markForCheck();
    }

    convertDate(inputFormat: any, dia: any): string {
        function pad(s: number) {
            return s < 10 ? '0' + s : s;
        }
        const d = new Date(inputFormat);
        return [
            d.getFullYear(),
            pad(d.getMonth() + 1),
            pad(d.getDate() + dia),
        ].join('-');
    }

    convertDateMonth(inputFormat: any): string {
        function pad(s: number) {
            return s < 10 ? '0' + s : s;
        }
        const d = new Date(inputFormat);
        return [
            d.getFullYear(),
            pad(d.getMonth() + 1),
            pad(1),
        ].join('-');
    }

    isArray(value: any): boolean {
        return Array.isArray(value);
    }

    isUndefined(value: any): boolean {
        return typeof (value) === 'undefined';
    }

    isAcessoTodasSupervisores(): boolean {
        const flt = this.currentUserSalesApp.user.authorityDTOs.filter(
            (auth: any) => {
                return auth.name === 'ROLE_SALES_PAGINA_VENDA_FUNCAO_REPORT_PLAN_GERENTE' || auth.name === 'ROLE_ADMIN';
            }
        );
        return flt.length > 0 ? true : false;
    }

    onLimpa(): void {
        this.submitted = false;
        this.buscaForm.reset();
        this.buscaForm.get('dtaEmissaoInicial')!.setValue(this.convertDateMonth(new Date()));
        this.buscaForm.get('dtaEmissaoFinal')!.setValue(this.convertDate(new Date(), 0));
        this.setFormAccess();
        this.resultQuad1 = [];
    }
    onPesquisa(): void {
        this.submitted = true;
        if (this.rUserAcess.level_access === 0) {
            this.toastr.error('Usuário sem funcionário representante configurado', 'Erro');
            return;
        } else {
            if (this.buscaForm.invalid) {
                this.toastr.error('Preencha os campos obrigatórios', 'Erro');
                return;
            } else {
                const values: any = this.buscaForm.getRawValue();
                console.log(values);

                const postBody: ReportPostBodySuperVend = {
                    dtaEmissaoInicial: values.dtaEmissaoInicial,
                    dtaEmissaoFinal: values.dtaEmissaoFinal,
                    vendedorId: -1,
                    supervisorId: -1
                };

                if (values.supervisor != null && this.isUndefined(values.supervisor) === false) {
                    postBody.supervisorId = values.supervisor.supervisor_id;
                }

                if (values.vendedor != null && this.isUndefined(values.vendedor) === false) {
                    postBody.vendedorId = values.vendedor.vendedor_id;
                }
                this.spinner.show('fullSpinner');
                this._reportsService.findIndQuad1(postBody)
                .subscribe({
                    next: (data) => {
                        this.spinner.hide('fullSpinner');
                        this.resultQuad1 = data;
                        this.resultQuad1.sort((obj1, obj2) => {
                            if (obj1.ord_ind > obj2.ord_ind) {
                                return 1;
                            }
                            if (obj1.ord_ind < obj2.ord_ind) {
                                return -1;
                            }
                            return 0;
                        });

                        this.cdr.markForCheck();
                    },
                    error: (error) => {
                        this.spinner.hide('fullSpinner');
                        console.log(error);
                        this.toastr.error('Nenhum valor retornado para quad1, erro.', 'Erro');
                    }
                });
            }
        }
    }

    get f() {
        return this.buscaForm.controls;
    }

    compareVendedor(v1: any, v2: any): boolean {
        return v1 && v2 ? v1.vendedor_id === v2.vendedor_id : v1 === v2;
    }

    compareSupervisor(v1: SupervisorAux, v2: SupervisorAux): boolean {
        return v1 && v2 ? v1.supervisor_id === v2.supervisor_id : v1 === v2;
    }
}
