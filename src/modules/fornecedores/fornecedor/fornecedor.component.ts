import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, tap, switchMap } from 'rxjs/operators';
import { NgxSpinnerService } from 'ngx-spinner';
import { AppFornecModalConfirmComponent } from '../modals/app-fornec-modal-confirm/app-fornec-modal-confirm.component';
import { ColumnMode, SelectionType } from '@swimlane/ngx-datatable';
import { environment } from 'environments/environment';
import { EstadoDTO, MunicipioDTO } from '@modules/shared/models/layout.utils';
import { FornecedorGrupoService, FornecedorService, LayoutService } from '@modules/shared/services';
import { ToastrService } from 'ngx-toastr';
import { FornecedorDTO, FornecedorGrupoDTO, FornecedorPesquisaDTO, PageFornecedor } from '@modules/shared/models/fornecedor';


@Component({
    selector: 'app-fornecedor',
    templateUrl: './fornecedor.component.html',
    styleUrls: ['./fornecedor.component.scss'],
})
export class FornecedorComponent implements OnInit {

    ColumnMode = ColumnMode;
    fornecedor!: FornecedorDTO;
    selectionTypeSingle = SelectionType.single;

    fornecedorPesquisa!: FornecedorPesquisaDTO;
    pageFornecedor!: PageFornecedor;

    estados: EstadoDTO[] = [];
    municipios: MunicipioDTO[] = [];
    flgBuscandoMunicipio: number;

    grupoFornecedor!: FornecedorGrupoDTO;
    grupoFornecedores!: FornecedorGrupoDTO[];

    errorForm: any = {};
    authorities!: string[];
    grupoFornecedorSelected: any = {};
    // status 1 = salvando, status 2 = editando, status 3 = pesquisando
    statusForm: number;
    activeNav: number;

    foneMask? = environment.foneMask;
    cellMask? = environment.cellMask;
    cgcMask? = environment.cgcMask;

    public loading = false;

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
        private spinner: NgxSpinnerService,
        private __fornecedorService: FornecedorService,
        private _pagesService: LayoutService,
        private _grupoFornecedorService: FornecedorGrupoService,
        private toastr: ToastrService,
        private cdr: ChangeDetectorRef,
    ) {
        this.statusForm = 1;
        this.flgBuscandoMunicipio = 0;
        this.activeNav = 1;
    }



    searchingGrupo = false;
    searchFailedGrupo = false;
    hideSearchingWhenUnsubscribedGrupo = new Observable(() => () => this.searchingGrupo = false);


    formatterGrupo = (x: { nome: string }) => x.nome;


    /*
    cobrança
    indicador de liquidação analitico
    indicador de liquidação mensal
    */

    searchGrupo = (text$: Observable<string>) =>
        text$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            tap(() => this.searchingGrupo = true),
            switchMap(term =>
                this._grupoFornecedorService.findByName(term)
                    .pipe(
                        tap(() => this.searchFailedGrupo = false),
                        catchError(() => {
                            this.searchFailedGrupo = true;
                            return of([]);
                        })),
            ), tap(() => this.searchingGrupo = false))

    buscaCep(): void {
        this.loading = true;
        this._pagesService.buscaCep(this.fornecedor.fornecedorEnderecoDTO.cep)
            .subscribe((data) => {
                this.setaCep(data);
                this.loading = false;
                this.pop('success', 'OK', 'Cep encontrado com sucesso.');
                this.cdr.detectChanges();
            }, (err) => {
                this.loading = false;
                this.pop('error', 'Erro', 'Digite um cep valido, erro ao pesquisar!.');
                this.cdr.detectChanges();
            });
    }


    ngOnInit(): void {
        this.iniciaObjs();
        this.buscaUtils();
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

    isArray(value: any): boolean {
        return Array.isArray(value);
    }
    
    isUndefined(value: any): boolean {
        return typeof(value) === 'undefined';
    }

    grupoSelecionado(event: any, vGrupoSelecionado: any): void {
        this.grupoFornecedorSelected = event.item;
        setTimeout(function () {
            vGrupoSelecionado.value = '';
        }, 400);
        this.addGrupo();
    }

    setaCep(data: any): void {
        this.fornecedor.fornecedorEnderecoDTO.cep = data.cep;
        this.fornecedor.fornecedorEnderecoDTO.logradouro = data.logradouro;
        this.fornecedor.fornecedorEnderecoDTO.bairro = data.bairro;
        this.fornecedor.fornecedorEnderecoDTO.cidade = data.cidade;
        this.fornecedor.fornecedorEnderecoDTO.estado = data.uf;
        this.fornecedor.fornecedorEnderecoDTO.numLogradouro = data.numLogradouro;
        this.fornecedor.fornecedorEnderecoDTO.complemento = data.complemento;
        this.fornecedor.fornecedorEnderecoDTO.uf = data.uf;

        this.fornecedor.fornecedorEnderecoDTO.municipioDTO = data.municipioDTO;
        this.municipios.push(this.fornecedor.fornecedorEnderecoDTO.municipioDTO);
        this.cdr.markForCheck();
    }


    addGrupo(): void {
        // console.log(this.grupoFornecedorSelected);
        if (this.grupoFornecedorSelected == null || typeof (this.grupoFornecedorSelected.id) === 'undefined') {
            this.pop('error', 'Erro', 'Selecione um grupo primeiro!.');
        } else {
            const filtros = this.fornecedor.fornecedorGrupoDTOs.filter(g => {
                return g.id === this.grupoFornecedorSelected.id;
            });

            if (filtros.length > 0) {
                this.pop('error', 'Erro', 'Grupo já foi adicionado!.');
            } else {
                this.fornecedor.fornecedorGrupoDTOs.push(this.grupoFornecedorSelected);
            }
        }
    }

    removeGrupo(id: number): void {
        for (let i = 0; i < this.fornecedor.fornecedorGrupoDTOs.length; i++) {
            if (this.fornecedor.fornecedorGrupoDTOs[i].id === id) {
                this.fornecedor.fornecedorGrupoDTOs.splice(i, 1);
                i = this.fornecedor.fornecedorGrupoDTOs.length + 1;
            }
        }
        this.pop('success', 'OK', 'Grupo removido!');
    }

    onPesquisa(): void {
        this.fornecedorPesquisa.fornecedorDTO = this.fornecedor;
        this.pesquisaForncedor(this.fornecedorPesquisa);
    }

    pesquisaForncedor(fornecedorPesquisaDTO: FornecedorPesquisaDTO): void {
        this.selected = [];
        this.rows = [];

        this.spinner.show();
        this.__fornecedorService.findByPage(fornecedorPesquisaDTO)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    this.spinner.hide();
                    this.pageFornecedor = data;

                    if (this.pageFornecedor.content.length === 0) {
                        this.pop('error', 'Pesquisa', 'Não foi encontrado nada com essa pesquisa.');
                    } else if (this.pageFornecedor.content.length === 1) {
                        this.pop('success', 'Pesquisa', 'Encontrado apenas 1.');
                        this.setaFornecedor(this.pageFornecedor.content[0]);
                        this.statusForm = 2;
                    } else {
                        this.statusForm = 3;
                    }
                    this.cdr.detectChanges();
                },
                error: () => {
                    this.spinner.hide();
                    // console.log(err);
                    this.cdr.detectChanges();
                }
            });
    }

    setPage(pageInfo: any) {
        this.fornecedorPesquisa.pageSize = pageInfo.pageSize;
        this.fornecedorPesquisa.pageNumber = pageInfo.offset;
        this.pesquisaForncedor(this.fornecedorPesquisa);
        this.cdr.detectChanges();
    }

    setaFornecedor(fornecedor: FornecedorDTO): void {
        this.fornecedor = fornecedor;
        this.municipios.push(this.fornecedor.fornecedorEnderecoDTO.municipioDTO);
        this.cdr.detectChanges();
    }

    onDeleta(id: number): void {
        const activeModal = this._modalService.open(AppFornecModalConfirmComponent);
        activeModal.componentInstance.modalHeader = 'Confirme a exclusão';
        activeModal.componentInstance.modalContent = 'Deseja realmente excluir ?';
        activeModal.componentInstance.modalType = 'confirm';
        activeModal.componentInstance.defaultLabel = 'Não';
        activeModal.result.then((result) => {
            if (result === 'confirm') {
                let message = '';
                this.spinner.show();
                this.__fornecedorService.del(id)
                    .subscribe({
                        next: (resp: any) => {
                            this.spinner.hide();
                            // message = resp.message;
                            // this.pop('success', 'Sucesso', message);
                            this.rows = [];
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
        }, (error) => {
            console.log(error);
        });
    }

    onLimpa(): void {
        this.limpa();
        this.cdr.detectChanges();
    }

    onCadastra(): void {
        // console.log(this.fornecedor);
        this.spinner.show();
        this.__fornecedorService.postOrPut(this.fornecedor, this.statusForm)
            .subscribe({
                next: (data) => {
                    this.spinner.hide();
                    this.loading = false;
                    this.fornecedor = data;
                    this.pop('success', 'Sucesso', 'Requisição realizada sucesso.');
                    this.errorForm = {};
                    this.statusForm = 2;
                    this.rows = [];
                    this.cdr.detectChanges();

                },
                error: (err) => {
                    this.spinner.hide();
                    this.errorForm = err.error;
                    this.loading = false;
                    this.pop('error', 'Erro', 'Erro ao realizar requisição');
                    this.cdr.detectChanges();
                }
            });
    }


    editando(): void {
        // console.log('selecionando para editar');
        const sel = this.pageFornecedor.content.filter(us => {
            return us.id === this.selected[0].id;
        });
        this.setaFornecedor(sel[0]);
        this.statusForm = 2;
        this.cdr.detectChanges();
    }

    isValidDelete(): boolean {
        return this.statusForm === 2 && this.fornecedor.id != null ? false : true;
    }

    setaColumns(fornecedores: FornecedorDTO[]): void {
        if (fornecedores.length === 1) {
            this.fornecedor = fornecedores[0];
            this.statusForm = 2;
            this.pop('success', 'Encontrado apenas 1 registro', '');
        } else {
            this.rows = [];
            for (let i = 0; i < fornecedores.length; i++) {
                this.rows.push(
                    {
                        id: fornecedores[i].id,
                        nome: fornecedores[i].nome,
                        status: fornecedores[i].status === true ? 'Ativo' : 'Desativado',
                    },
                );
            }
        }
        this.cdr.detectChanges();
    }

    onLeftArray(): void {
        if (this.statusForm === 2) {
            for (let i = 0; i < this.pageFornecedor.content.length; i++) {
                if (this.fornecedor.id === this.pageFornecedor.content[i].id) {
                    if ((i - 1) >= 0) {
                        this.selected = [];
                        this.fornecedor = this.pageFornecedor.content[i - 1];
                        i = this.pageFornecedor.content.length + 1;
                        this.selected.push(this.fornecedor);
                    }
                }
            }
        }
    }

    onRightArray(): void {
        if (this.statusForm === 2) {
            for (let i = 0; i < this.pageFornecedor.content.length; i++) {
                if (this.fornecedor.id === this.pageFornecedor.content[i].id) {
                    if ((i + 1) < this.pageFornecedor.content.length) {
                        // console.log('entrou');
                        this.selected = [];
                        this.fornecedor = this.pageFornecedor.content[i + 1];
                        i = this.pageFornecedor.content.length + 1;
                        this.selected.push(this.fornecedor);
                    }
                }
            }
        }
    }

    voltar(): void {
        if (this.fornecedor.id > 0) {
            this.statusForm = 2;
        } else {
            this.statusForm = 1;
        }
        this.cdr.detectChanges();
    }

    onTable(): void {
        // console.log('teste');
        if (this.pageFornecedor.content != null && this.pageFornecedor.content.length > 0) {
            this.statusForm = 3;
        } else {
            this.pop('error', 'Erro', 'Procure primeiro.');
        }
        this.cdr.markForCheck();
    }

    limpa(): void {
        this.iniciaObjs();
        this.buscaUtils();
        this.statusForm = 1;
        this.errorForm = {};
        this.selected = [];
        this.cdr.markForCheck();
    }

    iniciaObjs(): void {
        this.fornecedor = new FornecedorDTO();

        this.fornecedorPesquisa = new FornecedorPesquisaDTO();

        this.municipios = [];
        this.estados = [];

        this.fornecedor.fornecedorEnderecoDTO.municipioDTO = new MunicipioDTO();
        this.fornecedor.fornecedorEnderecoDTO.municipioDTO.id = -1;
        this.fornecedor.fornecedorEnderecoDTO.municipioDTO.estadoDTO = null;
        this.cdr.detectChanges();
    }

    buscaUtils(): void {
        this.buscaEstados();
    }

    buscaEstados(): void {
        this._pagesService.buscaEstados()
            .subscribe({
                next: (data) => {
                    this.estados = data;
                    // console.log(this.estados);
                    this.cdr.markForCheck();
                },
                error: () => {
                    this.pop('error', 'Erro', 'Erro ao buscar estados, contate o administrador.');
                }
            });
    }

    buscaMunicipiosPorEstado(estado: EstadoDTO): void {
        if (estado != null) {
            this.flgBuscandoMunicipio = 1;
            this._pagesService.buscaMunicipioPorEstado(estado.uf)
                .subscribe({
                    next: (data) => {
                        this.flgBuscandoMunicipio = 0;
                        this.municipios = data;
                        // console.log(this.municipios);
                        this.cdr.markForCheck();
                    },
                    error: () => {
                        this.flgBuscandoMunicipio = 0;
                        this.pop('error', 'Erro', 'Erro ao buscar municipios, contate o administrador.');
                        this.cdr.markForCheck();
                    }
                });
        }
    }

    compareEstado(c1: EstadoDTO, c2: EstadoDTO): boolean {
        return c1 && c2 ? c1.id === c2.id : c1 === c2;
    }

    compareMunicipio(c1: MunicipioDTO, c2: MunicipioDTO): boolean {
        return c1 && c2 ? c1.id === c2.id : c1 === c2;
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
