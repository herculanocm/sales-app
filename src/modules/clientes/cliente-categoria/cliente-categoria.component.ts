import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { AppClienteModalConfirmComponent } from '../modals/app-cliente-modal-confirm/app-cliente-modal-confirm.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ColumnMode, SelectionType } from '@swimlane/ngx-datatable';
import { ToastrService } from 'ngx-toastr';
import { ClienteCategoriaDTO } from '@modules/shared/models/cliente';
import { ClienteCategoriaService } from '@modules/shared/services';

@Component({
    selector: 'app-cliente-categoria',
    templateUrl: './cliente-categoria.component.html',
    styleUrls: ['./cliente-categoria.component.scss'],
})
export class ClienteCategoriaComponent {

    ColumnMode = ColumnMode;
    categoriaCliente: ClienteCategoriaDTO;
    categoriaClientes!: ClienteCategoriaDTO[];
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
        { name: 'NOME' },
        { name: 'STATUS' },
    ];
    selected: any[] = [];
    // datatable

    constructor(
        private _modalService: NgbModal,
        private toastr: ToastrService,
        private cdr: ChangeDetectorRef,
        private _categoriaClienteService: ClienteCategoriaService,
    ) {
        this.categoriaCliente = new ClienteCategoriaDTO();
        this.categoriaCliente.status = true;
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
        this.categoriaClientes = [];
        this.selected = [];
        this.rows = [];
        this._categoriaClienteService.find(this.categoriaCliente)
            .subscribe((data) => {
                this.categoriaClientes = data;
                if (this.categoriaClientes.length === 0) {
                    this.pop('error', 'Pesquisa', 'Não foi encontrado nada com essa pesquisa.');
                } else {
                    this.statusForm = 3;
                    this.setaColumns(this.categoriaClientes);
                }
                this.cdr.detectChanges();
            }, (err) => {
                // console.log(err);
                this.pop('error', 'Erro', 'Erro ao pesquisar');
                this.cdr.detectChanges();
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
                this._categoriaClienteService.del(id)
                    .subscribe((resp: any) => {
                        message = resp.message;
                        // this.showToast('success', 'Sucesso', message);
                        this.rows = [];
                        this.categoriaClientes = [];
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

    onCadastra(): void {
        this._categoriaClienteService.postOrPut(this.categoriaCliente, this.statusForm)
            .subscribe((data) => {
                this.categoriaCliente = data;
                // this.showToast('success', 'Sucesso', 'Requisição realizada sucesso.');
                this.errorForm = {};
                this.statusForm = 2;
                this.rows = [];
                this.categoriaClientes = [];
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
        const sel = this.categoriaClientes.filter(us => {
            return us.id === this.selected[0].id;
        });
        // console.log(sel);
        this.categoriaCliente = sel[0];
        this.statusForm = 2;
        this.cdr.detectChanges();
    }
    isValidDelete(): boolean {
        return this.statusForm === 2 && this.categoriaCliente.id != null ? false : true;
    }

    voltar(): void {
        if (this.categoriaCliente.id > 0) {
            this.statusForm = 2;
        } else {
            this.statusForm = 1;
        }
    }

    onLeftArray(): void {
        if (this.statusForm === 2) {
            for (let i = 0; i < this.categoriaClientes.length; i++) {
                if (this.categoriaCliente.id === this.categoriaClientes[i].id) {
                    if ((i - 1) >= 0) {
                        this.selected = [];
                        this.categoriaCliente = this.categoriaClientes[i - 1];
                        i = this.categoriaClientes.length + 1;
                        this.selected.push(this.categoriaCliente);
                    }
                }
            }
        }
    }

    onRightArray(): void {
        if (this.statusForm === 2) {
            for (let i = 0; i < this.categoriaClientes.length; i++) {
                if (this.categoriaCliente.id === this.categoriaClientes[i].id) {
                    if ((i + 1) < this.categoriaClientes.length) {
                        // console.log('entrou');
                        this.selected = [];
                        this.categoriaCliente = this.categoriaClientes[i + 1];
                        i = this.categoriaClientes.length + 1;
                        this.selected.push(this.categoriaCliente);
                    }
                }
            }
        }
    }

    onTable(): void {
        if (this.categoriaClientes != null && this.categoriaClientes.length > 0) {
            this.statusForm = 3;
        } else {
            this.pop('error', 'Erro', 'Procure primeiro.');
        }
    }

    setaColumns(categoriaClientes: ClienteCategoriaDTO[]): void {
        if (categoriaClientes.length === 1) {
            this.categoriaCliente = categoriaClientes[0];
            this.statusForm = 2;
            this.pop('success', 'Encontrado apenas 1 registro', '');
        } else {
            this.rows = [];
            for (let i = 0; i < categoriaClientes.length; i++) {
                this.rows.push(
                    {
                        id: categoriaClientes[i].id,
                        nome: categoriaClientes[i].nome,
                        status: categoriaClientes[i].status === true ? 'Ativo' : 'Desativado',
                    },
                );
            }
        }
    }

    limpa(): void {
        this.categoriaCliente = new ClienteCategoriaDTO();
        this.categoriaCliente.status = true;
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
