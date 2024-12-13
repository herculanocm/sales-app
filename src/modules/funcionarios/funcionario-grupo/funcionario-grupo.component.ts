import { Component, ChangeDetectorRef } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AppFuncModalConfirmComponent } from '../modals/app-func-modal-confirm/app-func-modal-confirm.component';
import { ColumnMode, SelectionType } from '@swimlane/ngx-datatable';
import { FuncionarioGrupoDTO } from '@modules/shared/models/funcionario';
import { FuncionarioGrupoService } from '@modules/shared/services';

@Component({
    selector: 'app-funcionario-grupo',
    templateUrl: './funcionario-grupo.component.html',
    styleUrls: ['./funcionario-grupo.component.scss'],
})
export class FuncionarioGrupoComponent {
    ColumnMode = ColumnMode;
    grupoFuncionario: FuncionarioGrupoDTO;
    grupoFuncionarios!: FuncionarioGrupoDTO[];
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
        private toastr: ToastrService,
        private _modalService: NgbModal,
        private _grupoFuncionarioService: FuncionarioGrupoService,
        private cdr: ChangeDetectorRef,
    ) {
        this.grupoFuncionario = new FuncionarioGrupoDTO();
        this.grupoFuncionario.status = true;
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
        this.grupoFuncionarios = [];
        this.selected = [];
        this.rows = [];
        this._grupoFuncionarioService.find(this.grupoFuncionario)
            .subscribe({
                next: (data) => {
                    this.grupoFuncionarios = data;
                    if (this.grupoFuncionarios.length === 0) {
                        this.pop('error', 'Pesquisa', 'Não foi encontrado nada com essa pesquisa.');
                    } else {
                        this.statusForm = 3;
                        this.setaColumns(this.grupoFuncionarios);
                    }
                },
                error: (err) => {
                    // console.log(err);
                    this.pop('error', 'Erro', 'Erro ao pesquisar');
                }
            });
    }
    onDeleta(id: number): void {
        const activeModal = this._modalService.open(AppFuncModalConfirmComponent);
        activeModal.componentInstance.modalHeader = 'Confirme a exclusão';
        activeModal.componentInstance.modalContent = 'Deseja realmente excluir ?';
        activeModal.componentInstance.modalType = 'confirm';
        activeModal.componentInstance.defaultLabel = 'Não';
        activeModal.result.then((result) => {
            if (result === 'confirm') {
                this._grupoFuncionarioService.del(id)
                    .subscribe({
                        next: (resp: any) => {
                            // message = resp.message;
                            this.rows = [];
                            this.grupoFuncionarios = [];
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
    }
    onCadastra(): void {
        this._grupoFuncionarioService.postOrPut(this.grupoFuncionario, this.statusForm)
            .subscribe({
                next: (data) => {
                    this.grupoFuncionario = data;
                    // this.showToast('success', 'Sucesso', 'Requisição realizada sucesso.');
                    this.errorForm = {};
                    this.statusForm = 2;
                    this.rows = [];
                    this.grupoFuncionarios = [];
                    this.cdr.detectChanges();
                },
                error: (err) => {
                    if (Object.prototype.hasOwnProperty.call(err, 'error') && err.error != null) {
                        this.errorForm = err.error;
                    }
                    this.cdr.detectChanges();
                }
            });
    }
    editando(): void {
        // console.log('selecionando para editar');
        const sel = this.grupoFuncionarios.filter(us => {
            return us.id === this.selected[0].id;
        });
        // console.log(sel);
        this.grupoFuncionario = sel[0];
        this.statusForm = 2;
    }
    isValidDelete(): boolean {
        return this.statusForm === 2 && this.grupoFuncionario.id != null ? false : true;
    }

    voltar(): void {
        if (this.grupoFuncionario.id > 0) {
            this.statusForm = 2;
        } else {
            this.statusForm = 1;
        }
    }

    setaColumns(grupoFuncionarios: FuncionarioGrupoDTO[]): void {

        if (grupoFuncionarios.length === 1) {
            this.grupoFuncionario = grupoFuncionarios[0];
            this.statusForm = 2;
            this.pop('success', 'Encontrado apenas 1 registro', '');
        } else {
            this.rows = [];
            for (let i = 0; i < grupoFuncionarios.length; i++) {
                this.rows.push(
                    {
                        id: grupoFuncionarios[i].id,
                        nome: grupoFuncionarios[i].nome,
                        status: grupoFuncionarios[i].status === true ? 'Ativo' : 'Desativado',
                    },
                );
            }
        }
        this.cdr.detectChanges();
    }

    onLeftArray(): void {
        if (this.statusForm === 2) {
            for (let i = 0; i < this.grupoFuncionarios.length; i++) {
                if (this.grupoFuncionario.id === this.grupoFuncionarios[i].id) {
                    if ((i - 1) >= 0) {
                        this.selected = [];
                        this.grupoFuncionario = this.grupoFuncionarios[i - 1];
                        i = this.grupoFuncionarios.length + 1;
                        this.selected.push(this.grupoFuncionario);
                    }
                }
            }
        }
    }

    onRightArray(): void {
        if (this.statusForm === 2) {
            for (let i = 0; i < this.grupoFuncionarios.length; i++) {
                if (this.grupoFuncionario.id === this.grupoFuncionarios[i].id) {
                    if ((i + 1) < this.grupoFuncionarios.length) {
                        // console.log('entrou');
                        this.selected = [];
                        this.grupoFuncionario = this.grupoFuncionarios[i + 1];
                        i = this.grupoFuncionarios.length + 1;
                        this.selected.push(this.grupoFuncionario);
                    }
                }
            }
        }
    }

    onTable(): void {
        // console.log('teste');
        if (this.grupoFuncionarios != null && this.grupoFuncionarios.length > 0) {
            this.statusForm = 3;
        } else {
            this.pop('error', 'Erro', 'Procure primeiro.');
        }
    }

    limpa(): void {
        this.grupoFuncionario = new FuncionarioGrupoDTO();
        this.grupoFuncionario.status = true;
        this.statusForm = 1;
        this.errorForm = {};
        this.selected = [];
        this.cdr.detectChanges();
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
