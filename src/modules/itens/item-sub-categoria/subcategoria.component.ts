import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AppItensModalConfirmComponent } from '../modals/app-itens-modal-confirm/app-itens-modal-confirm.component';
import { ToastrService } from 'ngx-toastr';
import { ColumnMode, SelectionType } from '@swimlane/ngx-datatable';
import { environment } from 'environments/environment';
import { ItemCategoriaDTO, ItemSubCategoriaDTO } from '@modules/shared/models/item';
import { ItemSubCategoriaService } from '@modules/shared/services/subcategoria.service';
import { ItemCategoriaService } from '@modules/shared/services/categoria.service';

@Component({
    selector: 'app-item-sub-categoria',
    templateUrl: './subcategoria.component.html',
    styleUrls: ['./subcategoria.component.scss'],
})
export class ItemSubCategoriaComponent implements OnInit {
    ColumnMode = ColumnMode;
    itemSubCategoria!: ItemSubCategoriaDTO;
    itemSubCategorias!: ItemSubCategoriaDTO[];
    errorForm: any = {};
    entitySelected: any;
    // status 1 = salvando, status 2 = editando, status 3 = pesquisando
    statusForm: number;
    selected: any[] = [];
    // datatable
    selectionTypeSingle = SelectionType.single;

    categoriaDTOs!: ItemCategoriaDTO[];
    percentageMask = environment.percentageMask;

    constructor(
        private spinner: NgxSpinnerService,
        private _modalService: NgbModal,
        private _itemSubCategoriaService: ItemSubCategoriaService,
        private _itemCategoriaService: ItemCategoriaService,
        private toastr: ToastrService,
        private cdr: ChangeDetectorRef,
    ) {
        this.statusForm = 1;
    }

    ngOnInit() {
        this.iniciaCategorias();
        this.itemSubCategoria = new ItemSubCategoriaDTO();
        this.itemSubCategoria.status = true;
        this.itemSubCategoria.itemCategoriaDTO = null;
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

    iniciaCategorias(): void {
        this._itemCategoriaService.getAllActive()
            .subscribe((data) => {
                this.categoriaDTOs = data;
                this.cdr.detectChanges();
            }, (err) => {
                this.pop('error', 'Erro', 'Erro ao atualizar categorias');
            });
    }

    atualizaCategorias(event: any): void {
        event.preventDefault();
        // console.log('Atualizando categorias');
        this.iniciaCategorias();
    }

    compareCategoria(c1: ItemCategoriaDTO, c2: ItemCategoriaDTO): boolean {
        return c1 && c2 ? c1.id === c2.id : c1 === c2;
    }

    onPesquisa(): void {
        this.itemSubCategorias = [];
        this.selected = [];
        this.spinner.show();
        this._itemSubCategoriaService.find(this.itemSubCategoria)
            .subscribe((data) => {
                this.spinner.hide();
                this.itemSubCategorias = data;
                if (this.itemSubCategorias.length === 0) {
                    this.pop('error', 'Erro', 'Não foi encontrado nada com essa pesquisa');
                } else {
                    this.statusForm = 3;
                    this.setaColumns(this.itemSubCategorias);
                }
                this.cdr.detectChanges();
            }, (err) => {
                this.spinner.hide();
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
                this.spinner.show();
                this._itemSubCategoriaService.del(id)
                    .subscribe((resp: any) => {
                        this.spinner.hide();
                        message = resp.message;
                        this.pop('success', 'Sucesso', message);
                        this.itemSubCategorias = [];
                        this.onLimpa();
                        this.cdr.detectChanges();
                    }, err => {
                        this.spinner.hide();
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
        this.itemSubCategoria = new ItemSubCategoriaDTO();
        this.itemSubCategoria.status = true;
        this.statusForm = 1;
        this.errorForm = {};
        this.selected = [];
    }

    voltar(): void {
        if (this.itemSubCategoria.id > 0) {
            this.statusForm = 2;
        } else {
            this.statusForm = 1;
        }
    }

    onLeftArray(): void {
        if (this.statusForm === 2) {
            for (let i = 0; i < this.itemSubCategorias.length; i++) {
                if (this.itemSubCategoria.id === this.itemSubCategorias[i].id) {
                    if ((i - 1) >= 0) {
                        this.selected = [];
                        this.itemSubCategoria = this.itemSubCategorias[i - 1];
                        i = this.itemSubCategorias.length + 1;
                        this.selected.push(this.itemSubCategoria);
                    }
                }
            }
        }
    }

    onRightArray(): void {
        if (this.statusForm === 2) {
            for (let i = 0; i < this.itemSubCategorias.length; i++) {
                if (this.itemSubCategoria.id === this.itemSubCategorias[i].id) {
                    if ((i + 1) < this.itemSubCategorias.length) {
                        // console.log('entrou');
                        this.selected = [];
                        this.itemSubCategoria = this.itemSubCategorias[i + 1];
                        i = this.itemSubCategorias.length + 1;
                        this.selected.push(this.itemSubCategoria);
                    }
                }
            }
        }
    }

    onTable(): void {
        if (this.itemSubCategorias != null && this.itemSubCategorias.length > 0) {
            this.statusForm = 3;
        } else {
            this.pop('error', 'Procure primeiro', '');
        }
    }
    onCadastra(): void {
        // console.log('On cadastra');
        this.spinner.show();
        this._itemSubCategoriaService.postOrPut(this.itemSubCategoria, this.statusForm)
            .subscribe((data) => {
                this.spinner.hide();
                this.itemSubCategoria = data;
                this.pop('success', 'Sucesso', 'Requisição realizada com sucesso');
                this.errorForm = {};
                this.clear();
                this.statusForm = 2;
                this.cdr.detectChanges();
            }, (err) => {
                this.spinner.hide();
                if (Object.prototype.hasOwnProperty.call(err, 'error') && err.error != null) {
                    this.errorForm = err.error;
                }
                this.pop('error', 'Erro', 'Erro ao realizar requisição');
                this.cdr.detectChanges();
            });
    }
    editando(): void {
        // console.log('selecionando para editar');
        const sel = this.itemSubCategorias.filter(us => {
            return us.id === this.selected[0].id;
        });
        // console.log(sel);
        this.itemSubCategoria = sel[0];
        this.statusForm = 2;
        this.cdr.detectChanges();
    }
    isValidDelete(): boolean {
        return this.statusForm === 2 && this.itemSubCategoria.id != null ? false : true;
    }

    setaColumns(itemSubCategorias: ItemSubCategoriaDTO[]): void {
        if (itemSubCategorias.length === 1) {
            this.itemSubCategoria = itemSubCategorias[0];
            this.statusForm = 2;
            this.pop('success', 'Encontrado apenas 1 registro', '');
        }
    }

    clear() {
        this.statusForm = 1;
        this.itemSubCategorias = [];
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
