import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AppClienteModalConfirmComponent } from '../modals/app-cliente-modal-confirm/app-cliente-modal-confirm.component';
import { ColumnMode, SelectionType } from '@swimlane/ngx-datatable';
import { ToastrService } from 'ngx-toastr';
import { ClienteStatusLabelDTO } from '@modules/shared/models/cliente';
import { ClienteStatusLabelService } from '@modules/shared/services';

@Component({
    selector: 'app-cliente-status-label',
    templateUrl: './cliente-status-label.component.html',
    styleUrls: ['./cliente-status-label.component.scss'],
})
export class ClienteStatusLabelComponent {

    ColumnMode = ColumnMode;
    clienteStatusLabel: ClienteStatusLabelDTO;
    clienteStatusLabels!: ClienteStatusLabelDTO[];
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
        { name: 'LABEL' },
        { name: 'SIGLA' },
        { name: 'STATUS' },
    ];
    selected: any[] = [];
    // datatable


    constructor(
        private toastr: ToastrService,
        private cdr: ChangeDetectorRef,
        private _modalService: NgbModal,
        private _clienteStatusLabelService: ClienteStatusLabelService,
    ) {
        this.clienteStatusLabel = new ClienteStatusLabelDTO();
        this.clienteStatusLabel.status = true;
        this.clienteStatusLabel.isVendaBloqueada = false;
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
        this.clienteStatusLabels = [];
        this.selected = [];
        this.rows = [];
        this._clienteStatusLabelService.find(this.clienteStatusLabel)
            .subscribe((data) => {
                this.clienteStatusLabels = data;
                // console.log(this.clienteStatusLabels);
                if (this.clienteStatusLabels.length === 0) {
                    this.pop('error', 'Pesquisa', 'Não foi encontrado nada com essa pesquisa.');
                } else {
                    this.statusForm = 3;
                    this.setaColumns(this.clienteStatusLabels);
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
                this._clienteStatusLabelService.del(id)
                    .subscribe((resp: any) => {
                        message = resp.message;
                        this.rows = [];
                        this.clienteStatusLabels = [];
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
            for (let i = 0; i < this.clienteStatusLabels.length; i++) {
                if (this.clienteStatusLabel.id === this.clienteStatusLabels[i].id) {
                    if ((i - 1) >= 0) {
                        this.selected = [];
                        this.clienteStatusLabel = this.clienteStatusLabels[i - 1];
                        i = this.clienteStatusLabels.length + 1;
                        this.selected.push(this.clienteStatusLabel);
                    }
                }
            }
        }
    }

    onRightArray(): void {
        if (this.statusForm === 2) {
            for (let i = 0; i < this.clienteStatusLabels.length; i++) {
                if (this.clienteStatusLabel.id === this.clienteStatusLabels[i].id) {
                    if ((i + 1) < this.clienteStatusLabels.length) {
                        // console.log('entrou');
                        this.selected = [];
                        this.clienteStatusLabel = this.clienteStatusLabels[i + 1];
                        i = this.clienteStatusLabels.length + 1;
                        this.selected.push(this.clienteStatusLabel);
                    }
                }
            }
        }
    }

    onTable(): void {
        if (this.clienteStatusLabels != null && this.clienteStatusLabels.length > 0) {
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
        this._clienteStatusLabelService.postOrPut(this.clienteStatusLabel, this.statusForm)
            .subscribe((data) => {
                this.clienteStatusLabel = data;
                this.errorForm = {};
                this.statusForm = 2;
                this.rows = [];
                this.clienteStatusLabels = [];
                this.cdr.detectChanges();
            }, (err) => {
                if (Object.prototype.hasOwnProperty.call(err, 'error') && err.error != null) {
                    this.errorForm = err.error;
                }
                this.cdr.detectChanges();
            });
    }
    editando(): void {
        const sel = this.clienteStatusLabels.filter(us => {
            return us.id === this.selected[0].id;
        });
        // console.log(sel);
        this.clienteStatusLabel = sel[0];
        this.statusForm = 2;
        this.cdr.detectChanges();
    }
    isValidDelete(): boolean {
        return this.statusForm === 2 && this.clienteStatusLabel.id != null ? false : true;
    }

    voltar(): void {
        if (this.clienteStatusLabel.id > 0) {
            this.statusForm = 2;
        } else {
            this.statusForm = 1;
        }
    }

    setaColumns(clienteStatusLabels: ClienteStatusLabelDTO[]): void {
        if (clienteStatusLabels.length === 1) {
            this.clienteStatusLabel = clienteStatusLabels[0];
            this.statusForm = 2;
            this.pop('success', 'Encontrado apenas 1 registro', '');
        } else {
            this.rows = [];
            for (let i = 0; i < clienteStatusLabels.length; i++) {
                this.rows.push(
                    {
                        id: clienteStatusLabels[i].id,
                        label: clienteStatusLabels[i].label,
                        sigla: clienteStatusLabels[i].sigla,
                        status: clienteStatusLabels[i].status === true ? 'Ativo' : 'Desativado',
                    },
                );
            }
        }
    }

    limpa(): void {
        this.clienteStatusLabel = new ClienteStatusLabelDTO();
        this.clienteStatusLabel.status = true;
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
