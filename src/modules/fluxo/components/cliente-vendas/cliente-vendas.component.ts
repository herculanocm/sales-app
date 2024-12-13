import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { VendaDTOAuxResumoValor } from '@modules/shared/models/fluxo-caixa';
import { FluxoService } from '@modules/shared/services';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-fluxo-cliente-vendas',
    templateUrl: './cliente-vendas.component.html',
    styleUrls: ['./cliente-vendas.component.scss'],
})
export class ClienteVendasModalAlertComponent {
    @Input() modalHeader: string;
    @Input() clienteId!: number;
    vendaAux: VendaDTOAuxResumoValor[] = [];
    submitted = false;

    createForm = new FormGroup({
        dtaReferenciaInicial: new FormControl<Date | null>(null, [Validators.required]),
        dtaReferenciaFinal: new FormControl<Date | null>(null, [Validators.required]),
      });


    constructor(
        private toastr: ToastrService,
        private cdr: ChangeDetectorRef,
        private spinner: NgxSpinnerService,
        private fluxoService: FluxoService,
        public activeModal: NgbActiveModal,
      ) {
        this.modalHeader = 'Header';
      }

      get f() { return this.createForm.controls; }
   

    onSubmit(): void {
        this.submitted = true;
        if (this.createForm.invalid) {
            return;
        } else {
            const bodyFields = this.createForm.getRawValue();

            this.spinner.show('searchVendasClientes');
            this.fluxoService.getVendasCliente(this.clienteId, bodyFields.dtaReferenciaInicial!, bodyFields.dtaReferenciaFinal!).subscribe({
                next: (data) => {
                    this.vendaAux = data;
                    this.spinner.hide('searchVendasClientes');
                    this.cdr.markForCheck();
                },
                error: (error) => {
                    console.log(error);
                    this.spinner.hide('searchVendasClientes');
                    this.toastr.error('Erro ao buscar vendas do cliente', 'Erro');
                    this.cdr.markForCheck();
                }
            });
        }
        
    }

    selecionarVenda(venda: VendaDTOAuxResumoValor): void {
        console.log(venda);
        this.activeModal.close(venda);
    }

}
