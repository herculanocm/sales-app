import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AppClienteModalConfirmComponent } from '../modals/app-cliente-modal-confirm/app-cliente-modal-confirm.component';
import { ColumnMode, SelectionType } from '@swimlane/ngx-datatable';
import { ToastrService } from 'ngx-toastr';
import { SetorDTO } from '@modules/shared/models/cliente';
import { SetorService } from '@modules/shared/services';

@Component({
    selector: 'app-setor',
    templateUrl: './setor.component.html',
    styleUrls: ['./setor.component.scss'],
})
export class SetorComponent {

    ColumnMode = ColumnMode;
    setor: SetorDTO;
    setores!: SetorDTO[];
    errorForm: any = {};
    authorities!: string[];
    authSelected: any;
    // status 1 = salvando, status 2 = editando, status 3 = pesquisando
    statusForm: number;
    selectionTypeSingle = SelectionType.single;

    // datatable
    rows: any[] = [];
    columns: any[] = [
        { name: 'ID' },
        { name: 'NOME' },
        { name: 'STATUS' },
    ];
    selected: any[] = [];
    // datatable

    constructor(
        private toastr: ToastrService,
        private cdr: ChangeDetectorRef,
        private _modalService: NgbModal,
        private _setorService: SetorService,
    ) {
        this.setor = new SetorDTO();
        this.setor.status = true;
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
        this.setores = [];
        this.selected = [];
        this.rows = [];
        this._setorService.find(this.setor)
            .subscribe((data) => {
                this.setores = data;
                if (this.setores.length === 0) {
                    this.pop('error', 'Pesquisa', 'Não foi encontrado nada com essa pesquisa.');
                } else {
                    this.statusForm = 3;
                    this.setaColumns(this.setores);
                }
                this.cdr.detectChanges();
            }, (err) => {
                // // console.log(err);
            });
    }
    onDeleta(id: number): void {
        const activeModal = this._modalService.open(AppClienteModalConfirmComponent);
        activeModal.componentInstance.modalHeader = 'Confirme a exclusão';
        activeModal.componentInstance.modalContent = 'Deseja realmente excluir ?';
        activeModal.componentInstance.modalType = 'confirm';
        activeModal.componentInstance.defaultLabel = 'Não';
        activeModal.result.then((result) => {
            if (result === 'confirm') {
                let message = '';
                this._setorService.del(id)
                    .subscribe((resp: any) => {
                        message = resp.message;
                        // this.showToast('success', 'Sucesso', message);
                        this.rows = [];
                        this.setores = [];
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

    onLimpa(): void {
        this.limpa();
    }
    onCadastra(): void {
        this._setorService.postOrPut(this.setor, this.statusForm)
            .subscribe((data) => {
                this.setor = data;
                // this.showToast('success', 'Sucesso', 'Requisição realizada sucesso.');
                this.errorForm = {};
                this.statusForm = 2;
                this.rows = [];
                this.setores = [];
                this.cdr.detectChanges();
            }, (err) => {
                if (Object.prototype.hasOwnProperty.call(err, 'error') && err.error != null) {
                    this.errorForm = err.error;
                }
                this.cdr.detectChanges();
            });
    }
    editando(): void {
        // // console.log('selecionando para editar');
        const sel = this.setores.filter(us => {
            return us.id === this.selected[0].id;
        });
        // console.log(sel);
        this.setor = sel[0];
        this.statusForm = 2;
        this.cdr.detectChanges();
    }
    isValidDelete(): boolean {
        return this.statusForm === 2 && this.setor.id != null ? false : true;
    }

    setaColumns(setores: SetorDTO[]): void {
        if (setores.length === 1) {
            this.setor = setores[0];
            this.statusForm = 2;
            this.pop('success', 'Encontrado apenas 1 registro', '');
        } else {
            this.rows = [];
            for (let i = 0; i < setores.length; i++) {
                this.rows.push(
                    {
                        id: setores[i].id,
                    },
                );
            }
        }
    }

    voltar(): void {
        if (this.setor.id > 0) {
            this.statusForm = 2;
        } else {
            this.statusForm = 1;
        }
    }

    onLeftArray(): void {
        if (this.statusForm === 2) {
            for (let i = 0; i < this.setores.length; i++) {
                if (this.setor.id === this.setores[i].id) {
                    if ((i - 1) >= 0) {
                        this.selected = [];
                        this.setor = this.setores[i - 1];
                        i = this.setores.length + 1;
                        this.selected.push(this.setor);
                    }
                }
            }
        }
    }

    onRightArray(): void {
        if (this.statusForm === 2) {
            for (let i = 0; i < this.setores.length; i++) {
                if (this.setor.id === this.setores[i].id) {
                    if ((i + 1) < this.setores.length) {
                        // console.log('entrou');
                        this.selected = [];
                        this.setor = this.setores[i + 1];
                        i = this.setores.length + 1;
                        this.selected.push(this.setor);
                    }
                }
            }
        }
    }

    onTable(): void {
        if (this.setores != null && this.setores.length > 0) {
            this.statusForm = 3;
        } else {
            this.pop('error', 'Erro', 'Procure primeiro.');
        }
    }

    limpa(): void {
        this.setor = new SetorDTO();
        this.setor.status = true;
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
