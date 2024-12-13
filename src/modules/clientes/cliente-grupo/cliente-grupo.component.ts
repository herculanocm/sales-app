import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AppClienteModalConfirmComponent } from '../modals/app-cliente-modal-confirm/app-cliente-modal-confirm.component';
import { ColumnMode, SelectionType } from '@swimlane/ngx-datatable';
import { ToastrService } from 'ngx-toastr';
import { ClienteGrupoDTO } from '@modules/shared/models/cliente';
import { ClienteGrupoService } from '@modules/shared/services';

@Component({
    selector: 'app-cliente-grupo',
    templateUrl: './cliente-grupo.component.html',
    styleUrls: ['./cliente-grupo.component.scss'],
})
export class ClienteGrupoComponent {

    ColumnMode = ColumnMode;
    grupoCliente: ClienteGrupoDTO;
    grupoClientes!: ClienteGrupoDTO[];
    errorForm: any = {};
    authorities!: string[];
    authSelected: any;
    selectionTypeSingle = SelectionType.single;
    // status 1 = salvando, status 2 = editando, status 3 = pesquisando
    statusForm: number;
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
        private _grupoClienteService: ClienteGrupoService,
        private toastr: ToastrService,
        private cdr: ChangeDetectorRef,
        private _modalService: NgbModal,
    ) {
        this.grupoCliente = new ClienteGrupoDTO();
        this.grupoCliente.status = true;
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
        this.grupoClientes = [];
        this.selected = [];
        this.rows = [];
        this._grupoClienteService.find(this.grupoCliente)
            .subscribe((data) => {
                this.grupoClientes = data;
                if (this.grupoClientes.length === 0) {
                    this.pop('warning', 'Pesquisa', 'Não foi encontrado nada com essa pesquisa.');
                } else {
                    this.statusForm = 3;
                    this.setaColumns(this.grupoClientes);
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
                this._grupoClienteService.del(id)
                    .subscribe((resp: any) => {
                        message = resp.message;
                        this.rows = [];
                        this.grupoClientes = [];
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
            for (let i = 0; i < this.grupoClientes.length; i++) {
                if (this.grupoCliente.id === this.grupoClientes[i].id) {
                    if ((i - 1) >= 0) {
                        this.selected = [];
                        this.grupoCliente = this.grupoClientes[i - 1];
                        i = this.grupoClientes.length + 1;
                        this.selected.push(this.grupoCliente);
                    }
                }
            }
        }
    }

    onRightArray(): void {
        if (this.statusForm === 2) {
            for (let i = 0; i < this.grupoClientes.length; i++) {
                if (this.grupoCliente.id === this.grupoClientes[i].id) {
                    if ((i + 1) < this.grupoClientes.length) {
                        // console.log('entrou');
                        this.selected = [];
                        this.grupoCliente = this.grupoClientes[i + 1];
                        i = this.grupoClientes.length + 1;
                        this.selected.push(this.grupoCliente);
                    }
                }
            }
        }
    }

    onTable(): void {
        if (this.grupoClientes != null && this.grupoClientes.length > 0) {
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
        this._grupoClienteService.postOrPut(this.grupoCliente, this.statusForm)
            .subscribe((data) => {
                this.grupoCliente = data;
                this.errorForm = {};
                this.statusForm = 2;
                this.rows = [];
                this.grupoClientes = [];
                this.cdr.detectChanges();
            }, (err) => {
                if (Object.prototype.hasOwnProperty.call(err, 'error') && err.error != null) {
                    this.errorForm = err.error;
                }
                this.cdr.detectChanges();
            });
    }
    editando(): void {
        const sel = this.grupoClientes.filter(us => {
            return us.id === this.selected[0].id;
        });
        // console.log(sel);
        this.grupoCliente = sel[0];
        this.statusForm = 2;
        this.cdr.detectChanges();
    }
    isValidDelete(): boolean {
        return this.statusForm === 2 && this.grupoCliente.id != null ? false : true;
    }

    voltar(): void {
        if (this.grupoCliente.id > 0) {
            this.statusForm = 2;
        } else {
            this.statusForm = 1;
        }
    }

    setaColumns(grupoClientes: ClienteGrupoDTO[]): void {
        if (grupoClientes.length === 1) {
            this.grupoCliente = grupoClientes[0];
            this.statusForm = 2;
            this.pop('success', 'Encontrado apenas 1 registro', '');
        } else {
            this.rows = [];
            for (let i = 0; i < grupoClientes.length; i++) {
                this.rows.push(
                    {
                        id: grupoClientes[i].id,
                        nome: grupoClientes[i].nome,
                        status: grupoClientes[i].status === true ? 'Ativo' : 'Desativado',
                    },
                );
            }
        }
    }

    limpa(): void {
        this.grupoCliente = new ClienteGrupoDTO();
        this.grupoCliente.status = true;
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
