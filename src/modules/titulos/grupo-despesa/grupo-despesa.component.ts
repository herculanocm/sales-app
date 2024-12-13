import { ChangeDetectorRef, Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AppTituloModalConfirmComponent } from '../modals/app-titulo-modal-confirm/app-titulo-modal-confirm.component';
import { ColumnMode, SelectionType } from '@swimlane/ngx-datatable';
import { environment } from 'environments/environment';
import { GrupoDespesaDTO } from '@modules/shared/models/titulo';
import { GrupoDespesaService } from '@modules/shared/services';

@Component({
    selector: 'app-grupo-despesa',
    templateUrl: './grupo-despesa.component.html',
    styleUrls: ['./grupo-despesa.component.scss'],
})
export class GrupoDespesaComponent {
    grupoDespesa: GrupoDespesaDTO;
    grupoDespesas: GrupoDespesaDTO[] = [];
    errorForm: any = {};
    entitySelected: any;
    ColumnMode: any;
    // status 1 = salvando, status 2 = editando, status 3 = pesquisando
    statusForm: number;
    selectionTypeSingle = SelectionType.single;
    // datatable
    selected: any[] = [];
    // datatable


    percentageMask = environment.percentageMask;

    constructor(
        private toastr: ToastrService,
        private _modalService: NgbModal,
        private _grupoDespesaService: GrupoDespesaService,
        private cdr: ChangeDetectorRef,
    ) {
        this.grupoDespesa = new GrupoDespesaDTO();
        this.grupoDespesa.status = true;
        this.statusForm = 1;
        this.ColumnMode = ColumnMode;
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

    onPesquisa(): void {
        this.grupoDespesas = [];
        this.selected = [];
        this._grupoDespesaService.find(this.grupoDespesa)
            .subscribe({
                next: (data) => {
                    this.grupoDespesas = data;
                    if (this.grupoDespesas.length === 0) {
                        this.pop('error', 'Erro', 'Não foi encontrado nada com essa pesquisa');
                    } else {
                        this.statusForm = 3;
                        this.setaColumns(this.grupoDespesas);
                    }
                    this.cdr.detectChanges();
                },
                error: () => {
                    this.cdr.detectChanges();
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
                this._grupoDespesaService.del(id)
                    .subscribe({
                        next: (resp: any) => {
                            message = resp.message;
                            this.pop('success', 'Sucesso', message);
                            this.grupoDespesas = [];
                            this.onLimpa();
                            this.cdr.detectChanges();
                        },
                        error: (err: any) => {
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
        this.grupoDespesa = new GrupoDespesaDTO();
        this.grupoDespesa.status = true;
        this.statusForm = 1;
        this.errorForm = {};
        this.selected = [];
        this.cdr.detectChanges();
    }

    voltar(): void {
        if (this.grupoDespesa.id > 0) {
            this.statusForm = 2;
        } else {
            this.statusForm = 1;
        }
        this.cdr.detectChanges();
    }

    onLeftArray(): void {
        if (this.statusForm === 2) {
            for (let i = 0; i < this.grupoDespesas.length; i++) {
                if (this.grupoDespesa.id === this.grupoDespesas[i].id) {
                    if ((i - 1) >= 0) {
                        this.selected = [];
                        this.grupoDespesa = this.grupoDespesas[i - 1];
                        i = this.grupoDespesas.length + 1;
                        this.selected.push(this.grupoDespesa);
                    }
                }
            }
        }
        this.cdr.detectChanges();
    }

    onRightArray(): void {
        if (this.statusForm === 2) {
            for (let i = 0; i < this.grupoDespesas.length; i++) {
                if (this.grupoDespesa.id === this.grupoDespesas[i].id) {
                    if ((i + 1) < this.grupoDespesas.length) {
                        // console.log('entrou');
                        this.selected = [];
                        this.grupoDespesa = this.grupoDespesas[i + 1];
                        i = this.grupoDespesas.length + 1;
                        this.selected.push(this.grupoDespesa);
                    }
                }
            }
        }
        this.cdr.detectChanges();
    }

    onTable(): void {
        if (this.grupoDespesas != null && this.grupoDespesas.length > 0) {
            this.statusForm = 3;
        } else {
            this.pop('error', 'Procure primeiro', '');
        }
        this.cdr.detectChanges();
    }
    onCadastra(): void {
        this._grupoDespesaService.postOrPut(this.grupoDespesa, this.statusForm)
            .subscribe({
                next: (data: any) => {
                    this.grupoDespesa = data;
                    this.pop('success', 'Sucesso', 'Requisição realizada com sucesso');
                    this.errorForm = {};
                    this.clear();
                    this.statusForm = 2;
                    this.cdr.detectChanges();
                },
                error: (err: any) => {
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
        const sel = this.grupoDespesas.filter(us => {
            return us.id === this.selected[0].id;
        });
        // console.log(sel);
        this.grupoDespesa = sel[0];
        this.statusForm = 2;
        this.cdr.detectChanges();
    }
    isValidDelete(): boolean {
        return this.statusForm === 2 && this.grupoDespesa.id != null ? false : true;
    }

    setaColumns(grupoDespesas: GrupoDespesaDTO[]): void {
        if (grupoDespesas.length === 1) {
            this.grupoDespesa = grupoDespesas[0];
            this.statusForm = 2;
            this.pop('success', 'Encontrado apenas 1 registro', '');
        }
    }

    clear() {
        this.statusForm = 1;
        this.grupoDespesas = [];
        this.selected = [];
        this.errorForm = {};
    }

    onActivate(event: any) {
        if (
            (event.type === 'dblclick') ||
            (event.type === 'keydown' && event.event.keyCode === 13)
        ) {
            this.editando();
        }
    }
}
