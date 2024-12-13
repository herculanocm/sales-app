import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { AuthorityDTO } from './authorities';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { RolesService } from './roles.service';
import { AppAcessosModalConfirmComponent } from '../modals/app-acessos-modal-confirm/app-acessos-modal-confirm.component';
import { ColumnMode, SelectionType } from '@swimlane/ngx-datatable';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-acessos-roles',
    templateUrl: './roles.component.html',
    styleUrls: ['./roles.component.scss'],
})
export class RolesComponent implements OnInit {
    errorForm: any = {};
    ColumnMode = ColumnMode;
    authorities!: AuthorityDTO[];
    authority!: AuthorityDTO;
    statusForm: number;
    selectionTypeSingle = SelectionType.single;
    selected: any[] = [];

    ngOnInit(): void {
        this.iniciaObjs();
    }

    constructor(
        private _modalService: NgbModal,
        private spinner: NgxSpinnerService,
        private _rolesService: RolesService,
        private toastr: ToastrService,
        private cdr: ChangeDetectorRef,
    ) {
        this.statusForm = 1;
    }

    isValidDelete(): boolean {
        return this.statusForm === 2 && this.authority.name != null ? false : true;
    }

    iniciaObjs(): void {
        this.authority = new AuthorityDTO();
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
        this.spinner.show();
        this._rolesService.getAllAuthorities()
            .subscribe({
                next: (data) => {
                    this.authorities = data.sort((s1, s2) => {
                        if (s1.name > s2.name) {
                            return 1;
                        }
                        if (s1.name < s2.name) {
                            return -1;
                        }
                        return 0;
                    });
                    this.spinner.hide();
                    if (this.authorities.length === 0) {
                        this.pop('error', 'Pesquisa', 'Não foi encontrado nada com essa pesquisa');
                    } else {
                        this.setaColumns(this.authorities);
                    }
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
    setaColumns(authorities: AuthorityDTO[]): void {
        if (authorities.length === 1) {
            this.authority = authorities[0];
            this.statusForm = 2;
            this.pop('success', 'Encontrado apenas 1 registro', '');
        } else {
            this.statusForm = 3;
        }
        this.cdr.detectChanges();
    }
    onDeleta(name: string): void {
        const activeModal = this._modalService.open(AppAcessosModalConfirmComponent);
        activeModal.componentInstance.modalHeader = 'Confirme a exclusão';
        activeModal.componentInstance.modalContent = 'Deseja realmente excluir ?';
        activeModal.componentInstance.modalType = 'confirm';
        activeModal.componentInstance.defaultLabel = 'Não';
        activeModal.result.then((result) => {
            if (result === 'confirm') {
                let message = '';
                this.spinner.show();
                this._rolesService.deleteAuthority(name)
                    .subscribe({
                        next: (resp: any) => {
                            this.spinner.hide();
                            message = resp.message;
                            this.authorities = [];
                            this.pop('success', 'Atenção', message);
                            this.onLimpa();
                            this.cdr.detectChanges();
                        },
                        error: (err) => {
                            this.spinner.hide();
                            message = err.message;
                            this.pop('error', 'Atenção', message);
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
    voltar(): void {
        if (this.authority.name != null && this.authority.name.length > 0) {
            this.statusForm = 2;
        } else {
            this.statusForm = 1;
        }
    }
    limpa(): void {
        this.iniciaObjs();
        this.statusForm = 1;
        this.errorForm = {};
        this.selected = [];
    }
    onCadastra(): void {
        this.spinner.show();
        this._rolesService.salvaOuAtualizaAuthority(this.authority, this.statusForm)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    this.spinner.hide();
                    this.authority = data;
                    this.errorForm = {};
                    this.statusForm = 2;
                    this.authorities = [];
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
        const sel = this.authorities.filter(us => {
            return us.name === this.selected[0].name;
        });
        // // console.log(sel);
        this.authority = sel[0];
        this.statusForm = 2;
        this.cdr.detectChanges();
    }
    onLeftArray(): void {
        if (this.statusForm === 2) {
            for (let i = 0; i < this.authorities.length; i++) {
                if (this.authority.name === this.authorities[i].name) {
                    if ((i - 1) >= 0) {
                        this.selected = [];
                        this.authority = this.authorities[i - 1];
                        i = this.authorities.length + 1;
                        this.selected.push(this.authority);
                    }
                }
            }
        }
    }
    onRightArray(): void {
        if (this.statusForm === 2) {
            for (let i = 0; i < this.authorities.length; i++) {
                if (this.authority.name === this.authorities[i].name) {
                    if ((i + 1) < this.authorities.length) {
                        // console.log('entrou');
                        this.selected = [];
                        this.authority = this.authorities[i + 1];
                        i = this.authorities.length + 1;
                        this.selected.push(this.authority);
                    }
                }
            }
        }
    }
    onTable(): void {
        // console.log('teste');
        if (this.authorities != null && this.authorities.length > 0) {
            this.statusForm = 3;
        } else {
            this.pop('error', 'Atenção', 'Procure primeiro');
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
