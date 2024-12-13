import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, tap, switchMap } from 'rxjs/operators';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AppMovimentoModalConfirmComponent } from '../modals/app-mov-modal-confirm/app-mov-modal-confirm.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { ColumnMode, SelectionType } from '@swimlane/ngx-datatable';
import { ToastrService } from 'ngx-toastr';
import { EstoqueAlmoxarifadoDTO, ItemDTO, ItemUnidadeDTO } from '@modules/shared/models/item';
import { EstoqueItemSaldo, ItemAlmoxarifadoDTO, MovimentoPosicaoItemAux } from '@modules/shared/models/movimento';
import { EstoqueAlmoxarifadoService, ItemService, MovimentoPosicaoItemService } from '@modules/shared/services';

@Component({
    selector: 'app-movimento-posicao-item',
    templateUrl: './movimento-posicao-item.component.html',
    styleUrls: ['./movimento-posicao-item.component.scss'],
})
export class MovimentoPosicaoItemComponent implements OnInit {

    ColumnMode = ColumnMode;
    almoxarifados!: EstoqueAlmoxarifadoDTO[];
    movPosicaoItem!: MovimentoPosicaoItemAux;
    itemProcura!: ItemDTO;
    deviceInfo = null;
    itemAlmoxarifadoDTOs!: ItemAlmoxarifadoDTO[];
    selectionTypeSingle = SelectionType.single;

    /* Searching variables */
    searchingItem: boolean;
    searchFailedItem: boolean;

    constructor(
        private toastr: ToastrService,
        private cdr: ChangeDetectorRef,
        private _modalService: NgbModal,
        private _movimentoPosicaoItemService: MovimentoPosicaoItemService,
        private _estoqueAlmoxarifadoService: EstoqueAlmoxarifadoService,
        private _itemService: ItemService,
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
        if (this.movPosicaoItem.almoxarifados == null || this.movPosicaoItem.almoxarifados.length == 0) {
            const activeModal = this._modalService.open(AppMovimentoModalConfirmComponent);
            activeModal.componentInstance.modalHeader = 'Atenção';
            activeModal.componentInstance.modalContent = 'Atenção selecione pelo menos um almoxarifado antes da pesquisa';
            activeModal.componentInstance.modalType = 'error';
            activeModal.componentInstance.defaultLabel = 'Ok';
            activeModal.result.then((result) => { console.log(result) }, (error) => { console.log(error) });
        } else if (this.movPosicaoItem.nomeItem == null
            || this.movPosicaoItem.nomeItem.trim().length === 0) {
            const activeModal = this._modalService.open(AppMovimentoModalConfirmComponent);
            activeModal.componentInstance.modalHeader = 'Atenção';
            activeModal.componentInstance.modalContent = 'Atenção digite o nome do item antes da pesquisa';
            activeModal.componentInstance.modalType = 'error';
            activeModal.componentInstance.defaultLabel = 'Ok';
            activeModal.result.then((result) => { console.log(result) }, (error) => { console.log(error) });
        } else {
            this.buscaPosicaoItem(this.movPosicaoItem.almoxarifados, this.movPosicaoItem.nomeItem.trim());
        }
    }
    iniciaObjs(): void {
        this.movPosicaoItem = new MovimentoPosicaoItemAux();
        this.movPosicaoItem.itemDTO = new ItemDTO();
        this.movPosicaoItem.estoqueAlmoxarifadoId = null;
        this.movPosicaoItem.almoxarifados = [];
        this.itemAlmoxarifadoDTOs = [];
    }
    buscaPosicaoItem(almoxarifados: EstoqueAlmoxarifadoDTO[], nomeItem: string): void {
        this.spinner.show();
        this._movimentoPosicaoItemService.getByAlmoxarifados(almoxarifados, nomeItem)
            .subscribe((resp) => {
                this.spinner.hide();
                this.itemAlmoxarifadoDTOs = [];

                if (resp.length > 0) {
                    resp = resp.sort((obj1, obj2) => {
                        if (obj1.nome > obj2.nome) {
                            return 1;
                        }
                        if (obj1.nome < obj2.nome) {
                            return -1;
                        }
                        return 0;
                    });
                    for (let i = 0; i < resp.length; i++) {
                        if (resp[i].itemUnidadeDTOs.length === 1) {
                            resp[i].itemUnidadeDTO = resp[i].itemUnidadeDTOs[0];
                        } else if (resp[i].itemUnidadeDTOs.length > 1) {

                            resp[i].itemUnidadeDTOs = resp[i].itemUnidadeDTOs.sort((obj1, obj2) => {
                                if (obj1.fator > obj2.fator) {
                                    return 1;
                                }
                                if (obj1.fator < obj2.fator) {
                                    return -1;
                                }
                                return 0;
                            });

                            for (let j = 0; j < resp[i].itemUnidadeDTOs.length; j++) {
                                if (resp[i].itemUnidadeDTOs[j].fator > 1) {
                                    resp[i].itemUnidadeDTO = resp[i].itemUnidadeDTOs[j];
                                    j = resp[i].itemUnidadeDTOs.length + 1;
                                }
                            }
                        }
                    }
                    this.itemAlmoxarifadoDTOs = JSON.parse(JSON.stringify(resp));
                    // console.log(this.itemAlmoxarifadoDTOs);
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
                this.pop('error', 'Erro', 'Erro ao buscar os itens com esses parametros');
                this.cdr.detectChanges();
            });
    }
    compareUnidade(c1: ItemUnidadeDTO, c2: ItemUnidadeDTO): boolean {
        return c1 && c2 ? c1.id === c2.id : c1 === c2;
    }
    atualizaAlmoxarifados(): void {
        this.buscaAlmoxarifados();
    }

    buscaAlmoxarifados(): void {
        this._estoqueAlmoxarifadoService.getAllActive()
            .subscribe((resp: any) => {
                this.almoxarifados = resp;
                this.cdr.detectChanges();
            }, (err) => {
                this.pop('error', 'Erro', 'Erro ao buscar os almoxarifados');
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
    getQtdItemDisponivel(itemUnidadeDTO: ItemUnidadeDTO, itemQtdAlmoxarifadoDTO: EstoqueItemSaldo): number {
        if (itemQtdAlmoxarifadoDTO == null) {
            return 0;
        } else if (itemUnidadeDTO == null) {
            return itemQtdAlmoxarifadoDTO.qtdDisponivel;
        } else {
            return (itemQtdAlmoxarifadoDTO.qtdDisponivel / itemUnidadeDTO.fator);
        }
    }
    selectedItemId(event: any, idItem: number): void {
        this._itemService.findById(idItem)
            .subscribe((resp: any) => {
                this.movPosicaoItem.itemDTO = resp;
                this.cdr.detectChanges();
            }, err => {
                this.pop('error', 'ERRO', 'Erro ao buscar o item, revise o codigo digitado');
                this.cdr.detectChanges();
            });
    }
    selectedItem(event: any) {

        this._itemService.findById(event.item.id)
            .subscribe((resp: any) => {
                this.itemProcura = resp;
                this.selectedItemId(null, this.itemProcura.id);
                this.cdr.detectChanges();
            }, err => {
                this.pop('error', 'ERRO', 'Erro ao buscar o Item.');
                this.cdr.detectChanges();
            });

    }
}
