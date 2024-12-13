import { Component,ChangeDetectorRef } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AppItensModalConfirmComponent } from '../modals/app-itens-modal-confirm/app-itens-modal-confirm.component';
import { ToastrService } from 'ngx-toastr';
import { ColumnMode, SelectionType } from '@swimlane/ngx-datatable';
import { ItemPredioDTO } from '@modules/shared/models/item';
import { ItemService } from '@modules/shared/services';

@Component({
    selector: 'app-item-predio',
    templateUrl: './predio.component.html',
    styleUrls: ['./predio.component.scss'],
})
export class ItemPredioComponent  {

    ColumnMode = ColumnMode;
    predio: ItemPredioDTO;
    predios!: ItemPredioDTO[];
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
        private _service: ItemService,
    ) {
        this.predio = new ItemPredioDTO();
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
        this.predios = [];
        this.selected = [];
        this.spinner.show();
        this._service.findPredios(this.predio)
            .subscribe({
                next: (data) => {
                    this.spinner.hide();
                    this.predios = data;
                    if (this.predios.length === 0) {
                        this.pop('error', 'Erro', 'Não foi encontrado nada com essa pesquisa');
                    } else {
                        this.statusForm = 3;
                        this.setaColumns(this.predios);
                    }
                    this.cdr.detectChanges();
                },
                error: (error) => {
                    this.spinner.hide();
                    this.pop('error', 'Erro', 'Erro ao pesquisar');
                    this.cdr.detectChanges();
                }
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
                this._service.delPredio(id)
                    .subscribe({
                        next: (resp) => {
                            this.spinner.hide();
                            message = resp.message;
                            this.pop('success', 'Sucesso', message);
                            this.predios = [];
                            this.onLimpa();
                            this.cdr.detectChanges();
                        },
                        error: (err) => {
                            this.spinner.hide();
                            message = err.message;
                            this.pop('error', 'Erro', message);
                            this.cdr.detectChanges();
                        }
                    });
            }
        }, (error) => { console.log(error) });
    }

    onLimpa(): void {
        this.limpa();
    }

    limpa(): void {
        this.predio = new ItemPredioDTO();
        this.statusForm = 1;
        this.errorForm = {};
        this.selected = [];
    }

    voltar(): void {
        if (this.predio.id > 0) {
            this.statusForm = 2;
        } else {
            this.statusForm = 1;
        }
    }

    onLeftArray(): void {
        if (this.statusForm === 2) {
            for (let i = 0; i < this.predios.length; i++) {
                if (this.predio.id === this.predios[i].id) {
                    if ((i - 1) >= 0) {
                        this.selected = [];
                        this.predio = this.predios[i - 1];
                        i = this.predios.length + 1;
                        this.selected.push(this.predio);
                    }
                }
            }
        }
    }

    onRightArray(): void {
        if (this.statusForm === 2) {
            for (let i = 0; i < this.predios.length; i++) {
                if (this.predio.id === this.predios[i].id) {
                    if ((i + 1) < this.predios.length) {
                        // console.log('entrou');
                        this.selected = [];
                        this.predio = this.predios[i + 1];
                        i = this.predios.length + 1;
                        this.selected.push(this.predio);
                    }
                }
            }
        }
    }

    onTable(): void {
        if (this.predios != null && this.predios.length > 0) {
            this.statusForm = 3;
        } else {
            this.pop('error', 'Erro', 'Procure primeiro');
        }
    }
    onCadastra(): void {
        this.spinner.show();
        this._service.postOrPutPredio(this.predio, this.statusForm)
            .subscribe({
                next: (data) => {
                    this.spinner.hide();
                    this.predio = data;
                    this.errorForm = {};
                    this.clear();
                    this.statusForm = 2;
                    this.cdr.detectChanges();
                },
                error: (err) => {
                    this.spinner.hide();
                    if (Object.prototype.hasOwnProperty.call(err, 'error') && err.error != null) {
                        this.errorForm = err.error;
                    }
                    this.cdr.detectChanges();
                }
            });
    }
    editando(): void {
        // console.log('selecionando para editar');
        const sel = this.predios.filter(us => {
            return us.id === this.selected[0].id;
        });
        // console.log(sel);
        this.predio = sel[0];
        this.statusForm = 2;
        this.cdr.detectChanges();
    }
    isValidDelete(): boolean {
        return this.statusForm === 2 && this.predio.id != null ? false : true;
    }

    setaColumns(predios: ItemPredioDTO[]): void {
        if (predios.length === 1) {
            this.predio = predios[0];
            this.statusForm = 2;
            this.pop('success', 'Encontrado apenas 1 registro', '');
        }
    }

    clear() {
        this.statusForm = 1;
        this.predios = [];
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
