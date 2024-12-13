import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import 'moment/locale/pt-br';
import { AppVendaModalAlertComponent } from '../modals/app-venda-modal-alert/app-venda-modal-alert.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ngxCsv } from 'ngx-csv';
import { ToastrService } from 'ngx-toastr';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { FuncionarioAux } from '@modules/shared/models/funcionario';
import { ItemGrupo, ItemGrupoDTO, ItemMarcaDTO } from '@modules/shared/models/item';
import { CurrentUserSalesAppAux, FormPesquisa, ItemCliente } from '@modules/shared/models/generic';
import { FuncionarioService, VendaService } from '@modules/shared/services';

@Component({
    selector: 'app-venda-report-grupo',
    templateUrl: './report-grupo.component.html',
    styleUrls: ['./report-grupo.component.scss'],
})
export class ReportGrupoComponent implements OnInit {

    ColumnMode!: ColumnMode;
    submitted: boolean;
    statusForm!: number;
    buscaForm!: FormGroup;
    vendedores!: FuncionarioAux[] | undefined;
    grupos!: ItemGrupoDTO[] | undefined;
    itensGrupos: ItemGrupo[];
    itemClientes: ItemCliente[];
    marcas!: ItemMarcaDTO[] | any;

    currentUserSalesApp!: CurrentUserSalesAppAux;
    constructor(
        private toastr: ToastrService,
        private cdr: ChangeDetectorRef,
        private _vendaService: VendaService,
        private _modalService: NgbModal,
        private _funcionarioService: FuncionarioService,

        private spinner: NgxSpinnerService,
    ) {
        this.submitted = false;
        this.itensGrupos = [];
        this.itemClientes = [];
    }

    async ngOnInit(): Promise<void> {
        this.currentUserSalesApp = JSON.parse(sessionStorage.getItem('currentUserSalesApp')!);

        this.createForm();
        await this.iniciaObjs();

        this.setaVendedor();
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

    setaVendedor(): void {
        if (this.currentUserSalesApp.funcionarioDTO != null &&
            this.currentUserSalesApp.funcionarioDTO.id != null &&
            this.currentUserSalesApp.funcionarioDTO.id > 0
        ) {
            const funAux: FuncionarioAux = new FuncionarioAux();
            funAux.id = this.currentUserSalesApp.funcionarioDTO.id;
            funAux.nome = this.currentUserSalesApp.funcionarioDTO.nome;
            funAux.indSupervisor = this.currentUserSalesApp.funcionarioDTO.indSupervisor;

            const vend = this.vendedores!.filter(v => {
                return v.id === funAux.id;
            });

            if (vend.length > 0) {

                this.buscaForm.patchValue({
                    vendedor: vend[0],
                });
            } else {
                this.buscaForm.patchValue({
                    vendedor: funAux,
                });
            }


            if (funAux.indSupervisor == null || funAux.indSupervisor === false) {
                this.buscaForm.controls['vendedor'].disable();
            }
        }
    }

    async iniciaObjs(): Promise<void> {
        this.vendedores = await this._funcionarioService.getAllActiveVendedorByusername(
            this.currentUserSalesApp.username).toPromise();
        this.vendedores!.sort((v1, v2) => {
            if (v1.nome < v2.nome) {
                return -1;
            }
            if (v1.nome > v2.nome) {
                return 1;
            }
            return 0;
        });

        this.grupos = await this._vendaService.buscaTodosItemGrupos().toPromise();
        this.marcas = await this._vendaService.buscaTodasMarcas().toPromise();
    }
    compareVendedor(v1: FuncionarioAux, v2: FuncionarioAux): boolean {
        return v1 && v2 ? v1.id === v2.id : v1 === v2;
    }

    onLimpa(): void {
        this.submitted = false;
        this.itensGrupos = [];
        this.itemClientes = [];
        this.buscaForm.reset();
        this.buscaForm.patchValue({
            dtaEmissaoInicial: this.convertDate(new Date(), 0),
            dtaEmissaoFinal: this.convertDate(new Date(), 0),
        });
        this.setaVendedor();
    }

    buscaItensGrupo(formPesq: object): void {
        this.spinner.show('itens');
        this._vendaService.buscaItensDoGrupo(formPesq)
            .subscribe((data) => {
                this.spinner.hide('itens');
                this.itensGrupos = data;
            }, (error) => {
                this.itensGrupos = [];
                this.spinner.hide('itens');
                this.pop('error', 'Erro', 'Erro ao buscar os itens do grupo');
            });
    }

    analiseClientes(): string {
        const qtdCliCompra = this.itemClientes.filter(flt => {
            return flt.qtd_venda > 0;
        });
        return 'Total Clientes : ' + this.itemClientes.length
            + ' - Positivados: ' + qtdCliCompra.length + ' - Perc: '
            + this.roundNum((qtdCliCompra.length / this.itemClientes.length) * 100) + '% - Rest: '
            + (this.itemClientes.length - qtdCliCompra.length);
    }

    roundNum(num: number): number {
        return Math.round((num + Number.EPSILON) * 100) / 100;
    }

    isArray(value: any): boolean {
        return Array.isArray(value);
    }

    buscaItemClientes(formPesq: object): void {
        this.spinner.show('clientes');
        this._vendaService.buscaItemClientesGrupo(formPesq)
            .subscribe((data) => {
                this.spinner.hide('clientes');
                this.itemClientes = data;
                this.cdr.detectChanges();
            }, (error) => {
                this.itemClientes = [];
                this.spinner.hide('clientes');
                this.pop('error', 'Erro', 'Erro ao buscar os clientes');
                this.cdr.detectChanges();
            });
    }

    onPesquisa(): void {
        this.submitted = true;
        if (this.buscaForm.valid) {

            const formPesq: FormPesquisa = this.buscaForm.getRawValue();

            if (
                (formPesq.marcas == null ||
                    formPesq.marcas.length === 0) &&
                (formPesq.grupo == null || formPesq.grupo.id == null)
            ) {
                this.pop('error', 'Erro', 'Ou um grupo ou marcas precisam estar selecionadas');
            } else {
                let marcas = '';

                if (formPesq.marcas != null && formPesq.marcas.length > 0) {
                    formPesq.marcas.forEach(m => {
                        if (marcas.length === 0) {
                            marcas = m.id.toString();
                        } else {
                            marcas += ', ' + m.id.toString();
                        }
                    });

                    marcas = ' (' + marcas + ') ';
                } else {
                    marcas = ' (-1) ';
                }

                const obj = {
                    dtaEmissaoInicial: formPesq.dtaEmissaoInicial,
                    dtaEmissaoFinal: formPesq.dtaEmissaoFinal,
                    grupoId: (
                        formPesq.grupo != null &&
                            formPesq.grupo.id != null &&
                            formPesq.grupo.id > 0 ? formPesq.grupo.id : null),
                    vendedorId: formPesq.vendedor.id,
                    marcas: marcas
                };

                this.buscaItensGrupo(obj);

                this.buscaItemClientes(obj);
                this.cdr.detectChanges();
            }
        } else {
            this.pop('error', 'Erro', 'Selecione os campos para pesquisa');
        }
    }
    createForm(): void {
        this.buscaForm = new FormGroup({
            dtaEmissaoInicial: new FormControl(this.convertDate(new Date(), 0), [Validators.required]),
            dtaEmissaoFinal: new FormControl(this.convertDate(new Date(), 0), [Validators.required]),
            vendedor: new FormControl(null, [Validators.required]),
            grupo: new FormControl(null),
            marcas: new FormControl(null),
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

    onDownloadCSV(): void {
        const nameReport = 'clientes_posit_' + this.currentUserSalesApp.username;
        const options = {
            fieldSeparator: ';',
            quoteStrings: '"',
            decimalseparator: ',',
            showLabels: true,
            showTitle: false,
            useBom: true,
            noDownload: false,
            headers: ['clienteId', 'clienteNome', 'qtdVenda'],
        };
        const data: any[] = [];

        this.itemClientes.forEach(ic => {
            const obj = {
                clienteId: ic.cliente_id,
                clienteNome: ic.cliente_nome,
                qtdVenda: ic.qtd_venda
            };
            data.push(obj);
        });



        const csv = new ngxCsv(data, nameReport, options);
        this.cdr.detectChanges();
    }
}
