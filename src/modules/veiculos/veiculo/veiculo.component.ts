import { Component, ChangeDetectorRef } from '@angular/core';
import { VeiculoDTO } from './veiculo';
import { VeiculoService } from './veiculo.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AppVeiculoModalConfirmComponent } from '../modals/app-veiculo-modal-confirm/app-veiculo-modal-confirm.component';
import { ColumnMode, SelectionType } from '@swimlane/ngx-datatable';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
    selector: 'app-veiculo',
    templateUrl: './veiculo.component.html',
    styleUrls: ['./veiculo.component.scss'],
})
export class VeiculoComponent {
    
    ColumnMode = ColumnMode;
    veiculo: VeiculoDTO;
    veiculos!: VeiculoDTO[];
    errorForm: object | any = {};
    authorities!: string[];
    authSelected: any;
    // status 1 = salvando, status 2 = editando, status 3 = pesquisando
    statusForm: number;
    selectionTypeSingle = SelectionType.single;

    public loading = false;

    // datatable
    rows: any[] = [];
    columns: any[] = [
        { name: 'ID' },
        { name: 'NOME' },
        { name: 'PLACA' },
        { name: 'MARCA' },
        { name: 'MODELO' },
    ];
    selected: any[] = [];
    // datatable

    constructor(
        private toastr: ToastrService,
        private cdr: ChangeDetectorRef,
        private _modalService: NgbModal,
        private _veiculoService: VeiculoService,
        private spinner: NgxSpinnerService,
    ) {
        this.veiculo = new VeiculoDTO();
        this.veiculo.status = true;
        this.statusForm = 1;
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

    onPesquisa(): void {
        this.spinner.show('fullSpinner');
        this._veiculoService.getAll()
            .subscribe({
                next: (users: VeiculoDTO[]) => {
                    this.spinner.hide('fullSpinner');
                    this.veiculos = users;
                    if (this.veiculos.length === 0) {
                        this.pop('error', 'Pesquisa', 'Não foi encontrado nada com essa pesquisa.');
                    } else {
                        this.statusForm = 3;
                        this.setaColumns(this.veiculos);
                    }
                    this.cdr.detectChanges();
                },
                error: () => {
                    this.spinner.hide('fullSpinner');
                }
            });
    }
    onDeleta(id: number): void {
        const activeModal = this._modalService.open(AppVeiculoModalConfirmComponent);
        activeModal.componentInstance.modalHeader = 'Confirme a exclusão';
        activeModal.componentInstance.modalContent = 'Deseja realmente excluir ?';
        activeModal.componentInstance.modalType = 'confirm';
        activeModal.componentInstance.defaultLabel = 'Não';
        activeModal.result.then((result) => {
            if (result === 'confirm') {
                let message = '';
                this.spinner.show('fullSpinner');
                this._veiculoService.del(id)
                    .subscribe({
                        next: (resp: any) => {
                            this.spinner.hide('fullSpinner');
                            // message = resp.message;
                            // this.pop('success', 'Sucesso', message);
                            this.rows = [];
                            this.veiculos = [];
                            this.onLimpa();
                            this.cdr.detectChanges();
                        },
                        error: (err) => {
                            this.spinner.hide('fullSpinner');
                            message = err.message;
                            this.pop('error', 'Erro', message);
                            this.cdr.detectChanges();
                        }
                    });
            }
        }, (error) => {
            console.log(error);
        });
    }

    onLimpa(): void {
        // this.router.navigate([]).then(result => {  window.open('http://localhost:4200/print/5897445575555', '_blank'); });
        this.limpa();
    }
    onCadastra(): void {
        this.loading = true;
        this.spinner.show('fullSpinner');
        this._veiculoService.postOrPut(this.veiculo, this.statusForm)
            .subscribe({
                next: (data: VeiculoDTO) => {
                    this.spinner.hide('fullSpinner');
                    // // console.log(data);
                    this.loading = false;
                    this.veiculo = data;
                    // this.pop('success', 'Sucesso', 'VeiculoDTO criado com sucesso.');
                    this.errorForm = {};
                    this.errorForm = {};
                    this.statusForm = 2;
                    this.rows = [];
                    this.veiculos = [];
                    this.cdr.detectChanges();
                },
                error: (err) => {
                    this.spinner.hide('fullSpinner');
                    // // console.log(err);
                    this.errorForm = err.error;
                    this.loading = false;
                    this.cdr.detectChanges();
                    // this.pop('error', 'Erro', 'Erro ao realizar requisição');
                }
            });
    }
    editando(): void {
        // // console.log('selecionando para editar');
        const sel = this.veiculos.filter(us => {
            return us.id === this.selected[0].id;
        });
        // // console.log(sel);
        this.veiculo = sel[0];
        this.statusForm = 2;
        this.cdr.detectChanges();
    }
    isValidDelete(): boolean {
        return this.statusForm === 2 && this.veiculo.id != null ? false : true;
    }

    setaColumns(veiculos: VeiculoDTO[]): void {

        if (veiculos.length === 1) {
            this.veiculo = veiculos[0];
            this.statusForm = 2;
            this.pop('success', 'Encontrado apenas 1 registro', '');
        } else {
            this.rows = [];
            for (let i = 0; i < veiculos.length; i++) {
                this.rows.push(
                    {
                        id: veiculos[i].id,
                        nome: veiculos[i].nome,
                        placa: veiculos[i].placa,
                        marca: veiculos[i].marca,
                        modelo: veiculos[i].modelo,
                    },
                );
            }
        }
    }

    onLeftArray(): void {
        if (this.statusForm === 2) {
            for (let i = 0; i < this.veiculos.length; i++) {
                if (this.veiculo.id === this.veiculos[i].id) {
                    if ((i - 1) >= 0) {
                        this.veiculo = this.veiculos[i - 1];
                        i = this.veiculos.length + 1;
                    }
                }
            }
        }
    }

    onRightArray(): void {
        if (this.statusForm === 2) {
            for (let i = 0; i < this.veiculos.length; i++) {
                if (this.veiculo.id === this.veiculos[i].id) {
                    if ((i + 1) < this.veiculos.length) {
                        // console.log('entrou');
                        this.veiculo = this.veiculos[i + 1];
                        i = this.veiculos.length + 1;
                    }
                }
            }
        }
    }



    /*
    limpa(): void {
        this.VeiculoDTO.id = null;
        this.VeiculoDTO.login = null;
        this.VeiculoDTO.firstName = null;
        this.VeiculoDTO.lastName = null;
        this.VeiculoDTO.email = null;
        this.VeiculoDTO.imageUrl = null;
        this.VeiculoDTO.activated = true;
        this.VeiculoDTO.langKey = null;
        this.VeiculoDTO.createdBy = null;
        this.VeiculoDTO.createdDate = null;
        this.VeiculoDTO.lastModifiedBy = null;
        this.VeiculoDTO.authorities = [];
    }
*/
    limpa(): void {
        this.veiculo = new VeiculoDTO();
        this.veiculo.status = true;
        this.statusForm = 1;
        this.errorForm = {};
        this.selected = [];
    }

    onTable(): void {
        // console.log('teste');
        if (this.veiculos != null && this.veiculos.length > 0) {
            this.statusForm = 3;
        } else {
            this.pop('error', 'Erro', 'Procure primeiro.');
        }
    }




    voltar(): void {
        if (this.veiculo.id > 0) {
            this.statusForm = 2;
        } else {
            this.statusForm = 1;
        }
    }

    onActivate(event: any) {
        if (
            (event.type === 'dblclick') ||
            (event.type === 'keydown' && event.event.keyCode === 13)
        ) {
            this.editando();
        }
    }
}
