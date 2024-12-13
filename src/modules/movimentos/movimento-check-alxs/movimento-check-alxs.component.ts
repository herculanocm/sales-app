import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { AppMovimentoModalConfirmComponent } from '../modals/app-mov-modal-confirm/app-mov-modal-confirm.component';
import { ngxCsv } from 'ngx-csv';
import { SelectionType } from '@swimlane/ngx-datatable';
import { ToastrService } from 'ngx-toastr';
import { CurrentUserSalesAppAux } from '@app/app.utils';
import { EstoqueAlmoxarifadoDTO, ItemUnidadeDTO } from '@modules/shared/models/item';
import { ItemAlxs, ProcuraItemAlxs } from '@modules/shared/models/movimento';
import { EstoqueAlmoxarifadoService, MovimentoCheckAlxsService } from '@modules/shared/services';

@Component({
    selector: 'app-movimento-check-alxs',
    templateUrl: './movimento-check-alxs.component.html',
    styleUrls: ['./movimento-check-alxs.component.scss'],
})
export class MovimentoCheckAlxsComponent implements OnInit {
    almoxarifados!: EstoqueAlmoxarifadoDTO[];
    procura!: ProcuraItemAlxs;
    resultado!: ItemAlxs[];
    currentUserSalesApp: CurrentUserSalesAppAux;
    selectionTypeSingle = SelectionType.single;
    
    constructor(
        private toastr: ToastrService,
        private cdr: ChangeDetectorRef,
        private _modalService: NgbModal,
        private _movCheckAlxService: MovimentoCheckAlxsService,
        private _estoqueAlmoxarifadoService: EstoqueAlmoxarifadoService,
        private spinner: NgxSpinnerService,
    ) {
        this.currentUserSalesApp = JSON.parse(sessionStorage.getItem('currentUserSalesApp')!);
    }

    ngOnInit() {
        this.buscaAlmoxarifados();
        this.iniciaObjs();
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

    onLimpa(): void {
        this.iniciaObjs();
    }
    onPesquisa(): void {
        if (this.procura == null || this.procura.idAlx1 == null || this.procura.idAlx2 == null) {
            const activeModal = this._modalService.open(AppMovimentoModalConfirmComponent);
            activeModal.componentInstance.modalHeader = 'Atenção';
            activeModal.componentInstance.modalContent = 'Atenção o almoxarifado 1 e 2 precisam estar selecionados';
            activeModal.componentInstance.modalType = 'error';
            activeModal.componentInstance.defaultLabel = 'Ok';
            activeModal.result.then(() => {
                console.log('ok');
            }, () => {
                console.log('nok');
            });
        } else {

            if (this.procura.itemNome == null || this.procura.itemNome === 'undefined'
            || this.procura.itemNome.length === 0) {
                this.procura.itemNome = null;
            }

            console.log(this.procura);

            this.spinner.show();
            this._movCheckAlxService.getCheckAlx(this.procura)
                .subscribe((data) => {
                    this.spinner.hide();
                    if (data == null || data.length === 0) {
                        this.pop('warning', 'Atenção', 'Não foi encontrado nada na pesquisa');
                    } else {
                        this.resultado = data.sort((obj1, obj2) => {
                            if (obj1.itemNome > obj2.itemNome) {
                                return 1;
                            }
                            if (obj1.itemNome < obj2.itemNome) {
                                return -1;
                            }
                            return 0;
                        });

                        for (let i = 0; i < this.resultado.length; i++) {
                            if (this.resultado[i].itemUnidadeDTOs.length === 1) {
                                this.resultado[i].itemUnidadeDTO = this.resultado[i].itemUnidadeDTOs[0];
                            } else if (this.resultado[i].itemUnidadeDTOs.length > 1) {

                                this.resultado[i].itemUnidadeDTOs = this.resultado[i].itemUnidadeDTOs.sort((obj1, obj2) => {
                                    if (obj1.fator > obj2.fator) {
                                        return 1;
                                    }
                                    if (obj1.fator < obj2.fator) {
                                        return -1;
                                    }
                                    return 0;
                                });

                                for (let j = 0; j < this.resultado[i].itemUnidadeDTOs.length; j++) {
                                    if (this.resultado[i].itemUnidadeDTOs[j].fator > 1) {
                                        this.resultado[i].itemUnidadeDTO = this.resultado[i].itemUnidadeDTOs[j];
                                        j = this.resultado[i].itemUnidadeDTOs.length + 1;
                                    }
                                }
                            }
                        }

                        this.pop('success', 'Encontrado com sucesso', '');
                    }
                    this.cdr.detectChanges();
                }, (error) => {
                    this.spinner.hide();
                    console.log(error);
                    const activeModal = this._modalService.open(AppMovimentoModalConfirmComponent);
                    activeModal.componentInstance.modalHeader = 'Atenção';
                    activeModal.componentInstance.modalContent = 'Erro ao pesquisar contate o administrador';
                    activeModal.componentInstance.modalType = 'error';
                    activeModal.componentInstance.defaultLabel = 'Ok';
                    activeModal.result.then(() => {
                        this.cdr.detectChanges();
                    }, () => {
                        this.cdr.detectChanges();
                    });
                    this.cdr.detectChanges();
                });
        }
    }
    roundNuber(value: number): number {
        return Math.round((value + Number.EPSILON) * 100) / 100;
        // return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
    }
    iniciaObjs(): void {
        this.procura = new ProcuraItemAlxs();
        this.procura.idAlx1 = null;
        this.procura.idAlx2 = null;
        this.resultado = [];
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
            }, () => {
                this.pop('error', 'Erro', 'Erro ao buscar os almoxarifados');
                this.cdr.detectChanges();
            });
    }
    compareAlmoxarifado(c1: EstoqueAlmoxarifadoDTO, c2: EstoqueAlmoxarifadoDTO): boolean {
        return c1 && c2 ? c1.id === c2.id : c1 === c2;
    }
    getQtdItem(itemUnidadeDTO: ItemUnidadeDTO, qtd: number): number {
        if (qtd == null) {
            return 0;
        } else if (itemUnidadeDTO == null) {
            return qtd;
        } else {
            return (qtd / itemUnidadeDTO.fator);
        }
    }

    isArray(value: any): boolean {
        return Array.isArray(value);
    }
    
    isUndefined(value: any): boolean {
        return typeof(value) === 'undefined';
    }
    onDownloadCSV(): void {
        const nameReport = 'check_alxs_' + this.currentUserSalesApp.username;
        const options = {
            fieldSeparator: ';',
            quoteStrings: '"',
            decimalseparator: ',',
            showLabels: true,
            showTitle: false,
            useBom: true,
            noDownload: false,
            headers: ['itemRuaNome', 'itemId', 'itemIdAux', 'itemNome', 'qtd_alx1_un', 'qtd_alx2_un',
                'dif_un', 'des_ag2', 'qtd_alx1_ag2', 'qtd_alx2_ag2', 'dif_ag2'],
        };

        let data: any[] = [];

        //console.log(this.resultado);

        this.resultado.forEach(obj => {

            const uns = obj.itemUnidadeDTOs.sort((u1, u2) => {
                if (u1.fator > u2.fator) {
                    return 1;
                }
                if (u1.fator < u2.fator) {
                    return -1;
                }
                return 0;
            });

            const nobj: any = {
                itemRuaNome: obj.itemRuaNome,
                itemId: obj.itemId,
                itemIdAux: (obj.itemIdAux !== null && !this.isUndefined(obj.itemIdAux) && obj.itemIdAux > 0 ? obj.itemIdAux : ''),
                itemNome: obj.itemNome,
                qtd_alx1_un: obj.qtd_alx1,
                qtd_alx2_un: obj.qtd_alx2,
                dif_un: obj.dif,
                des_ag2: null,
                qtd_alx1_ag2: null,
                qtd_alx2_ag2: null,
                dif_ag2: null,
            };

            if (uns != null
                && uns.length >= 2
                && uns[1].id != null
                && uns[1].id > 0) {
                nobj.des_ag2 = uns[1].nome;

                nobj.qtd_alx1_ag2 = this.roundNuber(nobj.qtd_alx1_un / uns[1].fator);
                nobj.qtd_alx2_ag2 = this.roundNuber(nobj.qtd_alx2_un / uns[1].fator);

                nobj.dif_ag2 = this.roundNuber(nobj.qtd_alx1_ag2 - nobj.qtd_alx2_ag2);
            }

            data.push(nobj);
            
        });

        data = data.sort((d1, d2) => {
            if (d1.itemRuaNome > d2.itemRuaNome) {
                return 1;
            }
            if (d1.itemRuaNome === d2.itemRuaNome) {
                if (d1.nome > d2.nome) {
                    return 1;
                } else {
                    return -1;
                }
            }
            if (d1.itemRuaNome == null) {
                return 0;
            }
            return -1;
        });

        const csv = new ngxCsv(data, nameReport, options);
    }
}
