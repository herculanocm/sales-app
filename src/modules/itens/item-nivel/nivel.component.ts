import { Component,ChangeDetectorRef } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AppItensModalConfirmComponent } from '../modals/app-itens-modal-confirm/app-itens-modal-confirm.component';
import { ToastrService } from 'ngx-toastr';
import { ColumnMode, SelectionType } from '@swimlane/ngx-datatable';
import { ItemNivelDTO } from '@modules/shared/models/item';
import { ItemService } from '@modules/shared/services';

@Component({
    selector: 'app-item-nivel',
    templateUrl: './nivel.component.html',
    styleUrls: ['./nivel.component.scss'],
})
export class ItemNivelComponent {

    ColumnMode = ColumnMode;
    nivel: ItemNivelDTO;
    nivels!: ItemNivelDTO[];
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
        this.nivel = new ItemNivelDTO();
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
        this.nivels = [];
        this.selected = [];
        this.spinner.show();
        this._service.findNivels(this.nivel)
            .subscribe({
                next: (data) => {
                    this.spinner.hide();
                    this.nivels = data;
                    if (this.nivels.length === 0) {
                        this.pop('error', 'Erro', 'Não foi encontrado nada com essa pesquisa');
                    } else {
                        this.statusForm = 3;
                        this.setaColumns(this.nivels);
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
                this._service.delNivel(id)
                    .subscribe({
                        next: (resp) => {
                            this.spinner.hide();
                            message = resp.message;
                            this.pop('success', 'Sucesso', message);
                            this.nivels = [];
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
        this.nivel = new ItemNivelDTO();
        this.statusForm = 1;
        this.errorForm = {};
        this.selected = [];
    }

    voltar(): void {
        if (this.nivel.id > 0) {
            this.statusForm = 2;
        } else {
            this.statusForm = 1;
        }
    }

    onLeftArray(): void {
        if (this.statusForm === 2) {
            for (let i = 0; i < this.nivels.length; i++) {
                if (this.nivel.id === this.nivels[i].id) {
                    if ((i - 1) >= 0) {
                        this.selected = [];
                        this.nivel = this.nivels[i - 1];
                        i = this.nivels.length + 1;
                        this.selected.push(this.nivel);
                    }
                }
            }
        }
    }

    onRightArray(): void {
        if (this.statusForm === 2) {
            for (let i = 0; i < this.nivels.length; i++) {
                if (this.nivel.id === this.nivels[i].id) {
                    if ((i + 1) < this.nivels.length) {
                        // console.log('entrou');
                        this.selected = [];
                        this.nivel = this.nivels[i + 1];
                        i = this.nivels.length + 1;
                        this.selected.push(this.nivel);
                    }
                }
            }
        }
    }

    onTable(): void {
        if (this.nivels != null && this.nivels.length > 0) {
            this.statusForm = 3;
        } else {
            this.pop('error', 'Erro', 'Procure primeiro');
        }
    }
    onCadastra(): void {
        this.spinner.show();
        this._service.postOrPutNivel(this.nivel, this.statusForm)
            .subscribe({
                next: (data) => {
                    this.spinner.hide();
                    this.nivel = data;
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
        const sel = this.nivels.filter(us => {
            return us.id === this.selected[0].id;
        });
        // console.log(sel);
        this.nivel = sel[0];
        this.statusForm = 2;
        this.cdr.detectChanges();
    }
    isValidDelete(): boolean {
        return this.statusForm === 2 && this.nivel.id != null ? false : true;
    }

    setaColumns(nivels: ItemNivelDTO[]): void {
        if (nivels.length === 1) {
            this.nivel = nivels[0];
            this.statusForm = 2;
            this.pop('success', 'Encontrado apenas 1 registro', '');
        }
    }

    clear() {
        this.statusForm = 1;
        this.nivels = [];
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
