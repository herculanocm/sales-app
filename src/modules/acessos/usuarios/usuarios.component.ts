import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { AppAcessosModalConfirmComponent } from '../modals/app-acessos-modal-confirm/app-acessos-modal-confirm.component';
import { AuthorityDTO } from '../roles/authorities';
import { ColumnMode, SelectionType } from '@swimlane/ngx-datatable';
import { AppAcessosModalCloneComponent } from '../modals/app-acessos-modal-clone/app-acessos-modal-clone.component';
import { ToastrService } from 'ngx-toastr';
import { UserDTO } from '@modules/shared/models/usuario';
import { FuncionarioService, UsuarioService } from '@modules/shared/services';
import { FuncionarioDTO } from '@modules/shared/models/funcionario';


@Component({
    selector: 'app-acessos-usuarios',
    templateUrl: './usuarios.component.html',
    styleUrls: ['./usuarios.component.scss'],
})
export class UsuariosComponent implements OnInit {
    ColumnMode = ColumnMode;
    usuario!: UserDTO;
    usuarios!: UserDTO[];
    errorForm: object | any = {};
    authorities!: AuthorityDTO[];
    authSelected: any;
    // status 1 = salvando, status 2 = editando, status 3 = pesquisando
    statusForm: number;
    selectionTypeSingle = SelectionType.single;

    funcionarios: FuncionarioDTO[] = [];

    public loading = false;

    // datatable
    rows: any[] = [];
    columns: any[] = [
        { name: 'ID' },
        { name: 'LOGIN' },
        { name: 'NOME' },
        { name: 'EMAIL' },
    ];
    selected: any[] = [];
    // datatable


    constructor(
        private _usuarioService: UsuarioService,
        private toastr: ToastrService,
        private cdr: ChangeDetectorRef,
        private _modalService: NgbModal,
        private spinner: NgxSpinnerService,
        private _funcionarioService: FuncionarioService
    ) {
        this.statusForm = 1;
    }
    buscaAuthorities(): void {
        this._usuarioService.getAllAuthorities()
            .subscribe({
                next: (data: AuthorityDTO[]) => {
                    // console.log(data);
                    this.authorities = data;

                    this.authorities.sort((obj1, obj2) => {
                        if (obj1.name > obj2.name) {
                            return 1;
                        }
                        if (obj1.name < obj2.name) {
                            return -1;
                        }
                        return 0;
                    });
                    this.cdr.markForCheck();
                }
            });
    }

    ngOnInit() {
        this.buscaAuthorities();
        this.getAllFuncionarios();

        this.usuario = new UserDTO();
        this.usuario.authorityDTOs = [];
        this.usuario.activated = true;
        this.usuario.neededChangePass = false;

        this.authorities = [];
        this.authSelected = null;
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

    getAllFuncionarios(): void {
        this._funcionarioService.getAll()
            .subscribe({
                next: (data: FuncionarioDTO[]) => {
                    this.funcionarios = data;
                    this.cdr.detectChanges();
                }
            });
    }

    getFuncionarioName(): string {
        let nome = 'Digite o ID do funcionário';
        if (this.funcionarios.length > 0) {
            this.funcionarios.forEach(funcionario => {
                if (funcionario.id != null && funcionario.id === this.usuario.idVendedor) {
                    nome = funcionario.nome;
                }
            });
        }
        return nome;
    }

    onPesquisa(): void {
        this.spinner.show();
        this._usuarioService.getUsers()
            .subscribe({
                next: (users: UserDTO[]) => {
                    this.usuarios = users;
                    this.spinner.hide();
                    if (this.usuarios.length === 0) {
                        this.pop('error', 'Pesquisa', 'Não foi encontrado nada com essa pesquisa');
                    } else {
                        this.statusForm = 3;
                        this.setaColumns(this.usuarios);
                    }
                    this.cdr.detectChanges();
                },
                error: () => {
                    this.spinner.hide();
                    this.cdr.detectChanges();
                    // // console.log(err);
                }
            });
    }

    onDeleta(id: number): void {
        const activeModal = this._modalService.open(AppAcessosModalConfirmComponent);
        activeModal.componentInstance.modalHeader = 'Confirme a exclusão';
        activeModal.componentInstance.modalContent = 'Deseja realmente excluir ?';
        activeModal.componentInstance.modalType = 'confirm';
        activeModal.componentInstance.defaultLabel = 'Não';
        activeModal.result.then((result) => {
            if (result === 'confirm') {
                let message = '';
                this.spinner.show();
                this._usuarioService.delUserByLogin(this.usuario.login)
                    .subscribe({
                        next: (resp: any) => {
                            this.spinner.hide();
                            message = resp.message;
                            this.rows = [];
                            this.usuarios = [];
                            this.pop('success', 'Atenção', message);
                            this.onLimpa();
                            this.cdr.detectChanges();
                        },
                        error: (err) => {
                            this.spinner.hide();
                            message = err.message;
                            this.pop('error', 'Atenção', message);
                            this.cdr.detectChanges();
                        }
                    });
            }
        }, (error) => { console.log(error) });
    }
    clonarAcessos(): void {
        const activeModal = this._modalService.open(AppAcessosModalCloneComponent);
        activeModal.componentInstance.modalHeader = 'Selecione os usuários para clonar';
        activeModal.result.then((result) => {
            console.log(result);
        }, (error) => {
            console.log(error);
        });
    }
    onLimpa(): void {
        this.limpa();
        this.cdr.markForCheck();
    }
    voltar(): void {
        if (this.usuario.id > 0) {
            this.statusForm = 2;
        } else {
            this.statusForm = 1;
        }
        this.cdr.markForCheck();
    }
    onCadastra(): void {
        // console.log(this.usuario);
        this.spinner.show();
        this._usuarioService.postOrPutUser(this.usuario, this.statusForm)
            .subscribe({
                next: (data: UserDTO) => {
                    // console.log(data);
                    this.spinner.hide();
                    this.usuario = data;
                    this.errorForm = {};
                    this.statusForm = 2;
                    this.rows = [];
                    this.usuarios = [];
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
        // // console.log('selecionando para editar');
        const sel = this.usuarios.filter(us => {
            return us.id === this.selected[0].id;
        });
        // // console.log(sel);
        this.usuario = sel[0];
        this.statusForm = 2;
        this.cdr.detectChanges();
    }
    isValidDelete(): boolean {
        return this.statusForm === 2 && this.usuario.id != null ? false : true;
    }
    setaColumns(usuarios: UserDTO[]): void {
        this.rows = [];
        for (let i = 0; i < usuarios.length; i++) {
            this.rows.push(
                {
                    id: usuarios[i].id,
                    login: usuarios[i].login,
                    nome: usuarios[i].firstName,
                    email: usuarios[i].email,
                },
            );
        }
    }
    onLeftArray(): void {
        if (this.statusForm === 2) {
            for (let i = 0; i < this.usuarios.length; i++) {
                if (this.usuario.id === this.usuarios[i].id) {
                    if ((i - 1) >= 0) {
                        this.selected = [];
                        this.usuario = this.usuarios[i - 1];
                        i = this.usuarios.length + 1;
                        this.selected.push(this.usuario);
                    }
                }
            }
        }
    }
    onRightArray(): void {
        if (this.statusForm === 2) {
            for (let i = 0; i < this.usuarios.length; i++) {
                if (this.usuario.id === this.usuarios[i].id) {
                    if ((i + 1) < this.usuarios.length) {
                        // console.log('entrou');
                        this.selected = [];
                        this.usuario = this.usuarios[i + 1];
                        i = this.usuarios.length + 1;
                        this.selected.push(this.usuario);
                    }
                }
            }
        }
    }
    limpa(): void {
        this.usuario = new UserDTO();
        this.usuario.authorityDTOs = [];
        this.usuario.activated = true;
        this.usuario.neededChangePass = false;
        this.statusForm = 1;
        this.errorForm = {};
        this.selected = [];
    }
    onTable(): void {
        // console.log('teste');
        if (this.usuarios != null && this.usuarios.length > 0) {
            this.statusForm = 3;
        } else {
            this.pop('error', 'Atenção', 'Procure primeiro');
        }
        this.cdr.detectChanges();
    }
    addRole(): void {
        if (this.authSelected == null) {
            this.pop('error', 'Atenção', 'Selecione uma role Primeiro');
        } else if (this.authSelected !== undefined) {
            const filtArray = this.usuario.authorityDTOs.filter(authorityDTO => {
                return authorityDTO.name === this.authSelected.name;
            });

            if (filtArray.length > 0) {
                this.pop('warning', 'Atenção', 'Role já existe');
            } else {
                this.usuario.authorityDTOs.push(this.authSelected);
                this.authSelected = null;
            }
        } else {
            this.pop('error', 'Atenção', 'Selecione uma role Primeiro');
        }
        this.cdr.detectChanges();
    }
    removeRole(role: string): void {
        for (let i = 0; i < this.usuario.authorityDTOs.length; i++) {
            if (this.usuario.authorityDTOs[i].name === role) {
                this.usuario.authorityDTOs.splice(i, 1);
                this.pop('success', 'Atenção', 'Role removida');
                i = this.usuario.authorityDTOs.length + 1;
            }
        }
        this.cdr.detectChanges();
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
