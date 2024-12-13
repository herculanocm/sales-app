import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AppTituloModalConfirmComponent } from '../modals/app-titulo-modal-confirm/app-titulo-modal-confirm.component';
import { ColumnMode, SelectionType } from '@swimlane/ngx-datatable';
import { ToastrService } from 'ngx-toastr';
import { GrupoDespesaDTO, SubGrupoDespesaDTO } from '@modules/shared/models/titulo';
import { SubGrupoDespesaService } from '@modules/shared/services';

@Component({
    selector: 'app-sub-grupo-despesa',
    templateUrl: './sub-grupo-despesa.component.html',
    styleUrls: ['./sub-grupo-despesa.component.scss'],
})
export class SubGrupoDespesaComponent implements OnInit {
    subGrupoDespesa!: SubGrupoDespesaDTO;
    subGrupoDespesas: SubGrupoDespesaDTO[] = [];
    grupoDespesas: GrupoDespesaDTO[];
    errorForm: any = {};
    entitySelected: any;
    ColumnMode: any;
    // status 1 = salvando, status 2 = editando, status 3 = pesquisando
    statusForm: number;
    selected: any[] = [];
    // datatable
    selectionTypeSingle = SelectionType.single;

    constructor(
        private spinner: NgxSpinnerService,
        private toastr: ToastrService,
        private _modalService: NgbModal,
        private _subGrupoDespesaService: SubGrupoDespesaService,
        private cdr: ChangeDetectorRef,
    ) {
        this.statusForm = 1;
        this.ColumnMode = ColumnMode;
        this.grupoDespesas = [];
    }

    ngOnInit() {
        this.subGrupoDespesa = new SubGrupoDespesaDTO();
        this.subGrupoDespesa.status = true;
        this.subGrupoDespesa!.grupoDespesaDTO = null;
        this.iniciaGrupos();
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

    iniciaGrupos(): void {
        this._subGrupoDespesaService.findAllGrupos()
            .subscribe({
                next: (data) => {
                    this.grupoDespesas = data.filter(dt => {
                        return dt.status === true;
                    });
                    this.cdr.detectChanges();
                },
                error: () => {
                    this.pop('error', 'Erro', 'Erro ao buscar os grupos');
                }
            });
    }

    atualizaCategorias(event: any): void {
        event.preventDefault();
        this.cdr.detectChanges();
    }

    compareGrupos(c1: GrupoDespesaDTO, c2: GrupoDespesaDTO): boolean {
        return c1 && c2 ? c1.id === c2.id : c1 === c2;
    }

    onPesquisa(): void {
        this.subGrupoDespesas = [];
        this.selected = [];
        this.spinner.show();
        this._subGrupoDespesaService.find(this.subGrupoDespesa)
            .subscribe({
                next: (data) => {
                    this.spinner.hide();
                    this.subGrupoDespesas = data;
                    if (this.subGrupoDespesas.length === 0) {
                        this.pop('error', 'Erro', 'Não foi encontrado nada com essa pesquisa');
                    } else {
                        this.statusForm = 3;
                        this.setaColumns(this.subGrupoDespesas);
                    }
                    this.cdr.detectChanges();
                },
                error: () => {
                    this.spinner.hide();
                    this.pop('error', 'Erro', 'Erro ao pesquisar');
                }
            });
    }
    onDeleta(id: number): void {
        const activeModal = this._modalService.open(AppTituloModalConfirmComponent);
        activeModal.componentInstance.modalHeader = 'Confirme a exclusão';
        activeModal.componentInstance.modalContent = 'Deseja realmente excluir ?';
        activeModal.componentInstance.modalType = 'confirm';
        activeModal.componentInstance.defaultLabel = 'Não';
        activeModal.result.then((result) => {
            if (result === 'confirm') {
                let message = '';
                this.spinner.show();
                this._subGrupoDespesaService.del(id)
                    .subscribe({
                        next: (resp: any) => {
                            this.spinner.hide();
                            message = resp.message;
                            this.pop('success', 'Sucesso', message);
                            this.subGrupoDespesas = [];
                            this.onLimpa();
                            this.cdr.detectChanges();
                        },
                        error: (err: any) => {
                            this.spinner.hide();
                            message = err.message;
                            this.pop('error', 'Erro', message);
                            this.cdr.detectChanges();
                        }
                    });
            }
        });
    }

    onLimpa(): void {
        this.limpa();
    }

    limpa(): void {
        this.subGrupoDespesa = new SubGrupoDespesaDTO();
        this.subGrupoDespesa.status = true;
        this.subGrupoDespesa.grupoDespesaDTO = null;
        this.statusForm = 1;
        this.errorForm = {};
        this.selected = [];
        this.iniciaGrupos();
        this.cdr.detectChanges();
    }

    voltar(): void {
        if (this.subGrupoDespesa.id > 0) {
            this.statusForm = 2;
        } else {
            this.statusForm = 1;
        }
        this.cdr.detectChanges();
    }

    onLeftArray(): void {
        if (this.statusForm === 2) {
            for (let i = 0; i < this.subGrupoDespesas.length; i++) {
                if (this.subGrupoDespesa.id === this.subGrupoDespesas[i].id) {
                    if ((i - 1) >= 0) {
                        this.selected = [];
                        this.subGrupoDespesa = this.subGrupoDespesas[i - 1];
                        i = this.subGrupoDespesas.length + 1;
                        this.selected.push(this.subGrupoDespesa);
                    }
                }
            }
        }
        this.cdr.detectChanges();
    }

    onRightArray(): void {
        if (this.statusForm === 2) {
            for (let i = 0; i < this.subGrupoDespesas.length; i++) {
                if (this.subGrupoDespesa.id === this.subGrupoDespesas[i].id) {
                    if ((i + 1) < this.subGrupoDespesas.length) {
                        // console.log('entrou');
                        this.selected = [];
                        this.subGrupoDespesa = this.subGrupoDespesas[i + 1];
                        i = this.subGrupoDespesas.length + 1;
                        this.selected.push(this.subGrupoDespesa);
                    }
                }
            }
        }
        this.cdr.detectChanges();
    }

    onTable(): void {
        if (this.subGrupoDespesas != null && this.subGrupoDespesas.length > 0) {
            this.statusForm = 3;
        } else {
            this.pop('error', 'Procure primeiro', '');
        }
        this.cdr.detectChanges();
    }
    onCadastra(): void {
        // console.log('On cadastra');
        this.spinner.show();
        this._subGrupoDespesaService.postOrPut(this.subGrupoDespesa, this.statusForm)
            .subscribe({
                next: (data) => {
                    this.spinner.hide();
                    this.subGrupoDespesa = data;
                    this.pop('success', 'Sucesso', 'Requisição realizada com sucesso');
                    this.errorForm = {};
                    this.clear();
                    this.statusForm = 2;
                    this.cdr.detectChanges();
                },
                error: (err: any) => {
                    this.spinner.hide();
                    if (Object.prototype.hasOwnProperty.call(err, 'error') && err.error != null) {
                        this.errorForm = err.error;
                    }
                    this.pop('error', 'Erro', 'Erro ao realizar requisição');
                    this.cdr.detectChanges();
                }
            });
    }
    editando(): void {
        // console.log('selecionando para editar');
        const sel = this.subGrupoDespesas.filter(us => {
            return us.id === this.selected[0].id;
        });
        // console.log(sel);
        this.subGrupoDespesa = sel[0];
        this.statusForm = 2;
        this.cdr.detectChanges();
    }
    isValidDelete(): boolean {
        return this.statusForm === 2 && this.subGrupoDespesa.id != null ? false : true;
    }

    setaColumns(subGrupoDespesas: SubGrupoDespesaDTO[]): void {
        if (subGrupoDespesas.length === 1) {
            this.subGrupoDespesa = subGrupoDespesas[0];
            this.statusForm = 2;
            this.pop('success', 'Encontrado apenas 1 registro', '');
        }
    }

    clear() {
        this.statusForm = 1;
        this.subGrupoDespesas = [];
        this.selected = [];
        this.errorForm = {};
        this.cdr.detectChanges();
    }

    onActivate(event: any) {
        if (
            (event.type === 'dblclick') ||
            (event.type === 'keydown' && event.event.keyCode === 13)
        ) {
            this.editando();
        }
        this.cdr.detectChanges();
    }
}
