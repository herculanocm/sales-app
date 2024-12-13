import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormControl } from '@angular/forms';
import { ItemPAv, ItemUnidadePAv } from './app-venda-modal-item-pesqav.utils';
import { ToastrService } from 'ngx-toastr';
import { VendaService } from '@modules/shared/services';
import { FuncionarioDTO } from '@modules/shared/models/funcionario';

@Component({
    selector: 'app-venda-modal-item-pesqav',
    templateUrl: './app-venda-modal-item-pesqav.component.html',
    styleUrls: ['./app-venda-modal-item-pesqav.component.scss'],
})
export class AppVendaModalItemPesqavComponent implements OnInit {
    @Input() modalHeader!: string;
    @Input() modalContent!: string;

    pesqAvForm!: FormGroup;
    flgPesquisando: number;
    itens: ItemPAv[];

    constructor(
        public activeModal: NgbActiveModal,
        private toastr: ToastrService,
        private _vendaService: VendaService,
        private cdr: ChangeDetectorRef,
    ) {
        this.itens = [];
        this.flgPesquisando = 0;
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
    compareVendedor(v1: FuncionarioDTO, v2: FuncionarioDTO): boolean {
        return v1 && v2 ? v1.id === v2.id : v1 === v2;
    }

    ngOnInit(): void {
        this.createForm();
    }
    onLimpa(): void {
        this.pesqAvForm.reset();
        this.itens = [];
        this.cdr.detectChanges();
    }

    isUndefined(value: any): boolean {
        return typeof(value) === 'undefined';
    }

    isArray(value: any): boolean {
        return Array.isArray(value);
    }
    onPesquisa(): void {
        if ((this.pesqAvForm.controls['nome'].value == null || this.pesqAvForm.controls['nome'].value === '')) {
            this.pop('error', 'Erro', 'Adicione um valor aos campos de procura');
        } else {
            this.flgPesquisando = 1;
            this.itens = [];
            this._vendaService.findItemPesAvV2(this.pesqAvForm.getRawValue())
                .subscribe({
                    next: data => {
                        this.flgPesquisando = 0;
                        if (data == null || data.length === 0) {
                            this.pop('error', 'Pesquisa', 'Não foi encontrado nada com essa pesquisa');
                        } else {

                            ///console.log(data);

                            for (let i = 0; i < data.length; i++) {
                                // const msgErros: string[] = [];

                                // if (data[i].venda_bloqueada === true) {
                                //     msgErros.push('Venda bloqueada');
                                // }

                                // if (data[i].qtd_disponivel <= 0) {
                                //     msgErros.push('Estoque insuficiente');
                                // }

                                // if (data[i].flg_preco_zero === 1) {
                                //     msgErros.push('Sem preço lançado ou vigente');
                                // }

                                // if (msgErros.length > 0) {
                                //     data[i].flg_indisponivel = 1;
                                //     data[i].msg_status = msgErros.join(', ');
                                // }
                                data[i].estoque_venda.forEach(ev => {
                                    const msgErros: string[] = [];

                                    if (data[i].venda_bloqueada === true) {
                                        msgErros.push('Venda bloqueada');
                                    }

                                    if (ev.qtd_disponivel <= 0) {
                                        msgErros.push('Estoque insuficiente');
                                    }

                                    if (ev.preco_atual === 0) {
                                        msgErros.push('Sem preço lançado ou vigente');
                                    }

                                    if (msgErros.length > 0) {
                                        ev.flg_indisponivel = 1;
                                        ev.msg_status = msgErros.join(', ');
                                    }
                                
                                });

                                let sel: any[] = [];
                                console.log(data[i]);
                                if (data[i].agrupamentos != null && data[i].agrupamentos.length > 0) {
                                    sel = data[i].agrupamentos.filter(un => {
                                        return Number(un.item_unidade_fator) > 1;
                                    });
                                }



                                if (sel.length > 0) {

                                    sel = sel.sort((obj1, obj2) => {
                                        if (obj1.item_unidade_fator > obj2.item_unidade_fator) {
                                            return 1;
                                        }
                                        if (obj1.item_unidade_fator < obj2.item_unidade_fator) {
                                            return -1;
                                        }
                                        return 0;
                                    });

                                    data[i].unidade = sel[0];
                                } else {
                                    data[i].unidade = data[i].agrupamentos[0];
                                }

                                this.itens.push(data[i]);
                            }
                        }
                        this.cdr.detectChanges();
                    },
                    error: err => {
                        this.flgPesquisando = 0;
                        this.pop('error', 'Erro', 'Erro ao pesquisar');
                        this.cdr.detectChanges();
                    }
                });

        }
    }
    compareAgrupamento(u1: ItemUnidadePAv, u2: ItemUnidadePAv): boolean {
        return u1 && u1 ? u1.item_unidade_id === u1.item_unidade_id : u1 === u1;
    }
    createForm(): void {
        this.pesqAvForm = new FormGroup({
            nome: new FormControl('')
        });
    }
}
