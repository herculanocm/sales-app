import { Component, ChangeDetectorRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AppMovimentoModalConfirmComponent } from '../modals/app-mov-modal-confirm/app-mov-modal-confirm.component';
import { ColumnMode, SelectionType } from '@swimlane/ngx-datatable';
import { ToastrService } from 'ngx-toastr';
import { MovimentoTipoDTO } from '@modules/shared/models/movimento';
import { MovimentoTipoService } from '@modules/shared/services';

@Component({
    selector: 'app-movimento-tipo',
    templateUrl: './movimento-tipo.component.html',
    styleUrls: ['./movimento-tipo.component.scss'],
})
export class MovimentoTipoComponent {

    ColumnMode = ColumnMode;
    movimentoTipo: MovimentoTipoDTO;
    movimentoTipos!: MovimentoTipoDTO[];
    errorForm: any = {};
    // status 1 = salvando, status 2 = editando, status 3 = pesquisando
    statusForm: any;
    selectionTypeSingle = SelectionType.single;

    selected: any[] = [];
    // datatable

    constructor(
        private toastr: ToastrService,
        private cdr: ChangeDetectorRef,
        private _modalService: NgbModal,
        private _movimentoTipoService: MovimentoTipoService,
    ) {
        this.movimentoTipo = new MovimentoTipoDTO();
        this.movimentoTipo.status = true;
        this.movimentoTipo.indTipo = null;
        this.statusForm = 1;
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
        this.movimentoTipos = [];
        this.selected = [];
        this._movimentoTipoService.find(this.movimentoTipo)
            .subscribe((data) => {
                this.movimentoTipos = data;
                // console.log(this.movimentoTipos);
                if (this.movimentoTipos.length === 0) {
                    this.pop('error', 'Pesquisa', 'Não foi encontrado nada com essa pesquisa.');
                } else {
                    this.statusForm = 3;
                    this.setaColumns(this.movimentoTipos);
                }
                this.cdr.detectChanges();
            }, (err) => {
                // // console.log(err);
            });
    }
    onDeleta(id: number): void {

        const activeModal = this._modalService.open(AppMovimentoModalConfirmComponent);
        activeModal.componentInstance.modalHeader = 'Confirme a exclusão';
        activeModal.componentInstance.modalContent = 'Deseja realmente excluir ?';
        activeModal.componentInstance.modalType = 'confirm';
        activeModal.componentInstance.defaultLabel = 'Não';
        activeModal.result.then((result) => {
            if (result === 'confirm') {
                let message = '';
                this._movimentoTipoService.del(id)
                    .subscribe((resp: any) => {
                        message = resp.message;
                        this.movimentoTipos = [];
                        this.onLimpa();
                        this.cdr.detectChanges();
                    }, err => {
                        message = err.message;
                        this.pop('error', 'Erro', message);
                        this.cdr.detectChanges();
                    });
            }
        }, (error) => { console.log(error) });
    }

    onLeftArray(): void {
        if (this.statusForm === 2) {
            for (let i = 0; i < this.movimentoTipos.length; i++) {
                if (this.movimentoTipo.id === this.movimentoTipos[i].id) {
                    if ((i - 1) >= 0) {
                        this.selected = [];
                        this.movimentoTipo = this.movimentoTipos[i - 1];
                        i = this.movimentoTipos.length + 1;
                        this.selected.push(this.movimentoTipo);
                    }
                }
            }
        }
    }

    onRightArray(): void {
        if (this.statusForm === 2) {
            for (let i = 0; i < this.movimentoTipos.length; i++) {
                if (this.movimentoTipo.id === this.movimentoTipos[i].id) {
                    if ((i + 1) < this.movimentoTipos.length) {
                        // console.log('entrou');
                        this.selected = [];
                        this.movimentoTipo = this.movimentoTipos[i + 1];
                        i = this.movimentoTipos.length + 1;
                        this.selected.push(this.movimentoTipo);
                    }
                }
            }
        }
    }

    onTable(): void {
        if (this.movimentoTipos != null && this.movimentoTipos.length > 0) {
            this.statusForm = 3;
        } else {
            this.pop('error', 'Erro', 'Procure primeiro.');
        }
    }

    onLimpa(): void {
        this.limpa();
        this.cdr.detectChanges();
    }
    onCadastra(): void {
        this._movimentoTipoService.postOrPut(this.movimentoTipo, this.statusForm)
            .subscribe((data) => {
                this.movimentoTipo = data;
                this.pop('success', 'Sucesso', '');
                this.errorForm = {};
                this.statusForm = 2;
                this.movimentoTipos = [];
                this.cdr.detectChanges();
            }, (err) => {
                if (Object.prototype.hasOwnProperty.call(err, 'error') && err.error != null) {
                    this.errorForm = err.error;
                }
                this.cdr.detectChanges();
            });
    }
    editando(): void {
        const sel = this.movimentoTipos.filter(us => {
            return us.id === this.selected[0].id;
        });
        // console.log(sel);
        this.movimentoTipo = sel[0];
        this.statusForm = 2;
        this.cdr.detectChanges();
    }
    isValidDelete(): boolean {
        return this.statusForm === 2 && this.movimentoTipo.id != null ? false : true;
    }

    voltar(): void {
        if (this.movimentoTipo.id > 0) {
            this.statusForm = 2;
        } else {
            this.statusForm = 1;
        }
    }

    setaColumns(movimentoTipos: MovimentoTipoDTO[]): void {
        if (movimentoTipos.length === 1) {
            this.movimentoTipo = movimentoTipos[0];
            this.statusForm = 2;
            this.pop('success', 'Encontrado apenas 1 registro', '');
        }
    }

    limpa(): void {
        this.movimentoTipo = new MovimentoTipoDTO();
        this.movimentoTipo.status = true;
        this.movimentoTipo.indTipo = null;
        this.statusForm = 1;
        this.errorForm = {};
        this.selected = [];
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
