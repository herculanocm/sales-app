import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, tap, switchMap } from 'rxjs/operators';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AppMovimentoModalConfirmComponent } from '../modals/app-mov-modal-confirm/app-mov-modal-confirm.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { ColumnMode, SelectionType } from '@swimlane/ngx-datatable';
import { ToastrService } from 'ngx-toastr';
import { EstoqueItemSaldo, FiltroTabela, MovimentoItemAuditoriaDTO, ProcuraMovimentoItemAuditoria, ResumoPrecoItem } from '@modules/shared/models/movimento';
import { EstoqueAlmoxarifadoDTO, ItemDTO, ItemUnidadeDTO } from '@modules/shared/models/item';
import { EstoqueAlmoxarifadoService, ItemService, MovimentoItemAuditoriaService } from '@modules/shared/services';

@Component({
    selector: 'app-movimento-preco-item',
    templateUrl: './movimento-preco-item.component.html',
    styleUrls: ['./movimento-preco-item.component.scss'],
})
export class MovimentoPrecoItemComponent implements OnInit {
    ColumnMode = ColumnMode;
    procuraPrecoItem!: ProcuraMovimentoItemAuditoria;
    movimentoItemAuditoriaDTOs!: MovimentoItemAuditoriaDTO[];
    almoxarifados!: EstoqueAlmoxarifadoDTO[];
    precoMedioEntrada!: number;
    precoMedioSaida!: number;
    filtroTabela!: FiltroTabela;
    resumoPrecoItens!: ResumoPrecoItem[];
    selectionTypeSingle = SelectionType.single;

    /* Searching variables */
    searchingItem: boolean;
    searchFailedItem: boolean;
    constructor(
        private toastr: ToastrService,
        private cdr: ChangeDetectorRef,
        private _modalService: NgbModal,
        private _estoqueAlmoxarifadoService: EstoqueAlmoxarifadoService,
        private _itemService: ItemService,
        private _movimentoItemAuditoriaService: MovimentoItemAuditoriaService,
        private spinner: NgxSpinnerService,
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
        this.iniciaObjs();
    }

    onLimpa(): void {
        this.iniciaObjs();
        this.cdr.detectChanges();
    }
    onPesquisa(): void {
        if (this.procuraPrecoItem.dtaInicial == null
            || this.procuraPrecoItem.dtaFinal == null) {
            const activeModal = this._modalService.open(AppMovimentoModalConfirmComponent);
            activeModal.componentInstance.modalHeader = 'Atenção';
            activeModal.componentInstance.modalContent = 'Selecione uma data para inicio e uma data para fim';
            activeModal.componentInstance.modalType = 'error';
            activeModal.componentInstance.defaultLabel = 'Ok';
            activeModal.result.then((result) => { console.log(result) }, (error) => { console.log(error) });
        } else if (this.procuraPrecoItem.estoqueAlmoxarifadoId == null) {
            const activeModal = this._modalService.open(AppMovimentoModalConfirmComponent);
            activeModal.componentInstance.modalHeader = 'Atenção';
            activeModal.componentInstance.modalContent = 'Selecione um almoxarifado antes da pesquisa';
            activeModal.componentInstance.modalType = 'error';
            activeModal.componentInstance.defaultLabel = 'Ok';
            activeModal.result.then((result) => { console.log(result) }, (error) => { console.log(error) });
        } else if (this.procuraPrecoItem.itemDTO == null
            || this.procuraPrecoItem.itemDTO.id == null) {
            const activeModal = this._modalService.open(AppMovimentoModalConfirmComponent);
            activeModal.componentInstance.modalHeader = 'Atenção';
            activeModal.componentInstance.modalContent = `Você está tentando procurar sem selecionar um item,
                    essa opção irá pesquisar todos, deseja continuar?`;
            activeModal.componentInstance.modalType = 'confirm';
            activeModal.componentInstance.defaultLabel = 'Não';
            activeModal.result.then((result) => {
                if (result === 'confirm') {
                    this.buscaPosicaoItem(this.procuraPrecoItem.estoqueAlmoxarifadoId!, null
                        , this.procuraPrecoItem.dtaInicial.toString(), this.procuraPrecoItem.dtaFinal.toString());
                }
            });
        } else {
            this.buscaPosicaoItem(this.procuraPrecoItem.estoqueAlmoxarifadoId, this.procuraPrecoItem.itemDTO.id
                , this.procuraPrecoItem.dtaInicial.toString(), this.procuraPrecoItem.dtaFinal.toString());
        }
    }
    iniciaObjs(): void {
        this.procuraPrecoItem = new ProcuraMovimentoItemAuditoria();
        this.procuraPrecoItem.itemDTO = new ItemDTO();
        this.procuraPrecoItem.estoqueAlmoxarifadoId = null;
        this.procuraPrecoItem.dtaInicial = this.convertDate(new Date());
        this.procuraPrecoItem.dtaFinal = this.convertDate(new Date());
        this.movimentoItemAuditoriaDTOs = [];
        this.precoMedioEntrada = 0;
        this.precoMedioSaida = 0;
        this.resumoPrecoItens = [];
        this.filtroTabela = new FiltroTabela();
    }
    buscaPosicaoItem(idEstoqueAlmoxarifado: number, idItem: number | null, dtaInicial: string, dtaFinal: string): void {
        this.spinner.show();
        this._movimentoItemAuditoriaService.getAuditoriaItem(idEstoqueAlmoxarifado, idItem!, dtaInicial, dtaFinal, -1)
            .subscribe((resp) => {
                this.spinner.hide();
                if (resp.length > 0) {
                    // console.log(resp);
                    resp = resp.sort((obj1, obj2) => (obj1.movimentoId < obj2.movimentoId) ? 1 :
                        (obj1.movimentoId === obj2.movimentoId) ? ((obj1.id < obj2.id) ? 1 : -1) : -1);
                    this.setaMovimentoItemAuditoriaDTOs(JSON.parse(JSON.stringify(resp)));
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
            }, (err) => {
                this.spinner.hide();
            });
    }
    setaMovimentoItemAuditoriaDTOs(movimentoItemAuditoriaDTOs: MovimentoItemAuditoriaDTO[]): void {
        this.resumoPrecoItens = [];

        for (let i = 0; i < movimentoItemAuditoriaDTOs.length; i++) {
            let existe = false;
            for (let j = 0; j < this.resumoPrecoItens.length; j++) {
                if (this.resumoPrecoItens[j].id === movimentoItemAuditoriaDTOs[i].itemId) {
                    existe = true;
                    j = this.resumoPrecoItens.length + 1;
                }
            }
            if (existe === false) {
                const r = new ResumoPrecoItem();
                r.id = movimentoItemAuditoriaDTOs[i].itemId;
                r.nome = movimentoItemAuditoriaDTOs[i].itemNome;
                r.qtdEntrada = 0;
                r.qtdSaida = 0;
                r.vlrEntrada = 0;
                r.vlrSaida = 0;
                r.vlrMediaEntrada = 0;
                r.vlrMediaSaida = 0;
                this.resumoPrecoItens.push(r);
            }
        }

        for (let i = 0; i < movimentoItemAuditoriaDTOs.length; i++) {
            for (let j = 0; j < this.resumoPrecoItens.length; j++) {
                if (this.resumoPrecoItens[j].id === movimentoItemAuditoriaDTOs[i].itemId) {

                    if (movimentoItemAuditoriaDTOs[i].tipoOriginal === 'E' && movimentoItemAuditoriaDTOs[i].indGeraPreco === true) {
                        this.resumoPrecoItens[j].qtdEntrada += movimentoItemAuditoriaDTOs[i].qtdConvertido;
                        this.resumoPrecoItens[j].vlrEntrada +=
                        (movimentoItemAuditoriaDTOs[i].qtdConvertido * movimentoItemAuditoriaDTOs[i].valorUnitario);
                        this.resumoPrecoItens[j].vlrMediaEntrada =
                        (this.resumoPrecoItens[j].vlrEntrada / this.resumoPrecoItens[j].qtdEntrada);
                    }

                    if (movimentoItemAuditoriaDTOs[i].tipoOriginal === 'S' && movimentoItemAuditoriaDTOs[i].indGeraPreco === true) {
                        this.resumoPrecoItens[j].qtdSaida += movimentoItemAuditoriaDTOs[i].qtdConvertido;
                        this.resumoPrecoItens[j].vlrSaida +=
                        (movimentoItemAuditoriaDTOs[i].qtdConvertido * movimentoItemAuditoriaDTOs[i].valorUnitario);
                        this.resumoPrecoItens[j].vlrMediaSaida =
                        (this.resumoPrecoItens[j].vlrSaida / this.resumoPrecoItens[j].qtdSaida);
                    }

                }
            }
        }
        // console.log(this.resumoPrecoItens);
        this.resumoPrecoItens = this.resumoPrecoItens.sort((r1, r2) => {
            if (r1.nome > r2.nome) {
                return 1;
            }
            if (r1.nome < r2.nome) {
                return -1;
            }
            return 0;
        });
        this.movimentoItemAuditoriaDTOs = movimentoItemAuditoriaDTOs;
    }
    alteraValor(movimentoItemAuditoriaDTO: MovimentoItemAuditoriaDTO): void {
        // console.log(movimentoItemAuditoriaDTO);
        if (movimentoItemAuditoriaDTO.movimentoOrigemNome === 'MOVIMENTO COMPLETO'
            || movimentoItemAuditoriaDTO.movimentoOrigemNome === 'MOVIMENTO SIMPLES') {
            if (
                movimentoItemAuditoriaDTO.indGeraPreco === true &&
                (movimentoItemAuditoriaDTO.valorUnitario == null
                    || movimentoItemAuditoriaDTO.valorUnitario === 0)) {
                const activeModal = this._modalService.open(AppMovimentoModalConfirmComponent);
                activeModal.componentInstance.modalHeader = 'Atenção';
                activeModal.componentInstance.modalContent = `Está tentando alterar um preço de um movimento cujo valor está zerado,
            lançe um valor primeiro`;
                activeModal.componentInstance.modalType = 'error';
                activeModal.componentInstance.defaultLabel = 'Ok';
                activeModal.result.then((result) => { console.log(result) }, (error) => { console.log(error) });
            } else {
                movimentoItemAuditoriaDTO.isLoading = true;
                this._movimentoItemAuditoriaService.postAuditoriaItem(movimentoItemAuditoriaDTO)
                    .subscribe((resp) => {
                        movimentoItemAuditoriaDTO.isLoading = false;
                        this.pop('success', 'Atualizado com Sucesso', '');
                        this.setaMovimentoAuditoriaItem(resp);
                    }, err => {
                        movimentoItemAuditoriaDTO.isLoading = false;
                        this.pop('error', 'ERRO', 'Erro ao atualizar o preço do item');
                    });
            }
        } else {
            const activeModal = this._modalService.open(AppMovimentoModalConfirmComponent);
            activeModal.componentInstance.modalHeader = 'Atenção';
            activeModal.componentInstance.modalContent = `Somente movimento
        completo ou simples pode ser alterado o valor`;
            activeModal.componentInstance.modalType = 'error';
            activeModal.componentInstance.defaultLabel = 'Ok';
            activeModal.result.then((result) => { console.log(result) }, (error) => { console.log(error) });
        }
    }
    setaMovimentoAuditoriaItem(movimentoItemAuditoriaDTO: MovimentoItemAuditoriaDTO): void {
        for (let i = 0; i < this.movimentoItemAuditoriaDTOs.length; i++) {
            if (movimentoItemAuditoriaDTO.id === this.movimentoItemAuditoriaDTOs[i].id) {
                this.movimentoItemAuditoriaDTOs.splice(i, 1);
                i = this.movimentoItemAuditoriaDTOs.length + 1;
            }
        }
        this.movimentoItemAuditoriaDTOs.push(movimentoItemAuditoriaDTO);
        this.setaMovimentoItemAuditoriaDTOs(this.movimentoItemAuditoriaDTOs.sort((obj1, obj2) => (obj1.movimentoId < obj2.movimentoId) ? 1 :
            (obj1.movimentoId === obj2.movimentoId) ? ((obj1.id < obj2.id) ? 1 : -1) : -1));
    }
    compareUnidade(c1: ItemUnidadeDTO, c2: ItemUnidadeDTO): boolean {
        return c1 && c2 ? c1.id === c2.id : c1 === c2;
    }
    atualizaAlmoxarifados(): void {
        this.buscaAlmoxarifados();
    }
    getRowClass() {
        return ' row-personalizada ';
    }
    getCellClass() {
        return ' cell-personalizada ';
    }
    buscaAlmoxarifados(): void {
        this._estoqueAlmoxarifadoService.getAllActive()
            .subscribe((resp: any) => {
                this.almoxarifados = resp;
                this.cdr.detectChanges();
            }, (err) => {
                this.pop('error', 'Erro', 'Erro ao buscar os almoxarifados');
                this.cdr.detectChanges();
            });
    }
    compareAlmoxarifado(c1: EstoqueAlmoxarifadoDTO, c2: EstoqueAlmoxarifadoDTO): boolean {
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
            .subscribe((resp: any) => {
                this.procuraPrecoItem.itemDTO = resp;
                this.cdr.detectChanges();
            }, err => {
                this.pop('error', 'ERRO', 'Erro ao buscar o item, revise o codigo digitado');
                this.cdr.detectChanges();
            });
    }
    selectedItem(event: any) {
        // console.log(event);
        this._itemService.findById(event.item.id)
            .subscribe((resp: any) => {
                this.procuraPrecoItem.itemDTO = resp;
                this.selectedItemId(this.procuraPrecoItem.itemDTO.id);
                this.cdr.detectChanges();
            }, err => {
                this.pop('error', 'ERRO', 'Erro ao buscar o Item.');
                this.cdr.detectChanges();
            });

    }
    convertDate(inputFormat: any) {
        function pad(s: number) {
            return (s < 10) ? '0' + s : s;
        }
        const d = new Date(inputFormat);
        return [d.getFullYear(), pad(d.getMonth() + 1), pad(d.getDate())].join('-');
    }
}
