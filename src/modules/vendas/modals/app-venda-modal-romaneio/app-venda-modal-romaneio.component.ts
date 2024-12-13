import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { EstoqueAlmoxarifadoDTO } from '@modules/estoques/estoque-almoxarifado/estoque-almoxarifado';
import { CaixaService } from '@modules/shared/services/caixa.service';

@Component({
    selector: 'app-venda-modal-romaneio',
    templateUrl: './app-venda-modal-romaneio.component.html',
    styleUrls: ['./app-venda-modal-romaneio.component.scss'],
})
export class AppVendaModalRomaneioComponent implements OnInit {
    @Input() estoqueAlmoxarifados!: EstoqueAlmoxarifadoDTO[];
    @Input() tipo!: string;
    @Input() usuarioCaixa!: string;

    alertForm!: FormGroup;
    submitted: boolean;

    constructor(public activeModal: NgbActiveModal,
        private toastr: ToastrService,
        private _caixaService: CaixaService) {
        this.submitted = false;
    }

    ngOnInit(): void {
        this.createForm();
        this.alertForm.controls['usuarioCaixa'].setValue(this.usuarioCaixa);
        this.alertForm.controls['usuarioCaixa'].disable();
    }

    createForm(): void {
        this.alertForm = new FormGroup({
            alx: new FormControl(null, [Validators.required]),
            dtaRef: new FormControl(this.convertDate(new Date(), 0), [Validators.required]),
            usuarioCaixa: new FormControl(null),
        });
    }

    get f() { return this.alertForm.controls; }

    convertDate(inputFormat: any, dia: any) {
        function pad(s: any) {
            return (s < 10) ? '0' + s : s;
        }
        const d = new Date(inputFormat);
        return [d.getFullYear(), pad(d.getMonth() + 1), pad(d.getDate() + dia)].join('-');
    }

    fechaModal(ret: any): void {
        if (ret != null && Array.isArray(ret) && ret.length > 0) {
            const obj = {
                estoque: this.alertForm.controls['alx'].value,
                dtaRef: this.alertForm.controls['dtaRef'].value,
                acao: 'confirm',
                formato: ret
            };
            this.activeModal.close(obj);
        } else {
            this.pop('error', 'Não foi encontrado nada', '');
        }
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

    buscar(): void {
        this.submitted = true;
        if (this.alertForm.invalid) {
            this.pop('error', 'Existe campos que ainda precisam ser preenchidos', '');
        } else {
            if (this.tipo == 'vendas') {
                this._caixaService.getVendasEstoqueData(this.alertForm.controls['alx'].value,
                    this.alertForm.controls['dtaRef'].value, this.alertForm.controls['usuarioCaixa'].value)
                    .subscribe({
                        next: (data) => {
                            this.fechaModal(data);
                        },
                        error: (err) => {
                            this.pop('error', 'Erro ao buscar', '');
                        }
                    });
            } else {
                this._caixaService.getRomaneiosEstoqueData(this.alertForm.controls['alx'].value,
                    this.alertForm.controls['dtaRef'].value)
                    .subscribe({
                        next: (data) => {
                            this.fechaModal(data);
                        },
                        error: (err) => {
                            this.pop('error', 'Erro ao buscar', '');
                        }
                    });
            }
        }
    }
}
