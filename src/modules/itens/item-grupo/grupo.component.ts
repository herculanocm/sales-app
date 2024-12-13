import { Component, ChangeDetectorRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AppItensModalConfirmComponent } from '../modals/app-itens-modal-confirm/app-itens-modal-confirm.component';
import { ToastrService } from 'ngx-toastr';
import { ColumnMode, SelectionType } from '@swimlane/ngx-datatable';
import { environment } from 'environments/environment';
import { ItemGrupoDTO } from '@modules/shared/models/item';
import { ItemGrupoService } from '@modules/shared/services/grupo.service';

@Component({
    selector: 'app-item-grupo',
    templateUrl: './grupo.component.html',
    styleUrls: ['./grupo.component.scss'],
})
export class ItemGrupoComponent {

    ColumnMode = ColumnMode;
    itemGrupo: ItemGrupoDTO;
    itemGrupos!: ItemGrupoDTO[];
    errorForm: any = {};
    entitySelected: any;
    // status 1 = salvando, status 2 = editando, status 3 = pesquisando
    statusForm: number;
    selectionTypeSingle = SelectionType.single;
    // datatable
    selected: any[] = [];
    // datatable


    percentageMask = environment.percentageMask;

    constructor(
        private toastr: ToastrService,
        private cdr: ChangeDetectorRef,
        private _modalService: NgbModal,
        private _itemGrupoService: ItemGrupoService,
    ) {
        this.itemGrupo = new ItemGrupoDTO();
        this.itemGrupo.status = true;
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
        this.itemGrupos = [];
        this.selected = [];
        this._itemGrupoService.find(this.itemGrupo)
            .subscribe((data) => {
                this.itemGrupos = data;
                if (this.itemGrupos.length === 0) {
                    this.pop('error', 'Erro', 'Não foi encontrado nada com essa pesquisa');
                } else {
                    this.statusForm = 3;
                    this.setaColumns(this.itemGrupos);
                }
                this.cdr.detectChanges();
            }, (err) => {
                this.pop('error', 'Erro', 'Erro ao pesquisar');
            });
    }
    onDeleta(id: number): void {
        const activeModal = this._modalService.open(AppItensModalConfirmComponent);
        activeModal.componentInstance.modalHeader = 'Confirme a exclusão';
        activeModal.componentInstance.modalContent = 'Deseja realmente excluir ?';
        activeModal.componentInstance.modalType = 'confirm';
        activeModal.componentInstance.defaultLabel = 'Não';
        activeModal.result.then((result) => {
            if (result === 'confirm') {
                let message = '';
                this._itemGrupoService.del(id)
                    .subscribe((resp: any) => {
                        message = resp.message;
                        this.pop('success', 'Sucesso', message);
                        this.itemGrupos = [];
                        this.onLimpa();
                        this.cdr.detectChanges();
                    }, err => {
                        message = err.message;
                        this.pop('error', 'Erro', message);
                    });
            }
        }, (error) => { console.log(error) });
    }

    onLimpa(): void {
        this.limpa();
        this.cdr.detectChanges();
    }

    limpa(): void {
        this.itemGrupo = new ItemGrupoDTO();
        this.itemGrupo.status = true;
        this.statusForm = 1;
        this.errorForm = {};
        this.selected = [];
    }

    voltar(): void {
        if (this.itemGrupo.id > 0) {
            this.statusForm = 2;
        } else {
            this.statusForm = 1;
        }
    }

    onLeftArray(): void {
        if (this.statusForm === 2) {
            for (let i = 0; i < this.itemGrupos.length; i++) {
                if (this.itemGrupo.id === this.itemGrupos[i].id) {
                    if ((i - 1) >= 0) {
                        this.selected = [];
                        this.itemGrupo = this.itemGrupos[i - 1];
                        i = this.itemGrupos.length + 1;
                        this.selected.push(this.itemGrupo);
                    }
                }
            }
        }
    }

    onRightArray(): void {
        if (this.statusForm === 2) {
            for (let i = 0; i < this.itemGrupos.length; i++) {
                if (this.itemGrupo.id === this.itemGrupos[i].id) {
                    if ((i + 1) < this.itemGrupos.length) {
                        // console.log('entrou');
                        this.selected = [];
                        this.itemGrupo = this.itemGrupos[i + 1];
                        i = this.itemGrupos.length + 1;
                        this.selected.push(this.itemGrupo);
                    }
                }
            }
        }
    }

    onTable(): void {
        if (this.itemGrupos != null && this.itemGrupos.length > 0) {
            this.statusForm = 3;
        } else {
            this.pop('error', 'Procure primeiro', '');
        }
    }
    onCadastra(): void {
        this._itemGrupoService.postOrPut(this.itemGrupo, this.statusForm)
            .subscribe((data) => {
                this.itemGrupo = data;
                this.pop('success', 'Sucesso', 'Requisição realizada com sucesso');
                this.errorForm = {};
                this.clear();
                this.statusForm = 2;
                this.cdr.detectChanges();
            }, (err) => {
                if (Object.prototype.hasOwnProperty.call(err, 'error') && err.error != null) {
                    this.errorForm = err.error;
                }
                this.pop('error', 'Erro', 'Erro ao realizar requisição');
                this.cdr.detectChanges();
            });
    }
    editando(): void {
        // console.log('selecionando para editar');
        const sel = this.itemGrupos.filter(us => {
            return us.id === this.selected[0].id;
        });
        // console.log(sel);
        this.itemGrupo = sel[0];
        this.statusForm = 2;
        this.cdr.detectChanges();
    }
    isValidDelete(): boolean {
        return this.statusForm === 2 && this.itemGrupo.id != null ? false : true;
    }

    setaColumns(itemGrupos: ItemGrupoDTO[]): void {
        if (itemGrupos.length === 1) {
            this.itemGrupo = itemGrupos[0];
            this.statusForm = 2;
            this.pop('success', 'Encontrado apenas 1 registro', '');
        }
    }

    clear() {
        this.statusForm = 1;
        this.itemGrupos = [];
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
