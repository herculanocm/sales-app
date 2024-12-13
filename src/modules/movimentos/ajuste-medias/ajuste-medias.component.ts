import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { EstoqueAlmoxarifadoService } from '../../estoques/estoque-almoxarifado/estoque-almoxarifado.service';
import { EstoqueAlmoxarifadoDTO } from '../../estoques/estoque-almoxarifado/estoque-almoxarifado';
import { AppMovimentoModalConfirmComponent } from '../modals/app-mov-modal-confirm/app-mov-modal-confirm.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import moment from 'moment';
import 'moment/locale/pt-br';
import { ColumnMode, SelectionType } from '@swimlane/ngx-datatable';
import { ToastrService } from 'ngx-toastr';
import { CurrentUserSalesAppAux } from '@app/app.utils';
import { AjusteMediasAux } from '@modules/shared/models/movimento';
import { AjusteMediasService } from '@modules/shared/services';

@Component({
    selector: 'app-movimento-ajuste-medias',
    templateUrl: './ajuste-medias.component.html',
    styleUrls: ['./ajuste-medias.component.scss'],
})
export class AjusteMediasComponent implements OnInit {
    ColumnMode = ColumnMode;
    anoMes!: number;
    alxEntrada: number;
    alxSaida: number;
    medias: AjusteMediasAux[] = [];
    almoxarifados!: EstoqueAlmoxarifadoDTO[];
    currentUserSalesApp!: CurrentUserSalesAppAux;
    selectionTypeSingle = SelectionType.single;

    constructor(
        private toastr: ToastrService,
        private cdr: ChangeDetectorRef,
        private spinner: NgxSpinnerService,
        private _estoqueAlmoxarifadoService: EstoqueAlmoxarifadoService,
        private _ajusteMediasService: AjusteMediasService,
        private _modalService: NgbModal,
    ) {
        this.alxEntrada = 3;
        this.alxSaida = 3;
        this.medias = [];
    }
    ngOnInit() {
        this.currentUserSalesApp = JSON.parse(sessionStorage.getItem('currentUserSalesApp')!);
        this.buscaAlmoxarifados();
        this.anoMes = Number(moment().format('YYYYMM'));
    }
    onLimpa(): void {
        this.limpa();
        this.buscaAlmoxarifados();
        this.alxEntrada = 3;
        this.alxSaida = 3;
        this.medias = [];
    }
    limpa() {
        this.medias = [];
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
    
    buscaAlmoxarifados(): void {
        this._estoqueAlmoxarifadoService.getAllActive()
            .subscribe((data) => {

                const dtaf = data.sort((obj1, obj2) => {
                    if (obj1.nome > obj2.nome) {
                        return 1;
                    }
                    if (obj1.nome < obj2.nome) {
                        return -1;
                    }
                    return 0;
                });

                this.almoxarifados = dtaf;
                this.cdr.detectChanges();
            }, (err) => {
                this.pop('error', 'Erro', 'Erro ao buscar os almoxarifados');
                this.cdr.detectChanges();
            });
    }
    /*
    compareAlmoxarifado(c1: EstoqueAlmoxarifadoDTO, c2: EstoqueAlmoxarifadoDTO): boolean {
        return c1 && c2 ? c1.id === c2.id : c1 === c2;
    }
    */
    compareAlmoxarifado(c1: number, c2: number): boolean {
        return c1 === c2;
    }
    diff(mm: AjusteMediasAux): number {
        if (
            this.getVlrSaidaMedia(mm) === 0 ||
            this.getVlrEntradaMedia(mm) === 0
        ) {
            return 0;
        } else {
            return (this.getVlrSaidaMedia(mm) - this.getVlrEntradaMedia(mm));
        }
    }
    getVlrEntradaMedia(mm: AjusteMediasAux): number {
        if (mm.vlr_sub_entrada != null && mm.vlr_sub_entrada > 0) {
            return mm.vlr_sub_entrada;
        } else if (mm.vlr_medio_unitario_entrada != null && mm.vlr_medio_unitario_entrada > 0) {
            return mm.vlr_medio_unitario_entrada;
        } else {
            return 0;
        }
    }
    getVlrSaidaMedia(mm: AjusteMediasAux): number {
        if (mm.vlr_medio_unitario_saida != null && mm.vlr_medio_unitario_saida > 0) {
            return mm.vlr_medio_unitario_saida;
        } else {
            return 0;
        }
    }
    getLcBruto(mm: AjusteMediasAux): number {
        return (this.diff(mm) * mm.qtd_total_saida);
    }
    getValorBrutoTotal(): number {
        let vlr = 0;
        this.medias.forEach((mm) => {
            vlr += this.getLcBruto(mm);
        });
        return vlr;
    }
    getValorEntradaTotal(): number {
        let vlr = 0;
        this.medias.forEach((mm) => {
            if (
                (mm.vlr_total_entrada != null && mm.vlr_total_entrada > 0)
            ) {
                vlr += mm.vlr_total_entrada;
            }
        });
        return vlr;
    }
    getValorSaidaTotal(): number {
        let vlr = 0;
        this.medias.forEach((mm) => {
            if (
                (mm.vlr_total_saida != null && mm.vlr_total_saida > 0)
            ) {
                vlr += mm.vlr_total_saida;
            }
        });
        return vlr;
    }
    atualizaValor(mm: AjusteMediasAux): void {
        if (mm.vlr_sub_entrada != null && mm.vlr_sub_entrada >= 0) {
            this._ajusteMediasService.atualizaVlrSub(mm.vlr_sub_entrada, mm.nro_anomes, mm.item_id, this.currentUserSalesApp.username)
                .subscribe((data) => {
                    // console.log(data);
                    this.pop('success', 'OK', '' + data[0].proc_insere_sub_item_media_mensal);
                    this.cdr.detectChanges();
                }, (error) => {
                    console.log(error);
                    this.pop('error', 'Erro', 'Erro ao atualizar o valor do item');
                    this.cdr.detectChanges();
                });
        } else {
            mm.vlr_sub_entrada = 0;
        }
    }
    onPesquisa(): void {

        if (this.anoMes != null && typeof this.anoMes !== 'undefined' && this.anoMes > 0 &&
            this.alxEntrada != null && typeof this.alxEntrada !== 'undefined' && this.alxEntrada > 0 &&
            this.alxSaida != null && typeof this.alxSaida !== 'undefined' && this.alxSaida > 0 &&
            this.anoMes >= 202001 && this.anoMes <= 202812
        ) {
            this.spinner.show();
            this._ajusteMediasService.getMediasItens(this.anoMes, this.alxEntrada, this.alxSaida)
                .subscribe((data) => {
                    this.spinner.hide();
                    this.medias = data;
                    // console.log(data);
                    this.cdr.detectChanges();
                }, (error) => {
                    this.spinner.hide();
                    this.pop('error', 'Erro', 'Erro ao buscar os valores');
                    this.cdr.detectChanges();
                });
        } else {
            const activeModal = this._modalService.open(AppMovimentoModalConfirmComponent);
            activeModal.componentInstance.modalHeader = 'Atenção';
            activeModal.componentInstance.modalContent = `
             Todos os campos precisão ser preenchidos, Ano/Mês no formato de YYYYMM ex: 202005
            e os almoxarifados tanto de entrada como de saída
            `;
            activeModal.componentInstance.modalType = 'confirm';
            activeModal.componentInstance.defaultLabel = 'Não';
            activeModal.result.then((result) => { console.log(result) }, (error) => { console.log(error) });
        }
    }
}
