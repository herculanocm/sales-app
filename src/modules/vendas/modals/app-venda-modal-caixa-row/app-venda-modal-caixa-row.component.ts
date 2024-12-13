import { Component, Input, OnInit } from '@angular/core';
import { CaixaMovDTO } from '@modules/shared/models/caixa';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ColumnMode, SelectionType } from '@swimlane/ngx-datatable';

@Component({
    selector: 'app-venda-modal-caixa-row',
    templateUrl: './app-venda-modal-caixa-row.component.html',
    styleUrls: ['./app-venda-modal-caixa-row.component.scss'],
})
export class AppVendaModalCaixaRowComponent implements OnInit {
    ColumnMode = ColumnMode;
    @Input() caixaMov!: CaixaMovDTO;
    condicoesRomaneio = [];
    selectedRowMov: any[] = [];
    selectionTypeSingle = SelectionType.single;
    
    constructor(public activeModal: NgbActiveModal) {
        this.condicoesRomaneio = [];
    }

    ngOnInit(): void {
        if (this.isRomaneio()) {
            this.condicoesRomaneio = this.getCondicoesRomaneios();
        }
    }

    isRomaneioOuVendas(): boolean {
        if (this.caixaMov.referencia != null &&
            this.caixaMov.referencia.tipo != null &&
            (this.caixaMov.referencia.tipo == 'vendas' || this.caixaMov.referencia.tipo == 'romaneios')
            ) {
                return true;
            } else {
                return false;
            }
    }

    isRomaneio(): boolean {
        if (this.isRomaneioOuVendas() && this.caixaMov.referencia!.tipo == 'romaneios') {
            return true;
        } else {
            return false;
        }
    }

    isVendas(): boolean {
        if (this.isRomaneioOuVendas() && this.caixaMov.referencia!.tipo == 'vendas') {
            return true;
        } else {
            return false;
        }
    }

    getCondicoesRomaneios(): any {
        const arrayRet: any[] = [];

        this.caixaMov.referencia!.formato.forEach((fr: any) => {
            const obj = {
                id: fr.id,
                vlrDinheiro: 0,
                vlrBoleto: 0,
                vlrCheque: 0,
                vlrCartao: 0,
                vlrPix: 0,
                vlrNota: 0,
                vlrBonificacao: 0,
                vlrTroca: 0,
                vlrOutros: 0
            };

            fr.condicoes.condicoes.forEach((cd: any) => {
                if (cd.nome.toUpperCase().trim() == 'DINHEIRO') {
                    obj.vlrDinheiro += cd.vlr;
                } else if (cd.nome.toUpperCase().trim() == 'BOLETO') {
                    obj.vlrBoleto += cd.vlr;
                } else if (cd.nome.toUpperCase().trim() == 'CHEQUE') {
                    obj.vlrCheque += cd.vlr;
                } else if (cd.nome.toUpperCase().trim() == 'CARTÃO') {
                    obj.vlrCartao += cd.vlr;
                } else if (cd.nome.toUpperCase().trim() == 'PIX') {
                    obj.vlrPix += cd.vlr;
                } else if (cd.nome.toUpperCase().trim() == 'NOTA') {
                    obj.vlrNota += cd.vlr;
                } else if (cd.nome.toUpperCase().trim() == 'BONIFICAÇÃO') {
                    obj.vlrBonificacao += cd.vlr;
                } else if (cd.nome.toUpperCase().trim() == 'TROCA') {
                    obj.vlrTroca += cd.vlr;
                } else {
                    obj.vlrOutros += cd.vlr;
                }
            });
            arrayRet.push(obj);
        });

        return arrayRet;
    }
    isArray(value: any): boolean {
        return Array.isArray(value);
    }
    isUndefined(value: any): boolean {
        return typeof(value) === 'undefined';
    }
}
