import { Component, ChangeDetectorRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AppItensModalConfirmComponent } from '../modals/app-itens-modal-confirm/app-itens-modal-confirm.component';
import { ToastrService } from 'ngx-toastr';
import { ColumnMode, SelectionType } from '@swimlane/ngx-datatable';
import { environment } from 'environments/environment';
import { ItemCategoriaDTO } from '@modules/shared/models/item';
import { ItemCategoriaService } from '@modules/shared/services/categoria.service';

@Component({
    selector: 'app-item-categoria',
    templateUrl: './categoria.component.html',
    styleUrls: ['./categoria.component.scss'],
})
export class ItemCategoriaComponent {

    ColumnMode = ColumnMode;
    itemCategoria: ItemCategoriaDTO;
    itemCategorias!: ItemCategoriaDTO[];
    errorForm: any = {};
    entitySelected: any;
    // status 1 = salvando, status 2 = editando, status 3 = pesquisando
    statusForm: number;
    selectionTypeSingle = SelectionType.single;
    selected: any[] = [];
    // datatable

    percentageMask = environment.percentageMask;

    constructor(
        private _modalService: NgbModal,
        private _itemGrupoService: ItemCategoriaService,
        private toastr: ToastrService,
        private cdr: ChangeDetectorRef,
    ) {
        this.itemCategoria = new ItemCategoriaDTO();
        this.itemCategoria.status = true;
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
        this.itemCategorias = [];
        this.selected = [];
        this._itemGrupoService.find(this.itemCategoria)
            .subscribe((data) => {
                this.itemCategorias = data;
                if (this.itemCategorias.length === 0) {
                    this.pop('success', 'Pesquisa', 'Não foi encontrado nada com essa pesquisa');
                } else {
                    this.statusForm = 3;
                    this.setaColumns(this.itemCategorias);
                }
                this.cdr.detectChanges();
            }, (err) => {
                this.pop('error', 'Erro', 'Erro ao pesquisar');
                this.cdr.detectChanges();
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
                        this.itemCategorias = [];
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

    limpa(): void {
        this.itemCategoria = new ItemCategoriaDTO();
        this.itemCategoria.status = true;
        this.statusForm = 1;
        this.errorForm = {};
        this.selected = [];
    }

    voltar(): void {
        if (this.itemCategoria.id > 0) {
            this.statusForm = 2;
        } else {
            this.statusForm = 1;
        }
    }

    onLeftArray(): void {
        if (this.statusForm === 2) {
            for (let i = 0; i < this.itemCategorias.length; i++) {
                if (this.itemCategoria.id === this.itemCategorias[i].id) {
                    if ((i - 1) >= 0) {
                        this.selected = [];
                        this.itemCategoria = this.itemCategorias[i - 1];
                        i = this.itemCategorias.length + 1;
                        this.selected.push(this.itemCategoria);
                    }
                }
            }
        }
    }

    onRightArray(): void {
        if (this.statusForm === 2) {
            for (let i = 0; i < this.itemCategorias.length; i++) {
                if (this.itemCategoria.id === this.itemCategorias[i].id) {
                    if ((i + 1) < this.itemCategorias.length) {
                        // console.log('entrou');
                        this.selected = [];
                        this.itemCategoria = this.itemCategorias[i + 1];
                        i = this.itemCategorias.length + 1;
                        this.selected.push(this.itemCategoria);
                    }
                }
            }
        }
    }

    onTable(): void {
        if (this.itemCategorias != null && this.itemCategorias.length > 0) {
            this.statusForm = 3;
        } else {
            this.pop('error', 'Erro', 'Procure primeiro');
        }
    }
    onCadastra(): void {
        this._itemGrupoService.postOrPut(this.itemCategoria, this.statusForm)
            .subscribe((data) => {
                this.itemCategoria = data;
                this.errorForm = {};
                this.clear();
                this.statusForm = 2;
                this.cdr.detectChanges();
            }, (err) => {
                if (Object.prototype.hasOwnProperty.call(err, 'error') && err.error != null) {
                    this.errorForm = err.error;
                }
                this.cdr.detectChanges();
            });
    }
    editando(): void {
        // console.log('selecionando para editar');
        const sel = this.itemCategorias.filter(us => {
            return us.id === this.selected[0].id;
        });
        // console.log(sel);
        this.itemCategoria = sel[0];
        this.statusForm = 2;
        this.cdr.detectChanges();
    }
    isValidDelete(): boolean {
        return this.statusForm === 2 && this.itemCategoria.id != null ? false : true;
    }

    setaColumns(itemCategorias: ItemCategoriaDTO[]): void {
        if (itemCategorias.length === 1) {
            this.itemCategoria = itemCategorias[0];
            this.statusForm = 2;
            this.pop('success', 'Encontrado apenas 1 registro', '');
        }
    }

    clear() {
        this.statusForm = 1;
        this.itemCategorias = [];
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
