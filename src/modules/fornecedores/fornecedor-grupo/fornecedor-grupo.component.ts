import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AppFornecModalConfirmComponent } from '../modals/app-fornec-modal-confirm/app-fornec-modal-confirm.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { ColumnMode, SelectionType } from '@swimlane/ngx-datatable';
import { ToastrService } from 'ngx-toastr';
import { FornecedorGrupoDTO } from '@modules/shared/models/fornecedor';
import { FornecedorGrupoService } from '@modules/shared/services';

@Component({
    selector: 'app-fornecedor-grupo',
    templateUrl: './fornecedor-grupo.component.html',
    styleUrls: ['./fornecedor-grupo.component.scss'],
})
export class FornecedorGrupoComponent {
    ColumnMode = ColumnMode;
    grupoFornecedor: FornecedorGrupoDTO;
    grupoFornecedores!: FornecedorGrupoDTO[];
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
        private _grupoFuncionarioService: FornecedorGrupoService,
        private cdr: ChangeDetectorRef,
        private spinner: NgxSpinnerService,
        private toastr: ToastrService,
    ) {
        this.grupoFornecedor = new FornecedorGrupoDTO();
        this.grupoFornecedor.status = true;
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
        this.grupoFornecedores = [];
        this.selected = [];
        this.rows = [];
        this.spinner.show('fullSpinner');
        this._grupoFuncionarioService.find(this.grupoFornecedor)
            .subscribe({
                next: (data) => {
                    this.spinner.hide('fullSpinner');
                    this.grupoFornecedores = data;
                    if (this.grupoFornecedores.length === 0) {
                        this.pop('error', 'Pesquisa', 'Não foi encontrado nada com essa pesquisa.');
                    } else {
                        this.statusForm = 3;
                        this.setaColumns(this.grupoFornecedores);
                    }
                    this.cdr.markForCheck();
                },
                error: (err) => {
                    this.spinner.hide('fullSpinner');
                    // console.log(err);
                    this.pop('error', 'Erro', 'Erro ao pesquisar');
                    this.cdr.markForCheck();
                }
            });
    }
    onDeleta(id: number): void {
        const activeModal = this._modalService.open(AppFornecModalConfirmComponent);
        activeModal.componentInstance.modalHeader = 'Confirme a exclusão';
        activeModal.componentInstance.modalContent = 'Deseja realmente excluir ?';
        activeModal.componentInstance.modalType = 'confirm';
        activeModal.componentInstance.defaultLabel = 'Não';
        activeModal.result.then((result) => {
            if (result === 'confirm') {
                this._grupoFuncionarioService.del(id)
                    .subscribe({
                        next: () => {
                            this.rows = [];
                            this.grupoFornecedores = [];
                            this.onLimpa();
                            this.cdr.detectChanges();
                        }
                    });
            }
        }, (error) => {
            console.log(error);
        });
    }

    onLimpa(): void {
        this.limpa();
        this.pop('info', 'Sucesso', 'Limpo com sucesso');
        this.cdr.detectChanges();
    }
    onCadastra(): void {
        this._grupoFuncionarioService.postOrPut(this.grupoFornecedor, this.statusForm)
            .subscribe({
                next: (data) => {
                    this.grupoFornecedor = data;
                    this.pop('success', 'Sucesso', 'Requisição realizada sucesso.');
                    this.errorForm = {};
                    this.statusForm = 2;
                    this.rows = [];
                    this.grupoFornecedores = [];
                    this.cdr.detectChanges();
                },
                error: (err) => {
                    if (Object.prototype.hasOwnProperty.call(err, 'error') && err.error != null) {
                        this.errorForm = err.error;
                    }
                    this.pop('error', 'Erro', 'Erro ao salvar.');
                    console.log(err);
                    this.cdr.detectChanges();
                }
            });
    }
    editando(): void {
        // console.log('selecionando para editar');
        const sel = this.grupoFornecedores.filter(us => {
            return us.id === this.selected[0].id;
        });
        // console.log(sel);
        this.grupoFornecedor = sel[0];
        this.statusForm = 2;
        this.cdr.markForCheck();
    }
    isValidDelete(): boolean {
        return this.statusForm === 2 && this.grupoFornecedor.id != null ? false : true;
    }

    voltar(): void {
        if (this.grupoFornecedor.id > 0) {
            this.statusForm = 2;
        } else {
            this.statusForm = 1;
        }
        this.cdr.markForCheck();
    }

    setaColumns(grupoFornecedores: FornecedorGrupoDTO[]): void {

        if (grupoFornecedores.length === 1) {
            this.grupoFornecedor = grupoFornecedores[0];
            this.statusForm = 2;
            this.pop('success', 'Encontrado apenas 1 registro', '');
        } else {
            this.rows = [];
            for (let i = 0; i < grupoFornecedores.length; i++) {
                this.rows.push(
                    {
                        id: grupoFornecedores[i].id,
                        nome: grupoFornecedores[i].nome,
                        status: grupoFornecedores[i].status === true ? 'Ativo' : 'Desativado',
                    },
                );
            }
        }
        this.cdr.detectChanges();
    }

    onLeftArray(): void {
        if (this.statusForm === 2) {
            for (let i = 0; i < this.grupoFornecedores.length; i++) {
                if (this.grupoFornecedor.id === this.grupoFornecedores[i].id) {
                    if ((i - 1) >= 0) {
                        this.selected = [];
                        this.grupoFornecedor = this.grupoFornecedores[i - 1];
                        i = this.grupoFornecedores.length + 1;
                        this.selected.push(this.grupoFornecedor);
                    }
                }
            }
        }
    }

    onRightArray(): void {
        if (this.statusForm === 2) {
            for (let i = 0; i < this.grupoFornecedores.length; i++) {
                if (this.grupoFornecedor.id === this.grupoFornecedores[i].id) {
                    if ((i + 1) < this.grupoFornecedores.length) {
                        // console.log('entrou');
                        this.selected = [];
                        this.grupoFornecedor = this.grupoFornecedores[i + 1];
                        i = this.grupoFornecedores.length + 1;
                        this.selected.push(this.grupoFornecedor);
                    }
                }
            }
        }
    }

    onTable(): void {
        // console.log('teste');
        if (this.grupoFornecedores != null && this.grupoFornecedores.length > 0) {
            this.statusForm = 3;
        } else {
            this.pop('error', 'Erro', 'Procure primeiro.');
        }
        this.cdr.markForCheck();
    }

    limpa(): void {
        this.grupoFornecedor = new FornecedorGrupoDTO();
        this.grupoFornecedor.status = true;
        this.statusForm = 1;
        this.errorForm = {};
        this.selected = [];
        this.cdr.markForCheck();
    }
    onActivate(event: any) {
        if (
            (event.type === 'dblclick') ||
            (event.type === 'keydown' && event.event.keyCode === 13)
        ) {
            this.editando();
            this.cdr.detectChanges();
        }
    }
}
