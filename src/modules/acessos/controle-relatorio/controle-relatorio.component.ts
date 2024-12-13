import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { ColumnMode, SelectionType } from '@swimlane/ngx-datatable';
import { NgxSpinnerService } from 'ngx-spinner';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ControleRelatorioService } from './controle-relatorio.service';
import { AuthorityDTO } from '../roles/authorities';
import { ConsultaRelatorioAcessoDTO, ConsultaRelatorioDTO } from './controle-relatorio';
import { AppAcessosModalConfirmComponent } from '../modals/app-acessos-modal-confirm/app-acessos-modal-confirm.component';
import { PageControleRelatorio } from './page-controle-relatorio';
import { ControleRelatorioPesquisaDTO } from './controle-relatorio-pesquisa';
import { ToastrService } from 'ngx-toastr';
import { UsuarioService } from '@modules/shared/services';

@Component({
    selector: 'app-controle-relatorio',
    templateUrl: './controle-relatorio.component.html',
    styleUrls: ['./controle-relatorio.component.scss'],
})
export class ControleRelatorioComponent implements OnInit {

    ColumnMode: any;
    submitted: boolean;
    statusForm: number;
    authorities!: AuthorityDTO[];
    acessoForm!: FormGroup;
    pageControleRelatorio!: PageControleRelatorio;
    controleRelatorioPesquisaDTO!: ControleRelatorioPesquisaDTO;
    consultaRelatorioAcessoDTOs!: ConsultaRelatorioAcessoDTO[];
    selectionTypeSingle = SelectionType.single;

    selected: any[] = [];

    constructor(
        private _modalService: NgbModal,
        private spinner: NgxSpinnerService,
        private _usuarioService: UsuarioService,
        private _controleRelatorioService: ControleRelatorioService,
        private toastr: ToastrService,
        private cdr: ChangeDetectorRef,
    ) {
        this.submitted = false;
        this.statusForm = 1;
        this.ColumnMode = ColumnMode;
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

    get f() { return this.acessoForm.controls; }

    ngOnInit(): void {
        this.createForm();
        this.iniciaObjs();
    }

    iniciaObjs(): void {
        this.initDefaults();
        this.buscaAuthorities();


        this.pageControleRelatorio = new PageControleRelatorio();
        this.pageControleRelatorio.content = [];


        this.controleRelatorioPesquisaDTO = new ControleRelatorioPesquisaDTO();
    }

    initDefaults(): void {
        this.statusForm = 1;
        this.submitted = false;
        this.consultaRelatorioAcessoDTOs = [];
    }

    createForm(): void {
        this.acessoForm = new FormGroup({
            id: new FormControl(''),
            nome: new FormControl(null, [Validators.required]),
            area: new FormControl(null, [Validators.required]),
            descricao: new FormControl(null),
            qry: new FormControl(null, [Validators.required]),
            status: new FormControl(true, [Validators.required]),
            editavel: new FormControl(false, [Validators.required]),
            acesso: new FormControl(null),
        });
    }



    delay(ms: number) {
        return new Promise(resolve => {
            setTimeout(resolve, ms);
            this.cdr.detectChanges();
        });
    }

    async onLimpa(): Promise<void> {
        this.onReset();
        await this.iniciaObjs();
        this.pop('success', 'Limpo com sucesso', '');
        this.cdr.detectChanges();
    }
    onCadastra(): void {
        this.submitted = true;

        if (this.acessoForm.invalid) {
            this.msgAlerta('Atenção', 'Existe campos que ainda precisam ser preenchidos', 'error');
        } else {

            const consultaRelatorioDTO: ConsultaRelatorioDTO = this.acessoForm.getRawValue();
            consultaRelatorioDTO.consultaRelatorioAcessoDTOs = this.consultaRelatorioAcessoDTOs;

            console.log(consultaRelatorioDTO);

            this.spinner.show('fullSpinner');
            this._controleRelatorioService.postOrPut(consultaRelatorioDTO, this.statusForm)
                .subscribe({
                    next: (data) => {
                        this.spinner.hide('fullSpinner');
                        // console.log(data);
                        this.dtoToForm(data);
                        this.statusForm = 2;
                        this.pageControleRelatorio.content = [];
                        this.cdr.detectChanges();
                    },
                    error: (err) => {
                        this.spinner.hide('fullSpinner');
                        console.log(err);
                        this.cdr.detectChanges();
                    }
                });
        }
    }

    onDeleta(): void {
        const id = this.acessoForm.controls['id'].value;
        if (id != null && !isNaN(id) && id > 0 && this.statusForm === 2) {
            const activeModal = this._modalService.open(AppAcessosModalConfirmComponent);
            activeModal.componentInstance.modalHeader = 'Confirme a exclusão';
            activeModal.componentInstance.modalContent = 'Deseja realmente excluir ?';
            activeModal.componentInstance.modalType = 'confirm';
            activeModal.componentInstance.defaultLabel = 'Não';
            activeModal.result.then((result) => {
                if (result === 'confirm') {
                    this.spinner.show('fullSpinner');
                    let message = '';
                    this._controleRelatorioService.del(id)
                        .subscribe({
                            next: async (resp: any) => {
                                this.spinner.hide('fullSpinner');
                                message = resp.message;

                                this.pop('success', 'OK', message);
                                await this.delay(1000);
                                this.onLimpa();
                                this.cdr.detectChanges();
                            },
                            error: (err) => {
                                this.spinner.hide('fullSpinner');
                                message = err.message;
                                this.pop('error', 'Erro', message);
                                this.cdr.detectChanges();
                            }
                        });
                }
            }, (error) => {
                console.log(error);
            });
        } else {
            this.msgAlerta('Atenção', `Selecione um relatório primeiro,
            não é possível deletar sem um id válido`, 'alert');
        }
    }

    msgAlerta(titulo: string, conteudo: string, tipo: string): void {
        const activeModal = this._modalService.open(
            AppAcessosModalConfirmComponent, { backdrop: true });
        activeModal.componentInstance.modalHeader = titulo;
        activeModal.componentInstance.modalContent = conteudo;
        activeModal.componentInstance.modalType = tipo;
        activeModal.result.then((result) => {
            console.log(result);
        }, (error) => {
            console.log(error);
        });
    }

    dtoToForm(consultaRelatorioDTO: ConsultaRelatorioDTO): void {

        this.acessoForm.patchValue({
            id: consultaRelatorioDTO.id,
            nome: consultaRelatorioDTO.nome,
            area: consultaRelatorioDTO.area,
            descricao: consultaRelatorioDTO.descricao,
            qry: consultaRelatorioDTO.qry,
            status: consultaRelatorioDTO.status,
            editavel: consultaRelatorioDTO.editavel,
            acesso: null,
        });
        this.acessoForm.controls['id'].disable();
        this.consultaRelatorioAcessoDTOs = consultaRelatorioDTO.consultaRelatorioAcessoDTOs;
    }

    buscaAuthorities(): void {
        this._usuarioService.getAllAuthorities()
            .subscribe({
                next: (data: AuthorityDTO[]) => {

                    const filtAuthorites = data.filter(at => {
                        return at.name.indexOf('ROLE_SALES_FUNCAO_QRY') > -1;
                    });
                    this.authorities = filtAuthorites.sort((c1, c2) => {
                        if (c1.name > c2.name) {
                            return 1;
                        }
                        if (c1.name < c2.name) {
                            return -1;
                        }
                        return 0;
                    });
                    this.cdr.detectChanges();
                }
            });
    }



    onReset() {
        this.submitted = false;
        this.consultaRelatorioAcessoDTOs = [];
        this.acessoForm.reset();

        this.acessoForm.patchValue({
            status: true,
            editavel: false,
        });

        this.acessoForm.enable();
    }

    onPesquisa(): void {
        this.controleRelatorioPesquisaDTO.consultaRelatorioDTO = this.acessoForm.getRawValue();
        this.pesquisaRelatorio(this.controleRelatorioPesquisaDTO);
    }



    onLeftArray(): void {
        if (this.statusForm === 2) {
            for (let i = 0; i < this.pageControleRelatorio.content.length; i++) {
                const id = this.acessoForm.controls['id'].value;
                if (id != null && !isNaN(id) && id === this.pageControleRelatorio.content[i].id) {
                    if ((i - 1) >= 0) {
                        this.selected = [];
                        this.dtoToForm(this.pageControleRelatorio.content[i - 1]);
                        this.selected.push(this.pageControleRelatorio.content[i - 1]);
                        i = this.pageControleRelatorio.content.length + 1;
                    } else {
                        this.pop('error', 'Sem registro para mover, busque novamente ou pule a página', '');
                    }
                }
            }
        }
    }
    onRightArray(): void {
        if (this.statusForm === 2) {
            for (let i = 0; i < this.pageControleRelatorio.content.length; i++) {
                const id = this.acessoForm.controls['id'].value;
                if (id != null && !isNaN(id) && id === this.pageControleRelatorio.content[i].id) {
                    if ((i + 1) < this.pageControleRelatorio.content.length) {
                        this.selected = [];
                        this.dtoToForm(this.pageControleRelatorio.content[i + 1]);
                        this.selected.push(this.pageControleRelatorio.content[i + 1]);
                        i = this.pageControleRelatorio.content.length + 1;
                    } else {
                        this.pop('error', 'Sem registro para mover, busque novamente ou pule a página', '');
                    }
                }
            }
        }
    }

    setPage(pageInfo: any) {
        // console.log(pageInfo);
        this.controleRelatorioPesquisaDTO.pageSize = pageInfo.pageSize;
        this.controleRelatorioPesquisaDTO.pageNumber = pageInfo.offset;
        this.pesquisaRelatorio(this.controleRelatorioPesquisaDTO);
    }

    pesquisaRelatorio(controleRelatorioPesquisaDTO: ControleRelatorioPesquisaDTO): void {
        console.log(controleRelatorioPesquisaDTO);
        this.spinner.show('fullSpinner');
        this._controleRelatorioService.find(controleRelatorioPesquisaDTO)
            .subscribe({
                next: (data) => {
                    this.spinner.hide('fullSpinner');
                    const pageData = data;

                    this.pageControleRelatorio = pageData;

                    if (this.pageControleRelatorio.content.length === 0) {
                        this.pop('error', 'Pesquisa', 'Não foi encontrado nada com essa pesquisa.');
                    } else if (this.pageControleRelatorio.content.length === 1) {
                        this.pop('success', 'Pesquisa', 'Encontrado apenas 1.');
                        this.dtoToForm(this.pageControleRelatorio.content[0]);
                        this.statusForm = 2;
                    } else {
                        // console.log('mais que 1');
                        this.statusForm = 3;
                    }
                    this.cdr.detectChanges();
                },
                error: () => {
                    this.spinner.hide('fullSpinner');
                    this.cdr.detectChanges();
                }
            });
    }

    onTable(): void {
        this.unsetSelected();
        if (this.pageControleRelatorio != null && this.pageControleRelatorio.content.length > 0) {
            this.statusForm = 3;
        } else {
            this.pop('error', 'Erro', 'Procure primeiro.');
        }
    }

    addAcesso(): void {
        const authority: AuthorityDTO = this.acessoForm.controls['acesso'].value;

        if (authority != null) {
            const roleAcesso = authority.name;

            const filt = this.consultaRelatorioAcessoDTOs.filter(acr => {
                return acr.roleAcesso === roleAcesso;
            });

            if (filt.length === 0) {
                const objRoleAcesso = new ConsultaRelatorioAcessoDTO();
                objRoleAcesso.roleAcesso = roleAcesso;
                objRoleAcesso.id = null;
                objRoleAcesso.ConsultaRelatorioDTO_id = null;

                this.consultaRelatorioAcessoDTOs.push(objRoleAcesso);
            } else {
                this.pop('error', 'warning', 'Essa role ja foi adicionada');
            }
        } else {
            this.pop('error', 'warning', 'Atenção selecione a role primeiro');
        }
    }

    removeRole(roleAcesso: string): void {
        for (let i = 0; i < this.consultaRelatorioAcessoDTOs.length; i++) {
            if (roleAcesso === this.consultaRelatorioAcessoDTOs[i].roleAcesso) {
                this.consultaRelatorioAcessoDTOs.splice(i, 1);
                i = this.consultaRelatorioAcessoDTOs.length + 1;
            }
        }
    }

    editando(): void {
        const sel: ConsultaRelatorioDTO[] = this.pageControleRelatorio.content.filter(us => {
            return us.id === this.selected[0].id;
        });

        this.dtoToForm(sel[0]);
        this.statusForm = 2;
    }



    unsetSelected(): void {
        if (this.selected != null) {
            this.selected.splice(0, this.selected.length);
        }
    }


    voltar(): void {
        const id = this.acessoForm.controls['id'].value;
        if (id != null && id > 0) {
            this.statusForm = 2;
        } else {
            this.statusForm = 1;
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
