import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, tap, switchMap } from 'rxjs/operators';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AppMovimentoModalConfirmComponent } from '../modals/app-mov-modal-confirm/app-mov-modal-confirm.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { ngxCsv } from 'ngx-csv';
import { ColumnMode, SelectionType } from '@swimlane/ngx-datatable';
import { ToastrService } from 'ngx-toastr';
import { EstoqueItemSaldo, MovimentoItemAuditoriaDTO, MovimentoTipoDTO, ProcuraMovimentoItemAuditoria } from '@modules/shared/models/movimento';
import { EstoqueAlmoxarifadoDTO, ItemDTO, ItemUnidadeDTO } from '@modules/shared/models/item';
import { EstoqueAlmoxarifadoService, ItemService, MovimentoItemAuditoriaService, MovimentoTipoService } from '@modules/shared/services';

@Component({
    selector: 'app-movimento-auditoria',
    templateUrl: './movimento-auditoria.component.html',
    styleUrls: ['./movimento-auditoria.component.scss'],
})
export class MovimentoItemAuditoriaComponent implements OnInit {

    ColumnMode = ColumnMode;
    procuraAuditoria!: ProcuraMovimentoItemAuditoria;
    movimentoItemAuditoriaDTOs!: MovimentoItemAuditoriaDTO[];
    almoxarifados!: EstoqueAlmoxarifadoDTO[];
    selectionTypeSingle = SelectionType.single;
    /* Searching variables */
    searchingItem: boolean;
    searchFailedItem: boolean;
    movItens: MovimentoTipoDTO[] = [];

    constructor(
        private toastr: ToastrService,
        private cdr: ChangeDetectorRef,
        private _modalService: NgbModal,
        private _estoqueAlmoxarifadoService: EstoqueAlmoxarifadoService,
        private _itemService: ItemService,
        private _movimentoItemAuditoriaService: MovimentoItemAuditoriaService,
        private spinner: NgxSpinnerService,
        private _movTipo: MovimentoTipoService,
    ) {
        this.searchingItem = false;
        this.searchFailedItem = false;
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

    /* formatter */
    formatterItem = (x: { nome: string }) => x.nome;

    /* Serach Observable */
    searchItem = (text$: Observable<string>) =>
        text$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            tap(() => this.searchingItem = true),
            switchMap(term =>
                this._itemService.findByName(term)
                    .pipe(
                        tap(() => this.searchFailedItem = false),
                        catchError(() => {
                            this.searchFailedItem = true;
                            return of([]);
                        })),
            ), tap(() => this.searchingItem = false))

    ngOnInit() {
        this.buscaAlmoxarifados();
        this.getAllMovItens();
        this.iniciaObjs();
    }

    onLimpa(): void {
        this.iniciaObjs();
    }
    onPesquisa(): void {
        if (this.procuraAuditoria.dtaInicial == null
            || this.procuraAuditoria.dtaFinal == null) {
            const activeModal = this._modalService.open(AppMovimentoModalConfirmComponent);
            activeModal.componentInstance.modalHeader = 'Atenção';
            activeModal.componentInstance.modalContent = 'Selecione uma data para inicio e uma data para fim';
            activeModal.componentInstance.modalType = 'error';
            activeModal.componentInstance.defaultLabel = 'Ok';
            activeModal.result.then((result) => { console.log(result) }, (error) => { console.log(error) });
        } else if (this.procuraAuditoria.estoqueAlmoxarifadoId == null) {
            const activeModal = this._modalService.open(AppMovimentoModalConfirmComponent);
            activeModal.componentInstance.modalHeader = 'Atenção';
            activeModal.componentInstance.modalContent = 'Selecione um almoxarifado antes da pesquisa';
            activeModal.componentInstance.modalType = 'error';
            activeModal.componentInstance.defaultLabel = 'Ok';
            activeModal.result.then((result) => { console.log(result) }, (error) => { console.log(error) });
        } else if (this.procuraAuditoria.itemDTO == null
            || this.procuraAuditoria.itemDTO.id == null) {
            const activeModal = this._modalService.open(AppMovimentoModalConfirmComponent);
            activeModal.componentInstance.modalHeader = 'Atenção';
            activeModal.componentInstance.modalContent = 'Selecione um item antes da pesquisa';
            activeModal.componentInstance.modalType = 'error';
            activeModal.componentInstance.defaultLabel = 'Ok';
            activeModal.result.then((result) => { console.log(result) }, (error) => { console.log(error) });
        } else {
            this.buscaPosicaoItem(this.procuraAuditoria.estoqueAlmoxarifadoId, this.procuraAuditoria.itemDTO.id
                , this.procuraAuditoria.dtaInicial.toString(), this.procuraAuditoria.dtaFinal.toString(), this.procuraAuditoria.movimentoTipoId!);
        }
    }
    iniciaObjs(): void {
        this.procuraAuditoria = new ProcuraMovimentoItemAuditoria();
        this.procuraAuditoria.itemDTO = new ItemDTO();
        this.procuraAuditoria.estoqueAlmoxarifadoId = null;
        this.procuraAuditoria.movimentoTipoId = null;
        this.procuraAuditoria.dtaInicial = this.convertDate(new Date());
        this.procuraAuditoria.dtaFinal = this.convertDate(new Date());
        this.movimentoItemAuditoriaDTOs = [];
        this.cdr.markForCheck();
    }
    buscaPosicaoItem(idEstoqueAlmoxarifado: number, idItem: number, dtaInicial: string, dtaFinal: string, movTipoId: number): void {
        this.spinner.show();
        this._movimentoItemAuditoriaService.getAuditoriaItem(idEstoqueAlmoxarifado, idItem, dtaInicial, dtaFinal, movTipoId)
            .subscribe({
                next: (resp) => {
                    console.log(resp);
                    this.spinner.hide();
                    if (resp.length > 0) {
                        resp = resp.sort((obj1, obj2) => (obj1.movimentoId < obj2.movimentoId) ? 1 :
                            (obj1.movimentoId === obj2.movimentoId) ? ((obj1.id < obj2.id) ? 1 : -1) : -1);
                        this.movimentoItemAuditoriaDTOs = JSON.parse(JSON.stringify(resp));

                        this.movimentoItemAuditoriaDTOs.forEach(mi => {
                            if (mi.tipoOriginal === 'E' && mi.indGeraEstoque === true && mi.indAtivo === true) {
                                mi.qtdEstoqueValidoAtual = mi.qtdAnteriorEstoqueAtivo + mi.qtdConvertido;
                            } else if (mi.tipoOriginal === 'S' && mi.indGeraEstoque === true && mi.indAtivo === true) {
                                mi.qtdEstoqueValidoAtual = mi.qtdAnteriorEstoqueAtivo - mi.qtdConvertido;
                            } else {
                                mi.qtdEstoqueValidoAtual = mi.qtdAnteriorEstoqueAtivo;
                            }
                        });

                        this.movimentoItemAuditoriaDTOs = [...this.movimentoItemAuditoriaDTOs];
                        this.pop('success', 'Encontrado Busca', '');
                    } else {
                        const activeModal = this._modalService.open(AppMovimentoModalConfirmComponent);
                        activeModal.componentInstance.modalHeader = 'Atenção';
                        activeModal.componentInstance.modalContent = 'Não foi encontrado nada com essa pesquisa';
                        activeModal.componentInstance.modalType = 'error';
                        activeModal.componentInstance.defaultLabel = 'Ok';
                        activeModal.result.then((result) => { console.log(result) }, (error) => { console.log(error) });
                    }
                    this.cdr.detectChanges();
                },
                error: (err) => {
                    console.log(err);
                    this.spinner.hide();
                }
            });
    }
    compareUnidade(c1: ItemUnidadeDTO, c2: ItemUnidadeDTO): boolean {
        return c1 && c2 ? c1.id === c2.id : c1 === c2;
    }
    atualizaAlmoxarifados(): void {
        this.buscaAlmoxarifados();
    }
    getAllMovItens(): void {
        this._movTipo.getAll()
        .subscribe({
            next: (data) => {
                this.movItens = data;
                this.cdr.markForCheck();
            },
            error: (err) => {
                console.log(err);
            }
        });
    }
    buscaAlmoxarifados(): void {
        this._estoqueAlmoxarifadoService.getAllActive()
            .subscribe({
                next: (resp: any) => {
                    this.almoxarifados = resp;
                    this.cdr.detectChanges();
                },
                error: (err) => {
                    console.log(err);
                    this.pop('error', 'Erro', 'Erro ao buscar os almoxarifados');
                }
            });
    }
    compareAlmoxarifado(c1: EstoqueAlmoxarifadoDTO, c2: EstoqueAlmoxarifadoDTO): boolean {
        return c1 && c2 ? c1.id === c2.id : c1 === c2;
    }
    compareMovTipo(c1: MovimentoTipoDTO, c2: MovimentoTipoDTO): boolean {
        return c1 && c2 ? c1.id === c2.id : c1 === c2;
    }
    getQtdItem(itemUnidadeDTO: ItemUnidadeDTO, itemQtdAlmoxarifadoDTO: EstoqueItemSaldo): number {
        if (itemQtdAlmoxarifadoDTO == null) {
            return 0;
        } else if (itemUnidadeDTO == null) {
            return itemQtdAlmoxarifadoDTO.qtdSaldo;
        } else {
            return (itemQtdAlmoxarifadoDTO.qtdSaldo / itemUnidadeDTO.fator);
        }
    }
    selectedItemId(idItem: number): void {
        this._itemService.findById(idItem)
            .subscribe({
                next: (resp: any) => {
                    this.procuraAuditoria.itemDTO = resp;
                    this.cdr.detectChanges();
                },
                error: (err) => {
                    console.log(err);
                    this.pop('error', 'ERRO', 'Erro ao buscar o item, revise o codigo digitado');
                }
            });
    }
    selectedItem(event: any) {
        // console.log(event);
        this._itemService.findById(event.item.id)
            .subscribe({
                next: (resp: any) => {
                    this.procuraAuditoria.itemDTO = resp;
                    this.selectedItemId(this.procuraAuditoria.itemDTO.id);
                    this.cdr.detectChanges();
                },
                error: (err) => {
                    console.log(err);
                    this.pop('error', 'ERRO', 'Erro ao buscar o Item.');
                }
            });
    }
    onDownloadCSV(): void {
        const nameReport = 'auditoriaItemSales';
        const options = {
            fieldSeparator: ';',
            quoteStrings: '"',
            decimalseparator: ',',
            showLabels: true,
            showTitle: false,
            useBom: true,
            noDownload: false,
            headers: [
                'id',
                'qtd',
                'qtdConvertido',
                'tipoOriginal',
                'fatorOriginal',
                'valor',
                'valorUnitario',
                'dtaValidade',
                'indGeraPreco',
                'indGeraEstoque',
                'indGeraValidade',
                'indBaixaEndereco',
                'itemUnidadeId',
                'itemId',
                'itemNome',
                'movimentoId',
                'dtaInclusao',
                'usuarioInclusao',
                'numNotaFiscal',
                'movimentoTipoId',
                'movimentoTipoNome',
                'movimentoOrigemId',
                'movimentoOrigemNome',
                'estoqueAlmoxarifadoId',
                'estoqueAlmoxarifadoNome',
                'veiculoId',
                'veiculoNome',
                'motoristaFuncionarioId',
                'motoristaFuncionarioNome',
                'conferenteFuncionarioId',
                'conferenteFuncionarioNome',
                'fornecedorId',
                'fornecedorNome',
                'clienteId',
                'clienteNome'
            ],
        };
        const csv = new ngxCsv(this.movimentoItemAuditoriaDTOs, nameReport, options);
    }
    convertDate(inputFormat: any) {
        function pad(s: number) {
            return (s < 10) ? '0' + s : s;
        }
        const d = new Date(inputFormat);
        return [d.getFullYear(), pad(d.getMonth() + 1), pad(d.getDate())].join('-');
    }
}
