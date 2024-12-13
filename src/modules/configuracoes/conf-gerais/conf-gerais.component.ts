import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ConfGeraisService } from '@modules/shared/services';
import { ConfGeraisDTO } from '@modules/shared/models/configuracoes';

@Component({
    selector: 'app-conf-gerais',
    templateUrl: './conf-gerais.component.html',
    styleUrls: ['./conf-gerais.component.scss']
})
export class ConfGeraisComponent implements OnInit {
    conf!: ConfGeraisDTO;
    activeNav: number;
    constructor(
        private _confService: ConfGeraisService,
        private toastr: ToastrService,
        private cdr: ChangeDetectorRef,
        private spinner: NgxSpinnerService) {
        this.activeNav = 1;
    }

    ngOnInit(): void {
        this.iniciaObjs();
    }

    iniciaObjs(): void {
        this.conf = new ConfGeraisDTO();
        this.buscaConfiguracoes(1);
    }

    onCadastra(): void {
        this.spinner.show();
        this._confService.put(this.conf)
            .subscribe({
                next: (data) => {
                    this.spinner.hide();
                    this.conf = data;
                    this.cdr.detectChanges();
                },
                error: (err) => {
                    this.spinner.hide();
                    this.cdr.detectChanges();
                }
            });
    }

    buscaConfiguracoes(id: number): void {
        this.spinner.show();
        this._confService.getConfById(id)
            .subscribe({
                next: (data) => {
                    this.conf = data;
                    this.spinner.hide();
                    this.cdr.detectChanges();
                },
                error: (err) => {
                    this.spinner.hide();
                    this.cdr.detectChanges();
                    this.pop('error', 'Erro', 'Não foi possivel encontrar configuração.');
                }
            });
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
}
