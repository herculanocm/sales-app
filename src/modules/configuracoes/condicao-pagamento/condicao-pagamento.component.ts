import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AppConfigModalConfirmComponent } from '../modals/app-config-modal-confirm/app-config-modal-confirm.component';
import { ColumnMode, SelectionType } from '@swimlane/ngx-datatable';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CondicaoPagamentoService } from '@modules/shared/services';
import { TituloTipoDTO } from '@modules/shared/models/titulo';
import { CondicaoPagamentoDTO, CondicaoPagamentoPesquisaDTO, PageCondicaoPagamento } from '@modules/shared/models/condicao-pagamento';

@Component({
    selector: 'app-condicao-pagamento',
    templateUrl: './condicao-pagamento.component.html',
    styleUrls: ['./condicao-pagamento.component.scss'],
})
export class CondicaoPagamentoComponent implements OnInit {
    condicaoPagamento: CondicaoPagamentoDTO;
    condicaoPagamentos!: CondicaoPagamentoDTO[];
    condicaoPagamentoPesquisaDTO!: CondicaoPagamentoPesquisaDTO;
    pageCondicao!: PageCondicaoPagamento;
    tituloTipos: TituloTipoDTO[];
    errorForm: object | any = {};
    authorities!: string[];
    grupoClienteSelected: any = {};
    ColumnMode = ColumnMode;
    selectionTypeSingle = SelectionType.single;
  
    // status 1 = salvando, status 2 = editando, status 3 = pesquisando
    statusForm: number;

    public loading = false;

    rowsEndereco: any[] = [];
    selected: any[] = [];
    // datatable

    constructor(
        private _condicaoPagamentoService: CondicaoPagamentoService,
        private toastr: ToastrService,
        private cdr: ChangeDetectorRef,
        private _modalService: NgbModal,
        private spinner: NgxSpinnerService,
    ) {
        this.condicaoPagamento = new CondicaoPagamentoDTO();
        this.condicaoPagamento.status = true;
        this.condicaoPagamento.tipoPagamento = 'V';
        this.condicaoPagamento.geraTitulo = false;
        this.condicaoPagamento.geraComissaoRepresentante = true;
        this.condicaoPagamento.tituloTipoDTO = null;
        this.statusForm = 1;
        this.tituloTipos = [];
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

    iniciaObjs(): void {
        this.condicaoPagamentoPesquisaDTO = new CondicaoPagamentoPesquisaDTO();
        this.pageCondicao = new PageCondicaoPagamento();
    }

    ngOnInit(): void {
        this.buscaTituloTipos();
        this.iniciaObjs();
    }

    compareTituloTipo(c1: TituloTipoDTO, c2: TituloTipoDTO): boolean {
        return c1 && c2 ? c1.id === c2.id : c1 === c2;
    }


    buscaTituloTipos(): void {
        this._condicaoPagamentoService.findAllActiveTituloTipos()
        .subscribe({
            next: (data) => {
                this.tituloTipos = data;
                this.cdr.detectChanges();
            },
            error: () => {
                this.pop('error', 'Pesquisa', 'Não foi encontrado os tipos de titulos');
            },
        });
    }

    onPesquisa(): void {
        this.condicaoPagamentoPesquisaDTO.condicaoPagamentoDTO = this.condicaoPagamento;
        this.pesquisaItem(this.condicaoPagamentoPesquisaDTO);
    }

    pesquisaItem(condicaoPagamentoPesquisaDTO: CondicaoPagamentoPesquisaDTO): void {

        this.condicaoPagamentos = [];
        this.selected = [];
        this.spinner.show();
        this._condicaoPagamentoService.find(this.condicaoPagamentoPesquisaDTO)
            .subscribe({
                next: (data) => {
                    this.spinner.hide();
                    this.pageCondicao = data;
                    if (this.pageCondicao.content.length === 0) {
                        this.pop('error', 'Pesquisa', 'Não foi encontrado nada com essa pesquisa');
                    } else {
                        this.statusForm = 3;
                        this.pageCondicao.content = this.pageCondicao.content.sort((obj1, obj2) => {
                            if (obj1.id > obj2.id) {
                                return 1;
                            }
                            if (obj1.id < obj2.id) {
                                return -1;
                            }
                            return 0;
                        });
                    }
                    this.cdr.detectChanges();
                },
                error: () => {
                    this.spinner.hide();
                    this.pop('error', 'Pesquisa', 'Erro ao buscar condições de pagamentos');
                    this.cdr.detectChanges();
                },
            });
    }



    onDeleta(id: number): void {
        const activeModal = this._modalService.open(AppConfigModalConfirmComponent);
        activeModal.componentInstance.modalHeader = 'Confirme a exclusão';
        activeModal.componentInstance.modalContent = 'Deseja realmente excluir ?';
        activeModal.componentInstance.modalType = 'confirm';
        activeModal.componentInstance.defaultLabel = 'Não';
        activeModal.result.then((result) => {
            if (result === 'confirm') {
                let message = '';
                this._condicaoPagamentoService.del(id)
                    .subscribe({
                        next: (data) => {
                            message = data;
                            this.pop('success', 'Ação', message);
                            this.condicaoPagamentos = [];
                            this.onLimpa();
                            this.cdr.detectChanges();
                        },
                        error: () => {
                            message = 'Erro ao realizar requisição';
                            this.pop('error', 'Pesquisa', message);
                            this.cdr.detectChanges();
                        },
                    });
            }
        }, (error) => {
            console.log(error);
        });
    }

    onLimpa(): void {
        this.limpa();
        this.iniciaObjs();
    }

    limpa(): void {
        this.condicaoPagamento = new CondicaoPagamentoDTO();
        this.condicaoPagamento.status = true;
        this.condicaoPagamento.tipoPagamento = 'V';
        this.condicaoPagamento.geraTitulo = false;
        this.condicaoPagamento.geraComissaoRepresentante = true;
        this.condicaoPagamento.tituloTipoDTO = null;
        this.statusForm = 1;
        this.errorForm = {};
        this.selected = [];
    }
    onCadastra(): void {
        // console.log(this.funcionario);
        this.loading = true;
        this._condicaoPagamentoService.postOrPut(this.condicaoPagamento, this.statusForm)
            .subscribe({
                next: (data) => {
                    this.loading = false;
                    this.condicaoPagamento = data;
                    // this.showToast('success', 'Sucesso', 'Requisição realizada sucesso.');
                    this.errorForm = {};
                    this.statusForm = 2;
                    this.condicaoPagamentos = [];
                    this.cdr.detectChanges();

                },
                error: (err) => {
                    this.loading = false;
                    if (Object.prototype.hasOwnProperty.call(err, 'error') && err.error != null) {
                        this.errorForm = err.error;
                    }
                    this.pop('error', 'Pesquisa', 'Erro ao realizar requisição');
                    this.cdr.detectChanges();
                },
            });
    }
    editando(): void {
        // console.log('selecionando para editar');
        const sel = this.pageCondicao.content.filter(us => {
            return us.id === this.selected[0].id;
        });
        // console.log(sel);
        this.condicaoPagamento = sel[0];
        this.statusForm = 2;
        this.cdr.detectChanges();
    }

    voltar(): void {
        if (this.condicaoPagamento.id > 0) {
            this.statusForm = 2;
        } else {
            this.statusForm = 1;
        }
    }

    setPage(pageInfo: any) {
        this.condicaoPagamentoPesquisaDTO.pageSize = pageInfo.pageSize;
        this.condicaoPagamentoPesquisaDTO.pageNumber = pageInfo.offset;
        this.pesquisaItem(this.condicaoPagamentoPesquisaDTO);
    }

    isValidDelete(): boolean {
        return this.statusForm === 2 && this.condicaoPagamento.id != null ? false : true;
    }

    onLeftArray(): void {
        if (this.statusForm === 2) {
            for (let i = 0; i < this.condicaoPagamentos.length; i++) {
                if (this.condicaoPagamento.id === this.condicaoPagamentos[i].id) {
                    if ((i - 1) >= 0) {
                        this.condicaoPagamento = this.condicaoPagamentos[i - 1];
                        i = this.condicaoPagamentos.length + 1;
                    }
                }
            }
        }
    }

    onRightArray(): void {
        if (this.statusForm === 2) {
            for (let i = 0; i < this.condicaoPagamentos.length; i++) {
                if (this.condicaoPagamento.id === this.condicaoPagamentos[i].id) {
                    if ((i + 1) < this.condicaoPagamentos.length) {
                        // console.log('entrou');
                        this.condicaoPagamento = this.condicaoPagamentos[i + 1];
                        i = this.condicaoPagamentos.length + 1;
                    }
                }
            }
        }
    }

    onTable(): void {
        // console.log('teste');
        if (this.condicaoPagamentos != null && this.condicaoPagamentos.length > 0) {
            this.statusForm = 3;
        } else {
            this.pop('error', 'Pesquisa', 'Procure primeiro');
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
