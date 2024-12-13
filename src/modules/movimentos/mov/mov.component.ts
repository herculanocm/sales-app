import {
  Component,
  OnInit,
  ElementRef,
  ViewChild,
  Renderer2,
  ChangeDetectorRef,
  AfterViewInit,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Observable, of } from 'rxjs';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  tap,
  switchMap,
} from 'rxjs/operators';
import { NgxSpinnerService } from 'ngx-spinner';
import { saveAs as importedSaveAs } from 'file-saver';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AppMovimentoModalConfirmComponent } from '../modals/app-mov-modal-confirm/app-mov-modal-confirm.component';
import { Router } from '@angular/router';
import { ColumnMode, SelectionType } from '@swimlane/ngx-datatable';
import { ToastrService } from 'ngx-toastr';
import { CurrentUserLoged } from '@modules/shared/models/layout.utils';
import {
  ItemEstoqueStatus,
  MovimentoDTO,
  MovimentoItemDTO,
  MovimentoOrigemDTO,
  MovimentoPesquisaDTO,
  MovimentoTipoDTO,
  PageMovimento,
} from '@modules/shared/models/movimento';
import { ClienteDTO } from '@modules/shared/models/cliente';
import { FornecedorDTO } from '@modules/shared/models/fornecedor';
import { FuncionarioDTO } from '@modules/shared/models/funcionario';
import { VeiculoDTO } from '@modules/shared/models/veiculo';
import {
  EstoqueAlmoxarifadoDTO,
  ItemDTO,
  ItemResumoDTO,
  ItemUnidadeDTO,
} from '@modules/shared/models/item';
import { UserDTO } from '@modules/shared/models/usuario';
import {
  ClienteService,
  EstoqueAlmoxarifadoService,
  FornecedorService,
  FuncionarioService,
  ItemService,
  MovService,
  MovimentoTipoService,
  UsuarioService,
} from '@modules/shared/services';
import { VeiculoService } from '@modules/veiculos/veiculo/veiculo.service';
import { ItemConfirmModalComponent } from '../modals/item-confirm-modal.component';
import { ModalFindMovimentoComponent } from '../modals/modal-find-movimento/modal-find-movimento.component';

@Component({
  selector: 'app-mov',
  templateUrl: './mov.component.html',
  styleUrls: ['./mov.component.scss'],
})
export class MovComponent implements OnInit, AfterViewInit {
  ColumnMode = ColumnMode;

  currentUserSalesApp!: CurrentUserLoged;
  movimento!: MovimentoDTO;
  pageMovimento!: PageMovimento;
  movimentoPesquisaDTO!: MovimentoPesquisaDTO;
  movimentoTipos!: MovimentoTipoDTO[];
  movimentoOrigens!: MovimentoOrigemDTO[];
  clienteSelecionado!: ClienteDTO;
  fornecedorSelecionado!: FornecedorDTO;
  motoristas!: FuncionarioDTO[];
  conferentes!: FuncionarioDTO[];
  veiculos!: VeiculoDTO[];
  almoxarifados!: EstoqueAlmoxarifadoDTO[];
  itemProcura!: ItemDTO;
  selectionTypeSingle = SelectionType.single;
  selectedItemMovimento!: MovimentoItemDTO;
  usuarios!: UserDTO[];
  itemResumoDTO!: ItemResumoDTO;
  currentJustify = 'center';
  itemEstoqueStatus!: ItemEstoqueStatus;
  public loading = false;
  registerForm!: FormGroup;
  formPesquisa!: FormGroup;
  botaoGeraCSV!: string;
  temp: any[] = [];
  itemUnidadeDTOs: ItemUnidadeDTO[] = [];

  @ViewChild('movId') movId: ElementRef | undefined;
  @ViewChild('itemNome') itemNome: ElementRef | undefined;
  @ViewChild('itemUnidade') itemUnidade: ElementRef | undefined;
  @ViewChild('itemId') itemId: ElementRef | undefined;
  @ViewChild('clienteId') clienteId: ElementRef | undefined;
  @ViewChild('fornecedorId') fornecedorId: ElementRef | undefined;

  /* Searching variables */
  searchingItem!: boolean;
  searchFailedItem!: boolean;

  searchingCliente!: boolean;
  searchFailedCliente!: boolean;

  searchingFornecedor!: boolean;
  searchFailedFornecedor!: boolean;

  searchingMotorista!: boolean;
  searchFailedMotorista!: boolean;

  searchingConferente!: boolean;
  searchFailedConferente!: boolean;

  // status 1 = salvando, status 2 = editando, status 3 = pesquisando
  statusForm!: number;
  columns: any[] = [
    { name: 'ID' },
    { name: 'NOME' },
    { name: 'STATUS' },
    { name: 'OUTRO' },
  ];
  selected: any[] = [];
  selectedMovItem: any[] = [];

  submitted = false;
  submittedItem = false;

  movForm = new FormGroup({
    id: new FormControl<number | null>(null),
    numNotaFiscal: new FormControl<string | null>(null),

    dtaInclusao: new FormControl<Date | null>(null),
    usuarioInclusao: new FormControl<string | null>(null),

    preVendaId: new FormControl<number | null>(null),
    rotaId: new FormControl<number | null>(null),

    clienteId: new FormControl<number | null>(null),

    fornecedorId: new FormControl<number | null>(null),

    movimentoOrigemDTO: new FormControl<MovimentoOrigemDTO | null>(null),
    movimentoTipoDTO: new FormControl<MovimentoTipoDTO | null>(
      null,
      Validators.required
    ),
    estoqueAlmoxarifadoDTO: new FormControl<EstoqueAlmoxarifadoDTO | null>(
      null,
      Validators.required
    ),

    veiculoDTO: new FormControl<VeiculoDTO | null>(null, Validators.required),
    motoristaDTO: new FormControl<FuncionarioDTO | null>(
      null,
      Validators.required
    ),
    conferenteDTO: new FormControl<FuncionarioDTO | null>(
      null,
      Validators.required
    ),
    clienteDTO: new FormControl<ClienteDTO | null>(null),
    fornecedorDTO: new FormControl<FornecedorDTO | null>(null),

    descricao: new FormControl('', Validators.maxLength(4000)),

    indAtivo: new FormControl(true, Validators.required),
    indAuditoria: new FormControl(false, Validators.required),

    item: new FormGroup({
      itemId: new FormControl(null),
      itemIdAux: new FormControl(null),
      itemDTO: new FormControl(null, Validators.required),
      itemUnidadeDTO: new FormControl(null, Validators.required),
      qtd: new FormControl(null, [Validators.required, Validators.min(0)]),
      saldo: new FormControl(0),
      valor: new FormControl(0, [Validators.required, Validators.min(0)]),
      valorMedioUnit: new FormControl(null),
      indGeraPreco: new FormControl(null),
      indGeraEstoque: new FormControl(true),
    }),
  });

  itemForm = this.movForm.get('item') as FormGroup;

  constructor(
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef,
    private _modalService: NgbModal,
    private _movimentoService: MovService,
    private _movimentoTipoService: MovimentoTipoService,
    private _veiculoService: VeiculoService,
    private _clienteService: ClienteService,
    private _fornecedorService: FornecedorService,
    private _funcionarioService: FuncionarioService,
    private _itemService: ItemService,
    private _estoqueAlmoxarifadoService: EstoqueAlmoxarifadoService,
    private _usuarioService: UsuarioService,
    private spinner: NgxSpinnerService,
    private router: Router
  ) {}
  ngOnInit() {
    this.currentUserSalesApp = JSON.parse(
      sessionStorage.getItem('currentUserSalesApp')!
    );
    // console.log(this.currentUserSalesApp);
    this.searchingItem = false;
    this.searchFailedItem = false;
    this.searchingCliente = false;
    this.searchFailedCliente = false;
    this.searchingFornecedor = false;
    this.searchFailedFornecedor = false;
    this.searchingMotorista = false;
    this.searchFailedMotorista = false;
    this.searchingConferente = false;
    this.searchFailedConferente = false;
    this.botaoGeraCSV = 'Gerar CSV';
    this.statusForm = 1;
    this.buscaMovimentoOrigens();
    this.buscaMovimentoTipos();
    this.buscaVeiculos();
    this.buscaAlmoxarifados();
    this.buscaConferentes();
    this.buscaMotoristas();
    this.buscaUsuarios();
    this.iniciaObjs();

    this.onResetForm();
  }

  onResetForm(): void {
    this.movForm.reset();
    this.movForm.enable();

    this.movForm.controls.usuarioInclusao.disable();
    this.movForm.controls.dtaInclusao.disable();
    this.movForm.controls.preVendaId.disable();
    this.movForm.controls.rotaId.disable();

    this.movForm.controls.indAtivo.setValue(true);
    this.movForm.controls.indAuditoria.setValue(false);

    this.onResetItemForm();
    this.cdr.detectChanges();
  }

  ngAfterViewInit() {
    this.movId!.nativeElement.focus();
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

  get f() {
    return this.movForm.controls;
  }

  get fi() {
    return this.itemForm.controls;
  }

  findMovimentoItens(): void {
    const activeModal = this._modalService.open(ModalFindMovimentoComponent, {
      backdrop: 'static',
      size: 'xl',
    });
    activeModal.result.then(
      (result) => {
        if (
          result != null &&
          !this.isUndefined(result) &&
          this.isArray(result)
        ) {
          this.movimento.movimentoItemDTOs = [];
          result.forEach((mi: MovimentoItemDTO) => {
            if ((mi.qtd > 0 && mi.indGeraEstoque === true) || (mi.valor > 0 && mi.indGeraPreco === true)) {
              mi.status = 'novo';
              mi.id = null;
              mi.movimentoDTO_id = null;
              mi.valorUnitario = mi.valor / (mi.qtd * mi.itemUnidadeDTO!.fator);
              this.movimento.movimentoItemDTOs.push(mi);
            }
          });
          this.movimento.movimentoItemDTOs = [
            ...this.movimento.movimentoItemDTOs,
          ];
          this.movimento.movimentoItemDTOs.sort((v1, v2) => {
            if (v1.ordemInclusaoTimestamp < v2.ordemInclusaoTimestamp) {
                return -1;
            }
            if (v1.ordemInclusaoTimestamp > v2.ordemInclusaoTimestamp) {
                return 1;
            }
            return 0;
        });
        console.log(this.movimento);
          this.cdr.markForCheck();
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }
  isArray(value: any): boolean {
    return Array.isArray(value);
  }

  isUndefined(value: any): boolean {
    return typeof value === 'undefined';
  }

  tooltipBtnSalvar(): string {
    if (this.statusForm === 2 && this.isMovimentoDifCompleto()) {
      return 'Somente movimento completo e de rota pode ser atualizado';
    } else if (this.statusForm === 2 && this.isDisableAtualizarMovimento()) {
      return 'Você está sem permissão para atualiar movimento';
    } else if (this.statusForm === 2) {
      return 'Botão de atualizar movimento';
    } else if (this.statusForm === 1 && this.isDisableSalvarMovimento()) {
      return 'Você está sem permissão para salvar movimento';
    } else {
      return 'Botão de salvar movimento';
    }
  }

  isDisableSalvaAtualiza(): boolean {
    if (
      this.statusForm === 2 &&
      this.isMovimentoDifCompleto() &&
      this.isMovimentoDifRota()
    ) {
      return true;
    } else if (this.statusForm === 2 && this.isDisableAtualizarMovimento()) {
      return true;
    } else if (this.statusForm === 2) {
      return false;
    } else if (this.statusForm === 1 && this.isDisableSalvarMovimento()) {
      return true;
    } else {
      return false;
    }
  }
  isDisableSalvarMovimento(): boolean {
    const flt = this.currentUserSalesApp.user.authorityDTOs.filter((auth) => {
      return auth.name === 'ROLE_SALES_MOVIMENTO_SALVAR';
    });
    return flt.length > 0 ? false : true;
  }

  isDisableAtualizarMovimento(): boolean {
    const flt = this.currentUserSalesApp.user.authorityDTOs.filter((auth) => {
      return auth.name === 'ROLE_SALES_MOVIMENTO_ATUALIZAR';
    });
    return flt.length > 0 ? false : true;
  }

  isMovimentoDifCompleto(): boolean {
    return this.movimento != null &&
      this.movimento.movimentoOrigemDTO != null &&
      this.movimento.movimentoOrigemDTO.id != null &&
      this.movimento.movimentoOrigemDTO.id > 1
      ? true
      : false;
  }

  isMovimentoDifRota(): boolean {
    return this.movimento != null &&
      this.movimento.movimentoOrigemDTO != null &&
      this.movimento.movimentoOrigemDTO.id != null &&
      this.movimento.movimentoOrigemDTO.id != 7
      ? true
      : false;
  }

  isDisableDeletarMovimento(): boolean {
    const flt = this.currentUserSalesApp.user.authorityDTOs.filter((auth) => {
      return auth.name === 'ROLE_SALES_MOVIMENTO_DELETAR';
    });
    return flt.length > 0 ? false : true;
  }

  isValidDelete(): boolean {
    if (this.isDisableDeletarMovimento()) {
      return false;
    } else if (this.isMovimentoDifCompleto() && this.isMovimentoDifRota()) {
      return false;
    } else if (
      this.statusForm !== 2 ||
      this.movimento == null ||
      this.movimento.id == null
    ) {
      return false;
    } else if (
      this.statusForm === 2 &&
      this.movimento != null &&
      this.movimento.id != null &&
      this.movimento.id > 0
    ) {
      return true;
    } else {
      return false;
    }
  }

  // isDisableDeleteMovimentoItem(): boolean {
  //     if (this.selectedItemMovimento.status == 'novo' ||
  //         (this.movimento != null &&
  //             this.movimento.movimentoOrigemDTO != null &&
  //             this.movimento.movimentoOrigemDTO.id === 7)
  //     ) {
  //         return false;
  //     } else {
  //         return true;
  //     }
  // }

  isDisableDeleteMovimentoItem(): boolean {
    const movOrigem: any = this.movForm.controls.movimentoOrigemDTO.value;
    if (
      this.statusForm === 1 ||
      (movOrigem != null && movOrigem.id != null && movOrigem.id === 7)
    ) {
      return false;
    } else {
      return true;
    }
  }

  tooltipBtnDeletar(): string {
    if (this.isDisableDeletarMovimento()) {
      return 'Você está sem permissão para deletar movimento';
    } else if (this.isMovimentoDifCompleto() && this.isMovimentoDifRota()) {
      return 'Somente movimento completo e de rota pode ser deletado';
    } else if (
      this.statusForm !== 2 ||
      this.movimento == null ||
      this.movimento.id == null
    ) {
      return 'Selecione um movimento válido para deleção';
    } else if (
      this.statusForm === 2 &&
      this.movimento != null &&
      this.movimento.id != null &&
      this.movimento.id > 0
    ) {
      return 'Clicando aqui você irá deletar o movimento';
    } else {
      return 'Sem capacidade para deletar';
    }
  }

  getVlrMedio(): number {
    const qtd: number = this.itemForm.controls['qtd'].value;
    const valor: number = this.itemForm.controls['valor'].value;
    const itemUnidadeDTO: ItemUnidadeDTO =
      this.itemForm.controls['itemUnidadeDTO'].value;

    if (qtd != null && valor != null && itemUnidadeDTO != null) {
      return valor / (qtd * itemUnidadeDTO.fator);
    }
    return 0;
  }

  /* formatter */
  formatterItem = (x: { nome: string }) => x.nome;
  formatterCliente = (x: { nome: string }) => x.nome.toLowerCase();
  formatterFornecedor = (x: { nome: string }) => x.nome;
  formatterMotorista = (x: { nome: string }) => x.nome;
  formatterConferente = (x: { nome: string }) => x.nome;

  /* inputFormatter */
  inputFormatterCliente = (c: any) => c.nome;
  inputFormatterFornecedor = (f: any) => f.nome;
  inputFormatterItem = (i: any) => i.nome;

  verificaCliente(): void {
    if (
      this.searchFailedCliente === true &&
      this.clienteSelecionado != null &&
      this.clienteSelecionado.nome != null &&
      this.clienteSelecionado.nome.length >= 0
    ) {
      this.searchFailedCliente = false;
      this.clienteSelecionado = new ClienteDTO();
    }
  }
  verificaFornecedor(): void {
    if (
      this.searchFailedFornecedor === true &&
      this.fornecedorSelecionado != null &&
      this.fornecedorSelecionado.nome != null &&
      this.fornecedorSelecionado.nome.length >= 0
    ) {
      this.searchFailedFornecedor = false;
      this.fornecedorSelecionado = new FornecedorDTO();
    }
  }

  /* is */
  isCliente(): boolean {
    return this.movForm.controls.clienteDTO.value != null &&
      Object.prototype.hasOwnProperty.call(
        this.movForm.controls.clienteDTO.value,
        'id'
      ) &&
      Object.prototype.hasOwnProperty.call(
        this.movForm.controls.clienteDTO.value,
        'clienteStatusDTO'
      )
      ? true
      : false;
  }

  isMovimentoTipo(): boolean {
    return Object.prototype.hasOwnProperty.call(
      this.movimento,
      'movimentoTipoDTO'
    ) &&
      this.movimento.movimentoTipoDTO != null &&
      this.movimento.movimentoTipoDTO.id > 0
      ? true
      : false;
  }

  getValueFromForncedorDTOForm(): any {
    return this.movForm.controls.fornecedorDTO.value;
  }

  isFornecedor(): boolean {
    return this.movForm.controls.fornecedorDTO.value != null &&
      Object.prototype.hasOwnProperty.call(
        this.movForm.controls.fornecedorDTO.value,
        'id'
      ) &&
      Object.prototype.hasOwnProperty.call(
        this.movForm.controls.fornecedorDTO.value,
        'status'
      ) &&
      this.getValueFromForncedorDTOForm().status === true
      ? true
      : false;
  }

  isMotorista(): boolean {
    return this.movimento.motoristaDTO != null &&
      Object.prototype.hasOwnProperty.call(this.movimento.motoristaDTO, 'id') &&
      Object.prototype.hasOwnProperty.call(
        this.movimento.motoristaDTO,
        'status'
      ) &&
      this.movimento.motoristaDTO.status === true
      ? true
      : false;
  }

  isConferente(): boolean {
    return this.movimento.conferenteDTO != null &&
      Object.prototype.hasOwnProperty.call(
        this.movimento.conferenteDTO,
        'id'
      ) &&
      Object.prototype.hasOwnProperty.call(
        this.movimento.conferenteDTO,
        'status'
      ) &&
      this.movimento.conferenteDTO.status === true
      ? true
      : false;
  }

  /* Serach Observable */
  searchItem = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => (this.searchingItem = true)),
      switchMap((term) =>
        this._itemService.findByName(term).pipe(
          tap(() => (this.searchFailedItem = false)),
          catchError(() => {
            this.searchFailedItem = true;
            return of([]);
          })
        )
      ),
      tap(() => (this.searchingItem = false))
    );

  searchCliente = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => (this.searchingCliente = true)),
      switchMap((term) =>
        this._clienteService.findByNameResumo(term).pipe(
          tap(() => (this.searchFailedCliente = false)),
          catchError(() => {
            this.searchFailedCliente = true;
            return of([]);
          })
        )
      ),
      tap(() => (this.searchingCliente = false))
    );

  searchFornecedor = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => (this.searchingFornecedor = true)),
      switchMap((term) =>
        this._fornecedorService.findByName(term).pipe(
          tap(() => (this.searchFailedFornecedor = false)),
          catchError(() => {
            this.searchFailedFornecedor = true;
            return of([]);
          })
        )
      ),
      tap(() => (this.searchingFornecedor = false))
    );

  searchConferente = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => (this.searchingConferente = true)),
      switchMap((term) =>
        this._funcionarioService.getConferenteByName(term).pipe(
          tap(() => (this.searchFailedConferente = false)),
          catchError(() => {
            this.searchFailedConferente = true;
            return of([]);
          })
        )
      ),
      tap(() => (this.searchingConferente = false))
    );

  searchMotorista = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => (this.searchingMotorista = true)),
      switchMap((term) =>
        this._funcionarioService.getMotoristaByName(term).pipe(
          tap(() => (this.searchFailedMotorista = false)),
          catchError(() => {
            this.searchFailedMotorista = true;
            return of([]);
          })
        )
      ),
      tap(() => (this.searchingMotorista = false))
    );

  onDeleta(id: number): void {
    const activeModal = this._modalService.open(
      AppMovimentoModalConfirmComponent
    );
    activeModal.componentInstance.modalHeader = 'Confirme a exclusão';
    activeModal.componentInstance.modalContent = 'Deseja realmente excluir ?';
    activeModal.componentInstance.modalType = 'confirm';
    activeModal.componentInstance.defaultLabel = 'Não';
    activeModal.result.then(
      (result) => {
        if (result === 'confirm') {
          let message = '';
          this._movimentoService.del(id).subscribe({
            next: (resp: any) => {
              message = resp.message;
              this.pop('success', 'Sucesso', message);
              this.onLimpa();
              this.cdr.detectChanges();
            },
            error: (err) => {
              message = err.message;
              this.pop('error', 'Erro', message);
              this.cdr.detectChanges();
            },
          });
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }

  convertDate(inputFormat: any, dia: any) {
    function pad(s: number) {
      return s < 10 ? '0' + s : s;
    }
    const d = new Date(inputFormat);
    return [
      d.getFullYear(),
      pad(d.getMonth() + 1),
      pad(d.getDate() + dia),
    ].join('-');
  }

  onPesquisa(event?: any): void {
    if (event != null) {
      event.srcElement.blur();
      event.preventDefault();
    }

    const mov = this.formToDTO(this.movForm.getRawValue());
    // console.log(mov);
    this.movimentoPesquisaDTO.movimentoDTO = mov;
    this.pesquisaMovimento(this.movimentoPesquisaDTO);
  }

  getValueFromControlEstoqueAlmoxarifadoDTO(): any {
    return this.movForm.controls.estoqueAlmoxarifadoDTO.value;
  }

  isActiveAlx(): boolean {
    if (
      this.movForm.controls.estoqueAlmoxarifadoDTO.value != null &&
      this.getValueFromControlEstoqueAlmoxarifadoDTO().id != null &&
      this.getValueFromControlEstoqueAlmoxarifadoDTO().id > 0
    ) {
      return true;
    } else {
      return false;
    }
  }

  isItemProcura(): boolean {
    if (
      this.itemProcura != null &&
      this.itemProcura.id != null &&
      this.itemProcura.itemUnidadeDTOs != null &&
      this.itemProcura.itemUnidadeDTOs.length > 0 &&
      this.itemProcura.id > 0
    ) {
      return true;
    } else {
      return false;
    }
  }

  pesquisaMovimento(movPesquisa: MovimentoPesquisaDTO): void {
    this.selected = [];

    this.loading = true;

    console.log(movPesquisa);

    this.spinner.show();
    this._movimentoService.find2(movPesquisa).subscribe({
      next: (data) => {
        this.spinner.hide();

        this.pageMovimento = data;
        //console.log(this.pageMovimento);

        if (this.pageMovimento.content.length === 0) {
          this.pop(
            'error',
            'Pesquisa',
            'Não foi encontrado nada com essa pesquisa.'
          );
        } else if (this.pageMovimento.content.length === 1) {
          this.editando(this.pageMovimento.content[0].id);
        } else {
          this.statusForm = 3;
          // this.setaColumns(this.pageMovimento.content);
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log(err);
        this.spinner.hide();
        this.cdr.detectChanges();
      },
    });
  }

  geraCSV(): void {
    this.botaoGeraCSV = 'Gerando CSV';
    this._movimentoService.geraCSV(this.movimentoPesquisaDTO).subscribe(
      (data) => {
        this.cdr.detectChanges();
        // console.log(data);
        // console.log('realizando download do arquivo');
        const fileName = data.fileName;
        this.botaoGeraCSV = 'Gerando! Baixando CSV';
        this._movimentoService.donwloadCSV(data.id).subscribe(
          (respData) => {
            this.cdr.detectChanges();
            // console.log('subscribe');
            // console.log(data);
            // console.log(respData);
            this.botaoGeraCSV = 'Gerar CSV';
            const dataBlob = [respData];
            const file = new Blob(dataBlob, {
              type: 'text/plain;charset=utf-8',
            });
            importedSaveAs(file, fileName);
            // var fileUrl = window.URL.createObjectURL(file);

            // console.log('abrindo janela');

            // window.open(fileUrl);

            // console.log(fileUrl);
            this.cdr.detectChanges();
          },
          (err) => {
            this.botaoGeraCSV = 'Gerar CSV';
            // console.log(err);
            this.cdr.detectChanges();
          }
        );
      },
      (err) => {
        this.botaoGeraCSV = 'Gerar CSV';
        this.cdr.detectChanges();
        // console.log(err);
      }
    );
  }

  openUrl(): void {
    window.open();
  }

  downloadCSV(id: number): void {
    this._movimentoService.donwloadCSV(id).subscribe(
      (data) => {
        this.cdr.detectChanges();
        // console.log(data);
      },
      (err) => {
        // console.log(err);
      }
    );
  }
  downloadZip(id: number): void {
    // console.log('realizando download do arquivo');
    this._movimentoService.donwloadCSV(id).subscribe(
      (data) => {
        // console.log('subscribe');
        // console.log(data);
        const file = new Blob([data], { type: 'text/csv' });

        const fileUrl = window.URL.createObjectURL(file);

        // console.log('abrindo janela');

        window.open(fileUrl);

        // console.log(fileUrl);
        this.cdr.detectChanges();
      },
      (err) => {
        // console.log(err);
      }
    );
  }

  setPage(pageInfo: any) {
    // console.log(pageInfo);
    this.movimentoPesquisaDTO.pageSize = pageInfo.pageSize;
    this.movimentoPesquisaDTO.pageNumber = pageInfo.offset;
    this.pesquisaMovimento(this.movimentoPesquisaDTO);
  }

  nextCadastra(formRawValue: any): void {
    this.itemForm.enable();

    const mov = this.formToDTO(formRawValue);
    console.log(formRawValue);
    console.log(mov);

    // hardcode for movimento completo
    const flt = this.movimentoOrigens.filter((mor) => {
      return mor.id === 1;
    });

    if (flt.length > 0) {
      mov.movimentoOrigemDTO = flt[0];
    }

    mov.movimentoItemDTOs = [...this.movimento.movimentoItemDTOs];

    this.spinner.show();
    this._movimentoService.postOrPut(mov, this.statusForm).subscribe({
      next: (data) => {
        this.spinner.hide();
        this.setaMovimento(data);
        this.statusForm = 2;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.spinner.hide();
        console.log(err);
        if (err.status != 400) {
          this.mensagemAlerta(
            'Atenção',
            `Erro ao salvar movimento, contate o administrador`,
            'error'
          );
        }
      },
    });
  }

  onCadastra(): void {
    this.submitted = true;
    this.itemForm.disable();
    const formRawValue = this.movForm.getRawValue();

    if (this.movForm.invalid) {
      console.log(this.getFormValidationErrorsV2(this.movForm));
      this.itemForm.enable();
      // console.log(this.getFormValidationErrorsV2(this.pedidoForm));
      // console.log(this.getFormValidationErrorsV2(formCliente));
      this.mensagemAlerta(
        'Atenção',
        `Existe campos que ainda precisam ser preenchidos`,
        'error'
      );
    } else {
      if (formRawValue.indAtivo === false) {
        const activeModal = this._modalService.open(
          AppMovimentoModalConfirmComponent
        );
        activeModal.componentInstance.modalHeader = 'Confirme a alteração';
        activeModal.componentInstance.modalContent =
          'Deseja realmente salvar o movimento desativado?';
        activeModal.componentInstance.modalType = 'confirm';
        activeModal.componentInstance.defaultLabel = 'Não';
        activeModal.result.then(
          (result) => {
            if (result === 'confirm') {
              this.nextCadastra(formRawValue);
            }
          },
          (error) => {
            console.log(error);
          }
        );
      } else {
        this.nextCadastra(formRawValue);
      }
    }
  }

  getFormValidationErrorsV2(form: FormGroup) {
    const result: any[] = [];
    Object.keys(form.controls).forEach((key) => {
      const controlErrors: ValidationErrors | null = form.get(key)!.errors;
      if (controlErrors) {
        Object.keys(controlErrors).forEach((keyError) => {
          result.push({
            control: key,
            error: keyError,
            value: controlErrors[keyError],
          });
        });
      }
    });

    return result;
  }

  formToDTO(rawValue: any): MovimentoDTO {
    const mov = new MovimentoDTO();
    mov.id = rawValue.id;
    mov.clienteDTO = rawValue.clienteDTO;
    mov.conferenteDTO = rawValue.conferenteDTO;
    mov.descricao = rawValue.descricao;
    mov.estoqueAlmoxarifadoDTO = rawValue.estoqueAlmoxarifadoDTO;
    mov.fornecedorDTO = rawValue.fornecedorDTO;
    mov.indAtivo = rawValue.indAtivo;
    mov.motoristaDTO = rawValue.motoristaDTO;
    mov.movimentoOrigemDTO = rawValue.movimentoOrigemDTO;
    mov.movimentoTipoDTO = rawValue.movimentoTipoDTO;
    mov.numNotaFiscal = rawValue.numNotaFiscal;
    mov.preVendaId = rawValue.preVendaId;
    mov.rotaId = rawValue.rotaId;
    mov.veiculoDTO = rawValue.veiculoDTO;

    mov.movimentoItemDTOs = [];

    return mov;
  }

  dtoToForm(mov: MovimentoDTO): void {
    this.movForm.patchValue({
      id: mov.id,
      numNotaFiscal: mov.numNotaFiscal,

      dtaInclusao: mov.dtaInclusao,
      usuarioInclusao: mov.usuarioInclusao,

      preVendaId: mov.preVendaId,
      rotaId: mov.rotaId,

      clienteId: mov.clienteDTO?.id,

      fornecedorId: mov.fornecedorDTO?.id,

      movimentoOrigemDTO: mov.movimentoOrigemDTO,
      movimentoTipoDTO: mov.movimentoTipoDTO,
      estoqueAlmoxarifadoDTO: mov.estoqueAlmoxarifadoDTO,

      veiculoDTO: mov.veiculoDTO,
      motoristaDTO: mov.motoristaDTO,
      conferenteDTO: mov.conferenteDTO,
      clienteDTO: mov.clienteDTO,
      fornecedorDTO: mov.fornecedorDTO,

      descricao: mov.descricao,

      indAtivo: mov.indAtivo,
    });
  }

  verificaEntidadesMovimento(movimento: MovimentoDTO): MovimentoDTO {
    if (movimento.motoristaDTO == null) {
      movimento.motoristaDTO = new FuncionarioDTO();
    }
    if (movimento.conferenteDTO == null) {
      movimento.conferenteDTO = new FuncionarioDTO();
    }
    if (movimento.clienteDTO == null) {
      movimento.clienteDTO = new ClienteDTO();
    }
    if (movimento.fornecedorDTO == null) {
      movimento.fornecedorDTO = new FornecedorDTO();
    }
    return movimento;
  }

  mensagemAlerta(titulo: string, content: string, type: string): void {
    const activeModal = this._modalService.open(
      AppMovimentoModalConfirmComponent
    );
    activeModal.componentInstance.modalHeader = titulo;
    activeModal.componentInstance.modalContent = content;
    activeModal.componentInstance.modalType = 'alert';
    activeModal.componentInstance.defaultLabel = 'Ok';
    activeModal.result.then(
      (result) => {
        console.log(result);
      },
      (error) => {
        console.log(error);
      }
    );
  }

  selectedItem(event: any) {
    this.itemForm.controls['itemId'].setValue(event.item.id);
    this.selectedItemId(null);

    // this._itemService.findById(event.item.id)
    //     .subscribe({
    //         next: data => {
    //             this.itemForm.controls.itemId.setValue(data.id);
    //             this.selectedItemId();
    //         },
    //         error: err => {
    //             this.pop('error', 'ERRO', 'Erro ao buscar o Item.');
    //             this.itemForm.controls.itemId.setValue(null);
    //             this.itemForm.controls.itemDTO.setValue(null);
    //             this.cdr.detectChanges();
    //         }
    //     });
    // .subscribe((resp: any) => {
    //     this.itemProcura = resp;
    //     this.itemForm.controls.itemId.setValue(resp.id);
    //
    // }, err => {
    //     this.pop('error', 'ERRO', 'Erro ao buscar o Item.');
    //     this.cdr.detectChanges();
    // });
  }

  selectedItemId(event: any): void {
    if (event != null) {
      event.srcElement.blur();
      event.preventDefault();
    }

    this.spinner.hide();
    const idItem = this.itemForm.controls['itemId'].value;
    if (idItem != null && idItem > 0) {
      this.spinner.show();
      this._itemService.findById(idItem).subscribe({
        next: (resp) => {
          this.spinner.hide();

          if (resp.movimentoBloqueado === true) {
            const activeModal = this._modalService.open(
              AppMovimentoModalConfirmComponent
            );
            activeModal.componentInstance.modalHeader = 'ATENÇAO';
            activeModal.componentInstance.modalContent =
              'O item ' +
              resp.nome +
              ' está bloqueado para lançamento de movimentos, contate o responsável';
            activeModal.componentInstance.modalType = 'error';
            activeModal.componentInstance.defaultLabel = 'Ok';
            activeModal.result.then(
              (result) => {
                this.itemForm.controls['itemDTO'].setValue(null);
              },
              (error) => {
                this.itemForm.controls['itemDTO'].setValue(null);
              }
            );
          } else {
            this.itemForm.controls['itemDTO'].setValue(resp);
            this.itemUnidadeDTOs = resp.itemUnidadeDTOs;

            const selUnidades = this.itemUnidadeDTOs.filter((u) => {
              return u.fator > 1;
            });

            if (selUnidades.length > 0) {
              this.itemForm.controls['itemUnidadeDTO'].setValue(selUnidades[0]);
              this.itemForm.controls['itemIdAux'].setValue(resp.idAux);
            }

            let alx: EstoqueAlmoxarifadoDTO | null;

            if (this.isActiveAlx()) {
              alx = this.movForm.controls.estoqueAlmoxarifadoDTO.value;
            } else {
              const sel = this.almoxarifados.filter((alxf) => {
                return alxf.id === 2;
              });
              if (sel.length > 0) {
                alx = sel[0];
              } else {
                alx = this.almoxarifados[0];
              }
            }

            this.getItemSaldoEstoque(alx!, idItem);
            this.itemUnidade!.nativeElement.focus();
          }
        },
        error: (err) => {
          this.spinner.hide();
          this.pop(
            'error',
            'ERRO',
            'Erro ao buscar o item, revise o codigo digitado'
          );
          this.itemForm.controls['itemDTO'].setValue(null);
          this.itemUnidadeDTOs = [];
          this.cdr.detectChanges();
        },
      });
    } else {
      this.spinner.hide();
      this.pop(
        'error',
        'Erro',
        'Digite um codigo válido e maior do que 0 para o Item'
      );
      this.itemNome?.nativeElement.focus();
    }
  }

  selectedItemIdAux(event: any): void {
    if (event != null) {
      event.srcElement.blur();
      event.preventDefault();
    }

    this.spinner.hide();
    const idItem = this.itemForm.controls['itemIdAux'].value;
    if (idItem != null && idItem > 0) {
      this.spinner.show();
      this._itemService.findByIdAux(idItem).subscribe({
        next: (resp) => {
          this.spinner.hide();

          ///console.log(resp);

          if (resp.length === 1) {
            this.selecionaItemModal(resp[0]);
          } else {
            const activeModal = this._modalService.open(
              ItemConfirmModalComponent
            );
            activeModal.componentInstance.itens = resp;

            activeModal.result.then(
              (result) => {
                //console.log(result);
                this.selecionaItemModal(result);
              },
              (error) => {
                console.log(error);
              }
            );
          }

          // const resul = resp[0];
        },
        error: (err) => {
          this.spinner.hide();
          this.pop(
            'error',
            'ERRO',
            'Erro ao buscar o item, revise o codigo digitado'
          );
          this.itemForm.controls['itemDTO'].setValue(null);
          this.itemUnidadeDTOs = [];
          this.cdr.detectChanges();
        },
      });
    } else {
      this.spinner.hide();
      this.pop(
        'error',
        'Erro',
        'Digite um codigo válido e maior do que 0 para o Item'
      );
      this.itemNome?.nativeElement.focus();
    }
  }

  selecionaItemModal(resul: ItemDTO): void {
    if (resul.movimentoBloqueado === true) {
      const activeModal = this._modalService.open(
        AppMovimentoModalConfirmComponent
      );
      activeModal.componentInstance.modalHeader = 'ATENÇAO';
      activeModal.componentInstance.modalContent =
        'O item ' +
        resul.nome +
        ' está bloqueado para lançamento de movimentos, contate o responsável';
      activeModal.componentInstance.modalType = 'error';
      activeModal.componentInstance.defaultLabel = 'Ok';
      activeModal.result.then(
        (result) => {
          this.itemForm.controls['itemDTO'].setValue(null);
        },
        (error) => {
          this.itemForm.controls['itemDTO'].setValue(null);
        }
      );
    } else {
      this.itemForm.controls['itemDTO'].setValue(resul);
      this.itemUnidadeDTOs = resul.itemUnidadeDTOs;

      const selUnidades = this.itemUnidadeDTOs.filter((u) => {
        return u.fator > 1;
      });

      if (selUnidades.length > 0) {
        this.itemForm.controls['itemUnidadeDTO'].setValue(selUnidades[0]);
        this.itemForm.controls['itemId'].setValue(resul.id);
      }

      let alx: EstoqueAlmoxarifadoDTO | null;

      if (this.isActiveAlx()) {
        alx = this.movForm.controls.estoqueAlmoxarifadoDTO.value;
      } else {
        const sel = this.almoxarifados.filter((alxf) => {
          return alxf.id === 2;
        });
        if (sel.length > 0) {
          alx = sel[0];
        } else {
          alx = this.almoxarifados[0];
        }
      }

      this.getItemSaldoEstoque(alx!, resul.id);
      this.itemUnidade!.nativeElement.focus();
    }
  }

  selectedFornecedor(event: any): void {
    this._fornecedorService.findById(event.item.id).subscribe({
      next: (data) => {
        this.setFornecedor(data);
      },
      error: (err) => {
        this.pop('error', 'Erro', 'Erro ao buscar o Fornecedor por typeahead');
        this.cdr.detectChanges();
      },
    });
    // .subscribe((data) => {
    //     this.setFornecedor(data);
    //     this.cdr.detectChanges();
    // }, (err) => {
    //     this.pop('error', 'Erro', 'Erro ao buscar o Fornecedor por typeahead');
    //     this.cdr.detectChanges();
    // });
  }
  selectFornecedorByCod(event?: any): void {
    if (event != null) {
      event.srcElement.blur();
      event.preventDefault();
    }

    const cod = this.movForm.controls.fornecedorId.value;
    if (cod != null && cod > 0) {
      this.spinner.show();
      this._fornecedorService.findById(cod).subscribe({
        next: (data) => {
          this.spinner.hide();
          this.setFornecedor(data);
        },
        error: (err) => {
          this.spinner.hide();
          this.movForm.controls.fornecedorDTO.setValue(null);
          this.pop(
            'error',
            'Erro',
            'Erro ao buscar o Fornecedor por esse codigo'
          );
          this.cdr.detectChanges();
        },
      });
    } else {
      this.pop(
        'error',
        'Erro',
        'Digite um codigo válido e maior do que 0 para o Fornecedor'
      );
      this.fornecedorId?.nativeElement.focus();
    }
  }
  selectMotoristaByCod(cod: number): void {
    if (cod != null && cod > 0) {
      this._funcionarioService.getById(cod).subscribe(
        (data) => {
          this.setMotorista(data);
          this.cdr.detectChanges();
        },
        (err) => {
          this.pop(
            'error',
            'Erro',
            'Erro ao buscar o Motorista por esse codigo'
          );
          this.cdr.detectChanges();
        }
      );
    } else {
      this.pop(
        'error',
        'Erro',
        'Digite um codigo maior do que 0 para o Motorista'
      );
    }
  }

  selectConferenteByCod(cod: number): void {
    if (cod != null && cod > 0) {
      this._funcionarioService.getById(cod).subscribe(
        (data) => {
          this.setConferente(data);
          this.cdr.detectChanges();
        },
        (err) => {
          this.pop(
            'error',
            'Erro',
            'Erro ao buscar o Conferente por esse codigo'
          );
          this.cdr.detectChanges();
        }
      );
    } else {
      this.pop(
        'error',
        'Erro',
        'Digite um codigo maior do que 0 para o Conferente'
      );
    }
  }

  selectClienteByCod(event?: any): void {
    if (event != null) {
      event.srcElement.blur();
      event.preventDefault();
    }

    const cliId = this.movForm.controls.clienteId.value;
    if (cliId != null && cliId > 0) {
      this.spinner.show();
      this._clienteService.findById(cliId).subscribe({
        next: (data) => {
          this.spinner.hide();
          this.setCliente(data);
        },
        error: (err) => {
          this.spinner.hide();
          this.pop('error', 'Erro', 'Erro ao buscar o cliente por esse codigo');
          this.movForm.controls.clienteDTO.setValue(null);
          this.cdr.detectChanges();
        },
      });
    } else {
      this.pop(
        'error',
        'Erro',
        'Digite um codigo válido e maior do que 0 para o Cliente'
      );
      this.clienteId?.nativeElement.focus();
    }
  }

  selectedCliente(event: any): void {
    this._clienteService.findById(event.item.id).subscribe({
      next: (data) => {
        this.setCliente(data);
      },
      error: (err) => {
        this.pop(
          'error',
          'Erro',
          'Erro ao buscar o cliente depois do typeahead'
        );
      },
    });

    // .subscribe((data) => {
    //     this.setCliente(data);
    //     this.cdr.detectChanges();
    // }, (err) => {
    //     this.pop('error', 'Erro', 'Erro ao buscar o cliente depois do typeahead');
    //     this.cdr.detectChanges();
    // });
  }

  typeaHeadSelectCliente(event: any): void {
    // console.log('print typeahead cliente');
    this.selectedCliente(event);
  }

  setCliente(cliente: ClienteDTO): void {
    if (cliente.clienteStatusDTO.clienteStatusLabelDTO!.isMovimentoBloqueado) {
      const activeModal = this._modalService.open(
        AppMovimentoModalConfirmComponent
      );
      activeModal.componentInstance.modalHeader = 'Atenção';
      activeModal.componentInstance.modalContent =
        'Cliente informado está bloqueado para lançamento de movimento';
      activeModal.componentInstance.modalType = 'error';
      activeModal.componentInstance.defaultLabel = 'Ok';
      activeModal.result.then(
        (result) => {
          this.movForm.controls.clienteDTO.setValue(null);
          this.cdr.detectChanges();
        },
        (error) => {
          this.movForm.controls.clienteDTO.setValue(null);
          this.cdr.detectChanges();
        }
      );
    } else {
      this.searchFailedCliente = false;
      this.movForm.controls.clienteDTO.setValue(cliente);
      this.movForm.controls.clienteId.setValue(cliente.id);
      this.cdr.detectChanges();
    }
  }

  setFornecedor(fornecedor: FornecedorDTO): void {
    if (!fornecedor.status) {
      const activeModal = this._modalService.open(
        AppMovimentoModalConfirmComponent
      );
      activeModal.componentInstance.modalHeader = 'Atenção';
      activeModal.componentInstance.modalContent =
        'Fornecedor informado está inativo';
      activeModal.componentInstance.modalType = 'error';
      activeModal.componentInstance.defaultLabel = 'Ok';
      activeModal.result.then(
        (result) => {
          this.movForm.controls.fornecedorDTO.setValue(null);
          this.cdr.detectChanges();
        },
        (error) => {
          this.movForm.controls.fornecedorDTO.setValue(null);
          this.cdr.detectChanges();
        }
      );
    } else {
      this.searchFailedFornecedor = false;
      this.movForm.controls.fornecedorDTO.setValue(fornecedor);
      this.movForm.controls.fornecedorId.setValue(fornecedor.id);
      this.cdr.detectChanges();
    }
  }

  setMotorista(funcionario: FuncionarioDTO): void {
    if (!funcionario.status) {
      const activeModal = this._modalService.open(
        AppMovimentoModalConfirmComponent
      );
      activeModal.componentInstance.modalHeader = 'Atenção';
      activeModal.componentInstance.modalContent =
        'Motorista informado está inativo';
      activeModal.componentInstance.modalType = 'error';
      activeModal.componentInstance.defaultLabel = 'Ok';
      activeModal.result.then(
        (result) => {
          this.resetaMotorista();
          this.cdr.detectChanges();
        },
        (error) => {
          this.resetaMotorista();
          this.cdr.detectChanges();
        }
      );
    } else if (!funcionario.indMotorista) {
      const activeModal = this._modalService.open(
        AppMovimentoModalConfirmComponent
      );
      activeModal.componentInstance.modalHeader = 'Atenção';
      activeModal.componentInstance.modalContent =
        'Funcionario informado não está configurado como motorista';
      activeModal.componentInstance.modalType = 'error';
      activeModal.componentInstance.defaultLabel = 'Ok';
      activeModal.result.then(
        (result) => {
          this.resetaMotorista();
          this.cdr.detectChanges();
        },
        (error) => {
          this.resetaMotorista();
          this.cdr.detectChanges();
        }
      );
    } else {
      this.movimento.motoristaDTO = funcionario;
      this.cdr.detectChanges();
    }
  }

  setConferente(funcionario: FuncionarioDTO): void {
    if (!funcionario.status) {
      const activeModal = this._modalService.open(
        AppMovimentoModalConfirmComponent
      );
      activeModal.componentInstance.modalHeader = 'Atenção';
      activeModal.componentInstance.modalContent =
        'Conferente informado está inativo';
      activeModal.componentInstance.modalType = 'error';
      activeModal.componentInstance.defaultLabel = 'Ok';
      activeModal.result.then(
        (result) => {
          this.resetaConferente();
          this.cdr.detectChanges();
        },
        (error) => {
          this.resetaConferente();
          this.cdr.detectChanges();
        }
      );
    } else if (!funcionario.indConferente) {
      const activeModal = this._modalService.open(
        AppMovimentoModalConfirmComponent
      );
      activeModal.componentInstance.modalHeader = 'Atenção';
      activeModal.componentInstance.modalContent =
        'Funcionario informado não está configurado como conferente';
      activeModal.componentInstance.modalType = 'error';
      activeModal.componentInstance.defaultLabel = 'Ok';
      activeModal.result.then(
        (result) => {
          this.resetaConferente();
          this.cdr.detectChanges();
        },
        (error) => {
          this.resetaConferente();
          this.cdr.detectChanges();
        }
      );
    } else {
      this.movimento.conferenteDTO = funcionario;
      this.cdr.detectChanges();
    }
  }

  resetaFornecedor(): void {
    this.movimento.fornecedorDTO = null;
    this.movForm.controls.fornecedorDTO.setValue(null);
    this.movForm.controls.fornecedorId.setValue(null);
  }
  resetaMotorista(): void {
    this.movimento.motoristaDTO = null;
  }
  resetaConferente(): void {
    this.movimento.conferenteDTO = null;
  }
  resetaCliente(): void {
    this.movimento.clienteDTO = null;
    this.movForm.controls.clienteDTO.setValue(null);
    this.movForm.controls.clienteId.setValue(null);
  }

  getItemSaldoEstoque(
    estoqueAlmoxarifadoDTO: EstoqueAlmoxarifadoDTO,
    idItem: number
  ): void {
    this._itemService
      .getItemSaldoEstoque(estoqueAlmoxarifadoDTO.id, idItem)
      .subscribe({
        next: (data) => {
          const item: ItemDTO = this.itemForm.controls['itemDTO'].value;

          item.qtdEntrada = data.qtdEntrada;
          item.qtdSaida = data.qtdSaida;
          item.qtdSaldo = data.qtdSaldo;

          this.itemForm.controls['itemDTO'].setValue(item);
          this.itemForm.controls['saldo'].setValue(data.qtdSaldo);

          this.cdr.detectChanges();
        },
      });
  }

  onChangeAlmoxarifado(alx: any): void {
    this.onLimpaMovimentoItem();
    this.cdr.detectChanges();
  }

  getRowClass(row: any) {
    return {
      'datatable-row-class': 1 === 1,
    };
  }
  voltar(): void {
    if (this.statusForm === 2) {
      this.statusForm = 2;
    } else {
      this.statusForm = 1;
    }
  }
  editando(id?: number): void {
    let movId = 0;
    if (id != null && id > 0) {
      movId = id;
    } else {
      movId = this.selected[0].id;
    }
    this.spinner.show();
    this._movimentoService.findById(movId).subscribe({
      next: (data) => {
        this.spinner.hide();
        this.setaMovimento(data);
        this.statusForm = 2;
        this.movForm.controls.id.disable();
        this.movForm.controls.movimentoOrigemDTO.disable();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.spinner.hide();
        this.mensagemAlerta(
          'Erro - Atenção',
          `Erro ao buscar o movimento, contate o administrador`,
          'error'
        );
      },
    });
  }

  setaMovimento(movimento: MovimentoDTO): void {
    this.movimento = movimento;
    this.movimento.movimentoItemDTOs = this.movimento.movimentoItemDTOs.sort(
      (obj1, obj2) => {
        if (obj1.ordemInclusaoTimestamp > obj2.ordemInclusaoTimestamp) {
          return 1;
        }
        if (obj1.ordemInclusaoTimestamp < obj2.ordemInclusaoTimestamp) {
          return -1;
        }
        return 0;
      }
    );

    this.movimento.movimentoItemDTOs = [...this.movimento.movimentoItemDTOs];
    this.dtoToForm(this.movimento);
    this.cdr.detectChanges();
  }

  onLimpa(): void {
    this.limpa();
    this.cdr.detectChanges();
    this.movId!.nativeElement.focus();
  }
  limpa() {
    this.iniciaObjs();
    this.statusForm = 1;
    this.selected = [];
    this.onResetForm();
  }

  openPrintPage(): void {
    const id = new Date().getTime();

    this._movimentoService
      .storageSet(id.toString(), { id: 'movimento', data: this.movimento })
      .subscribe({
        next: (resp) => {
          console.log(resp);
          console.log('Deu tudo certo, vamos imprimir');
          const hrefFull =
            this._movimentoService.hrefContext() +
            'print/movimento/' +
            id.toString();
          this.router.navigate([]).then((result) => {
            window.open(hrefFull, '_blank');
          });
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.log(error);
          this.pop(
            'error',
            'Erro ao tentar imprimir, contate o administrador',
            ''
          );
          console.log(
            'Erro ao tentar imprimir, contate o administrador, não salvou no indexdDB'
          );
          this.cdr.detectChanges();
        },
      });
  }
  onLeftArray(): void {
    if (this.statusForm === 2) {
      for (let i = 0; i < this.pageMovimento.content.length; i++) {
        if (this.movimento.id === this.pageMovimento.content[i].id) {
          if (i - 1 >= 0) {
            this.selected = [];
            const mov = this.pageMovimento.content[i - 1];
            this.editando(mov.id);
            i = this.pageMovimento.content.length + 1;
          }
        }
      }
    }
  }

  onRightArray(): void {
    if (this.statusForm === 2) {
      for (let i = 0; i < this.pageMovimento.content.length; i++) {
        if (this.movimento.id === this.pageMovimento.content[i].id) {
          if (i + 1 < this.pageMovimento.content.length) {
            this.selected = [];
            const mov = this.pageMovimento.content[i + 1];
            this.editando(mov.id);
            i = this.pageMovimento.content.length + 1;
          }
        }
      }
    }
  }

  unsetSelected(): void {
    if (this.selected != null) {
      this.selected.splice(0, this.selected.length);
    }
    this.cdr.detectChanges();
  }

  onTable(): void {
    this.unsetSelected();
    if (this.pageMovimento != null && this.pageMovimento.content.length > 0) {
      this.statusForm = 3;
    } else {
      this.pop('error', 'Erro', 'Procure primeiro.');
    }
  }
  iniciaObjs(): void {
    this.movimento = new MovimentoDTO();
    this.movimento.movimentoItemDTOs = [];
    this.movimentoPesquisaDTO = new MovimentoPesquisaDTO();
    this.movimentoPesquisaDTO.dtaInicialPesquisa = this.convertDate(
      new Date(),
      0
    );
    this.movimentoPesquisaDTO.dtaFinalPesquisa = this.convertDate(
      new Date(),
      0
    );
  }
  addMovimentoItem(event?: any): void {
    // console.log('movimento item');

    if (event != null) {
      event.srcElement.blur();
      event.preventDefault();
    }

    this.submittedItem = true;

    if (this.itemForm.invalid) {
      // console.log(this.getFormValidationErrorsV2(this.pedidoForm));
      // console.log(this.getFormValidationErrorsV2(formCliente));
      this.mensagemAlerta(
        'Atenção',
        `Existe campos do item que ainda precisam ser preenchidos`,
        'error'
      );
    } else {
      const itemDTO: ItemDTO = this.itemForm.controls['itemDTO'].value;
      const itemUnidadeDTO: ItemUnidadeDTO =
        this.itemForm.controls['itemUnidadeDTO'].value;
      const indGeraPreco: boolean =
        this.itemForm.controls['indGeraPreco'].value;
      const indGeraEstoque: boolean =
        this.itemForm.controls['indGeraEstoque'].value;
      let valor: number = this.itemForm.controls['valor'].value;
      const qtd: number = this.itemForm.controls['qtd'].value;
      const valorMedioUnit: number =
        this.itemForm.controls['valorMedioUnit'].value;

      const buscaMovItem = this.movimento.movimentoItemDTOs.filter((mv) => {
        return (
          mv.itemDTO.id === itemDTO.id &&
          mv.itemUnidadeDTO!.id === itemUnidadeDTO!.id
        );
      });
      if (buscaMovItem.length > 0) {
        this.mensagemAlerta(
          'Erro - Atenção',
          `O item com essa unidade já foi adicionado`,
          'error'
        );
      } else if (
        indGeraPreco != null &&
        indGeraPreco === true &&
        (valor == null || valor === 0)
      ) {
        this.mensagemAlerta(
          'Erro - Atenção',
          `Para gerar preço de Custo o valor
                 do item deve ser diferente de 0.`,
          'error'
        );
      } else {
        if (valor == null || valor <= 0) {
          valor = 0;
        }

        const ordemInclusaoTimestamp: number = new Date().getTime();

        const movimentoItem = new MovimentoItemDTO();
        movimentoItem.id = null;
        movimentoItem.ordemInclusaoTimestamp = ordemInclusaoTimestamp;
        movimentoItem.dtaValidade = null;
        movimentoItem.fatorOriginal = itemUnidadeDTO.fator;
        movimentoItem.itemDTO = itemDTO;
        movimentoItem.indBaixaEndereco = null;
        movimentoItem.indGeraEstoque = indGeraEstoque;
        movimentoItem.indGeraPreco = indGeraPreco;
        movimentoItem.indGeraValidade = null;
        movimentoItem.itemUnidadeDTO = itemUnidadeDTO;
        movimentoItem.numNotaFiscalItem = null;
        movimentoItem.qtd = qtd;
        movimentoItem.qtdConvertido = qtd * itemUnidadeDTO.fator;
        movimentoItem.valor = valor;
        movimentoItem.valorUnitario = this.getVlrMedio();
        movimentoItem.vlrMedio = this.getVlrMedio();

        this.movimento.movimentoItemDTOs.push(movimentoItem);

        this.movimento.movimentoItemDTOs =
          this.movimento.movimentoItemDTOs.sort((obj1, obj2) => {
            if (obj1.ordemInclusaoTimestamp > obj2.ordemInclusaoTimestamp) {
              return 1;
            }
            if (obj1.ordemInclusaoTimestamp < obj2.ordemInclusaoTimestamp) {
              return -1;
            }
            return 0;
          });

        this.movimento.movimentoItemDTOs = [
          ...this.movimento.movimentoItemDTOs,
        ];
        this.onLimpaMovimentoItem();
        //this.inputIdCodItem.nativeElement.focus();
        this.cdr.detectChanges();
      }
    }
  }

  onLimpaMovimentoItem(): void {
    this.submittedItem = false;
    this.itemUnidadeDTOs = [];
    this.onResetItemForm();
    this.itemId?.nativeElement.focus();
  }

  onResetItemForm(): void {
    this.itemForm.reset();
    this.itemForm.enable();
    this.itemForm.controls['saldo'].setValue(0);
    this.itemForm.controls['saldo'].disable();
    this.itemForm.controls['valorMedioUnit'].setValue(0);
    this.itemForm.controls['valorMedioUnit'].disable();
    this.itemForm.controls['valor'].setValue(0);
    this.itemForm.controls['indGeraEstoque'].setValue(true);
  }

  onDeletaMovimentoItem(row: MovimentoItemDTO): void {
    const activeModal = this._modalService.open(
      AppMovimentoModalConfirmComponent
    );
    activeModal.componentInstance.modalHeader = 'Confirme a exclusão';
    activeModal.componentInstance.modalContent =
      'Deseja realmente excluir o item ?';
    activeModal.componentInstance.modalType = 'confirm';
    activeModal.componentInstance.defaultLabel = 'Não';
    activeModal.result.then(
      (result) => {
        if (result === 'confirm') {
          for (let i = 0; i < this.movimento.movimentoItemDTOs.length; i++) {
            if (
              this.movimento.movimentoItemDTOs[i].itemDTO.id ===
                row.itemDTO.id &&
              this.movimento.movimentoItemDTOs[i].itemUnidadeDTO!.id ===
                row.itemUnidadeDTO!.id
            ) {
              this.movimento.movimentoItemDTOs.splice(i, 1);
              i = this.movimento.movimentoItemDTOs.length + 1;
            }
          }
          this.movimento.movimentoItemDTOs = [
            ...this.movimento.movimentoItemDTOs,
          ];
          this.cdr.detectChanges();
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }

  buscaMovimentoTipos(): void {
    this._movimentoTipoService.getAllActive().subscribe(
      (resp) => {
        const dtaf = resp.filter((mt) => {
          return (
            mt.roleAcesso == null ||
            mt.roleAcesso.length === 0 ||
            this.currentUserSalesApp.user.authorityDTOs.filter((auth) => {
              return auth.name === mt.roleAcesso;
            }).length > 0
          );
        });

        this.movimentoTipos = dtaf.sort((d1, d2) => {
          if (d1.nome > d2.nome) {
            return 1;
          }
          if (d1.nome < d2.nome) {
            return -1;
          }
          return 0;
        });
        this.cdr.detectChanges();
      },
      (err) => {
        this.pop('error', 'Erro', 'Erro ao buscar tipos de movimento');
      }
    );
  }

  compareUnidade(c1: ItemUnidadeDTO, c2: ItemUnidadeDTO): boolean {
    return c1 && c2 ? c1.id === c2.id : c1 === c2;
  }

  compareMovimentoOrigem(
    c1: MovimentoOrigemDTO,
    c2: MovimentoOrigemDTO
  ): boolean {
    return c1 && c2 ? c1.id === c2.id : c1 === c2;
  }

  compareUsuarios(u1: UserDTO, u2: UserDTO): boolean {
    return u1 && u2 ? u1.login === u2.login : u1 === u2;
  }

  buscaVeiculos(): void {
    this._veiculoService.getAllActive().subscribe(
      (data) => {
        data = data.sort((obj1, obj2) => {
          if (obj1.nome > obj2.nome) {
            return 1;
          }
          if (obj1.nome < obj2.nome) {
            return -1;
          }
          return 0;
        });

        this.veiculos = data;
        this.cdr.detectChanges();
      },
      (err) => {
        this.pop('error', 'Erro', 'Erro ao buscar veiculos');
      }
    );
  }

  buscaMovimentoOrigens(): void {
    this._movimentoService.getAllMovimentoOrigens().subscribe(
      (data: MovimentoOrigemDTO[]) => {
        data = data.sort((obj1, obj2) => {
          if (obj1.nome > obj2.nome) {
            return 1;
          }
          if (obj1.nome < obj2.nome) {
            return -1;
          }
          return 0;
        });

        this.movimentoOrigens = data;
        this.cdr.detectChanges();
      },
      (err) => {
        this.pop('error', 'Erro', 'Erro ao buscar origem de movimentos');
      }
    );
  }

  buscaMotoristas(): void {
    this._funcionarioService.getAllActiveMotoristas().subscribe(
      (data) => {
        data = data.sort((obj1, obj2) => {
          if (obj1.nome > obj2.nome) {
            return 1;
          }
          if (obj1.nome < obj2.nome) {
            return -1;
          }
          return 0;
        });

        this.motoristas = data;
        this.cdr.detectChanges();
      },
      (err) => {
        this.pop('error', 'Erro', 'Erro ao buscar os almoxarifados');
      }
    );
  }

  buscaConferentes(): void {
    this._funcionarioService.getAllActiveConferente().subscribe(
      (data) => {
        data = data.sort((obj1, obj2) => {
          if (obj1.nome > obj2.nome) {
            return 1;
          }
          if (obj1.nome < obj2.nome) {
            return -1;
          }
          return 0;
        });

        this.conferentes = data;
        this.cdr.detectChanges();
      },
      (err) => {
        this.pop('error', 'Erro', 'Erro ao buscar os almoxarifados');
      }
    );
  }

  buscaAlmoxarifados(): void {
    this._estoqueAlmoxarifadoService.getAllActive().subscribe(
      (data) => {
        // let dtaf = data.filter(alx => {
        //     return alx.roleAcesso == null || alx.roleAcesso.length === 0 ||
        //         this.currentUserSalesApp.user.authorityDTOs.filter(auth => {
        //             return auth.name === alx.roleAcesso;
        //         }).length > 0;
        // });

        // dtaf = dtaf.sort((obj1, obj2) => {
        //     if (obj1.nome > obj2.nome) {
        //         return 1;
        //     }
        //     if (obj1.nome < obj2.nome) {
        //         return -1;
        //     }
        //     return 0;
        // });

        this.almoxarifados = data;
      },
      (err) => {
        this.pop('error', 'Erro', 'Erro ao buscar os almoxarifados');
      }
    );
  }

  buscaUsuarios(): void {
    this._usuarioService.getUsers().subscribe(
      (data) => {
        data = data.sort((obj1, obj2) => {
          if (obj1.login > obj2.login) {
            return 1;
          }
          if (obj1.login < obj2.login) {
            return -1;
          }
          return 0;
        });

        this.usuarios = data;
        this.cdr.detectChanges();
      },
      (err) => {
        this.pop('error', 'Erro', 'Erro ao buscar os usuários');
      }
    );
  }
  atualizaMotoristas(): void {
    this.buscaMotoristas();
  }

  atualizaConferentes(): void {
    this.buscaConferentes();
  }

  atualizaUsuarios(): void {
    this.buscaUsuarios();
  }

  atualizaMovimentoTipo(): void {
    this.buscaMovimentoTipos();
  }

  atualizaVeiculo(): void {
    this.buscaVeiculos();
  }

  atualizaAlmoxarifados(): void {
    this.buscaAlmoxarifados();
  }

  compareMovimentoTipo(c1: MovimentoTipoDTO, c2: MovimentoTipoDTO): boolean {
    return c1 && c2 ? c1.id === c2.id : c1 === c2;
  }

  compareVeiculo(c1: VeiculoDTO, c2: VeiculoDTO): boolean {
    return c1 && c2 ? c1.id === c2.id : c1 === c2;
  }

  compareFuncionario(f1: FuncionarioDTO, f2: FuncionarioDTO): boolean {
    return f1 && f2 ? f1.id === f2.id : f1 === f2;
  }

  compareAlmoxarifado(
    c1: EstoqueAlmoxarifadoDTO,
    c2: EstoqueAlmoxarifadoDTO
  ): boolean {
    return c1 && c2 ? c1.id === c2.id : c1 === c2;
  }

  onSelectMovimentoItem({ selected }: any) {
    this.selectedItemMovimento = selected[0];
  }
  onActivate(event: any) {
    if (
      event.type === 'dblclick' ||
      (event.type === 'keydown' && event.event.keyCode === 13)
    ) {
      this.editando();
    }
  }
}
