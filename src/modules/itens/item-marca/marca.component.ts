import { Component, ChangeDetectorRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AppItensModalConfirmComponent } from '../modals/app-itens-modal-confirm/app-itens-modal-confirm.component';
import { ToastrService } from 'ngx-toastr';
import { ColumnMode, SelectionType } from '@swimlane/ngx-datatable';
import { ItemMarcaDTO } from '@modules/shared/models/item';
import { ItemMarcaService } from '@modules/shared/services/marca.service';

@Component({
    selector: 'app-item-marca',
    templateUrl: './marca.component.html',
    styleUrls: ['./marca.component.scss'],
})
export class MarcaComponent {

    ColumnMode = ColumnMode;
    marca: ItemMarcaDTO;
    marcas!: ItemMarcaDTO[];
    errorForm: any = {};
    entitySelected: any;
    // status 1 = salvando, status 2 = editando, status 3 = pesquisando
    statusForm: number;
    selectionTypeSingle = SelectionType.single;
    selected: any[] = [];
    // datatable


    constructor(
        private toastr: ToastrService,
        private cdr: ChangeDetectorRef,
        private _modalService: NgbModal,
        private _marcaService: ItemMarcaService,
    ) {
        this.marca = new ItemMarcaDTO();
        this.marca.status = true;
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
        this.marcas = [];
        this.selected = [];
        this._marcaService.find(this.marca)
            .subscribe((data) => {
                this.marcas = data;
                if (this.marcas.length === 0) {
                    this.pop('error', 'Erro', 'Não foi encontrado nada com essa pesquisa');
                } else {
                    this.statusForm = 3;
                    this.setaColumns(this.marcas);
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
                this._marcaService.del(id)
                    .subscribe((resp: any) => {
                        message = resp.message;
                        // this.showToast(this.types[1], 'Sucesso', message);
                        this.marcas = [];
                        this.onLimpa();
                        this.cdr.detectChanges();
                    }, err => {
                        message = err.message;
                        this.pop('error', 'Erro', message);
                    });
            }
        }, (error) => { console.log(error) });
    }

    onCadastra(): void {
        this._marcaService.postOrPut(this.marca, this.statusForm)
            .subscribe((data) => {
                this.marca = data;
                // this.showToast(this.types[1], 'Sucesso', 'Requisição realizada sucesso.');
                this.errorForm = {};
                this.statusForm = 2;
                this.marcas = [];
                this.cdr.detectChanges();
            }, (err: any) => {
                if (Object.prototype.hasOwnProperty.call(err, 'error') && err.error != null) {
                    this.errorForm = err.error;
                }
                this.cdr.detectChanges();
            });
    }
    editando(): void {
        // console.log('selecionando para editar');
        const sel = this.marcas.filter(us => {
            return us.id === this.selected[0].id;
        });
        // console.log(sel);
        this.marca = sel[0];
        this.statusForm = 2;
        this.cdr.detectChanges();
    }
    isValidDelete(): boolean {
        return this.statusForm === 2 && this.marca.id != null ? false : true;
    }
    setaColumns(marcas: ItemMarcaDTO[]): void {
        if (marcas.length === 1) {
            this.marca = marcas[0];
            this.statusForm = 2;
            this.pop('success', 'Encontrado apenas 1 registro', '');
        }
    }
    voltar(): void {
        if (this.marca.id > 0) {
            this.statusForm = 2;
        } else {
            this.statusForm = 1;
        }
    }

    onLeftArray(): void {
        if (this.statusForm === 2) {
            for (let i = 0; i < this.marcas.length; i++) {
                if (this.marca.id === this.marcas[i].id) {
                    if ((i - 1) >= 0) {
                        this.selected = [];
                        this.marca = this.marcas[i - 1];
                        i = this.marcas.length + 1;
                        this.selected.push(this.marca);
                    }
                }
            }
        }
    }

    onRightArray(): void {
        if (this.statusForm === 2) {
            for (let i = 0; i < this.marcas.length; i++) {
                if (this.marca.id === this.marcas[i].id) {
                    if ((i + 1) < this.marcas.length) {
                        this.selected = [];
                        // console.log('entrou');
                        this.marca = this.marcas[i + 1];
                        i = this.marcas.length + 1;
                        this.selected.push(this.marca);
                    }
                }
            }
        }
    }

    onTable(): void {
        if (this.marcas != null && this.marcas.length > 0) {
            this.statusForm = 3;
        } else {
            this.pop('error', 'Procure primeiro', '');
        }
    }

    onLimpa(): void {
        this.limpa();
        this.cdr.detectChanges();
    }

    limpa(): void {
        this.marca = new ItemMarcaDTO();
        this.marca.status = true;
        this.statusForm = 1;
        this.errorForm = {};
        this.selected = [];
    }

    clear() {
        this.statusForm = 1;
        this.marcas = [];
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
