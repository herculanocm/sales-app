import { Component,ChangeDetectorRef } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AppItensModalConfirmComponent } from '../modals/app-itens-modal-confirm/app-itens-modal-confirm.component';
import { ToastrService } from 'ngx-toastr';
import { ColumnMode, SelectionType } from '@swimlane/ngx-datatable';
import { ItemUnidadeDTO } from '@modules/shared/models/item';
import { ItemUnidadeService } from '@modules/shared/services/unidade.service';

@Component({
    selector: 'app-item-unidade',
    templateUrl: './unidade.component.html',
    styleUrls: ['./unidade.component.scss'],
})
export class UnidadeComponent {

    ColumnMode = ColumnMode;
    unidade: ItemUnidadeDTO;
    unidades!: ItemUnidadeDTO[];
    errorForm: any = {};
    entitySelected: any;
    // status 1 = salvando, status 2 = editando, status 3 = pesquisando
    statusForm: number;
    selectionTypeSingle = SelectionType.single;
    selected: any[] = [];
    // datatable

    constructor(
        private spinner: NgxSpinnerService,
        private toastr: ToastrService,
        private cdr: ChangeDetectorRef,
        private _modalService: NgbModal,
        private _unidadeService: ItemUnidadeService,
    ) {
        this.unidade = new ItemUnidadeDTO();
        this.unidade.status = true;
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
        this.unidades = [];
        this.selected = [];
        this.spinner.show();
        this._unidadeService.find(this.unidade)
            .subscribe((data) => {
                this.spinner.hide();
                this.unidades = data;
                if (this.unidades.length === 0) {
                    this.pop('error', 'Erro', 'Não foi encontrado nada com essa pesquisa');
                } else {
                    this.statusForm = 3;
                    this.setaColumns(this.unidades);
                }
                this.cdr.detectChanges();
            }, (err) => {
                // console.log(err);
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
                this._unidadeService.del(id)
                    .subscribe((resp: any) => {
                        this.spinner.hide();
                        message = resp.message;
                        this.pop('success', 'Sucesso', message);
                        this.unidades = [];
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
        this.unidade = new ItemUnidadeDTO();
        this.unidade.status = true;
        this.statusForm = 1;
        this.errorForm = {};
        this.selected = [];
    }

    voltar(): void {
        if (this.unidade.id > 0) {
            this.statusForm = 2;
        } else {
            this.statusForm = 1;
        }
    }

    onLeftArray(): void {
        if (this.statusForm === 2) {
            for (let i = 0; i < this.unidades.length; i++) {
                if (this.unidade.id === this.unidades[i].id) {
                    if ((i - 1) >= 0) {
                        this.selected = [];
                        this.unidade = this.unidades[i - 1];
                        i = this.unidades.length + 1;
                        this.selected.push(this.unidade);
                    }
                }
            }
        }
    }

    onRightArray(): void {
        if (this.statusForm === 2) {
            for (let i = 0; i < this.unidades.length; i++) {
                if (this.unidade.id === this.unidades[i].id) {
                    if ((i + 1) < this.unidades.length) {
                        // console.log('entrou');
                        this.selected = [];
                        this.unidade = this.unidades[i + 1];
                        i = this.unidades.length + 1;
                        this.selected.push(this.unidade);
                    }
                }
            }
        }
    }

    onTable(): void {
        if (this.unidades != null && this.unidades.length > 0) {
            this.statusForm = 3;
        } else {
            this.pop('error', 'Erro', 'Procure primeiro');
        }
    }
    onCadastra(): void {
        this.spinner.show();
        this._unidadeService.postOrPut(this.unidade, this.statusForm)
            .subscribe((data) => {
                this.spinner.hide();
                this.unidade = data;
                this.errorForm = {};
                this.clear();
                this.statusForm = 2;
                this.cdr.detectChanges();
            }, (err) => {
                this.spinner.hide();
                if (Object.prototype.hasOwnProperty.call(err, 'error') && err.error != null) {
                    this.errorForm = err.error;
                }
                this.cdr.detectChanges();
            });
    }
    editando(): void {
        // console.log('selecionando para editar');
        const sel = this.unidades.filter(us => {
            return us.id === this.selected[0].id;
        });
        // console.log(sel);
        this.unidade = sel[0];
        this.statusForm = 2;
        this.cdr.detectChanges();
    }
    isValidDelete(): boolean {
        return this.statusForm === 2 && this.unidade.id != null ? false : true;
    }

    setaColumns(unidades: ItemUnidadeDTO[]): void {
        if (unidades.length === 1) {
            this.unidade = unidades[0];
            this.statusForm = 2;
            this.pop('success', 'Encontrado apenas 1 registro', '');
        }
    }

    clear() {
        this.statusForm = 1;
        this.unidades = [];
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
