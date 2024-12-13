import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormControl } from '@angular/forms';
import { DiaSemana, ClientePAv } from './app-venda-modal-cliente-pesqav.utils';
import { ToastrService } from 'ngx-toastr';
import { FuncionarioDTO } from '@modules/shared/models/funcionario';
import { VendaService } from '@modules/shared/services';

@Component({
    selector: 'app-venda-modal-cliente-pesqav',
    templateUrl: './app-venda-modal-cliente-pesqav.component.html',
    styleUrls: ['./app-venda-modal-cliente-pesqav.component.scss'],
})
export class AppVendaModalClientePesqavComponent implements OnInit {
    @Input() modalHeader!: string;
    @Input() modalContent!: string;
    @Input() vendedoresVisiveis!: FuncionarioDTO[];
    @Input() vendedorSelecionado!: FuncionarioDTO;
    diasSemana: DiaSemana[];
    clientes: ClientePAv[];

    pesqAvForm!: FormGroup;
    submitted!: boolean;
    flgPesquisando: number;

    constructor(
        public activeModal: NgbActiveModal,
        private toastr: ToastrService,
        private _vendaService: VendaService,
        private cdr: ChangeDetectorRef,
    ) {
        this.diasSemana = [
            { id: 1, nome: 'Dom' },
            { id: 2, nome: 'Seg' },
            { id: 3, nome: 'Ter' },
            { id: 4, nome: 'Qua' },
            { id: 5, nome: 'Qui' },
            { id: 6, nome: 'Sex' },
            { id: 7, nome: 'Sab' },
        ];
        this.clientes = [];
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
    compareDias(v1: DiaSemana, v2: DiaSemana): boolean {
        return v1 && v2 ? v1.id === v2.id : v1 === v2;
    }
    isArray(value: any): boolean {
        return Array.isArray(value);
    }
    ngOnInit(): void {
        this.createForm();
    }
    onLimpa(): void {
        this.pesqAvForm.reset();
        this.clientes = [];
        this.pesqAvForm.patchValue({
            vendedor: this.vendedorSelecionado != null ? this.vendedorSelecionado : null,
        });
    }
    onPesquisa(): void {
        if (
            (this.pesqAvForm.controls['vendedor'].value == null
                && this.pesqAvForm.controls['diaSemana'].value == null
                && (this.pesqAvForm.controls['dtaIncInicial'].value == null || this.pesqAvForm.controls['dtaIncInicial'].value === '')
                && (this.pesqAvForm.controls['dtaIncFinal'].value == null || this.pesqAvForm.controls['dtaIncFinal'].value === '')
                && (this.pesqAvForm.controls['nome'].value == null || this.pesqAvForm.controls['nome'].value === '')
                && (this.pesqAvForm.controls['fantasia'].value == null || this.pesqAvForm.controls['fantasia'].value === '')
            )
        ) {
            this.pop('error', 'Erro', 'Selecione um dos campos para procura');
        } else {
            this.flgPesquisando = 1;
            this.clientes = [];
            this._vendaService.findClientePesAv(this.pesqAvForm.getRawValue())
                .subscribe((data: ClientePAv[]) => {
                    // console.log(data);
                    this.flgPesquisando = 0;
                    if (data == null || data.length === 0) {
                        this.pop('error', 'Pesquisa', 'Não foi encontrado nada com essa pesquisa');
                    } else {
                        this.clientes = data;
                    }
                    this.cdr.detectChanges();
                }, (err) => {
                    this.flgPesquisando = 0;
                    this.pop('error', 'Erro', 'Erro ao pesquisar');
                });
        }
    }
    createForm(): void {
        this.pesqAvForm = new FormGroup({
            vendedor: new FormControl(this.vendedorSelecionado != null ? this.vendedorSelecionado : null),
            diaSemana: new FormControl(null),
            nome: new FormControl(''),
            fantasia: new FormControl(''),
            dtaIncInicial: new FormControl(''),
            dtaIncFinal: new FormControl(''),
        });
    }
}
