import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ColumnMode, SelectionType } from '@swimlane/ngx-datatable';
import { NgxSpinnerService } from 'ngx-spinner';
import { AppClienteModalConfirmComponent } from '../modals/app-cliente-modal-confirm/app-cliente-modal-confirm.component';
import { Observable, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, tap, switchMap, map } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { CurrentUserSalesAppAux } from '@app/app.utils';
import { ComodatoAux, EstoqueComodatoAux } from '@modules/shared/models/comodato';
import { EstoqueAlmoxarifadoDTO, ItemDTO, ItemUnidadeDTO } from '@modules/shared/models/item';
import { ClienteService, ComodatoService } from '@modules/shared/services';
import { ClienteDTO } from '@modules/shared/models/cliente';

@Component({
    selector: 'app-comodato',
    templateUrl: './comodato.component.html',
    styleUrls: ['./comodato.component.scss'],
})
export class ComodatoComponent implements OnInit {

    ColumnMode = ColumnMode;
    submitted: boolean;
    statusForm: number;
    comodatoForm!: FormGroup;
    selected: any[] = [];
    currentUserSalesApp: CurrentUserSalesAppAux;
    flgPesquisandoCliente!: number;
    flgPesquisandoEmissor!: number;
    comodatos: ComodatoAux[];
    estoqueAlmoxarifados: EstoqueAlmoxarifadoDTO[];
    estoqueComodatoAux!: EstoqueComodatoAux;
    selectionTypeSingle = SelectionType.single;
    flgPesquisandoItem: number;

    // typeahead
    searchingCliente!: boolean;
    searchFailedCliente!: boolean;

    searchingItemNome!: boolean;
    searchFailedItemNome!: boolean;

    // typeahead


    /* formatter */
    formatterCliente = (x: { nome: string }) => x.nome;
    /* formatter */


    /* Serach Observable */
    searchCliente = (text$: Observable<string>) =>
        text$.pipe(
            debounceTime(400),
            distinctUntilChanged(),
            tap(() => {
                this.searchingCliente = true;
            }),
            switchMap(term =>
                this._clienteService.nodejsFindByName(term)
                    .pipe(
                        tap(() => this.searchFailedCliente = false),
                        catchError(() => {
                            this.searchFailedCliente = true;
                            return of([]);
                        })),
            ), tap(() => {
                this.searchingCliente = false;
            }))
    searchItemNome = (text$: Observable<string>) =>
        text$.pipe(
            debounceTime(400),
            distinctUntilChanged(),
            tap(() => {
                this.searchingItemNome = true;
            }),
            switchMap(term =>
                this._comodatoService.nodejsFindComodatoByName(term)
                    .pipe(
                        tap(() => this.searchFailedItemNome = false),
                        catchError(() => {
                            this.searchFailedItemNome = true;
                            return of([]);
                        })),
            ), tap(() => {
                this.searchingItemNome = false;
            }))



    constructor(
        private toastr: ToastrService,
        private cdr: ChangeDetectorRef,
        private _modalService: NgbModal,
        private spinner: NgxSpinnerService,
        private _comodatoService: ComodatoService,
        private _clienteService: ClienteService,
    ) {
        this.submitted = false;
        this.statusForm = 1;
        this.ColumnMode = ColumnMode;
        this.flgPesquisandoItem = 0;
        this.currentUserSalesApp = JSON.parse(sessionStorage.getItem('currentUserSalesApp')!);
        this.comodatos = [];
        this.estoqueAlmoxarifados = [];
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

    createForm(): void {
        this.comodatoForm = new FormGroup({
            id: new FormControl(''),

            clienteId: new FormControl(''),
            clienteDTO: new FormControl('', [Validators.required]),

            itemId: new FormControl(''),
            itemDTO: new FormControl('', [Validators.required]),

            agrupamento: new FormControl('', [Validators.required]),
            qtd: new FormControl('', [Validators.required, Validators.min(1)]),
            dtaEmprestimo: new FormControl('', [Validators.required]),

            estoqueAlmoxarifadoId: new FormControl(null, [Validators.required]),
            descricao: new FormControl(''),
        });
    }

    get f() { return this.comodatoForm.controls; }

    findItemById(event?: any): void {

        if (event != null) {
            event.srcElement.blur();
            event.preventDefault();
        }

        const idItem = this.comodatoForm.controls['itemId'].value;

        if (idItem == null || isNaN(idItem)) {
            this.pop('error', 'Erro', 'Digite um id valido para pesquisa');
        } else {

            this.selectItemByCod(idItem);
        }

    }

    selectItemByCod(id: number): void {
        this.flgPesquisandoItem = 1;
        this._comodatoService.findItemById(id)
            .subscribe((data) => {
                if (data.comodato === false) {
                    this.pop('error', 'Erro', 'Este item não é comodato');
                } else {
                    this.setaModelAndFormItem(data);
                    this.pop('success', 'Encontrado com sucesso', '');
                    this.getItemSaldoEstoque();
                }
                this.cdr.detectChanges();
            }, (err) => {
                this.flgPesquisandoItem = 0;
                this.pop('error', 'Erro', 'Não foi encontrado item com esse codigo');
                this.cdr.detectChanges();
            });
    }

    setaModelAndFormItem(i: ItemDTO): void {
        this.comodatoForm.patchValue({
            itemId: i.id,
            itemDTO: i,
        });
    }

    typeaHeadSelectItem(event: any): void {
        const itemId = event.item.id;
        this.comodatoForm.controls['itemId'].setValue(itemId);
        this.selectItemByCod(itemId);
    }

    getAgrupamentos(): ItemUnidadeDTO[] {
        const itemDTO = this.comodatoForm.controls['itemDTO'].value;
        if (itemDTO == null) {
            return [];
        } else {
            return itemDTO.itemUnidadeDTOs;
        }
    }

    addItem(): void {
        this.submitted = true;
        if (this.comodatoForm.invalid) {
            this.msgAlerta('Atenção', 'Existe campos que ainda precisam ser preenchidos', 'error');
        } else {
            const rawData = this.comodatoForm.getRawValue();
            rawData.usuarioInclusao = this.currentUserSalesApp.username;

            // console.log(rawData);
            this.spinner.show('fullSpinner');
            this._comodatoService.nodejsPostComodato(rawData)
                .subscribe((data) => {
                    this.spinner.hide('fullSpinner');
                    this.getItemSaldoEstoque();
                    this.reloadComodatos();
                    this.onLimpaItem();
                    this.cdr.detectChanges();
                }, (error) => {
                    this.spinner.hide('fullSpinner');
                    console.log(error);
                    this.cdr.detectChanges();
                });
        }
    }
    onLimpaItem(): void {
        this.submitted = false;
        this.comodatoForm.patchValue({
            qtd: null,
            dtaEmprestimo: null,
            agrupamento: null,
            itemDTO: null,
            itemId: null,
            descricao: null,
        });
    }

    ngOnInit(): void {
        this.createForm();
        this.iniciaObjs();
    }

    iniciaObjs(): void {
        this.initDefaults();
        this.comodatos = [];
        this.estoqueAlmoxarifados = [];
        this.buscaAlmoxarifados();
    }

    initDefaults(): void {
        this.statusForm = 1;
        this.submitted = false;
        this.estoqueComodatoAux = new EstoqueComodatoAux();
    }

    voltar(): void {
        const id = this.comodatoForm.controls['id'].value;
        if (id != null && id > 0) {
            this.statusForm = 2;
        } else {
            this.statusForm = 1;
        }
    }

    msgAlerta(titulo: string, conteudo: string, tipo: string): void {
        const activeModal = this._modalService.open(
            AppClienteModalConfirmComponent, { backdrop: true });
        activeModal.componentInstance.modalHeader = titulo;
        activeModal.componentInstance.modalContent = conteudo;
        activeModal.componentInstance.modalType = tipo;
        activeModal.result.then((result) => { console.log(result) }, (error) => { console.log(error) });
    }



    delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    onLimpa(): void {
        this.onReset();
        this.iniciaObjs();
        this.pop('success', 'Limpo com sucesso', '');
        this.submitted = false;
    }

    onReset() {
        this.submitted = false;
        this.comodatoForm.reset();
        this.comodatoForm.patchValue({
            status: true,
            estoqueAlmoxarifadoId: null,
        });
        this.comodatoForm.enable();
    }

    unsetSelected(): void {
        if (this.selected != null) {
            this.selected.splice(0, this.selected.length);
        }
    }

    findClienteById(event?: any): void {

        if (event != null) {
            event.srcElement.blur();
            event.preventDefault();
        }

        const idCliente = this.comodatoForm.controls['clienteId'].value;

        if (idCliente == null || isNaN(idCliente)) {
            this.pop('error', 'Erro', 'Digite um id valido para pesquisa');
        } else {

            this.selectClienteByCod(idCliente);
        }
    }

    selectClienteByCod(id: number): void {
        this.flgPesquisandoCliente = 1;
        this._clienteService.findById(id)
            .subscribe((data) => {
                // console.log(data);
                this.setaModelAndFormCliente(data);
                this.pop('success', 'Cliente encontrado com sucesso', '');
                this.flgPesquisandoCliente = 0;
                this.cdr.detectChanges();
            }, (err) => {
                this.flgPesquisandoCliente = 0;
                this.pop('error', 'Erro', 'Não foi encontrado cliente com esse codigo');
                this.cdr.detectChanges();
            });
    }

    buscaAlmoxarifados(): void {
        this._comodatoService.getAllEstoqueActive()
            .subscribe((data) => {
                this.estoqueAlmoxarifados = data;
                this.cdr.detectChanges();
            }, (err) => {
                this.pop('error', 'Erro', 'Não foi encontrado almoxarifados');
            });
    }

    buscaComodatosByCliente(clienteId: number): void {
        this.spinner.show('comodatosSpinner');
        this._comodatoService.nodejsGetComodatos(clienteId)
            .subscribe((data) => {
                this.spinner.hide('comodatosSpinner');
                this.comodatos = data;
                // console.log(this.comodatos);
                if (this.comodatos.length === 0) {
                    // this.pop('error', 'Erro', 'Erro ao encontrar comodatos para este cliente');
                } else {
                    this.pop('success', 'Comodatos encontrados com sucesso', '');
                }
                this.cdr.detectChanges();
            }, (err) => {
                this.spinner.hide('comodatosSpinner');
                this.pop('error', 'Erro', 'Não foi encontrado comodatos com esse codigo de cliente');
                this.cdr.detectChanges();
            });
    }

    getItemSaldoEstoque(): void {
        const itemId = this.comodatoForm.controls['itemId'].value;
        const estoqueId = this.comodatoForm.controls['estoqueAlmoxarifadoId'].value;

        this._comodatoService.nodejsGetEstoqueComodato(estoqueId, itemId)
            .subscribe((data) => {
                if (data.length > 0) {
                    this.estoqueComodatoAux = data[0];
                }
                this.cdr.detectChanges();
            });
    }

    setaModelAndFormCliente(cliente: ClienteDTO): void {
        this.comodatoForm.patchValue({
            clienteDTO: cliente,
            clienteId: cliente.id,
        });
        this.buscaComodatosByCliente(cliente.id);
    }

    deletarComodato(comodato: ComodatoAux): void {
        this.spinner.hide('fullSpinner');
        this._comodatoService.nodejsDelComodato(comodato.id)
            .subscribe((data) => {
                this.spinner.hide('fullSpinner');
                this.pop('success', 'Deletado com sucesso', '');
                this.getItemSaldoEstoque();
                this.reloadComodatos();
                this.cdr.detectChanges();
            }, (err) => {
                this.spinner.hide('fullSpinner');
                this.pop('error', 'Erro', 'Erro ao deletar');
                this.cdr.detectChanges();
            });
    }

    reloadComodatos(): void {
        const clienteId = this.comodatoForm.controls['clienteId'].value;
        this.buscaComodatosByCliente(clienteId);
    }

    typeaHeadSelectCliente(event: any): void {
        this.selectClienteByCod(event.item.id);
    }
}
