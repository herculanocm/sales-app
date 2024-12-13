import { Component, ChangeDetectorRef } from '@angular/core';
import { EstoqueAlmoxarifadoService } from './estoque-almoxarifado.service';
import { EstoqueAlmoxarifadoDTO } from './estoque-almoxarifado';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AppEstoqueModalConfirmComponent } from '../modals/app-estoque-modal-confirm/app-estoque-modal-confirm.component';
import { ToastrService } from 'ngx-toastr';
import { ColumnMode, SelectionType } from '@swimlane/ngx-datatable';

@Component({
    selector: 'app-estoque-almoxarifado',
    templateUrl: './estoque-almoxarifado.component.html',
    styleUrls: ['./estoque-almoxarifado.component.scss'],
})
export class EstoqueAlmoxarifadoComponent {

    ColumnMode = ColumnMode;
    almoxarifados!: EstoqueAlmoxarifadoDTO[];
    almoxarifado: EstoqueAlmoxarifadoDTO;
    errorForm: any = {};
    statusForm: number;
    selected: any[] = [];
    selectionTypeSingle = SelectionType.single;

    constructor(
        private _almoxarifadosService: EstoqueAlmoxarifadoService,
        private toastr: ToastrService,
        private cdr: ChangeDetectorRef,
        private _modalService: NgbModal,
    ) {
        this.almoxarifado = new EstoqueAlmoxarifadoDTO();
        this.almoxarifado.status = true;
        this.statusForm = 1;
    }

    clear() {
        this.statusForm = 1;
        this.almoxarifados = [];
        this.selected = [];
        this.errorForm = {};
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

    onCadastra(): void {
        this._almoxarifadosService.postOrPut(this.almoxarifado, this.statusForm)
            .subscribe((almoxarifado: EstoqueAlmoxarifadoDTO) => {
                this.almoxarifado = almoxarifado;
                this.errorForm = {};
                this.statusForm = 2;
                this.almoxarifados = [];
                this.cdr.detectChanges();
            }, (err: any) => {
                if (Object.prototype.hasOwnProperty.call(err, 'error') && err.error != null) {
                    this.errorForm = err.error;
                }
                this.cdr.detectChanges();
            });
    }

    onLimpa(): void {
        this.limpa();
    }

    limpa(): void {
        this.almoxarifado = new EstoqueAlmoxarifadoDTO();
        this.almoxarifado.status = true;
        this.statusForm = 1;
        this.errorForm = {};
        this.selected = [];
    }

    voltar(): void {
        if (this.almoxarifado.id > 0) {
            this.statusForm = 2;
        } else {
            this.statusForm = 1;
        }
    }

    onLeftArray(): void {
        if (this.statusForm === 2) {
            for (let i = 0; i < this.almoxarifados.length; i++) {
                if (this.almoxarifado.id === this.almoxarifados[i].id) {
                    if ((i - 1) >= 0) {
                        this.selected = [];
                        this.almoxarifado = this.almoxarifados[i - 1];
                        i = this.almoxarifados.length + 1;
                        this.selected.push(this.almoxarifado);
                    }
                }
            }
        }
    }

    onRightArray(): void {
        if (this.statusForm === 2) {
            for (let i = 0; i < this.almoxarifados.length; i++) {
                if (this.almoxarifado.id === this.almoxarifados[i].id) {
                    if ((i + 1) < this.almoxarifados.length) {
                        // console.log('entrou');
                        this.selected = [];
                        this.almoxarifado = this.almoxarifados[i + 1];
                        i = this.almoxarifados.length + 1;
                        this.selected.push(this.almoxarifado);
                    }
                }
            }
        }
    }

    onTable(): void {
        if (this.almoxarifados != null && this.almoxarifados.length > 0) {
            this.statusForm = 3;
        } else {
            this.pop('error', 'Erro', 'Procure primeiro');
        }
    }

    onDeleta(id: number): void {
        // console.log('onDeletaAlmoxarifado id: ' + id);
        const activeModal = this._modalService.open(AppEstoqueModalConfirmComponent);
        activeModal.componentInstance.modalHeader = 'Confirme a exclusão';
        activeModal.componentInstance.modalContent = 'Deseja realmente excluir ?';
        activeModal.componentInstance.modalType = 'confirm';
        activeModal.componentInstance.defaultLabel = 'Não';
        activeModal.result.then((result) => {
            if (result === 'confirm') {
                let message = '';
                this._almoxarifadosService.del(id)
                    .subscribe((resp: any) => {
                        message = resp.message;
                        this.pop('success', 'Sucesso', message);
                        this.almoxarifados = [];
                        this.onLimpa();
                        this.cdr.detectChanges();
                    }, err => {
                        message = err.message;
                        this.pop('error', 'Pesquisa', message);
                        this.cdr.detectChanges();
                    });
            }
        }, (error) => {
            console.log(error);
        });
    }

    onPesquisa(): void {
        this.almoxarifados = [];
        this.selected = [];
        this._almoxarifadosService.find(this.almoxarifado)
            .subscribe((almoxarifados: EstoqueAlmoxarifadoDTO[]) => {
                this.almoxarifados = almoxarifados;
                if (this.almoxarifados.length === 0) {
                    this.pop('error', 'Pesquisa', 'Não foi encontrado nada com essa pesquisa');
                } else {
                    this.statusForm = 3;
                    this.setaColumns(this.almoxarifados);
                }
                this.cdr.detectChanges();
            }, (err) => {
                // console.log(err);
                this.cdr.detectChanges();
                this.pop('error', 'Pesquisa', 'Erro ao pesquisar');
            });
    }

    editando(): void {
        const sel = this.almoxarifados.filter(alx => {
            return alx.id === this.selected[0].id;
        });

        this.almoxarifado = sel[0];
        this.statusForm = 2;
    }

    isValidDelete(): boolean {
        return this.statusForm === 2 && this.almoxarifado.id != null ? false : true;
    }

    setaColumns(almoxarifados: EstoqueAlmoxarifadoDTO[]): void {
        if (almoxarifados.length === 1) {
            this.almoxarifado = almoxarifados[0];
            this.statusForm = 2;
            this.pop('success', 'Encontrado apenas 1 registro', '');
        }
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
