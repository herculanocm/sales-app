import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ChangeDetectorRef,
  ViewChild,
  ElementRef,
} from '@angular/core';
import {
  FormGroup,
  Validators,
  FormControl,
  ValidationErrors,
} from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DeviceDetectorService } from 'ngx-device-detector';
import { Observable, of, lastValueFrom } from 'rxjs';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  tap,
  switchMap,
} from 'rxjs/operators';
import { AppVendaModalClientePesqavComponent } from '../modals/app-venda-modal-cliente-pesqav/app-venda-modal-cliente-pesqav.component';
import { AppVendaModalClienteListComponent } from '../modals/app-venda-modal-cliente-list/app-venda-modal-cliente-list.component';
import { AppVendaModalItemPesqavComponent } from '../modals/app-venda-modal-item-pesqav/app-venda-modal-item-pesqav.component';
import { AppVendaModalAlertComponent } from '../modals/app-venda-modal-alert/app-venda-modal-alert.component';
import { ColumnMode, SelectionType } from '@swimlane/ngx-datatable';
import { NgxSpinnerService } from 'ngx-spinner';
import { MessageAlertList } from '../modals/app-venda-modal-alert-list/app-venda-modal-alert-list-utils';
import { AppVendaModalAlertListComponent } from '../modals/app-venda-modal-alert-list/app-venda-modal-alert-list.component';
import { NgSelectConfig } from '@ng-select/ng-select';
import { AppVendaModalConfirmComponent } from '../modals/app-venda-modal-confirm/app-venda-modal-confirm.component';
import { Router } from '@angular/router';
import { AppVendaModalConfirmJustComponent } from '../modals/app-venda-modal-confirm-just/app-venda-modal-confirm-just.component';
import moment from 'moment';
import 'moment/locale/pt-br';
import { AppVendaModalTitulosComponent } from '../modals/app-venda-modal-titulos/app-venda-modal-titulos.component';
import { AppVendaModalConfirmJust2Component } from '../modals/app-venda-modal-confirm-just2/app-venda-modal-confirm-just2.component';
import { AppVendaModalClienteTopItensComponent } from '../modals/app-venda-modal-cliente-topitens/app-venda-modal-cliente-topitens.component';
import { AppVendaModalCancelamentoComponent } from '../modals/app-venda-modal-cancelamento/app-venda-modal-cancelamento.component';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'environments/environment';
import {
  BodyPostIds,
  ControleTopItens,
  CurrentUserSalesAppAux,
  DeviceAccess,
  MsgDescontoAplicado,
  MsgValidacaoCliente,
  MsgValidacaoItem,
  MsgValorDigitado,
  PermitVendaServer,
  RequestServerJust,
} from '@modules/shared/models/generic';
import { ConfGeraisDTO } from '@modules/shared/models/configuracoes';
import { FuncionarioDTO } from '@modules/shared/models/funcionario';
import {
  EstoqueAlmoxarifadoDTO,
  ItemAlxDescontoDTO,
  ItemAlxPrecoDTO,
  ItemAlxVendDescontoDTO,
  ItemDTO,
  ItemPrecoDTO,
  ItemUnidadeDTO,
} from '@modules/shared/models/item';
import {
  ClienteDTO,
  ClienteDividaComproLimiteSaldoDTO,
  ClienteEnderecoDTO,
  ClienteVendedorDTO,
  MunicipioDTO,
  VendedorResumoDTO,
} from '@modules/shared/models/cliente';
import {
  FaturarVendaItemReturn,
  PageVenda,
  PesqVendaArrayBody,
  VendaDTO,
  VendaItemDTO,
  VendaPag,
  VendaPagina,
  VendaPesquisaDTO,
  VendaStatusLabelDTO,
  VendaStatusMotivoDTO,
} from '@modules/shared/models/venda';
import {
  ClienteService,
  CondicaoPagamentoService,
  ConfGeraisService,
  EstoqueAlmoxarifadoService,
  FuncionarioService,
  ItemService,
  LayoutService,
  VendaService,
} from '@modules/shared/services';
import { VendaConfirmModalComponent } from '../modals/venda-confirm-modal.component';
import { ModalVendasAlertComponent } from '../modal-alert/modal-alert.component';
import { CondicaoPagamentoDTO } from '@modules/shared/models/condicao-pagamento';
import { ModalRepreClientComponent } from '../modal-repre-client/modal-repre-client.component';
import { error } from 'console';
import { ModalFaturarMultiplasComponent } from '../modal-faturar-multiplas/modal-faturar-multiplas.component';

@Component({
  selector: 'app-venda',
  templateUrl: './venda.component.html',
  styleUrls: ['./venda.component.scss'],
})
export class VendaComponent implements OnInit, OnDestroy, AfterViewInit {
  ColumnMode = ColumnMode;
  intervalVenda: any;
  currentUserSalesApp: CurrentUserSalesAppAux = JSON.parse(
    sessionStorage.getItem('currentUserSalesApp')!
  );
  confGerais!: ConfGeraisDTO | undefined;
  vendedores!: FuncionarioDTO[] | undefined;
  vendedoresVisiveis!: FuncionarioDTO[];
  estoqueAlmoxarifados!: EstoqueAlmoxarifadoDTO[];
  estoqueAlmoxarifadoFiltrados: EstoqueAlmoxarifadoDTO[] = [];
  condicaoPagamentos!: CondicaoPagamentoDTO[] | undefined;
  condicaoPagamentosVisiveis!: CondicaoPagamentoDTO[];
  horaMask: any;
  cgcMask: any;
  statusForm!: number;
  deviceAcess!: DeviceAccess;
  permitVendaServer: PermitVendaServer;
  vendaStatusLabels!: VendaStatusLabelDTO[];
  vendaStatusMotivos!: VendaStatusMotivoDTO[];
  selectionTypeSingle = SelectionType.single;
  activeNav!: number;

  municipios: MunicipioDTO[] = [];

  vendaDTO!: VendaDTO;
  pageVenda!: PageVenda;
  vendaPesquisaDTO!: VendaPesquisaDTO;
  itemSelecionado!: ItemDTO;

  submitted!: boolean;
  submittedItem!: boolean;

  @ViewChild('condicaoPagId')
  condicaoPagId: ElementRef | undefined;

  @ViewChild('qtdItemInput')
  qtdItemInput: ElementRef | undefined;

  msgClienteJaConfigurado!: string;

  flgPesquisandoCliente!: number;
  flgPesquisandoItem!: number;
  flgPesquisandoEstoqueItem!: number;
  flgPesquisandoTopItens!: number;

  controleTopItens!: ControleTopItens;

  selectedItem: any[] = [];

  selected: any[] = [];
  selectedHistoricoStatus: any[] = [];

  // typeahead
  searchingCliente!: boolean;
  searchFailedCliente!: boolean;

  searchingClienteFantasia!: boolean;
  searchFailedClienteFantasia!: boolean;

  searchingItemNome!: boolean;
  searchFailedItemNome!: boolean;
  // typeahead

  /* formatter */
  formatterCliente = (x: { nome: string }) => x.nome;
  formatterFantasia = (x: { fantasia: string }) => x.fantasia;
  formatterItem = (x: { nome: string }) => x.nome;
  /* formatter */

  /* Serach Observable */
  searchCliente = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      tap(() => {
        this.searchingCliente = true;
      }),
      switchMap((term) =>
        this._clienteService.nodejsFindByName(term).pipe(
          tap(() => (this.searchFailedCliente = false)),
          catchError(() => {
            this.searchFailedCliente = true;
            return of([]);
          })
        )
      ),
      tap(() => {
        this.searchingCliente = false;
      })
    );

  searchClienteFantasia = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      tap(() => {
        this.searchingClienteFantasia = true;
      }),
      switchMap((term) =>
        this._clienteService.nodejsFindByFantasia(term).pipe(
          tap(() => (this.searchFailedClienteFantasia = false)),
          catchError(() => {
            this.searchFailedClienteFantasia = true;
            return of([]);
          })
        )
      ),
      tap(() => {
        this.searchingClienteFantasia = false;
      })
    );

  searchItemNome = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      tap(() => {
        this.searchingItemNome = true;
      }),
      switchMap((term) =>
        this._itemService.nodejsFindByName(term).pipe(
          tap(() => (this.searchFailedItemNome = false)),
          catchError(() => {
            this.searchFailedItemNome = true;
            return of([]);
          })
        )
      ),
      tap(() => {
        this.searchingItemNome = false;
      })
    );

  pedidoForm = new FormGroup({
    id: new FormControl<number | null>(null),
    codPreVenda: new FormControl<string | null>(''),
    estoqueAlmoxarifadoId: new FormControl<number | null>(
      null,
      Validators.required
    ),
    dtaInclusao: new FormControl<Date | null>(null),
    dtaEmissao: new FormControl<Date | string | null>(
      this.convertDate(new Date(), 0),
      [Validators.required]
    ),
    dtaValidade: new FormControl<Date | null>(null),
    dtaEntrega: new FormControl<Date | string | null>(
      null,
      Validators.required
    ),
    // dtaEntrega: new FormControl(this.addDayDateToString(new Date(), 1), Validators.required),
    // dtaEntrega: new FormControl((this.convertDate(new Date(), 1)) + 'T17:00:00', Validators.required),
    condicaoPagamento: new FormControl<CondicaoPagamentoDTO | null>(
      null,
      Validators.required
    ),
    vendedor: new FormControl<FuncionarioDTO | null>(null, Validators.required),
    status: new FormControl<VendaStatusLabelDTO | null>(null),
    enderecoEntrega: new FormControl<any | null>(null, Validators.required),

    logradouroEntrega: new FormControl<string | null>(''),
    cepEntrega: new FormControl<string | null>(''),
    numEntrega: new FormControl<number | null>(null),
    bairroEntrega: new FormControl<string | null>(''),
    municipioEntrega: new FormControl<string | null>(''),
    estadoEntrega: new FormControl<string | null>(''),

    latEntrega: new FormControl<string | null>(''),
    lngEntrega: new FormControl<string | null>(''),

    // status: new FormControl(null),

    vlrFrete: new FormControl<number | null>(0, Validators.min(0)),
    vlrDespAcessoria: new FormControl<number | null>(0, Validators.min(0)),
    vlrAcrescimoFixoCondicao: new FormControl<number | null>(
      0,
      Validators.min(0)
    ),
    vlrTotal: new FormControl<number | null>(0),
    vlrDescontoGeral: new FormControl<number | null>(0, Validators.min(0)),

    descricao: new FormControl<string | null>(''),

    cliente: new FormGroup({
      id: new FormControl<number | null>(null, Validators.required),
      cgc: new FormControl<string | null>(''),
      nomeTypeahead: new FormControl<string | null>(''),
      fantasiaTypeahead: new FormControl<string | null>(''),
    }),
    item: new FormGroup({
      id: new FormControl<number | null>(null),
      idAux: new FormControl<number | null>(null),
      nomeTypeahead: new FormControl<string | null>(''),
      agrupamento: new FormControl<string | null>(null),
      qtd: new FormControl<number | null>(null),
      vlr: new FormControl<number | null>(null),
      perc: new FormControl<number | null>(0),
      vlrAg: new FormControl<number | null>(0),
    }),
  });

  constructor(
    private _vendaService: VendaService,
    private _estoqueAlmoxarifado: EstoqueAlmoxarifadoService,
    private _confService: ConfGeraisService,
    private _funcionarioService: FuncionarioService,
    private _condicaoPagamentoService: CondicaoPagamentoService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef,
    private _deviceService: DeviceDetectorService,
    private _clienteService: ClienteService,
    private _itemService: ItemService,
    private _modalService: NgbModal,
    private spinner: NgxSpinnerService,
    private _configSelect: NgSelectConfig,
    private router: Router,
    private _pagesService: LayoutService,
  ) {
    // this.initDefaults();
    this.permitVendaServer = new PermitVendaServer();
    this.identyDevice();
    this._configSelect.notFoundText = 'Não foi Encontrado';
    // console.log(new Date().toISOString());
  }

  initDefaults(): void {
    this.horaMask = environment.horaMask;
    this.cgcMask = environment.cgcMask;
    this.submitted = false;
    this.submittedItem = false;
    this.statusForm = 1;
    this.flgPesquisandoCliente = 0;
    this.flgPesquisandoItem = 0;
    this.flgPesquisandoEstoqueItem = 0;
    this.flgPesquisandoTopItens = 0;

    this.vendaPesquisaDTO = new VendaPesquisaDTO();

    this.controleTopItens = new ControleTopItens();

    this.activeNav = 1;
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
  ngAfterViewInit(): void {
    this.condicaoPagId!.nativeElement.focus();
  }
  // getRowClass(row: VendaDTO) {
  //     return {
  //         'classe-faturado': row.vendaStatusAtualDTO.vendaStatusLabelDTO.sigla === 'FA',
  //         'classe-aguardando-aprovacao-superior': (row.vendaStatusAtualDTO.roleName != null &&
  //             row.vendaStatusAtualDTO.roleName == 'ROLE_SALES_PAGINA_VENDA_FUNCAO_AUTORIZA_DESCONTO_SUPERIOR'),
  //         'classe-aguardando-aprovacao': row.vendaStatusAtualDTO.vendaStatusLabelDTO.sigla === 'AAE' || row.vendaStatusAtualDTO.vendaStatusLabelDTO.sigla === 'AAF',
  //         'classe-aguardando-faturamento': row.vendaStatusAtualDTO.vendaStatusLabelDTO.sigla === 'AFA',
  //         'classe-confirmado': row.vendaStatusAtualDTO.vendaStatusLabelDTO.sigla === 'CF'
  //     };
  // }

  getRowClass(row: VendaPag) {
    return {
      'classe-faturado': row.statusSigla === 'FA',
      'classe-aguardando-aprovacao-superior':
        row.roleName != null &&
        row.roleName ==
          'ROLE_SALES_PAGINA_VENDA_FUNCAO_AUTORIZA_DESCONTO_SUPERIOR',
      'classe-aguardando-aprovacao':
        row.statusSigla === 'AAE' || row.statusSigla === 'AAF',
      'classe-aguardando-faturamento': row.statusSigla === 'AFA',
      'classe-confirmado': row.statusSigla === 'CF',
      'classe-aguardando-carregamento': row.statusSigla === 'ACR',
      'classe-carregado': row.statusSigla === 'CRR',
    };
  }

  identyDevice(): void {
    this.deviceAcess = new DeviceAccess();
    this.deviceAcess.deviceInfo = this._deviceService.getDeviceInfo();
    this.deviceAcess.isMobile = this._deviceService.isMobile();
    this.deviceAcess.isDesktop = this._deviceService.isDesktop();
    // console.log(this.deviceAcess);
  }

  getAlertInfo(): string {
    let alert = 'Acesso realizado via:';
    if (this.deviceAcess.isDesktop) {
      alert += ' Desktop';
    } else {
      alert += ' Mobile';
    }
    alert += ', com browser: ' + this.deviceAcess.deviceInfo.browser;
    // alert += ' -- browser version: ' + this.deviceAcess.deviceInfo.browser_version;
    alert += ', com device: ' + this.deviceAcess.deviceInfo.device;
    alert += ', os: ' + this.deviceAcess.deviceInfo.os;
    alert += ', usuário: ' + this.currentUserSalesApp.username;
    // alert += ' -- os version: ' + this.deviceAcess.deviceInfo.os_version;
    return alert;
  }

  createForm(): void {
    // this.pedidoForm = new FormGroup({
    //     id: new FormControl(''),
    //     codPreVenda: new FormControl(''),
    //     estoqueAlmoxarifadoId: new FormControl(null, Validators.required),
    //     dtaInclusao: new FormControl(''),
    //     dtaEmissao: new FormControl(this.convertDate(new Date(), 0), [Validators.required]),
    //     dtaValidade: new FormControl(''),
    //     dtaEntrega: new FormControl('', Validators.required),
    //     // dtaEntrega: new FormControl(this.addDayDateToString(new Date(), 1), Validators.required),
    //     // dtaEntrega: new FormControl((this.convertDate(new Date(), 1)) + 'T17:00:00', Validators.required),
    //     condicaoPagamento: new FormControl(null, Validators.required),
    //     vendedor: new FormControl(null, Validators.required),

    //     enderecoEntrega: new FormControl(null, Validators.required),

    //     logradouroEntrega: new FormControl(''),
    //     cepEntrega: new FormControl(''),
    //     numEntrega: new FormControl(''),
    //     bairroEntrega: new FormControl(''),
    //     municipioEntrega: new FormControl(''),
    //     estadoEntrega: new FormControl(''),

    //     latEntrega: new FormControl(''),
    //     lngEntrega: new FormControl(''),

    //     // status: new FormControl(null),

    //     vlrFrete: new FormControl(0, Validators.min(0)),
    //     vlrDespAcessoria: new FormControl(0, Validators.min(0)),
    //     vlrAcrescimoFixoCondicao: new FormControl(0, Validators.min(0)),
    //     vlrTotal: new FormControl(0),

    //     descricao: new FormControl(''),

    //     cliente: new FormGroup({
    //         id: new FormControl(null, Validators.required),
    //         cgc: new FormControl(''),
    //         nomeTypeahead: new FormControl(''),
    //         fantasiaTypeahead: new FormControl(''),
    //     }),
    //     item: new FormGroup({
    //         id: new FormControl(null),
    //         idAux: new FormControl(null),
    //         nomeTypeahead: new FormControl(''),
    //         agrupamento: new FormControl(null),
    //         qtd: new FormControl(null),
    //         vlr: new FormControl(null),
    //         perc: new FormControl(0),
    //         vlrAg: new FormControl(0),
    //     }),
    // });
    this.disableEnderecoEntrega();
    this.disableVlrTotal();
    this.disableAcrescimoCondicao();
    this.disableDescontoGeralCapa();
  }
  async ngOnInit(): Promise<void> {
    this.currentUserSalesApp = JSON.parse(
      sessionStorage.getItem('currentUserSalesApp')!
    );
    this.msgClienteJaConfigurado =
      'Já existe um cliente configurado, limpe primeiro para depois poder procurar novamente';

    this.createForm();
    await this.iniciaObjs();

    this.intervalVenda = setInterval(() => {
      if (
        this.permitVendaServer.contador <= 0 &&
        this.permitVendaServer.statusConsultando === false
      ) {
        // console.log('Buncando Informações do Servidor');
        this.getPermitVenda();
      } else {
        this.permitVendaServer.contador = this.permitVendaServer.contador - 1;
      }
      // console.log('Proxima consulta em: ' + this.permitVendaServer.contador);
      this.cdr.detectChanges();
    }, 1000);

    this.cdr.detectChanges();
  }

  async iniciaObjs(): Promise<void> {
    this.initDefaults();

    this.vendaStatusMotivos = [];
    this._vendaService.buscaTodosMotivos().subscribe({
      next: (data) => {
        this.vendaStatusMotivos = data;
        this.cdr.detectChanges();
      },
      error: () => {
        this.pop(
          'error',
          'Erro',
          'Erro ao buscar os motivos, contate o administrador'
        );
      },
    });

    this.buscaMunicipios();

    this.spinner.show('fullSpinner');
    this.vendaDTO = new VendaDTO();

    try {
      this.confGerais = await lastValueFrom(this._confService.getConfById(1));
    } catch (e) {
      console.log('Error ao buscar confGerais');
      console.log(e);
    }

    try {
      this.vendedores = await lastValueFrom(
        this._funcionarioService.getAllActiveVendedor()
      );
    } catch (e) {
      console.log('Error ao buscar vendedores');
      console.log(e);
    }

    try {
      this.condicaoPagamentos = await lastValueFrom(
        this._condicaoPagamentoService.getAllActive()
      );
    } catch (e) {
      console.log('Error ao buscar condicoes');
      console.log(e);
    }

    try {
      this.estoqueAlmoxarifados = await lastValueFrom(
        this._estoqueAlmoxarifado.getAllActive()
      );
    } catch (e) {
      console.log('Error ao buscar estoque almoxarifado');
      console.log(e);
    }

 

    this.setaAlmoxarifados(this.estoqueAlmoxarifados);

    try {
      this.vendaStatusLabels = await lastValueFrom(
        this._vendaService.getVendaStatusLabels()
      );
    } catch (e) {
      console.log('Error ao buscar venda status labels');
      console.log(e);
    }



    this.vendaStatusLabels = this.vendaStatusLabels.sort((c1, c2) => {
      if (c1.ordem > c2.ordem) {
        return 1;
      }
      if (c1.ordem < c2.ordem) {
        return -1;
      }
      return 0;
    });

    this.condicaoPagamentos = this.condicaoPagamentos!.sort((c1, c2) => {
      if (c1.nome > c2.nome) {
        return 1;
      }
      if (c1.nome < c2.nome) {
        return -1;
      }
      return 0;
    });

    this.vendedores = this.vendedores!.sort((v1, v2) => {
      if (v1.nome > v2.nome) {
        return 1;
      }
      if (v1.nome < v2.nome) {
        return -1;
      }
      return 0;
    });

    console.log('permit');
    this.permitVendaServer.statusConsultando = true;

    try {
      this.permitVendaServer = await lastValueFrom(
        this._vendaService.isPermitVenda(
          this.currentUserSalesApp.user.idVendedor
        )
      );
    } catch (e) {
      console.log('Error ao buscar permite venda server');
      console.log(e);
    }

    console.log(this.permitVendaServer);
    console.log('permitVendaServer');
    this.permitVendaServer.contador = 30;
    this.permitVendaServer.statusConsultando = false;

    // console.log(this.currentUserSalesApp);

    console.log('seta');
    this.setaCondicoesPagamentoVisiveis(null);
    this.setaVendedoresVisiveis();
    this.spinner.hide('fullSpinner');
    this.cdr.detectChanges();
  }

  buscaMunicipios(): void {
      this._pagesService.buscaMunicipios().subscribe({
        next: (data) => {
          this.municipios = data;
          this.cdr.detectChanges();
        }
      });
  }

  modalAlert(header: string, content: string): void {
    const activeModal = this._modalService.open(ModalVendasAlertComponent);
    activeModal.componentInstance.modalHeader = header;
    activeModal.componentInstance.modalContent = content;
    activeModal.result.then(
      (result) => {
        console.log(result);
      },
      (err) => {
        console.log(err);
      }
    );
  }

  setaAlmoxarifados(ealxs: EstoqueAlmoxarifadoDTO[]): void {
    const estoqueAlmoxarifadoApareceVendas = ealxs.filter((al) => {
      return al.apareceVendas === true;
    });

    if (
      estoqueAlmoxarifadoApareceVendas.length > 0 &&
      this.currentUserSalesApp != null &&
      this.isUndefined(this.currentUserSalesApp) === false &&
      this.currentUserSalesApp.funcionarioDTO != null &&
      this.isUndefined(this.currentUserSalesApp.funcionarioDTO) === false &&
      this.currentUserSalesApp.funcionarioDTO.estoqueAlmoxarifadoDTOs != null &&
      this.currentUserSalesApp.funcionarioDTO.estoqueAlmoxarifadoDTOs.length > 0
    ) {
      const almoxarifados =
        this.currentUserSalesApp.funcionarioDTO.estoqueAlmoxarifadoDTOs;

      this.estoqueAlmoxarifadoFiltrados = estoqueAlmoxarifadoApareceVendas.filter((alx) => {
        return almoxarifados.some((alm) => alm.id === alx.id);
      });
      
      this.estoqueAlmoxarifadoFiltrados = [...this.estoqueAlmoxarifadoFiltrados];
      
    } else {
      this.estoqueAlmoxarifadoFiltrados = [];
      this.modalAlert(
        'Atenção',
        'Funcionário sem almoxarifado vinculado, contate o time de vendas'
      );
      
    }

    if (
      this.confGerais!.vendaEstoqueAlmoxarifadoId != null &&
      this.confGerais!.vendaEstoqueAlmoxarifadoId > 0
    ) {

      const flg = this.estoqueAlmoxarifadoFiltrados.filter((alx) => {
        return alx.id === this.confGerais!.vendaEstoqueAlmoxarifadoId;
      });
      if (flg.length > 0) {
        this.pedidoForm.controls.estoqueAlmoxarifadoId.setValue(
          this.confGerais!.vendaEstoqueAlmoxarifadoId
        );
      }
    }

    if (!this.isRoleAlteraAlmoxarifado()) {
      this.pedidoForm.controls.estoqueAlmoxarifadoId.disable();
    }
  }

  onChangeRepresentante(event: any): void {
    const vendedor = this.pedidoForm.controls.vendedor.value;
    if (vendedor != null && vendedor.id != null && vendedor.id > 0) {
      // if (this.vendaDTO != null
      //     && this.vendaDTO.vendaItemDTOs != null
      //     && this.vendaDTO.vendaItemDTOs.length > 0) {
      //     this.vendaDTO.vendaItemDTOs = [];
      //     this.msgAlerta('Atenção', 'Ao trocar o representante todos os itens já adicionados são removidos automaticamente', 'error');
      // }
      // this.onLimpaItem();
    }
  }

  onChangeAlmoxarifado(event: any): void {
    const evalue = this.pedidoForm.controls.estoqueAlmoxarifadoId.value;
    if (evalue != null && evalue > 0) {
      if (
        this.vendaDTO != null &&
        this.vendaDTO.vendaItemDTOs != null &&
        this.vendaDTO.vendaItemDTOs.length > 0
      ) {
        const flgItensAdd = this.vendaDTO.vendaItemDTOs.filter((vi) => {
          return vi.estoqueAlmoxarifadoId != evalue;
        });
        if (flgItensAdd.length > 0) {
          this.msgAlerta(
            'Atenção',
            'Existe itens adicionados com outro almoxarifado, caso queira alterar o almoxarifado é necessário remover todos os itens já adicionados',
            'error'
          );
          this.pedidoForm.controls.estoqueAlmoxarifadoId.setValue(
            flgItensAdd[0].estoqueAlmoxarifadoId
          );
        }
      }
      this.onLimpaItem();
    }
  }

  pesquisaPorId(): void {
    const id = this.pedidoForm.controls.id.value;

    if (id != null && !isNaN(id) && id > 0) {
      this.onPesquisa();
    } else {
      this.pop('error', 'Erro', 'Digite um id válido para pesquisa');
    }
  }

  compareAlmoxarifado(
    c1: EstoqueAlmoxarifadoDTO,
    c2: EstoqueAlmoxarifadoDTO
  ): boolean {
    return c1 && c2 ? c1.id === c2.id : c1 === c2;
  }

  compareMunicipios(c1: MunicipioDTO,
  c2: MunicipioDTO
): boolean {
  return c1 && c2 ? c1.id === c2.id : c1 === c2;
}

  getPermitVenda(): void {
    this.permitVendaServer.statusConsultando = true;
    this._vendaService
      .isPermitVenda(this.currentUserSalesApp.user.idVendedor)
      .subscribe({
        next: (data) => {
          this.permitVendaServer = data;
          this.permitVendaServer.contador = 30;
          this.permitVendaServer.statusConsultando = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.permitVendaServer.contador = 30;
          this.permitVendaServer.statusConsultando = false;
          this.permitVendaServer.msg =
            'Erro ao comunicar com o servidor, contate o administrador';
          this.permitVendaServer.vendaBloqueada = true;
          this.cdr.detectChanges();
        },
      });
  }

  getMsgPermitVenda(): string {
    return (
      'Consulta realizada em : ' +
      this.permitVendaServer.dataAtualFormatada +
      ', ' +
      this.permitVendaServer.msg +
      ', Proxima consulta em: ' +
      this.permitVendaServer.contador +
      's'
    );
  }

  setaVendedorVisivel(clienteDTO: ClienteDTO): void {
    // console.log(clienteDTO);
    // console.log(this.isDisableSelectVendedor());
    // console.log(this.isVerificaVendedorCliente());
    /*
        if (
            clienteDTO.clienteVendedorDTOs.length > 0 &&
            this.isDisableSelectVendedor() === false && // para quem não pode alterar o vendedor do cliente geralmente os vendedores
            this.statusForm === 1 && // somente para pedidos abertos
            this.isVerificaVendedorCliente() === false // quem tem acesso para vender para qualquer cliente
        ) {
            const v = clienteDTO.clienteVendedorDTOs[0].funcionarioDTO!.id;

            const filt = this.vendedoresVisiveis.filter(ven => {
                return ven.id === v;
            });

            if (filt.length > 0) {
                this.pedidoForm.controls.vendedor.patchValue(filt[0]);
                // seleci one o primeiro vendedor do cliente
            } else if (clienteDTO.clienteVendedorDTOs.length > 1) {
                const v2 = clienteDTO.clienteVendedorDTOs[1].funcionarioDTO!.id;

                const filt2 = this.vendedoresVisiveis.filter(ven => {
                    return ven.id === v2;
                });

                if (filt2.length > 0) {
                    this.pedidoForm.controls.vendedor.patchValue(filt2[0]);
                }
            }
        } 
        this.cdr.detectChanges();
        */
    if (
      this.statusForm === 1 &&
      this.isDisableSelectVendedor() === false &&
      this.isAcessaTodosOsVendedores() === false // não tem permissão de todos os vendedores
    ) {
      console.log('entrou');
      if (
        clienteDTO.clienteVendedorDTOs != null &&
        clienteDTO.clienteVendedorDTOs.length === 0
      ) {
        this.vendedoresVisiveis = [];
      } else {
        const vendedoresFiltro: (VendedorResumoDTO | null)[] = [];
        clienteDTO.clienteVendedorDTOs.forEach((cv) => {
          vendedoresFiltro.push(cv.funcionarioDTO);
        });
        this.vendedoresVisiveis = JSON.parse(JSON.stringify(vendedoresFiltro));

        if (
          this.vendedoresVisiveis != null &&
          this.vendedoresVisiveis.length === 1
        ) {
          this.pedidoForm.controls.vendedor.patchValue(
            this.vendedoresVisiveis[0]
          );
        }
      }
    } else {
      console.log('else');
      if (
        this.statusForm === 1 &&
        clienteDTO.clienteVendedorDTOs != null &&
        clienteDTO.clienteVendedorDTOs.length > 0
      ) {
        const vendedorSelecionado: FuncionarioDTO | null =
          this.pedidoForm.controls.vendedor.value;
        const v2 = clienteDTO.clienteVendedorDTOs[0].funcionarioDTO!.id;

        let vendFinal: number | null = null;

        if (
          typeof vendedorSelecionado !== 'undefined' &&
          vendedorSelecionado !== null &&
          typeof vendedorSelecionado.id !== 'undefined' &&
          vendedorSelecionado.id !== null &&
          vendedorSelecionado.id > 0
        ) {
          vendFinal = vendedorSelecionado.id;
        } else {
          vendFinal = v2;
        }

        const filt2 = this.vendedoresVisiveis.filter((ven) => {
          return ven.id === vendFinal;
        });

        if (filt2.length > 0) {
          this.pedidoForm.controls.vendedor.patchValue(filt2[0]);
        }

        // show client vendors
        this.selectVendedorByClient(clienteDTO.clienteVendedorDTOs);
      }
    }
  }

  setaCondicoesPagamentoVisiveis(
    condicoesCliente: CondicaoPagamentoDTO[] | null
  ): void {
    if (this.isAcessoTodasCondicoes()) {
      this.condicaoPagamentosVisiveis = JSON.parse(
        JSON.stringify(this.condicaoPagamentos)
      );

      /*
            if (this.statusForm === 1) {
                this.setaCondicaoPagamentoPreferida();
            }
            */
    } else if (condicoesCliente != null && condicoesCliente.length > 0) {
      this.condicaoPagamentosVisiveis = this.condicaoPagamentos!.filter((c) => {
        return (
          c.id === 1 ||
          c.id === 64 ||
          condicoesCliente.filter((c2) => {
            return c2.id === c.id;
          }).length > 0 ||
          c.id === 1
        );
      });

      if (this.statusForm === 1) {
        this.setaCondicaoPagamentoPreferida();
      }
    } else {
      this.condicaoPagamentosVisiveis = this.condicaoPagamentos!.filter((c) => {
        return c.id === 1 || c.id === 64; // condicao dinheiro e pix
      });
      if (this.statusForm === 1) {
        this.pedidoForm.controls.condicaoPagamento.patchValue(
          this.condicaoPagamentosVisiveis[0]
        );
      }
    }

    // apenas para quem não tem acesso ver a condição passada no pedido
    if (
      this.vendaDTO != null &&
      this.vendaDTO.id != null &&
      this.vendaDTO.id > 0 &&
      this.vendaDTO.vendaStatusAtualDTO.vendaStatusLabelDTO.sigla !== 'AB' &&
      this.statusForm === 2
    ) {
      const flt = this.condicaoPagamentosVisiveis.filter((fl) => {
        return fl.id === this.vendaDTO.condicaoPagamentoDTO!.id;
      });

      if (flt.length === 0) {
        const condicoes = this.condicaoPagamentos!.filter((c) => {
          return c.id === this.vendaDTO.condicaoPagamentoDTO!.id;
        });

        this.condicaoPagamentosVisiveis.push(condicoes[0]);
        this.condicaoPagamentosVisiveis = [...this.condicaoPagamentosVisiveis];
      }
    }
    this.cdr.detectChanges();
  }

  setaCondicaoPagamentoPreferida(): void {
    // verifica e seta condição de pagamento preferida do cliente
    if (
      this.vendaDTO != null &&
      this.vendaDTO.clienteDTO != null &&
      this.vendaDTO.clienteDTO.codCondicaoPagamento != null &&
      this.vendaDTO.clienteDTO.codCondicaoPagamento > 0
    ) {
      const flt = this.condicaoPagamentosVisiveis.filter((cond) => {
        return cond.id === this.vendaDTO.clienteDTO!.codCondicaoPagamento;
      });

      if (flt.length > 0) {
        this.pedidoForm.controls.condicaoPagamento.patchValue(flt[0]);
      }
    } else {
      const cond = this.condicaoPagamentosVisiveis.filter((c) => {
        return c.id === 1 || c.id === 64; // condicao dinheiro pix
      });

      this.pedidoForm.controls.condicaoPagamento.patchValue(cond[0]);
    }
    this.cdr.detectChanges();
  }

  isItemSelecionado(): boolean {
    return this.itemSelecionado != null &&
      this.itemSelecionado.id > 0 &&
      this.flgPesquisandoItem === 0
      ? true
      : false;
  }
  isDisableSalvaAtualiza(): boolean {
    if (
      this.vendaDTO != null &&
      this.vendaDTO.vendaStatusAtualDTO != null &&
      this.vendaDTO.vendaStatusAtualDTO.vendaStatusLabelDTO.sigla !== 'AB'
    ) {
      return true;
    } else {
      return false;
    }
  }

  disableEnderecoEntrega(): void {
    this.pedidoForm.controls.logradouroEntrega.disable();
    this.pedidoForm.controls.cepEntrega.disable();
    this.pedidoForm.controls.numEntrega.disable();
    this.pedidoForm.controls.bairroEntrega.disable();
    this.pedidoForm.controls.municipioEntrega.disable();
    this.pedidoForm.controls.estadoEntrega.disable();
    this.pedidoForm.controls.latEntrega.disable();
    this.pedidoForm.controls.lngEntrega.disable();
  }
  disableVlrTotal(): void {
    this.pedidoForm.controls.vlrTotal.disable();
  }
  disableAcrescimoCondicao(): void {
    if (!this.isRoleAlteraAcrescimoCondicao()) {
      this.pedidoForm.controls.vlrAcrescimoFixoCondicao.disable();
    }
  }
  disableDescontoGeralCapa(): void {
    if (!this.isRoleDescontoGeralCapa()) {
      this.pedidoForm.controls.vlrDescontoGeral.disable();
    }
  }
  setaVendedoresVisiveis(): void {
    this.vendedoresVisiveis = JSON.parse(JSON.stringify(this.vendedores));
    // console.log(this.vendedoresVisiveis);
    if (
      this.currentUserSalesApp.user.idVendedor != null &&
      this.currentUserSalesApp.user.idVendedor > 0
    ) {
      const sel = this.vendedoresVisiveis.filter((v) => {
        return v.id === this.currentUserSalesApp.user.idVendedor;
      });

      if (sel.length > 0) {
        this.pedidoForm.controls.vendedor.patchValue(sel[0]);
      }
    } else {
      /*
            const selv = this.vendedoresVisiveis.filter(v => {
                return v.id === 5;
            });
            this.pedidoForm.controls.vendedor.patchValue(selv[0]);
            */
    }

    if (this.isDisableSelectVendedor()) {
      this.pedidoForm.controls.vendedor.disable();
    }
    this.cdr.detectChanges();
  }

  isDisableSelectVendedor(): boolean {
    const flt = this.currentUserSalesApp.user.authorityDTOs.filter(
      (auth: any) => {
        return auth.name === 'ROLE_SALES_PAGINA_VENDA_FUNCAO_ALTERA_VENDEDOR';
      }
    );
    return flt.length > 0 ? false : true;
  }

  isVerificaVendedorCliente(): boolean {
    const flt = this.currentUserSalesApp.user.authorityDTOs.filter(
      (auth: any) => {
        return auth.name === 'ROLE_SALES_PAGINA_VENDA_FUNCAO_VENDEDOR_CLIENTE';
      }
    );
    return flt.length > 0 ? true : false;
  }

  isAcessaTodosOsVendedores(): boolean {
    const flt = this.currentUserSalesApp.user.authorityDTOs.filter(
      (auth: any) => {
        return (
          auth.name ===
          'ROLE_SALES_PAGINA_VENDA_FUNCAO_ACESSA_TODOS_OS_VENDEDORES'
        );
      }
    );
    return flt.length > 0 ? true : false;
  }

  isVendaAcimaLimiteCliente(): boolean {
    const flt = this.currentUserSalesApp.user.authorityDTOs.filter(
      (auth: any) => {
        return (
          auth.name === 'ROLE_SALES_PAGINA_VENDA_FUNCAO_VENDA_ACIMA_LIMITE'
        );
      }
    );
    return flt.length > 0 ? true : false;
  }

  isDisableSelectCondicaoPagamento2(): boolean {
    const flt = this.currentUserSalesApp.user.authorityDTOs.filter(
      (auth: any) => {
        return auth.name === 'ROLE_SALES_PAGINA_VENDA_FUNCAO_ALTERA_CONDICAO';
      }
    );
    return flt.length > 0 ? false : true;
  }

  isAddItemAbaixoPreco(): boolean {
    const flt = this.currentUserSalesApp.user.authorityDTOs.filter(
      (auth: any) => {
        return (
          auth.name === 'ROLE_SALES_PAGINA_VENDA_FUNCAO_ADD_ITEM_ABAIXO_PRECO'
        );
      }
    );
    return flt.length > 0 ? true : false;
  }

  isAcessoTodasCondicoes(): boolean {
    const flt = this.currentUserSalesApp.user.authorityDTOs.filter(
      (auth: any) => {
        return auth.name === 'ROLE_SALES_PAGINA_VENDA_FUNCAO_ACESSO_CONDICOES';
      }
    );
    return flt.length > 0 ? true : false;
  }

  compareVendedor(v1: FuncionarioDTO, v2: FuncionarioDTO): boolean {
    return v1 && v2 ? v1.id === v2.id : v1 === v2;
  }

  compareEnderecoEntrega(
    e1: ClienteEnderecoDTO,
    e2: ClienteEnderecoDTO
  ): boolean {
    return e1 && e2 ? e1.id === e2.id : e1 === e2;
  }

  compareCondicaoPagamento(
    v1: CondicaoPagamentoDTO,
    v2: CondicaoPagamentoDTO
  ): boolean {
    return v1 && v2 ? v1.id === v2.id : v1 === v2;
  }

  compareStatus(s1: VendaStatusLabelDTO, s2: VendaStatusLabelDTO): boolean {
    return s1 && s2 ? s1.sigla === s2.sigla : s1 === s2;
  }

  onLimpaCliente(): void {
    if (this.isStatusAberto()) {
      const formCli = this.pedidoForm.get('cliente') as FormGroup;
      formCli.reset();
      formCli.controls['id'].enable();
      formCli.controls['cgc'].enable();
      formCli.controls['nomeTypeahead'].enable();
      formCli.controls['fantasiaTypeahead'].enable();
      this.setaCondicoesPagamentoVisiveis(null);
      this.limpandoEnderecoEntrega();
      this.setaVendedoresVisiveis();
    } else {
      this.msgAlerta(
        'Atenção',
        'O cliente só pode ser removido com status do pedido em aberto',
        'error'
      );
    }
  }

  limpandoEnderecoEntrega(): void {
    this.pedidoForm.controls.enderecoEntrega.setValue(null);
    this.pedidoForm.controls.logradouroEntrega.setValue('');
    this.pedidoForm.controls.cepEntrega.setValue('');
    this.pedidoForm.controls.numEntrega.setValue(null);
    this.pedidoForm.controls.bairroEntrega.setValue('');
    this.pedidoForm.controls.municipioEntrega.setValue('');
    this.pedidoForm.controls.estadoEntrega.setValue('');

    this.vendaDTO.logradouroEntrega = '';
    this.vendaDTO.cepEntrega = '';
    this.vendaDTO.numEntrega = 0;
    this.vendaDTO.bairroEntrega = '';
    this.vendaDTO.municipioEntrega = '';
    this.vendaDTO.estadoEntrega = '';
    this.vendaDTO.idEnderecoCliente = null;
  }

  getVlrTotalItem(): number {
    const formItem = this.pedidoForm.get('item') as FormGroup;
    const itemUnidade = formItem.controls['agrupamento'].value;
    if (
      itemUnidade != null &&
      itemUnidade.fator != null &&
      itemUnidade.fator > 0 &&
      this.itemSelecionado != null &&
      this.itemSelecionado.precoAtual != null &&
      this.itemSelecionado.precoAtual.preco > 0 &&
      formItem.controls['qtd'].value != null &&
      formItem.controls['qtd'].value > 0
    ) {
      return this.arredondaNum(
        formItem.controls['qtd'].value *
          itemUnidade.fator *
          this.itemSelecionado.precoAtual.preco
      );
    } else {
      return 0;
    }
  }

  arredondaNum(numero: number): number {
    return Math.round(numero * 100) / 100;
  }

  isNullorUndefinedNumber(value: any): number {
    if (value == null || typeof value === 'undefined' || isNaN(value)) {
      return 0;
    } else {
      return value;
    }
  }

  getVlrTotalDescProdutos(): number {
    let total = 0;
    this.vendaDTO.vendaItemDTOs.forEach((vendaItemDTO) => {
      total += vendaItemDTO.vlrDesconto;
    });
    return total;
  }

  /*
    getVlrTotalAcrescimoCondicao(): number {
        const cond: CondicaoPagamentoDTO = this.pedidoForm.controls.condicaoPagamento.value;
        return cond != null ? cond.vlrAcrescimoFixo : 0;
    }
    */

  alterandoCondicao(): void {
    const cond: CondicaoPagamentoDTO | null =
      this.pedidoForm.controls.condicaoPagamento.value;
    const valorProdutos = this.getVlrTotalProdutos();
    if (
      this.vendaDTO.vendaStatusAtualDTO == null ||
      this.vendaDTO.vendaStatusAtualDTO.vendaStatusLabelDTO.sigla === 'AB'
    ) {
      if (
        cond != null &&
        cond.numAcrescimoPerc != null &&
        cond.numAcrescimoPerc > 0 &&
        valorProdutos > 0
      ) {
        this.pedidoForm.controls.vlrAcrescimoFixoCondicao.setValue(
          this.arredondaNum((valorProdutos / 100) * cond.numAcrescimoPerc)
        );
      } else if (
        cond != null &&
        cond.vlrAcrescimoFixo != null &&
        cond.vlrAcrescimoFixo > 0
      ) {
        this.pedidoForm.controls.vlrAcrescimoFixoCondicao.setValue(
          cond.vlrAcrescimoFixo
        );
      } else {
        this.pedidoForm.controls.vlrAcrescimoFixoCondicao.setValue(0);
      }
    }
  }

  getVlrTotalProdutos(): number {
    let total = 0;
    this.vendaDTO.vendaItemDTOs.forEach((vendaItemDTO) => {
      total += vendaItemDTO.vlr;
    });
    return total == null ? 0 : total;
  }

  getVlrTotalProdutosOrig(): number {
    let total = 0;
    this.vendaDTO.vendaItemDTOs.forEach((vendaItemDTO) => {
      total += vendaItemDTO.vlrOrig;
    });
    return total == null ? 0 : total;
  }

  getVlrTotalPreVenda(): number {
    // this.alterandoCondicao();

    const vlrFrete = this.pedidoForm.controls.vlrFrete.value;
    const vlrDespAcessoria = this.pedidoForm.controls.vlrDespAcessoria.value;
    const vlrAcrescimoFixoCondicao =
      this.pedidoForm.controls.vlrAcrescimoFixoCondicao.value;
    const vlrDescontoGeral = this.pedidoForm.controls.vlrDescontoGeral.value;

    let total = this.getVlrTotalProdutos();

    total += vlrFrete!;
    total += vlrDespAcessoria!;
    total += vlrAcrescimoFixoCondicao!;

    total -= vlrDescontoGeral!;

    return total;
  }

  getVlrTotalPreVendaOrig(): number {
    return this.vendaDTO == null || this.vendaDTO.vlrTotal == null
      ? 0
      : this.vendaDTO.vlrTotal;
  }

  roundNuber(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
    // return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
  }

  getVlrTotalPerc(): number {
    const formItem = this.pedidoForm.get('item') as FormGroup;
    if (
      this.getVlrTotalItem() !== 0 &&
      formItem.controls['perc'].value != null
    ) {
      return this.arredondaNum(
        this.getVlrTotalItem() -
          (this.getVlrTotalItem() / 100) * formItem.controls['perc'].value
      );
    } else {
      return 0;
    }
  }

  getVlrTotalAg(): number {
    const formItem = this.pedidoForm.get('item') as FormGroup;
    const itemUnidade = formItem.controls['agrupamento'].value;
    if (
      itemUnidade != null &&
      itemUnidade.fator != null &&
      itemUnidade.fator > 0 &&
      formItem.controls['vlrAg'].value != null &&
      formItem.controls['vlrAg'].value > 0 &&
      formItem.controls['qtd'].value != null &&
      formItem.controls['qtd'].value > 0
    ) {
      return formItem.controls['qtd'].value * formItem.controls['vlrAg'].value;
    } else {
      return 0;
    }
  }

  selectVendedorByClient(representantes: ClienteVendedorDTO[]): void {
    //ModalRepreClientComponent
    const representantesCli = this._modalService.open(
      ModalRepreClientComponent,
      { scrollable: true }
    );
    representantesCli.componentInstance.representantes = representantes;
    representantesCli.result.then(
      (result) => {
        if (result != null && typeof result !== 'undefined' && result.funcionarioDTO != null) {
          this.pedidoForm.controls.vendedor.patchValue(result.funcionarioDTO);
        }
        this.cdr.detectChanges();
      },
      (error) => {
        console.log(error);
      }
    );
  }

  selectClienteByArray(clientes: any): void {
    const activeModal = this._modalService.open(
      AppVendaModalClienteListComponent,
      { scrollable: true }
    );
    activeModal.componentInstance.modalHeader =
      'Existe mais de um cliente com o mesmo CGC, selecione!';
    activeModal.componentInstance.modalContent = clientes;
    activeModal.result.then(
      (result) => {
        if (
          result != null &&
          typeof 'result' !== 'undefined' &&
          result.id > 0
        ) {
          this.selectClienteByCod(result.id);
        } else {
          this.pop(
            'error',
            'Erro',
            'Não foi possivel selecionar o cliente na lista'
          );
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }

  onPesqAvItem(): void {
    this.onLimpaItem();

    const activeModal = this._modalService.open(
      AppVendaModalItemPesqavComponent,
      { size: 'lg', scrollable: true, backdrop: true }
    );
    activeModal.componentInstance.modalHeader = 'Pesquisa avançada de item';
    activeModal.componentInstance.modalContent = null;
    activeModal.result.then(
      (result) => {
        if (
          result != null &&
          typeof result !== 'undefined' &&
          result.id != null &&
          result.id > 0
        ) {
          this.selectItemByCod(result.id);
        }
        this.cdr.detectChanges();
      },
      (error) => {
        console.log(error);
      }
    );
  }
  onPesqAvCliente(): void {
    if (this.isStatusAberto()) {
      const activeModal = this._modalService.open(
        AppVendaModalClientePesqavComponent,
        { size: 'lg', scrollable: true, backdrop: true }
      );
      activeModal.componentInstance.modalHeader =
        'Pesquisa avançada de cliente';
      activeModal.componentInstance.modalContent = null;
      activeModal.componentInstance.vendedoresVisiveis =
        this.vendedoresVisiveis;
      activeModal.componentInstance.vendedorSelecionado =
        this.pedidoForm.controls.vendedor.value;
      activeModal.result.then(
        (result) => {
          if (
            result != null &&
            typeof result !== 'undefined' &&
            result.id != null &&
            result.id > 0
          ) {
            this.selectClienteByCod(result.id);
          }
          this.cdr.detectChanges();
        },
        (error) => {
          console.log(error);
        }
      );
    } else {
      this.msgAlerta(
        'Atenção',
        'O cliente só pode ser selecionado/alterado com status do pedido em aberto',
        'error'
      );
    }
  }

  isArray(value: any): boolean {
    return Array.isArray(value);
  }

  isUndefined(value: any): boolean {
    return typeof value === 'undefined';
  }

  findClienteById(): void {
    const formCli = this.pedidoForm.get('cliente') as FormGroup;
    if (!formCli.controls['id'].disabled) {
      this.selectClienteByCodForm(formCli);
    } else {
      this.pop('error', 'Erro', this.msgClienteJaConfigurado);
    }
  }

  buscaTopItensCliente(): void {
    const formCli = this.pedidoForm.get('cliente') as FormGroup;
    if (
      formCli.controls['id'].value != null &&
      Number(formCli.controls['id'].value) > 0
    ) {
      this.flgPesquisandoTopItens = 1;

      this._vendaService
        .buscaTopItensCliente(formCli.controls['id'].value, -1)
        .subscribe({
          next: (data) => {
            this.controleTopItens = new ControleTopItens();

            const vend = this.pedidoForm.controls.vendedor.value;

            this.controleTopItens.clienteId = formCli.controls['id'].value;
            this.controleTopItens.clienteNome =
              formCli.controls['nomeTypeahead'].value.nome;
            this.controleTopItens.vendedorNome =
              vend != null && vend.nome != null ? vend.nome : null;
            this.controleTopItens.topItensCliente = data;
            // console.log(this.controleTopItens);
            this.flgPesquisandoTopItens = 0;

            this.controleTopItens.topItensCliente.forEach((it) => {
              it.qtd_compra_media = Number(it.qtd_compra_media);
              it.qtd_compra_total = Number(it.qtd_compra_total);
              it.qtd_ultima_compra = Number(it.qtd_ultima_compra);
            });

            this.msgTopItens(this.controleTopItens);
            this.cdr.detectChanges();
          },
          error: (error) => {
            this.flgPesquisandoTopItens = 0;
            console.log(error);
            this.pop(
              'error',
              'Erro',
              'Erro ao buscar os tops itens do cliente, contate o administrador'
            );
            this.cdr.detectChanges();
          },
        });
    } else {
      this.msgAlerta(
        'Atenção',
        'Para buscar os tops itens é preciso um cliente estar configurado',
        'error'
      );
    }
  }

  buscaTopItensCliente2(): void {
    const formCli = this.pedidoForm.get('cliente') as FormGroup;
    if (
      formCli.controls['id'].value != null &&
      Number(formCli.controls['id'].value) > 0
    ) {
      // this.flgPesquisandoTopItens = 1;

      const vend = this.pedidoForm.controls.vendedor.value;

      this.msgTopItens2(
        vend != null && vend.id != null && vend.id > 0 ? vend : null,
        this.vendaDTO.clienteDTO!
      );
    } else {
      this.msgAlerta(
        'Atenção',
        'Para buscar os tops itens é preciso um cliente estar configurado',
        'error'
      );
    }
  }

  onAddItem(event: any): void {
    // console.log('adicionando item');

    if (event != null) {
      event.srcElement.blur();
      event.preventDefault();
    }

    if (this.isStatusAberto()) {
      const formItem = this.pedidoForm.get('item') as FormGroup;

      this.submittedItem = true;

      if (!formItem.invalid) {
        const msgDescontoAplicado = this.validadoDescontoAplicado(
          formItem,
          this.itemSelecionado
        );
        // console.log(msgDescontoAplicado);
        const msgValorDigitado = this.validadoValorDigitado(
          formItem,
          this.itemSelecionado
        );

        const agrupamentoEscolhido = formItem.controls['agrupamento'].value;
        const qtdEstoqueAposInclusao =
          this.itemSelecionado.qtdDisponivel -
          formItem.controls['qtd'].value * agrupamentoEscolhido.fator;

        if (this.itemSelecionado == null) {
          // this.pop('error', 'Erro', 'O item precisa ser selecionado primeiro');
          this.msgAlerta(
            'Atenção',
            'O item precisa ser selecionado primeiro',
            'error'
          );
        } else if (this.itemSelecionado.vendaBloqueada) {
          this.msgAlerta(
            'Atenção',
            'O item selecionado não pode ser adicionado porque está bloqueado para venda',
            'error'
          );
        } else if (this.itemSelecionado.qtdDisponivel <= 0) {
          this.msgAlerta(
            'Atenção',
            'O item está sem estoque ou zerado',
            'error'
          );
        } else if (qtdEstoqueAposInclusao < 0) {
          this.msgAlerta(
            'Atenção',
            'Altere a quantidade ou o agrupamento, o estoque ficará negativo apos a inclusão',
            'error'
          );
        } else if (msgDescontoAplicado.status === false) {
          // this.pop('error', 'Erro', msgDescontoAplicado.msg);
          this.msgAlerta('Atenção', msgDescontoAplicado.msg, 'error');
        } else if (msgValorDigitado.status === false) {
          // this.pop('error', 'Erro', msgValorDigitado.msg);
          this.msgAlerta('Atenção', msgValorDigitado.msg, 'error');
        } else {
          // regras ok agora é verificar duplicidade
          const selItensVenda = this.vendaDTO.vendaItemDTOs.filter((it) => {
            return it.itemDTO.id === this.itemSelecionado.id;
          });

          if (selItensVenda.length > 0) {
            // this.pop('error', 'Erro', 'Item já foi adicionado, remova e insira novamente');
            this.msgAlerta(
              'Atenção',
              'Item já foi adicionado, remova e insira novamente',
              'error'
            );
          } else {
            const vendaItemDTO = this.setaVendaItemDTO(
              formItem,
              this.itemSelecionado
            );
            this.vendaDTO.vendaItemDTOs.push(vendaItemDTO);
            this.vendaDTO.vendaItemDTOs = [...this.vendaDTO.vendaItemDTOs];

            this.vendaDTO.descricao = this.pedidoForm.controls.descricao.value;

            this.onLimpaItem();
            this.pop('success', 'OK', 'Item adicionado com sucesso');
            this.alterandoCondicao();
          }
        }
        this.cdr.detectChanges();
      } else {
        this.msgAlerta('Atenção', 'Corrija os campos solicitados', 'error');
      }
    } else {
      const activeModal = this._modalService.open(AppVendaModalAlertComponent);
      activeModal.componentInstance.modalHeader = 'Atenção';
      activeModal.componentInstance.modalContent = `O pedido precisa estar com status Aberto
        para que você possa adicionar ou remover itens`;
      activeModal.componentInstance.modalType = 'confirm';
      activeModal.componentInstance.defaultLabel = 'OK';
      activeModal.result.then(
        (result) => {
          console.log(result);
        },
        (error) => {
          console.log(error);
        }
      );
    }
  }
  removeValidatorsItem(formItem: FormGroup): void {
    formItem.controls['id'].clearValidators();
    formItem.controls['agrupamento'].clearValidators();
    formItem.controls['qtd'].clearValidators();
    formItem.controls['vlr'].clearValidators();
    formItem.controls['perc'].clearValidators();
  }
  setaVendaItemDTO(
    formItem: FormGroup,
    itemSelecionado: ItemDTO
  ): VendaItemDTO {
    const vendaItemDTO = new VendaItemDTO();
    // vendaItemDTO.estoqueAlmoxarifadoDTO = new EstoqueAlmoxarifadoDTO(this.confGerais.vendaEstoqueAlmoxarifadoId);
    vendaItemDTO.itemDTO = JSON.parse(JSON.stringify(itemSelecionado));
    vendaItemDTO.qtd = formItem.controls['qtd'].value;
    vendaItemDTO.vlr = formItem.controls['vlr'].value;
    vendaItemDTO.vlrUnitarioOrig = this.itemSelecionado.precoAtual.preco;
    vendaItemDTO.itemUnidadeDTO = formItem.controls['agrupamento'].value;

    vendaItemDTO.qtdEstoqueAtual = this.itemSelecionado.qtdDisponivel;

    vendaItemDTO.estoqueAlmoxarifadoId =
      this.itemSelecionado.estoqueAlmoxarifadoId;

    /*
        vendaItemDTO.percDesconto = formItem.controls.perc.value != null &&
            formItem.controls.perc.value > 0 ? formItem.controls.perc.value : 0;
            */

    vendaItemDTO.fatorInclusao = vendaItemDTO.itemUnidadeDTO.fator;
    vendaItemDTO.qtdConvertido =
      vendaItemDTO.qtd * vendaItemDTO.itemUnidadeDTO.fator;

    vendaItemDTO.vlrUnitario = vendaItemDTO.vlr / vendaItemDTO.qtdConvertido;

    vendaItemDTO.vlrOrig =
      vendaItemDTO.vlrUnitarioOrig * vendaItemDTO.qtdConvertido;

    if (vendaItemDTO.vlr < vendaItemDTO.vlrOrig) {
      vendaItemDTO.percDesconto =
        (1 - vendaItemDTO.vlr / vendaItemDTO.vlrOrig) * 100;

      /*
            vendaItemDTO.vlrDesconto = this.getVlrTotalPerc() === 0 ?
            (vendaItemDTO.vlrOrig - vendaItemDTO.vlr) : this.getVlrTotalItem() - this.getVlrTotalPerc();
            */
      vendaItemDTO.vlrDesconto = vendaItemDTO.vlrOrig - vendaItemDTO.vlr;
    } else {
      vendaItemDTO.percDesconto = 0;
      vendaItemDTO.vlrDesconto = 0;
    }

    return vendaItemDTO;
  }

  removeItemVenda(vendaItemDTO: VendaItemDTO): void {
    if (this.isStatusAberto()) {
      const activeModal = this._modalService.open(
        AppVendaModalConfirmComponent
      );
      activeModal.componentInstance.modalHeader = 'Confirme a exclusão';
      activeModal.componentInstance.modalContent =
        'Deseja realmente remover o item da venda?';
      activeModal.componentInstance.modalType = 'confirm';
      activeModal.componentInstance.defaultLabel = 'Não';
      activeModal.result.then(
        (result) => {
          if (result === 'confirm') {
            for (let i = 0; i < this.vendaDTO.vendaItemDTOs.length; i++) {
              if (
                this.vendaDTO.vendaItemDTOs[i].itemDTO.id ===
                vendaItemDTO.itemDTO.id
              ) {
                this.vendaDTO.vendaItemDTOs.splice(i, 1);
                this.vendaDTO.vendaItemDTOs = [...this.vendaDTO.vendaItemDTOs];
                i = this.vendaDTO.vendaItemDTOs.length + 1;
                this.pop('success', 'OK', 'Removido com sucesso');
                this.alterandoCondicao();
              }
            }
          }
          this.cdr.detectChanges();
        },
        (error) => {
          console.log(error);
        }
      );
    } else {
      const activeModal = this._modalService.open(AppVendaModalAlertComponent);
      activeModal.componentInstance.modalHeader = 'Atenção';
      activeModal.componentInstance.modalContent = `O pedido precisa estar com status Aberto
        para que você possa remover ou adicionar itens`;
      activeModal.componentInstance.modalType = 'confirm';
      activeModal.componentInstance.defaultLabel = 'OK';
      activeModal.result.then(
        (result) => {
          console.log(result);
        },
        (error) => {
          console.log(error);
        }
      );
    }
  }

  validadoValorDigitado(
    formItem: FormGroup,
    itemSelecionado: ItemDTO
  ): MsgValorDigitado {
    const msgValorDigitado = new MsgValorDigitado();
    msgValorDigitado.status = false;
    msgValorDigitado.msg = 'Erro contate o Administrador';
    const vlr = formItem.controls['vlr'].value;

    // 1 validação verificar se existe preço configurado
    // if (
    //   itemSelecionado.itemPrecoDTOs == null ||
    //   itemSelecionado.itemPrecoDTOs.length === 0 ||
    //   itemSelecionado.precoAtual == null ||
    //   itemSelecionado.precoAtual.preco === 0
    // ) {
    //   msgValorDigitado.status = false;
    //   msgValorDigitado.msg =
    //     'Preço configurado para o item não confere, ou não existe preços lançados, confira o preço';
    //   return msgValorDigitado;
    // } else {
    //   // Existe preço configurado para o item, agora é validar os valores
    //   // console.log(vlr);
    //   // console.log(this.getVlrTotalPerc());
    //   if (
    //     (this.isAddItemAbaixoPreco() === false &&
    //       this.getVlrTotalPerc() > 0 &&
    //       vlr < this.getVlrTotalPerc()) ||
    //     (this.isAddItemAbaixoPreco() === false &&
    //       this.getVlrTotalPerc() === 0 &&
    //       vlr < this.getVlrTotalItem())
    //   ) {
    //     msgValorDigitado.status = false;
    //     msgValorDigitado.msg =
    //       'Preço digitado está abaixo dos valores minimos, revise os detalhes';
    //     return msgValorDigitado;
    //   } else {
    //     msgValorDigitado.status = true;
    //     msgValorDigitado.msg = 'Tudo certo';
    //     return msgValorDigitado;
    //   }
    // }


      // Existe preço configurado para o item, agora é validar os valores
      // console.log(vlr);
      // console.log(this.getVlrTotalPerc());
      if (
        (this.isAddItemAbaixoPreco() === false &&
          this.getVlrTotalPerc() > 0 &&
          vlr < this.getVlrTotalPerc()) ||
        (this.isAddItemAbaixoPreco() === false &&
          this.getVlrTotalPerc() === 0 &&
          vlr < this.getVlrTotalItem())
      ) {
        msgValorDigitado.status = false;
        msgValorDigitado.msg =
          'Preço digitado está abaixo dos valores minimos, revise os detalhes';
        return msgValorDigitado;
      } else {
        msgValorDigitado.status = true;
        msgValorDigitado.msg = 'Tudo certo';
        return msgValorDigitado;
      }
    
  }

  validadoDescontoAplicado(
    formItem: FormGroup,
    itemSelecionado: ItemDTO
  ): MsgDescontoAplicado {
    const msgDescontoAplicado = new MsgDescontoAplicado();
    msgDescontoAplicado.status = false;
    msgDescontoAplicado.msg = 'Erro contate o Administrador';

    if (
      formItem.controls['perc'].value != null &&
      formItem.controls['perc'].value > 0
    ) {
      const itemAlxDescontoDTOs = [...itemSelecionado.itemAlxDescontoDTOs];
      itemSelecionado.itemAlxVendDescontoDTOs.forEach((it) => {
        itemAlxDescontoDTOs.push(it);
      });

      // 1 validação verificar se existe desconto configurado
      if (itemAlxDescontoDTOs.length === 0) {
        msgDescontoAplicado.status = false;
        msgDescontoAplicado.msg =
          'Item não tem desconto configurado, remova o percentual lançado';
        msgDescontoAplicado.tipo = 1;
        return msgDescontoAplicado;
      }

      const agr = formItem.controls['agrupamento'].value;
      // console.log(agr);
      // console.log(itemSelecionado.itemDescontoQtdDTOs);
      // filtro para verificar se a quantidade digitada pode ser aplicado desconto
      const qtdUnitario = formItem.controls['qtd'].value * agr.fator;
      const selQtd = itemAlxDescontoDTOs.filter((d) => {
        return qtdUnitario >= d.qtdConvertido;
      });

      // se não teve retorno é porque a quantidade digitada não é suficiente para aplicar desconto
      if (selQtd.length === 0) {
        msgDescontoAplicado.status = false;
        msgDescontoAplicado.msg = `A qtd digitada não pode ser aplicado desconto para esse item nesse
                agrupamento, revise os valores e regras`;
        msgDescontoAplicado.tipo = 1;
        return msgDescontoAplicado;
      } else {
        /* se a quantidade digitada pode ser aplicado desconto a regra agora é verificar se o percentual
                está dentro dos descontos lançados */
        const selQtd2 = selQtd.filter((d2) => {
          return formItem.controls['perc'].value <= d2.percDesc;
        });

        //  se não tem nada é porque o percentual é maior do que o configurado
        if (selQtd2.length === 0) {
          msgDescontoAplicado.status = false;
          msgDescontoAplicado.msg =
            'O percentual digitado não pode ser aplicado, revise os valores e regras';
          msgDescontoAplicado.tipo = 1;
          return msgDescontoAplicado;
        } else {
          // a quantidade tá ok e o perc também
          // checando se o percentual e o valor final é condizente
          if (this.getVlrTotalPerc() - formItem.controls['vlr'].value > 0.02) {
            msgDescontoAplicado.status = false;
            msgDescontoAplicado.msg =
              'Corrija, o valor final está menor que o percentual digitado';
            msgDescontoAplicado.tipo = 1;
            return msgDescontoAplicado;
          } else {
            msgDescontoAplicado.msg = 'Tudo certo';
            msgDescontoAplicado.status = true;
            msgDescontoAplicado.tipo = 2;
          }
        }
      }
    } else if (
      this.getVlrTotalItem() > 0 &&
      this.getVlrTotalItem() - formItem.controls['vlr'].value > 0.02 &&
      this.isAddItemAbaixoPreco() == false
    ) {
      msgDescontoAplicado.status = false;
      msgDescontoAplicado.msg =
        'Corrija o valor final, foi aplicado desconto que não existe';
      msgDescontoAplicado.tipo = 1;
      return msgDescontoAplicado;
    } else {
      msgDescontoAplicado.msg = 'Tudo certo';
      msgDescontoAplicado.status = true;
      msgDescontoAplicado.tipo = 0;
      return msgDescontoAplicado;
    }
    return msgDescontoAplicado;
  }

  findItemById(event: any): void {
    const formItem = this.pedidoForm.get('item') as FormGroup;
    this.selectItemByCodForm(formItem);
  }

  findItemByIdAux(event: any): void {
    if (event != null) {
      event.srcElement.blur();
      event.preventDefault();
    }

    const formItem = this.pedidoForm.get('item') as FormGroup;
    this.selectItemByCodAuxForm(formItem);
  }

  findClienteByCGC(): void {
    const formCli = this.pedidoForm.get('cliente') as FormGroup;
    if (!formCli.controls['id'].disabled) {
      this.selectClienteByCGC(formCli);
    } else {
      this.pop('error', 'Erro', this.msgClienteJaConfigurado);
    }
  }

  typeaHeadSelectCliente(event: any): void {
    const formCli = this.pedidoForm.get('cliente') as FormGroup;
    formCli.controls['id'].setValue(event.item.id);
    this.selectClienteByCodForm(formCli);
  }

  typeaHeadSelectItem(event: any): void {
    const formItem = this.pedidoForm.get('item') as FormGroup;
    formItem.controls['id'].setValue(event.item.id);
    this.selectItemByCodForm(formItem);
    // console.log(event);
  }
  selectClienteByCod(id: number): void {
    this.flgPesquisandoCliente = 1;
    this._clienteService.findById(id).subscribe({
      next: (data) => {
        // console.log(data);
        this.onLimpaCliente();
        this.setaModelAndFormCliente(data);
        this.pop('success', 'Cliente encontrado com sucesso', '');
        this.flgPesquisandoCliente = 0;
        // this.pedidoForm.controls.dtaEntrega.setValue(
        //   this.addDayDateToString(new Date(), 1)
        // );
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.flgPesquisandoCliente = 0;
        this.pop('error', 'Erro', 'Não foi encontrado cliente com esse codigo');
        this.cdr.detectChanges();
      },
    });
  }
  async setaModelAndFormCliente(
    c: ClienteDTO,
    statusForm?: number
  ): Promise<void> {
    // this.limpaEndereco();

    this.vendaDTO.clienteDTO = c;
    this.vendaDTO.clienteDTO.clienteDividaComproLimiteSaldoDTO =
      new ClienteDividaComproLimiteSaldoDTO();
    this.vendaDTO.clienteDTO.titulosPercAtrasoClienteDTO = {};

    // Confirguração de Endereço, apenas marcados como entrega
    const ends = c.clienteEnderecoDTOs.filter((end) => {
      return end.indEntrega === true;
    });

    this.vendaDTO.clienteDTO.clienteEnderecoDTOs = ends;

    if (ends.length > 0) {
      if (ends.length === 1) {
        // console.log('setando endereco');
        this.pedidoForm.controls.enderecoEntrega.setValue(ends[0]);
        this.enderecoSelecionado();
      }
    }

    const formCli = this.pedidoForm.get('cliente') as FormGroup;
    formCli.patchValue({
      id: this.vendaDTO.clienteDTO.id,
      cgc: this.vendaDTO.clienteDTO.cgc,
      nomeTypeahead: { nome: this.vendaDTO.clienteDTO.nome },
      fantasiaTypeahead: { fantasia: this.vendaDTO.clienteDTO.fantasia },
    });
    formCli.disable();

    try {
      const clienteDividaComproLimiteSaldoDTO = await lastValueFrom(
        this._clienteService.findLimiteDividaSaldoClienteByid(
          this.vendaDTO.clienteDTO.id
        )
      );
      // console.log(clienteDividaComproLimiteSaldoDTO);
      if (clienteDividaComproLimiteSaldoDTO != null) {
        this.vendaDTO.clienteDTO.clienteDividaComproLimiteSaldoDTO =
          clienteDividaComproLimiteSaldoDTO;
      }
    } catch (error) {
      this.pop(
        'error',
        'Atenção',
        'Não foi encontrado a divida, limite e saldo do cliente, lançado 0 como padrão'
      );
    }

    try {
      const titulosPercClienteDTOs: any[] = await lastValueFrom(
        this._vendaService.buscaTitulosPercAtrasoCliente(
          this.vendaDTO.clienteDTO.id
        )
      );
      if (titulosPercClienteDTOs.length > 0) {
        const fil = titulosPercClienteDTOs.filter((cf) => {
          return cf.clienteId === this.vendaDTO.clienteDTO!.id;
        });
        this.vendaDTO.clienteDTO.titulosPercAtrasoClienteDTO = JSON.parse(
          JSON.stringify(fil[0])
        );
      }
    } catch (error) {
      this.pop(
        'error',
        'Atenção',
        'Não foi encontrado o percentual de score de titulos em atraso do cliente, lançado 0 como padrão'
      );
    }

    this.setaCondicoesPagamentoVisiveis(c.condicaoPagamentoDTOs);

    this.setaVendedorVisivel(c);

    if (!statusForm || statusForm == null) {
      // somente para exclusao não para edicao
      const messAList = this.verificaClienteSelecionado(
        this.vendaDTO.clienteDTO
      );

      if (messAList.isErro && messAList.messageAlertList.length > 0) {
        this.msgAlertaList(
          'Atenção para o Cliente Selecionado',
          messAList.messageAlertList,
          'error'
        );
      }
    }
    this.cdr.detectChanges();
  }

  msgAlertaList(
    header: string,
    messAList: MessageAlertList[],
    modalType: string
  ): void {
    const activeModal = this._modalService.open(
      AppVendaModalAlertListComponent,
      { size: 'lg', scrollable: true, backdrop: true }
    );
    activeModal.componentInstance.modalHeader = header;
    activeModal.componentInstance.modalMessageList = messAList;
    activeModal.componentInstance.modalType = modalType;
    activeModal.result.then(
      (result) => {
        console.log(result);
      },
      (error) => {
        console.log(error);
      }
    );
  }

  verificaClienteSelecionado(c: ClienteDTO): MsgValidacaoCliente {
    const messAList = new MsgValidacaoCliente();
    messAList.messageAlertList = [];
    messAList.isErro = false;

    const condicaoEscolhida: CondicaoPagamentoDTO | null =
      this.pedidoForm.controls.condicaoPagamento.value;

    if (c.clienteStatusDTO.clienteStatusLabelDTO!.isVendaBloqueada) {
      const mes = new MessageAlertList();
      mes.erro = 'Bloqueio';
      mes.message = `O cliente foi bloqueado para venda e não poderá ser utilizado,
            contate a área responsável`;
      messAList.messageAlertList.push(mes);
    }

    if (
      condicaoEscolhida != null &&
      condicaoEscolhida.tipoPagamento === 'P' &&
      c.clienteDividaComproLimiteSaldoDTO.saldo < this.getVlrTotalPreVenda() &&
      this.isVendaAcimaLimiteCliente() === false
    ) {
      const mes = new MessageAlertList();
      mes.erro = 'Limite';
      mes.message = `O limite disponivel do cliente é menor que o valor total do pedido
            ou você não possui acesso para essa ação, altere a condição de pagamento ou contate a área responsável`;
      messAList.messageAlertList.push(mes);
    }

    if (this.isVerificaVendedorCliente()) {
      const mes = new MessageAlertList();

      if (c.clienteVendedorDTOs != null && c.clienteVendedorDTOs.length > 0) {
        const vendedor = this.pedidoForm.controls.vendedor.value;

        if (vendedor != null && vendedor.id != null && vendedor.id > 0) {
          const filt = c.clienteVendedorDTOs.filter((cli) => {
            return cli.funcionarioDTO!.id === vendedor.id;
          });

          if (filt.length === 0) {
            const mesR = new MessageAlertList();
            mesR.erro = 'Bloqueio';
            mesR.message = `O cliente foi bloqueado para venda e porque o representante
                    selecionado não está configurado, contate a área responsável`;
            messAList.messageAlertList.push(mesR);
          }
        }
      } else {
        mes.erro = 'Validação';
        mes.message = `O cliente não possui vendedores configurados e não poderá ser utilizado,
                    contate a área responsável`;
        messAList.messageAlertList.push(mes);
      }
    }

    if (messAList.messageAlertList.length > 0) {
      messAList.isErro = true;
    }

    return messAList;
  }

  async setaModelAndFormItem(i: ItemDTO): Promise<void> {
    const estoqueAlmoxarifadoId =
      this.pedidoForm.controls.estoqueAlmoxarifadoId.value;
    if (estoqueAlmoxarifadoId != null && estoqueAlmoxarifadoId > 0) {
      this.setaItemSelecionado(i);
      // console.log(i);
      const formItem = this.pedidoForm.get('item') as FormGroup;
      formItem.patchValue({
        id: this.itemSelecionado.id,
        idAux: this.itemSelecionado.idAux,
        nomeTypeahead: { nome: this.itemSelecionado.nome },
      });
      formItem.controls['id'].disable();
      formItem.controls['nomeTypeahead'].disable();
      formItem.controls['idAux'].disable();

      this.setaValidatorsItem(formItem);
      await this.delay(1000);
      this.qtdItemInput?.nativeElement.focus();
    } else {
      this.flgPesquisandoItem = 0;
      this.msgAlerta(
        'Atenção',
        'Selecione um estoque/almoxarifado para selecionar o item',
        'error'
      );
    }
  }

  setaValidatorsItem(formItem: FormGroup): void {
    formItem.controls['id'].setValidators([
      Validators.required,
      Validators.min(0),
    ]);
    formItem.controls['agrupamento'].setValidators(Validators.required);
    formItem.controls['qtd'].setValidators([
      Validators.required,
      Validators.min(1),
    ]);
    formItem.controls['vlr'].setValidators([
      Validators.required,
      Validators.min(1),
    ]);
    formItem.controls['perc'].setValidators(Validators.min(0));
  }
  async setaItemSelecionado(i: ItemDTO): Promise<void> {
    this.itemSelecionado = JSON.parse(JSON.stringify(i));
    this.itemSelecionado.qtdSaldo = 0;
    this.itemSelecionado.qtdComprometido = 0;
    this.itemSelecionado.qtdDisponivel = 0;
    this.itemSelecionado.qtdComprometido = 0;
    this.itemSelecionado.qtdDisponivel = 0;

    let estoqueAlmoxarifadoId =
      this.pedidoForm.controls.estoqueAlmoxarifadoId.value;

    const precoNovo: ItemAlxPrecoDTO | undefined = await lastValueFrom(
      this._itemService.getPrecoByItemIdAndEstoqueId(
        i.id,
        estoqueAlmoxarifadoId!
      )
    );

    if (precoNovo != null && precoNovo.id > 0) {
      this.itemSelecionado.precoAtual = new ItemPrecoDTO();
      this.itemSelecionado.precoAtual.preco = precoNovo.vlr;
      this.itemSelecionado.precoAtual.dtaInclusao = precoNovo.dtaInclusao;
      this.itemSelecionado.precoAtual.usuarioInclusao =
        precoNovo.usuarioInclusao;
      this.itemSelecionado.precoAtual.flAtual = true;
      this.itemSelecionado.precoAtual.itemDTO_id = precoNovo.itemDTO_id;
      this.itemSelecionado.precoAtual.id = precoNovo.id;
      this.itemSelecionado.itemAlxPrecoDTO = precoNovo;
    } else {
      this.itemSelecionado.precoAtual = new ItemPrecoDTO();
      this.itemSelecionado.precoAtual.preco = 0;
      this.itemSelecionado.precoAtual.dtaInclusao = new Date(0);
      this.itemSelecionado.precoAtual.usuarioInclusao = 'indefinido';
      this.itemSelecionado.itemAlxPrecoDTO = new ItemAlxPrecoDTO();
      this.itemSelecionado.itemAlxPrecoDTO.vlr = 0;
      this.itemSelecionado.itemAlxPrecoDTO.id = -1;
      this.itemSelecionado.itemAlxPrecoDTO.usuarioInclusao = 'indefinido';
      this.itemSelecionado.itemAlxPrecoDTO.dtaInclusao = new Date(0);
    }

    const descNovo: ItemAlxDescontoDTO[] | undefined = await lastValueFrom(
      this._itemService.getDescontosByItemIdAndEstoqueId(
        i.id,
        estoqueAlmoxarifadoId!
      )
    );
    // console.log(descNovo);

    if (descNovo != null && descNovo.length > 0) {
      this.itemSelecionado.itemAlxDescontoDTOs = descNovo;
    } else {
      this.itemSelecionado.itemAlxDescontoDTOs = [];
    }

    const vendedor = this.pedidoForm.controls.vendedor.value;

    if (vendedor != null && vendedor.id != null && vendedor.id > 0) {
      const descVendNovo: ItemAlxVendDescontoDTO[] | undefined =
        await lastValueFrom(
          this._itemService.getDescontosByItemIdAndEstoqueIdAndVendedorId(
            i.id,
            estoqueAlmoxarifadoId!,
            vendedor.id
          )
        );
      // console.log('descVendNovo: '+JSON.stringify(descVendNovo));

      if (descVendNovo != null && descVendNovo.length > 0) {
        this.itemSelecionado.itemAlxVendDescontoDTOs = descVendNovo;
      } else {
        this.itemSelecionado.itemAlxVendDescontoDTOs = [];
      }
    } else {
      this.itemSelecionado.itemAlxVendDescontoDTOs = [];
    }

    /*
        const selPreco = i.itemPrecoDTOs.filter((p) => {
            return p.flAtual === true;
        });

        if (selPreco.length === 1) {
            this.itemSelecionado.precoAtual = selPreco[0];
        } else if (selPreco.length > 1) {
            this.itemSelecionado.precoAtual = selPreco[0];
        } else {
            this.itemSelecionado.precoAtual = new ItemPrecoDTO();
            this.itemSelecionado.precoAtual.preco = 0;
            this.itemSelecionado.precoAtual.dtaInclusao = new Date(0);
            this.itemSelecionado.precoAtual.usuarioInclusao = 'indefinido';
        }
        */

    if (estoqueAlmoxarifadoId == null || estoqueAlmoxarifadoId <= 0) {
      estoqueAlmoxarifadoId = this.confGerais!.vendaEstoqueAlmoxarifadoId;
    }
    // console.log('estoqueAlmoxarifadoId: ' + estoqueAlmoxarifadoId);

    const estoqueItem = await lastValueFrom(
      this._itemService.getItemSaldoEstoque(estoqueAlmoxarifadoId, i.id)
    );

    this.itemSelecionado.estoqueAlmoxarifadoId = estoqueAlmoxarifadoId;

    if (estoqueItem != null) {
      this.itemSelecionado.qtdEntrada = estoqueItem.qtdEntrada;
      this.itemSelecionado.qtdSaida = estoqueItem.qtdSaida;
      this.itemSelecionado.qtdSaldo = estoqueItem.qtdSaldo;
      this.itemSelecionado.qtdComprometido = estoqueItem.qtdComprometido;
      this.itemSelecionado.qtdDisponivel = estoqueItem.qtdDisponivel;
    } else {
      this.itemSelecionado.qtdEntrada = 0;
      this.itemSelecionado.qtdSaida = 0;
      this.itemSelecionado.qtdSaldo = 0;
      this.itemSelecionado.qtdComprometido = 0;
      this.itemSelecionado.qtdDisponivel = 0;
    }

    const msgValidacaoItem = this.validaItemSelecionado(this.itemSelecionado);
    if (msgValidacaoItem.isErro) {
      this.msgAlertaList(
        'Atenção Item Bloqueado',
        msgValidacaoItem.messageAlertList,
        'error'
      );
    }

    this.flgPesquisandoItem = 0;

    this._itemService.getImagens(this.itemSelecionado.id).subscribe({
      next: (itemImageData) => {
        itemImageData.forEach((el) => {
          el.srcImg = 'data:' + el.fileType + ';base64,' + el.imgBase64;
          el.imgBase64 = null;
        });
        // console.log(itemImageData);
        this.itemSelecionado.itemImagemDTOs = [...itemImageData];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log(err);
      },
    });

    if (
      this.itemSelecionado.itemUnidadeDTOs != null &&
      this.itemSelecionado.itemUnidadeDTOs.length > 0
    ) {
      const fltUnids = this.itemSelecionado.itemUnidadeDTOs.filter((iu) => {
        return iu.fator > 1;
      });
      if (fltUnids.length > 0) {
        const formItem = this.pedidoForm.get('item') as FormGroup;
        formItem.controls['agrupamento'].setValue(fltUnids[0]);
      }
    }
  }

  async getItemSaldoEstoqueTable(idItem: number): Promise<number> {
    const estoqueItem = await lastValueFrom(
      this._itemService.getItemSaldoEstoque(
        this.confGerais!.vendaEstoqueAlmoxarifadoId,
        idItem
      )
    );

    if (estoqueItem != null) {
      return estoqueItem.qtdDisponivel;
    } else {
      return 0;
    }
  }

  validaItemSelecionado(i: ItemDTO): MsgValidacaoItem {
    const msgVal = new MsgValidacaoItem();
    msgVal.isErro = false;
    msgVal.messageAlertList = [];

    if (i.vendaBloqueada || i.qtdDisponivel <= 0 || i.precoAtual.preco <= 0) {
      msgVal.isErro = true;

      if (i.vendaBloqueada) {
        const msgErro = new MessageAlertList();
        msgErro.erro = 'Bloqueio';
        msgErro.message = 'Item com venda bloqueada, contate área responsável';
        msgVal.messageAlertList.push(msgErro);
      }
      if (i.qtdDisponivel <= 0) {
        const msgErro = new MessageAlertList();
        msgErro.erro = 'Estoque';
        msgErro.message =
          'Item está com estoque zerado ou negativo, contate área responsável';
        msgVal.messageAlertList.push(msgErro);
      }
      if (i.precoAtual.preco <= 0) {
        const msgErro = new MessageAlertList();
        msgErro.erro = 'Preço';
        msgErro.message =
          'Item está sem preço lançado ou zerado, contate área responsável';
        msgVal.messageAlertList.push(msgErro);
      }
    }
    return msgVal;
  }

  buscaSaldoEstoqueItem(almoxarifadoId: number, itemId: number): void {
    this._itemService.getItemSaldoEstoque(almoxarifadoId, itemId).subscribe({
      next: (data) => {
        this.itemSelecionado.qtdEntrada = data.qtdEntrada;
        this.itemSelecionado.qtdSaida = data.qtdSaida;
        this.itemSelecionado.qtdSaldo = data.qtdSaldo;
        this.itemSelecionado.qtdComprometido = data.qtdComprometido;
        this.itemSelecionado.qtdDisponivel = data.qtdDisponivel;
        this.cdr.detectChanges();
      },
      error: () => {
        this.itemSelecionado.qtdEntrada = 0;
        this.itemSelecionado.qtdSaida = 0;
        this.itemSelecionado.qtdSaldo = 0;
        this.itemSelecionado.qtdComprometido = 0;
        this.itemSelecionado.qtdDisponivel = 0;
        this.cdr.detectChanges();
      },
    });
  }

  setaVlrTotal(metodo: string): void {
    const formItem = this.pedidoForm.get('item') as FormGroup;

    if (metodo === 'vlrTotalCalc') {
      formItem.controls['vlr'].setValue(this.getVlrTotalItem());
    } else if (metodo === 'vlrTotalPerc') {
      formItem.controls['vlr'].setValue(this.getVlrTotalPerc());
    } else if (metodo === 'vlrAg') {
      formItem.controls['vlr'].setValue(this.getVlrTotalAg());
    } else {
      formItem.controls['vlr'].setValue(0);
    }
  }
  getEstoquePorAgr(un: ItemUnidadeDTO): number {
    return this.itemSelecionado.qtdDisponivel / un.fator;
  }

  getValorPorAgr(un: ItemUnidadeDTO): number {
    return this.itemSelecionado.precoAtual.preco * un.fator;
  }

  getValorComDesconto(perc: number): number {
    return this.itemSelecionado.precoAtual.preco * ((100 - perc) / 100);
  }

  selectClienteByCodForm(formCli: FormGroup): void {
    if (
      formCli.controls['id'].value != null &&
      formCli.controls['id'].value > 0
    ) {
      this.selectClienteByCod(formCli.controls['id'].value);
    } else {
      this.pop('error', 'Erro', 'Digite um código maior do que 0');
    }
  }

  selectItemByCodForm(formItem: FormGroup): void {
    if (
      formItem.controls['id'].value != null &&
      formItem.controls['id'].value > 0
    ) {
      this.selectItemByCod(formItem.controls['id'].value);
    } else {
      this.pop('error', 'Erro', 'Digite um código maior do que 0');
    }
  }

  selectItemByCodAuxForm(formItem: FormGroup): void {
    if (
      formItem.controls['idAux'].value != null &&
      formItem.controls['idAux'].value > 0
    ) {
      this.selectItemByCodAux(formItem.controls['idAux'].value);
    } else {
      this.pop('error', 'Erro', 'Digite um código maior do que 0');
    }
  }

  selectItemByCodAux(id: number): void {
    this.flgPesquisandoItem = 1;
    this._itemService.findByIdAux(id).subscribe({
      next: (data) => {
        if (data != null && data.length > 0) {
          const activeModal = this._modalService.open(
            VendaConfirmModalComponent
          );
          activeModal.componentInstance.itens = data;
          activeModal.result.then(
            (result) => {
              this.setaModelAndFormItem(result);
              this.qtdItemInput?.nativeElement.focus();
              this.pop('success', 'Encontrado com sucesso', '');
            },
            (error) => {
              console.log(error);
            }
          );
        } else {
          this.flgPesquisandoItem = 0;
          this.pop('error', 'Erro', 'Não foi encontrado item com esse codigo');
        }

        this.cdr.detectChanges();
      },
      error: () => {
        this.flgPesquisandoItem = 0;
        this.pop('error', 'Erro', 'Não foi encontrado item com esse codigo');
        this.cdr.detectChanges();
      },
    });
  }

  selectItemByCod(id: number): void {
    this.flgPesquisandoItem = 1;
    this._itemService.findById(id).subscribe({
      next: (data) => {
        this.setaModelAndFormItem(data);
        this.pop('success', 'Encontrado com sucesso', '');
        this.cdr.detectChanges();
        this.qtdItemInput?.nativeElement.focus();
      },
      error: () => {
        this.flgPesquisandoItem = 0;
        this.pop('error', 'Erro', 'Não foi encontrado item com esse codigo');
        this.cdr.detectChanges();
      },
    });
  }
  selectClienteByCGC(formCli: FormGroup): void {
    formCli.controls['cgc'].setValue(
      formCli.controls['cgc'].value.replace(/\D/g, '')
    );
    if (
      formCli.controls['cgc'].value != null &&
      formCli.controls['cgc'].value.length > 10
    ) {
      this._clienteService.findByCGC(formCli.controls['cgc'].value).subscribe({
        next: (data) => {
          if (data.length === 1) {
            this.selectClienteByCod(data[0].id);
          } else {
            this.selectClienteByArray(data);
          }
          this.cdr.detectChanges();
        },
        error: () => {
          this.pop('error', 'Erro', 'Não foi encontrado cliente com esse cgc');
          this.cdr.detectChanges();
        },
      });
    } else {
      this.pop(
        'error',
        'Erro',
        'Digite um CGC valido para procura, maior do que 10 números'
      );
    }
  }
  msgAlerta(titulo: string, conteudo: string, tipo: string): void {
    const activeModal = this._modalService.open(AppVendaModalAlertComponent, {
      backdrop: true,
    });
    activeModal.componentInstance.modalHeader = titulo;
    activeModal.componentInstance.modalContent = conteudo;
    activeModal.componentInstance.modalType = tipo;
    activeModal.result.then(
      (result) => {
        console.log(result);
      },
      (error) => {
        console.log(error);
      }
    );
  }

  msgTopItens(controleTopItens: ControleTopItens): void {
    const activeModal = this._modalService.open(
      AppVendaModalClienteTopItensComponent,
      { backdrop: true }
    );
    activeModal.componentInstance.controleTopItens = controleTopItens;
    activeModal.result.then(
      (result) => {
        if (result != null && Number(result) > 0) {
          this.onLimpaItem();
          this.selectItemByCod(Number(result));
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }

  msgTopItens2(vendedor: FuncionarioDTO | null, cliente: ClienteDTO): void {
    const activeModal = this._modalService.open(
      AppVendaModalClienteTopItensComponent,
      { backdrop: true }
    );
    activeModal.componentInstance.controleTopItens = null;
    activeModal.componentInstance.cliente = cliente;
    activeModal.componentInstance.vendedor = vendedor;
    activeModal.result.then(
      (result) => {
        if (result != null && Number(result) > 0) {
          this.onLimpaItem();
          this.selectItemByCod(Number(result));
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }

  visualizaTitulosCliente(clienteId: number): void {
    const activeModal = this._modalService.open(AppVendaModalTitulosComponent, {
      size: 'xl',
      scrollable: true,
    });
    activeModal.componentInstance.clienteDTO = this.vendaDTO.clienteDTO;
    activeModal.result.then(
      (result) => {
        console.log(result);
      },
      (error) => {
        console.log(error);
      }
    );
  }
  onLimpaItem(): void {
    const formItem = this.pedidoForm.get('item') as FormGroup;
    this.removeValidatorsItem(formItem);
    formItem.reset();
    formItem.enable();
    this.submittedItem = false;
    if (
      this.itemSelecionado == null ||
      typeof this.itemSelecionado == 'undefined'
    ) {
      this.itemSelecionado = new ItemDTO();
    }
    this.itemSelecionado.id = -1;
  }
  onLimpaItemCampos(): void {
    const formItem = this.pedidoForm.get('item') as FormGroup;
    formItem.controls['qtd'].setValue(null);
    formItem.controls['vlr'].setValue(null);
    formItem.controls['agrupamento'].setValue(null);
    formItem.controls['perc'].setValue(null);
    this.submittedItem = false;
  }
  isVendedorCliente(
    clienteDTO: ClienteDTO,
    vendedorDTO: FuncionarioDTO
  ): boolean {
    if (
      clienteDTO != null &&
      clienteDTO.clienteVendedorDTOs != null &&
      clienteDTO.clienteVendedorDTOs.length > 0 &&
      vendedorDTO != null &&
      vendedorDTO.id != null &&
      vendedorDTO.id > 0
    ) {
      const filt = clienteDTO.clienteVendedorDTOs.filter((cv) => {
        return cv.funcionarioDTO!.id === vendedorDTO.id;
      });
      if (filt.length > 0) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  getFormValidationErrors() {
    Object.keys(this.pedidoForm.controls).forEach((key) => {
      const controlErrors: ValidationErrors | null =
        this.pedidoForm.get(key)!.errors;
      if (controlErrors != null) {
        Object.keys(controlErrors).forEach((keyError) => {
          console.log(
            'Key control: ' + key + ', keyError: ' + keyError + ', err value: ',
            controlErrors[keyError]
          );
        });
      }
    });
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

  onCadastra(): void {
    if (this.permitVendaServer.vendaBloqueada === true) {
      this.msgAlerta('Atenção', this.permitVendaServer.msg, 'error');
    } else {
      if (
        this.vendaDTO.clienteDTO == null ||
        this.vendaDTO.clienteDTO.id == null ||
        this.vendaDTO.clienteDTO.id <= 0
      ) {
        this.msgAlerta(
          'Atenção',
          'Selecione um cliente para enviar um pedido',
          'error'
        );
      } else {
        if (
          this.vendaDTO.vendaItemDTOs == null ||
          this.vendaDTO.vendaItemDTOs.length === 0
        ) {
          this.msgAlerta(
            'Atenção',
            'Adicione itens para enviar um pedido',
            'error'
          );
        } else {
          // const formCliente = this.pedidoForm.get('cliente') as FormGroup;

          this.submitted = true;
          this.submittedItem = true;

          if (this.pedidoForm.invalid) {
            // console.log(this.getFormValidationErrorsV2(this.pedidoForm));
            // console.log(this.getFormValidationErrorsV2(formCliente));
            this.msgAlerta(
              'Atenção',
              `Existe campos que ainda precisam ser preenchidos,
                        navegue pelas abas e perceba os campos em vermelho, alguns campos que
                        precisam de atenção são: as datas de emissão e de entrega, também o endereço do cliente onde será entregue etc...`,
              'error'
            );
          } else {
            if (
              this.vendaDTO.clienteDTO == null ||
              this.vendaDTO.clienteDTO.id == null ||
              this.vendaDTO.clienteDTO.id <= 0
            ) {
              this.msgAlerta(
                'Atenção',
                'Selecione um cliente para continuar',
                'error'
              );
            } else {
              const msgCliSel = this.verificaClienteSelecionado(
                this.vendaDTO.clienteDTO
              );
              if (msgCliSel.isErro) {
                this.msgAlertaList(
                  'Atenção para o cliente selecionado',
                  msgCliSel.messageAlertList,
                  'error'
                );
              } else {
                this.formToDTO();

                // setando o almoxarifado dos itens
                this.vendaDTO.vendaItemDTOs.forEach((vi) => {
                  vi.estoqueAlmoxarifadoDTO = new EstoqueAlmoxarifadoDTO(
                    this.vendaDTO.estoqueAlmoxarifadoId!
                  );
                });

                this.vendaDTO.vlrTotal = this.getVlrTotalPreVenda();
                this.vendaDTO.vlrProdutos = this.getVlrTotalProdutos();
                this.vendaDTO.vlrDescontoProdutos =
                  this.getVlrTotalDescProdutos();
                this.vendaDTO.vlrProdutosSDesconto =
                  this.getVlrTotalProdutosOrig();

                this.spinner.show('fullSpinner');
                this._vendaService
                  .postOrPut(this.vendaDTO, this.statusForm)
                  .subscribe({
                    next: (data) => {
                      this.vendaDTO = data;

                      if (this.statusForm === 2) {
                        this.atualizaTable(this.vendaDTO);
                      }

                      this.dtoToForm(this.vendaDTO);
                      this.submitted = false;
                      this.submittedItem = false;

                      // delete this.pageVenda;
                      // this.pageVenda = new PageVenda();
                      // this.pageVenda.content = [];
                      this.cdr.detectChanges();
                    },
                    error: (err) => {
                      this.spinner.hide('fullSpinner');
                      // console.log(err);
                      if (
                        Object.prototype.hasOwnProperty.call(err, 'error') &&
                        err.error != null
                      ) {
                        const messAL: MessageAlertList[] = [];

                        if (
                          Object.prototype.hasOwnProperty.call(
                            err.error,
                            'fieldErrors'
                          ) &&
                          err.error.fieldErrors != null &&
                          err.error.fieldErrors.length > 0
                        ) {
                          for (
                            let i = 0;
                            i < err.error.fieldErrors.length;
                            i++
                          ) {
                            const mess = new MessageAlertList();
                            mess.erro = err.error.fieldErrors[i].code;
                            mess.message = err.error.fieldErrors[i].message;
                            messAL.push(mess);
                          }
                        }

                        this.msgAlertaList(err.error.message, messAL, 'error');
                      }
                      this.cdr.detectChanges();
                    },
                  });
              }
            }
          }
        }
      }
    }
  }
  async onLimpa(): Promise<void> {
    this.onReset();
    await this.iniciaObjs();
    this.pop('success', 'Limpo com sucesso', '');
    this.cdr.detectChanges();
    this.condicaoPagId!.nativeElement.focus();
  }
  onLeftArray(): void {
    if (this.statusForm === 2) {
      for (let i = 0; i < this.pageVenda.content.length; i++) {
        if (this.vendaDTO.id === this.pageVenda.content[i].id) {
          if (i - 1 >= 0) {
            this.selected = [];
            this.setaVendaDTO(this.pageVenda.content[i - 1]);
            this.selected.push(this.pageVenda.content[i - 1]);
            i = this.pageVenda.content.length + 1;
          } else {
            this.pop(
              'error',
              'Sem registro para mover, busque novamente ou pule a página',
              ''
            );
          }
        }
      }
    }
  }
  onRightArray(): void {
    if (this.statusForm === 2) {
      for (let i = 0; i < this.pageVenda.content.length; i++) {
        if (this.vendaDTO.id === this.pageVenda.content[i].id) {
          if (i + 1 < this.pageVenda.content.length) {
            this.selected = [];
            this.setaVendaDTO(this.pageVenda.content[i + 1]);
            this.selected.push(this.pageVenda.content[i + 1]);
            i = this.pageVenda.content.length + 1;
          } else {
            this.pop(
              'error',
              'Sem registro para mover, busque novamente ou pule a página',
              ''
            );
          }
        }
      }
    }
  }
  onDeleta(): void {
    const id = this.pedidoForm.controls.id.value;
    if (id != null && !isNaN(id) && id > 0 && this.statusForm === 2) {
      const activeModal = this._modalService.open(
        AppVendaModalConfirmComponent
      );
      activeModal.componentInstance.modalHeader = 'Confirme a exclusão';
      activeModal.componentInstance.modalContent = 'Deseja realmente excluir ?';
      activeModal.componentInstance.modalType = 'confirm';
      activeModal.componentInstance.defaultLabel = 'Não';
      activeModal.result.then(
        (result) => {
          if (result === 'confirm') {
            this.spinner.show('fullSpinner');
            let message = '';
            this._vendaService.del(id).subscribe({
              next: async (resp: any) => {
                this.spinner.hide('fullSpinner');
                if (
                  Object.prototype.hasOwnProperty.call(resp, 'status') &&
                  resp.status != null &&
                  resp.status == false
                ) {
                  message = resp.message;
                  this.pop('error', 'Erro', message);
                  this.cdr.detectChanges
                } else {
                  message = resp.message;
                  this.pop('success', 'OK', message);
                  await this.delay(1000);
                  this.onLimpa();
                  this.removeVendaPag(id);
                  this.cdr.detectChanges();
                }
              },
              error: (err) => {
                this.spinner.hide('fullSpinner');
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
    } else {
      this.msgAlerta(
        'Atenção',
        `Selecione uma venda primeiro,
            não é possível deletar sem uma venda selecionada
            ou sem um id válido`,
        'alert'
      );
    }
  }
  removeVendaPag(id: number): void {
    for (let i = 0; i < this.pageVenda.content.length; i++) {
      if (id === this.pageVenda.content[i].id) {
        this.pageVenda.content.splice(i, 1);
      }
    }
  }
  delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  isValidDelete(): boolean {
    return true;
  }
  onPesquisa(): void {
    this.formToDTO();
    this.vendaPesquisaDTO.vendaDTO = this.vendaDTO;
    //console.log(this.vendaPesquisaDTO);
    this.pesquisaVenda(this.vendaPesquisaDTO);
  }
  setPage(pageInfo: any) {
    this.vendaPesquisaDTO.pageSize = pageInfo.pageSize;
    this.vendaPesquisaDTO.pageNumber = pageInfo.offset;
    this.pesquisaVenda(this.vendaPesquisaDTO);
  }

  editando(): void {
    const sel: VendaPag[] = this.pageVenda.content.filter((us) => {
      return us.id === this.selected[0].id;
    });
    // console.log(sel[0]);
    this.setaVendaDTO(sel[0]);
    this.statusForm = 2;
    this.cdr.detectChanges();
  }

  voltar(): void {
    /*
        if (this.statusForm === 2) {
            this.statusForm = 2;
        } else {
            this.statusForm = 1;
        }
        */
    if (
      this.vendaDTO != null &&
      this.vendaDTO.id != null &&
      this.vendaDTO.id > 0 &&
      this.vendaDTO.vlrTotal != null &&
      this.vendaDTO.vlrTotal > 0 &&
      this.vendaDTO.usuarioInclusao != null &&
      this.vendaDTO.usuarioInclusao.length > 0
    ) {
      this.statusForm = 2;
    } else {
      this.statusForm = 1;
    }
  }

  getSpanBtn(tipo: string): string {
    let title = '';
    if (this.deviceAcess.isDesktop) {
      if (tipo === 'salvar' && this.statusForm === 1) {
        title = ' Salvar';
      }
      if (tipo === 'salvar' && this.statusForm === 2) {
        title = ' Alterar';
      }
      if (tipo === 'limpar') {
        title = ' Limpar';
      }
      if (tipo === 'deletar') {
        title = ' Deletar';
      }
      if (tipo === 'pesquisar') {
        title = ' Pesquisar';
      }
    }
    return title;
  }
  onReset() {
    console.log('reset');
    this.submitted = false;
    this.submittedItem = false;
    this.pedidoForm.reset();
    this.pedidoForm.enable();
    // this.pedidoForm.controls.dtaEntrega.setValue(this.addDayDateToString(new Date(), 1));
    this.pedidoForm.controls.dtaEmissao.setValue(
      this.convertDate(new Date(), 0)
    );
    /*
        this.pedidoForm.patchValue(
            {
                dtaEmissao: this.convertDate(new Date(), 0),
                // dtaEntrega: this.addDayDateToString(new Date(),1),
            }
        );
        */
    // this.pedidoForm.get('cliente').enable();

    this.disableEnderecoEntrega();
    this.disableAcrescimoCondicao();
    this.disableDescontoGeralCapa();
    this.cdr.detectChanges();
  }

  get f() {
    return this.pedidoForm.controls;
  }
  get fc() {
    const formCli = this.pedidoForm.get('cliente') as FormGroup;
    return formCli.controls;
  }
  get fi() {
    const formItem = this.pedidoForm.get('item') as FormGroup;
    return formItem.controls;
  }

  getStatusTituloReceber(indStatus: string): string {
    if (indStatus === 'A') {
      return 'ABERTO';
    } else if (indStatus === 'F') {
      return 'FECHADO';
    } else if (indStatus === 'N') {
      return 'NEGOCIADO';
    } else if (indStatus === 'P') {
      return 'EM PROTESTO';
    } else {
      return 'UNDEFINED';
    }
  }

  isTitulosExists(): boolean {
    if (
      this.vendaDTO != null &&
      this.vendaDTO.tituloReceberDTO != null &&
      this.vendaDTO.tituloReceberDTO.id != null &&
      this.vendaDTO.tituloReceberDTO.id > 0
    ) {
      return true;
    } else {
      return false;
    }
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalVenda);
  }
  statusCompleteClass(statusCode: string): boolean {
    return false;
  }
  buscaConfiguracao(): void {
    this._confService.getConfById(1).subscribe({
      next: (data) => {
        this.confGerais = data;
        // console.log(this.confGerais);
        this.cdr.detectChanges();
      },
      error: () => {
        this.pop('error', 'Erro', 'Erro ao buscar as configurações iniciais.');
        this.cdr.detectChanges();
      },
    });
  }
  buscaCondicaoPagamentos(): void {
    this._condicaoPagamentoService.getAllActive().subscribe({
      next: (data) => {
        this.condicaoPagamentos = data;
        this.setaCondicoesPagamentoVisiveis(null);
        this.cdr.detectChanges();
      },
      error: () => {
        this.pop('error', 'Erro', 'Erro ao buscar condições de pagamento.');
        this.cdr.detectChanges();
      },
    });
  }
  buscaVendedores(): void {
    this._funcionarioService.getAllActiveVendedor().subscribe({
      next: (data) => {
        this.vendedores = data;
        this.setaVendedoresVisiveis();
        this.cdr.detectChanges();
      },
      error: () => {
        this.pop('error', 'Erro', 'Erro ao buscar os vendedores.');
        this.cdr.detectChanges();
      },
    });
  }
  formToDTO(): void {
    this.vendaDTO.codPreVenda = this.pedidoForm.controls.codPreVenda.value;
    this.vendaDTO.id = this.pedidoForm.controls.id.value;
    this.vendaDTO.estoqueAlmoxarifadoId =
      this.pedidoForm.controls.estoqueAlmoxarifadoId.value;

    this.vendaDTO.dtaEntrega = this.pedidoForm.controls.dtaEntrega.value;
    this.vendaDTO.dtaEmissao = this.pedidoForm.controls.dtaEmissao.value;
    this.vendaDTO.dtaValidade = this.pedidoForm.controls.dtaValidade.value;
    this.vendaDTO.vendedorDTO = this.pedidoForm.controls.vendedor.value;
    this.vendaDTO.condicaoPagamentoDTO =
      this.pedidoForm.controls.condicaoPagamento.value;
    this.vendaDTO.descricao = this.pedidoForm.controls.descricao.value;

    this.vendaDTO.logradouroEntrega =
      this.pedidoForm.controls.logradouroEntrega.value;
    this.vendaDTO.cepEntrega = this.pedidoForm.controls.cepEntrega.value;
    this.vendaDTO.numEntrega = this.pedidoForm.controls.numEntrega.value;
    this.vendaDTO.bairroEntrega = this.pedidoForm.controls.bairroEntrega.value;
    this.vendaDTO.municipioEntrega =
      this.pedidoForm.controls.municipioEntrega.value;
    this.vendaDTO.estadoEntrega = this.pedidoForm.controls.estadoEntrega.value;
    this.vendaDTO.latEntrega = this.pedidoForm.controls.latEntrega.value;
    this.vendaDTO.lngEntrega = this.pedidoForm.controls.lngEntrega.value;

    this.vendaDTO.vlrFrete = this.pedidoForm.controls.vlrFrete.value;
    this.vendaDTO.vlrDespAcessoria =
      this.pedidoForm.controls.vlrDespAcessoria.value;
    this.vendaDTO.vlrAcrescimoFixoCondicao =
      this.pedidoForm.controls.vlrAcrescimoFixoCondicao.value == null
        ? 0
        : this.pedidoForm.controls.vlrAcrescimoFixoCondicao.value;

    this.vendaDTO.vlrDescontoGeral =
      this.pedidoForm.controls.vlrDescontoGeral.value;

    /*
        if (this.vendaDTO.condicaoPagamentoDTO != null && this.vendaDTO.vendaStatusAtualDTO) {
            this.vendaDTO.vlrAcrescimoFixoCondicao = this.vendaDTO.condicaoPagamentoDTO.vlrAcrescimoFixo;
        } else {
            this.vendaDTO.vlrAcrescimoFixoCondicao = 0;
        }
        */

    this.vendaDTO.browserAcesso = this.deviceAcess.deviceInfo.browser;
    this.vendaDTO.deviceAcesso = this.deviceAcess.deviceInfo.device;
    this.vendaDTO.osAcesso = this.deviceAcess.deviceInfo.os;
  }
  dtoToForm(vendaDTO: VendaDTO): void {
    this.vendaDTO = vendaDTO;
    this.statusForm = 2;

    this.setaModelAndFormCliente(this.vendaDTO.clienteDTO!, this.statusForm);

    // console.log(this.vendaDTO);
    // console.log(vendaDTO);
    /*
        if (this.vendaDTO.vendaStatusAtual == null) {
            const statusAtual = this.vendaDTO.vendaStatusDTOs.filter(vs => {
                return vs.flAtual === true;
            });
            this.vendaDTO.vendaStatusDTO = statusAtual[0];
        }
        */

    this.pedidoForm.patchValue({
      id: this.vendaDTO.id,
      estoqueAlmoxarifadoId: this.vendaDTO.estoqueAlmoxarifadoId,
      codPreVenda: this.vendaDTO.codPreVenda,
      dtaEntrega: this.vendaDTO.dtaEntrega,
      dtaEmissao: this.vendaDTO.dtaEmissao,
      dtaValidade: this.vendaDTO.dtaValidade,
      vendedor: this.vendaDTO.vendedorDTO,

      enderecoEntrega: new ClienteEnderecoDTO(this.vendaDTO.idEnderecoCliente!),
      logradouroEntrega: this.vendaDTO.logradouroEntrega,
      cepEntrega: this.vendaDTO.cepEntrega,
      numEntrega: this.vendaDTO.numEntrega,
      bairroEntrega: this.vendaDTO.bairroEntrega,
      municipioEntrega: this.vendaDTO.municipioEntrega,
      estadoEntrega: this.vendaDTO.estadoEntrega,
      latEntrega: this.vendaDTO.latEntrega,
      lngEntrega: this.vendaDTO.lngEntrega,

      condicaoPagamento: this.vendaDTO.condicaoPagamentoDTO,
      descricao: this.vendaDTO.descricao,
      vlrFrete: this.vendaDTO.vlrFrete,
      vlrDespAcessoria: this.vendaDTO.vlrDespAcessoria,
      vlrDescontoGeral: this.vendaDTO.vlrDescontoGeral,

      vlrTotal: this.vendaDTO.vlrTotal,
      vlrAcrescimoFixoCondicao: this.vendaDTO.vlrAcrescimoFixoCondicao,

      status: this.vendaDTO.vendaStatusAtualDTO.vendaStatusLabelDTO,
    });

    this.pedidoForm.controls.id.disable();
    this.pedidoForm.controls.codPreVenda.disable();
    this.disableAcrescimoCondicao();
    this.disableDescontoGeralCapa();

    if (
      this.vendaDTO.vendaStatusAtualDTO.vendaStatusLabelDTO.sigla === 'AB' &&
      (this.vendaDTO.condicaoPagamentoDTO!.numAcrescimoPerc == null ||
        this.vendaDTO.condicaoPagamentoDTO!.numAcrescimoPerc === 0) &&
      (this.vendaDTO.condicaoPagamentoDTO!.vlrAcrescimoFixo == null ||
        this.vendaDTO.condicaoPagamentoDTO!.vlrAcrescimoFixo === 0)
    ) {
      this.pedidoForm.controls.vlrAcrescimoFixoCondicao.setValue(0);
    }

    /*
        if (!this.isStatusAberto()) {
            // this.pedidoForm.disable();
            this.pedidoForm.controls.condicaoPagamento.disable();
            this.pedidoForm.controls.vendedor.disable();

            this.pedidoForm.controls.estoqueAlmoxarifadoId.disable();

            this.pedidoForm.controls.dtaEntrega.disable();
            this.pedidoForm.controls.dtaEmissao.disable();
            this.pedidoForm.controls.dtaValidade.disable();
            this.pedidoForm.controls.descricao.disable();

            this.pedidoForm.controls.vlrAcrescimoFixoCondicao.disable();
            this.pedidoForm.controls.vlrFrete.disable();
            this.pedidoForm.controls.vlrDespAcessoria.disable();

            this.pedidoForm.controls.enderecoEntrega.disable();
            this.pedidoForm.controls.logradouroEntrega.disable();
            this.pedidoForm.controls.cepEntrega.disable();
            this.pedidoForm.controls.numEntrega.disable();
            this.pedidoForm.controls.bairroEntrega.disable();
            this.pedidoForm.controls.municipioEntrega.disable();
            this.pedidoForm.controls.estadoEntrega.disable();
            this.pedidoForm.controls.latEntrega.disable();
            this.pedidoForm.controls.lngEntrega.disable();
        }
        */
    this.spinner.hide('fullSpinner');
    this.cdr.detectChanges();
  }
  pesquisaVenda(vendaPesquisa: VendaPesquisaDTO): void {
    this.spinner.show('fullSpinner');
    this._vendaService.find2(vendaPesquisa).subscribe({
      next: (data) => {
        this.spinner.hide('fullSpinner');
        const pageData = data;
        // console.log(pageData);
        // pageData.content = pageData.content.sort((obj1, obj2) => {
        //     if (obj1.id > obj2.id) {
        //         return 1;
        //     }
        //     if (obj1.id < obj2.id) {
        //         return -1;
        //     }
        //     return 0;
        // });

        // for (let i = 0; i < pageData.content.length; i++) {
        //     const idEst = pageData.content[i].estoqueAlmoxarifadoId;
        //     const est = this.estoqueAlmoxarifados.filter(et => {
        //         return et.id == idEst;
        //     });
        //     if (est != null && est.length > 0) {
        //         pageData.content[i].estoqueAlmoxarifadoDTO = est[0];
        //     }
        // }

        this.pageVenda = pageData;

        // console.log(this.pageVenda);
        /*
                    if (this.pageVenda.content.length === 0) {
                        this.pop('error', 'Pesquisa', 'Não foi encontrado nada com essa pesquisa.');
                    } else if (this.pageVenda.content.length === 1) {
                        this.pop('success', 'Pesquisa', 'Encontrado apenas 1.');
                        this.setaVendaDTO(this.pageVenda.content[0]);
                        // console.log(this.getUltStatusConfirmacao());
                        this.statusForm = 2;
                    } else {
                        // console.log('mais que 1');
                        this.statusForm = 3;
                    }
                    */
        if (this.pageVenda.content.length === 0) {
          this.pop(
            'error',
            'Pesquisa',
            'Não foi encontrado nada com essa pesquisa.'
          );
        } else {
          // console.log('mais que 1');
          this.statusForm = 3;
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.spinner.hide('fullSpinner');
        this.cdr.detectChanges();
      },
    });
  }

  setaVendaDTO(vendaDTOIn: VendaPag): void {
    this.spinner.show('fullSpinner');
    this._vendaService.findById(vendaDTOIn.id).subscribe({
      next: (vendaSub) => {
        this.vendaDTO = vendaSub;
        this.vendaDTO.vendaItemDTOs = [...this.vendaDTO.vendaItemDTOs];
        this.vendaDTO.vendaStatusDTOs = [...this.vendaDTO.vendaStatusDTOs];

        for (let i = 0; i < this.vendaDTO.vendaItemDTOs.length; i++) {
          this._itemService
            .getItemSaldoEstoque(
              this.confGerais!.vendaEstoqueAlmoxarifadoId,
              this.vendaDTO.vendaItemDTOs[i].itemDTO.id
            )
            .subscribe({
              next: (data) => {
                this.vendaDTO.vendaItemDTOs[i].qtdEstoqueAtual =
                  data.qtdDisponivel;
              },
              error: (error) => {
                console.log(error);
              },
            });
        }

        this.dtoToForm(this.vendaDTO);
        // console.log(this.vendaDTO);
      },
      error: (error) => {
        console.log(error);
        this.spinner.hide('fullSpinner');
      },
    });
  }
  qtdEstoqueAtualTable(row: VendaItemDTO): number {
    if (
      row == null ||
      row.qtdEstoqueAtual == null ||
      row.qtdEstoqueAtual === 0
    ) {
      return 0;
    } else {
      return row.qtdEstoqueAtual / row.itemUnidadeDTO.fator;
    }
  }
  getValorAgItemRow(row: VendaItemDTO): number {
    if (row == null || row.vlrUnitario == null || row.fatorInclusao == null) {
      return 0;
    } else {
      return row.vlrUnitario * row.fatorInclusao;
    }
  }
  convertDate(inputFormat: any, dia: any): string {
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

  convertToDate(inputFormat: any, dia: any): Date {
    function pad(s: number) {
      return s < 10 ? '0' + s : s;
    }

    const d = new Date(inputFormat);
    d.setDate(d.getDate() + dia);

    console.log(d);

    return d;
  }

  addDayToDate(dateFun: any, dias: any) {
    const dtaMom = moment(dateFun);
    const time = moment.duration('03:00:00');
    const mom = dtaMom.subtract(time).add('days', dias);
    // return mom.format('YYYY-MM-DDTHH:MM:SS');

    return mom.toISOString().substring(0, 19);
  }

  addDayDateToString(dateFun: any, dias: any) {
    const dtaMom = moment(dateFun);
    const time = moment.duration('03:00:00');
    const mom = dtaMom.subtract(time).add('days', dias);
    // return mom.format('YYYY-MM-DDTHH:MM:SS');

    // console.log(mom.utc().toString());
    console.log(mom.toISOString().substring(0, 19));
    return mom.toISOString().substring(0, 19);
  }

  unsetSelected(): void {
    if (this.selected != null) {
      this.selected.splice(0, this.selected.length);
    }
  }

  limpaEndereco(): void {
    this.vendaDTO.idEnderecoCliente = null;
    this.vendaDTO.municipioDTO = null;

    if (
      this.vendaDTO.clienteDTO != null &&
      this.vendaDTO.clienteDTO.clienteEnderecoDTOs != null &&
      this.vendaDTO.clienteDTO.clienteEnderecoDTOs.length > 0
    ) {
      this.vendaDTO.clienteDTO.clienteEnderecoDTOs = [];
    }

    this.pedidoForm.patchValue({
      logradouroEntrega: null,
      cepEntrega: null,
      numEntrega: null,
      bairroEntrega: null,
      municipioEntrega: null,
      estadoEntrega: null,

      latEntrega: null,
      lngEntrega: null,
    });
  }
  enderecoSelecionado(): void {
    const endSel: ClienteEnderecoDTO =
      this.pedidoForm.controls.enderecoEntrega.value;
    this.vendaDTO.idEnderecoCliente = endSel.id;
    this.vendaDTO.municipioDTO = endSel.municipioDTO;
    this.pedidoForm.patchValue({
      logradouroEntrega: endSel.logradouro,
      cepEntrega: endSel.cep,
      numEntrega: endSel.numLogradouro,
      bairroEntrega: endSel.bairro,
      municipioEntrega: endSel.municipioDTO.nome,
      estadoEntrega: endSel.municipioDTO.estadoDTO!.nome,

      latEntrega: endSel.latitude,
      lngEntrega: endSel.longitude,
    });

    this.vendaDTO.logradouroEntrega = endSel.logradouro;
    this.vendaDTO.cepEntrega = endSel.cep;
    this.vendaDTO.numEntrega = endSel.numLogradouro;
    this.vendaDTO.bairroEntrega = endSel.bairro;
    this.vendaDTO.municipioEntrega = endSel.municipioDTO.nome;
    this.vendaDTO.estadoEntrega = endSel.municipioDTO.estadoDTO!.nome;

    /*
                const uri = this._clienteService.convertEndToStringURLGoogle(endSel.logradouro, endSel.numLogradouro,
                    endSel.municipioDTO.nome, endSel.municipioDTO.estadoDTO.nome);
                    this._clienteService.getLatLongGoogleDirect(uri)
                    .subscribe((data) => {
                        if (data.status === 'OK') {
                            console.log('setando');
                            const lat = data.results[0].geometry.location.lat;
                            const lng = data.results[0].geometry.location.lng;
                            this.pedidoForm.patchValue({
                                latEntrega: lat,
                                lngEntrega: lng,
                            });
                        }
                    }, (error) => {
                        console.log(error);
                    });
                    */
  }
  isAcoesVisiveis(): boolean {
    if (
      this.vendaDTO == null ||
      this.vendaDTO.vendaStatusAtualDTO == null ||
      this.vendaDTO.vendaStatusAtualDTO.vendaStatusLabelDTO == null
    ) {
      return false;
    } else {
      return true;
    }
  }

  isBotaoConfirmar(): boolean {
    if (
      this.isAcoesVisiveis() &&
      this.vendaDTO.vendaStatusAtualDTO.vendaStatusLabelDTO.sigla === 'AB' &&
      this.isRoleConfirmar()
    ) {
      return true;
    } else {
      return false;
    }
  }

  

  isStatusAberto(): boolean {
    // console.log(this.vendaDTO);
    if (
      (this.vendaDTO != null &&
        this.vendaDTO.vendaStatusAtualDTO != null &&
        this.vendaDTO.vendaStatusAtualDTO.vendaStatusLabelDTO != null &&
        this.vendaDTO.vendaStatusAtualDTO.vendaStatusLabelDTO.sigla === 'AB') ||
      this.vendaDTO.vendaStatusAtualDTO == null
    ) {
      return true;
    } else {
      return false;
    }
  }

  isBotaoValidar(): boolean {
    if (
      this.isAcoesVisiveis() &&
      this.vendaDTO.vendaStatusAtualDTO.vendaStatusLabelDTO.sigla === 'CF' &&
      this.isRoleValidar()
    ) {
      return true;
    } else {
      return false;
    }
  }

  atualizaTable(vendaDTO: VendaDTO): void {
    if (
      this.pageVenda != null &&
      this.pageVenda.content != null &&
      this.pageVenda.content.length > 0
    ) {
      for (let i = 0; i < this.pageVenda.content.length; i++) {
        if (vendaDTO.id === this.pageVenda.content[i].id) {
          const vendaPag = new VendaPagina();
          vendaPag.id = vendaDTO.id;
          vendaPag.dtaInclusao = vendaDTO.dtaInclusao;
          vendaPag.usuarioInclusao = vendaDTO.usuarioInclusao;
          vendaPag.dtaEmissao = vendaDTO.dtaEmissao;
          vendaPag.dtaEntrega = vendaDTO.dtaEntrega;
          vendaPag.estoqueAlmoxarifadoId = vendaDTO.estoqueAlmoxarifadoId;

          const flt = this.estoqueAlmoxarifados.filter((alx) => {
            return alx.id === vendaDTO.estoqueAlmoxarifadoId;
          });

          if (flt.length > 0) {
            vendaPag.estoqueAlmoxarifadoNome = flt[0].nome;
          }

          vendaPag.status =
            vendaDTO.vendaStatusAtualDTO.vendaStatusLabelDTO.label;
          vendaPag.condicaoPagamentoId = vendaDTO.condicaoPagamentoDTO!.id;
          vendaPag.condicaoPagamentoNome = vendaDTO.condicaoPagamentoDTO!.nome;
          vendaPag.clienteId = vendaDTO.clienteDTO!.id;
          vendaPag.clienteNome = vendaDTO.clienteDTO!.nome;
          vendaPag.vendedorId = vendaDTO.vendedorDTO!.id;
          vendaPag.vendedorNome = vendaDTO.vendedorDTO!.nome;
          vendaPag.vlrTotal = vendaDTO.vlrTotal;
          vendaPag.roleName = vendaDTO.vendaStatusAtualDTO.roleName;
          vendaPag.statusSigla =
            vendaDTO.vendaStatusAtualDTO.vendaStatusLabelDTO.sigla;
          vendaPag.origem = vendaDTO.origem;
          

          this.pageVenda.content[i] = vendaPag;
        }
      }
    }
  }

  confirmaVenda(): void {
    if (
      this.roundNuber(this.getVlrTotalPreVendaOrig()) ===
      this.roundNuber(this.getVlrTotalPreVenda())
    ) {
      const activeModal = this._modalService.open(
        AppVendaModalConfirmJust2Component
      );
      activeModal.componentInstance.modalHeader = 'Confirme';
      activeModal.componentInstance.modalContent =
        'Deseja realmente confirmar o Pedido ?';
      activeModal.componentInstance.modalType = 'confirm';
      activeModal.componentInstance.defaultLabel = 'Não';
      activeModal.componentInstance.tipoStatus = 'confirmação';
      activeModal.result.then(
        (result) => {
          // console.log(result);
          if (
            typeof result !== 'undefined' &&
            result != null &&
            result.tipo === 'confirm'
          ) {
            this.spinner.show('fullSpinner');

            const r = new RequestServerJust();
            r.idPedido = this.vendaDTO.id;
            r.justificativa = result.justificativa;
            this.cdr.detectChanges();
            this._vendaService.postConfirmaVenda(r).subscribe({
              next: (data) => {
                this.spinner.hide('fullSpinner');
                this.vendaDTO = data;
                this.atualizaTable(this.vendaDTO);
                this.dtoToForm(this.vendaDTO);
                this.cdr.detectChanges();
              },
              error: () => {
                this.spinner.hide('fullSpinner');
                this.cdr.detectChanges();
              },
            });
          }
        },
        (error) => {
          console.log(error);
        }
      );
    } else {
      const activeModal = this._modalService.open(AppVendaModalAlertComponent);
      activeModal.componentInstance.modalHeader = 'Atenção';
      activeModal.componentInstance.modalContent = `Você alterou o valor total do pedido original e ainda não salvou
            altere primeiro para depois confirmar o pedido.`;
      activeModal.componentInstance.modalType = 'confirm';
      activeModal.componentInstance.defaultLabel = 'OK';
      activeModal.result.then(
        (result) => {
          console.log(result);
        },
        (error) => {
          console.log(error);
        }
      );
    }
  }

  validaVenda(): void {
    const activeModal = this._modalService.open(
      AppVendaModalConfirmJustComponent
    );
    activeModal.componentInstance.modalHeader = 'Confirme';
    activeModal.componentInstance.modalContent =
      'Deseja realmente validar o Pedido ?';
    activeModal.componentInstance.modalType = 'confirm';
    activeModal.componentInstance.defaultLabel = 'Não';
    activeModal.result.then(
      (result) => {
        // console.log(result);
        if (
          typeof result !== 'undefined' &&
          result != null &&
          result.tipo === 'confirm'
        ) {
          this.spinner.show('fullSpinner');

          const r = new RequestServerJust();
          r.idPedido = this.vendaDTO.id;
          r.justificativa = result.justificativa;
          this.cdr.detectChanges();
          this._vendaService.postValidaVenda(r).subscribe({
            next: (data) => {
              this.spinner.hide('fullSpinner');
              this.vendaDTO = data;
              this.atualizaTable(this.vendaDTO);
              this.dtoToForm(this.vendaDTO);
              this.cdr.detectChanges();
            },
            error: () => {
              this.spinner.hide('fullSpinner');
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

  aprovaVenda(): void {
    const activeModal = this._modalService.open(
      AppVendaModalConfirmJustComponent
    );
    activeModal.componentInstance.modalHeader = 'Confirme';
    activeModal.componentInstance.modalContent =
      'Deseja realmente aprovar o Pedido ?';
    activeModal.componentInstance.modalType = 'confirm';
    activeModal.componentInstance.defaultLabel = 'Não';
    activeModal.result.then(
      (result) => {
        if (
          typeof result !== 'undefined' &&
          result != null &&
          result.tipo === 'confirm'
        ) {
          this.spinner.show('fullSpinner');

          const r = new RequestServerJust();
          r.idPedido = this.vendaDTO.id;
          r.justificativa = result.justificativa;
          this.cdr.detectChanges();
          this._vendaService.postAprovaVenda(r).subscribe({
            next: (data) => {
              this.spinner.hide('fullSpinner');
              this.vendaDTO = data;
              this.atualizaTable(this.vendaDTO);
              this.dtoToForm(this.vendaDTO);
              this.cdr.detectChanges();
            },
            error: () => {
              this.spinner.hide('fullSpinner');
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

  faturaVenda(): void {
    const activeModal = this._modalService.open(
      AppVendaModalConfirmJustComponent
    );
    activeModal.componentInstance.modalHeader = 'Confirme';
    activeModal.componentInstance.modalContent =
      'Deseja realmente faturar o Pedido ?';
    activeModal.componentInstance.modalType = 'confirm';
    activeModal.componentInstance.defaultLabel = 'Não';
    activeModal.result.then(
      (result) => {
        if (
          typeof result !== 'undefined' &&
          result != null &&
          result.tipo === 'confirm'
        ) {
          this.spinner.show('fullSpinner');

          const r = new RequestServerJust();
          r.idPedido = this.vendaDTO.id;
          r.justificativa = result.justificativa;
          this.cdr.detectChanges();
          this._vendaService.postFaturarVenda(r).subscribe({
            next: (data) => {
              this.spinner.hide('fullSpinner');
              this.vendaDTO = data;
              this.atualizaTable(this.vendaDTO);
              this.dtoToForm(this.vendaDTO);
              this.cdr.detectChanges();
            },
            error: () => {
              this.spinner.hide('fullSpinner');
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

  desFaturaVenda(): void {
    const activeModal = this._modalService.open(
      AppVendaModalConfirmJustComponent
    );
    activeModal.componentInstance.modalHeader = 'Confirme';
    activeModal.componentInstance.modalContent =
      'Deseja realmente voltar o faturamento do Pedido? Após essa ação o pedido voltará para aberto';
    activeModal.componentInstance.modalType = 'confirm';
    activeModal.componentInstance.defaultLabel = 'Não';
    activeModal.result.then(
      (result) => {
        if (
          typeof result !== 'undefined' &&
          result != null &&
          result.tipo === 'confirm'
        ) {
          this.spinner.show('fullSpinner');

          const r = new RequestServerJust();
          r.idPedido = this.vendaDTO.id;
          r.justificativa = result.justificativa;
          this.cdr.detectChanges();
          this._vendaService.postDesFaturarVenda(r).subscribe({
            next: (data) => {
              this.spinner.hide('fullSpinner');
              this.vendaDTO = data;
              this.atualizaTable(this.vendaDTO);
              this.dtoToForm(this.vendaDTO);
              this.cdr.detectChanges();
            },
            error: () => {
              this.spinner.hide('fullSpinner');
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

  marcarAguardandoCarregamento(): void {
    const activeModal = this._modalService.open(
      AppVendaModalConfirmJustComponent
    );
    activeModal.componentInstance.modalHeader = 'Confirme a marcação como aguardando carregamento';
    activeModal.componentInstance.modalContent =
      'Deseja realmente marcar como aguardando carregamento esse pedido?';
    activeModal.componentInstance.modalType = 'confirm';
    activeModal.componentInstance.defaultLabel = 'Não';
    activeModal.result.then(
      (result) => {
        console.log(result);
        if (
          typeof result !== 'undefined' &&
          result != null &&
          result.tipo === 'confirm'
        ) {

          this.spinner.show('fullSpinner');

          const r = new RequestServerJust();
          r.idPedido = this.vendaDTO.id;
          r.justificativa = result.justificativa;
          console.log('pesquisando');

          this._vendaService.marcarAguardandoCarregamento(r)
          .subscribe({
            next: (data) => {
              this.spinner.hide('fullSpinner');
              this.vendaDTO = data;
              this.atualizaTable(this.vendaDTO);
              this.dtoToForm(this.vendaDTO);
              this.cdr.detectChanges();
            },
            error: (err) => {
              this.spinner.hide('fullSpinner');
              console.log(err);
              this.toastr.error('Erro ao marcar para aguardando carregamento', 'Erro');
            }
          });
        
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }

  marcarCarregado(): void {
    const activeModal = this._modalService.open(
      AppVendaModalConfirmJustComponent
    );
    activeModal.componentInstance.modalHeader = 'Confirme a marcação como carregado';
    activeModal.componentInstance.modalContent =
      'Deseja realmente marcar como carregado esse pedido?';
    activeModal.componentInstance.modalType = 'confirm';
    activeModal.componentInstance.defaultLabel = 'Não';
    activeModal.result.then(
      (result) => {
        console.log(result);
        if (
          typeof result !== 'undefined' &&
          result != null &&
          result.tipo === 'confirm'
        ) {

          this.spinner.show('fullSpinner');

          const r = new RequestServerJust();
          r.idPedido = this.vendaDTO.id;
          r.justificativa = result.justificativa;
          console.log('pesquisando');

          this._vendaService.marcarCarregado(r)
          .subscribe({
            next: (data) => {
              this.spinner.hide('fullSpinner');
              this.vendaDTO = data;
              this.atualizaTable(this.vendaDTO);
              this.dtoToForm(this.vendaDTO);
              this.cdr.detectChanges();
            },
            error: (err) => {
              this.spinner.hide('fullSpinner');
              console.log(err);
              this.toastr.error('Erro ao marcar carregado', 'Erro');
            }
          });
        
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }

  assumirCaixa(): void {
    const activeModal = this._modalService.open(
      AppVendaModalConfirmComponent
    );
    activeModal.componentInstance.modalHeader = 'Confirme';
    activeModal.componentInstance.modalContent =
      'Deseja realmente assumir o pedido para o seu caixa? Após essa ação não será possivel voltar a atrás';
    activeModal.componentInstance.modalType = 'confirm';
    activeModal.componentInstance.defaultLabel = 'Não';
    activeModal.result.then(
      (result) => {
        if (
          typeof result !== 'undefined' &&
          result != null &&
          result === 'confirm'
        ) {
          // console.log('confirm');
          // this.spinner.show('fullSpinner');
          this._vendaService.assumirCaixa(this.vendaDTO.id!)
          .subscribe({
            next: (data) => {
              this.spinner.hide('fullSpinner');
              this.vendaDTO = data;
              this.atualizaTable(this.vendaDTO);
              this.dtoToForm(this.vendaDTO);
              this.cdr.detectChanges();
            },
            error: (err) => {
              this.spinner.hide('fullSpinner');
              console.log(err);
              this.toastr.error('Erro ao assumir o caixa', 'Erro');
            }
          });
        
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }

  cancelarVenda(): void {
    const motivos = this.vendaStatusMotivos.filter((m) => {
      return m.tipo === 'cancelamento' && m.status === true;
    });

    const activeModal = this._modalService.open(
      AppVendaModalCancelamentoComponent
    );
    activeModal.componentInstance.modalHeader = 'Confirme';
    activeModal.componentInstance.modalContent = `Deseja realmente cancelar o Pedido?
        Após essa ação não será possível reabrir o pedido`;
    activeModal.componentInstance.modalType = 'confirm';
    activeModal.componentInstance.defaultLabel = 'Não';
    activeModal.componentInstance.motivosCancelamento = motivos;
    activeModal.result.then(
      (result) => {
        if (
          typeof result !== 'undefined' &&
          result != null &&
          result.tipo === 'confirm'
        ) {
          this.spinner.show('fullSpinner');

          const r = new RequestServerJust();
          r.idPedido = this.vendaDTO.id;
          r.justificativa = result.justificativa;
          r.vendaStatusMotivoDTO = result.motivo;

          // console.log(r);

          this.cdr.detectChanges();
          this._vendaService.postCancelaVenda(r).subscribe({
            next: (data) => {
              this.spinner.hide('fullSpinner');
              this.vendaDTO = data;
              this.atualizaTable(this.vendaDTO);
              this.dtoToForm(this.vendaDTO);
              this.cdr.detectChanges();
            },
            error: () => {
              this.spinner.hide('fullSpinner');
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

  desconfirmarVenda(): void {
    const activeModal = this._modalService.open(
      AppVendaModalConfirmJustComponent
    );
    activeModal.componentInstance.modalHeader = 'Confirme';
    activeModal.componentInstance.modalContent =
      'Deseja realmente desconfirmar o Pedido? Após essa ação o pedido irá para o status aberto';
    activeModal.componentInstance.modalType = 'confirm';
    activeModal.componentInstance.defaultLabel = 'Não';
    activeModal.result.then(
      (result) => {
        if (
          typeof result !== 'undefined' &&
          result != null &&
          result.tipo === 'confirm'
        ) {
          this.spinner.show('fullSpinner');

          const r = new RequestServerJust();
          r.idPedido = this.vendaDTO.id;
          r.justificativa = result.justificativa;
          this.cdr.detectChanges();
          this._vendaService.postDesconfirmarVenda(r).subscribe({
            next: (data) => {
              this.spinner.hide('fullSpinner');
              this.vendaDTO = data;
              this.atualizaTable(this.vendaDTO);
              this.dtoToForm(this.vendaDTO);
              this.cdr.detectChanges();
            },
            error: () => {
              this.spinner.hide('fullSpinner');
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

  isRoleDescontoGeralCapa(): boolean {
    const flt = this.currentUserSalesApp.user.authorityDTOs.filter(
      (auth: any) => {
        return (
          auth.name === 'ROLE_SALES_PAGINA_VENDA_FUNCAO_DESCONTO_GERAL_CAPA'
        );
      }
    );
    return flt.length > 0 ? true : false;
  }

  isRoleAprovar(): boolean {
    const flt = this.currentUserSalesApp.user.authorityDTOs.filter(
      (auth: any) => {
        return auth.name === 'ROLE_SALES_PAGINA_VENDA_FUNCAO_BOTAO_APROVAR';
      }
    );
    return flt.length > 0 ? true : false;
  }


  isRoleAprovarPixMesmoUsuario(): boolean {
    const flt = this.currentUserSalesApp.user.authorityDTOs.filter(
      (auth: any) => {
        return auth.name === 'ROLE_SALES_PAGINA_VENDA_FUNCAO_BOTAO_APROVAR_PIX_MESMO_USUARIO';
      }
    );
    return flt.length > 0 ? true : false;
  }

  isRoleAprovarPixMesmoRepresentante(): boolean {
    const flt = this.currentUserSalesApp.user.authorityDTOs.filter(
      (auth: any) => {
        return auth.name === 'ROLE_SALES_PAGINA_VENDA_FUNCAO_BOTAO_APROVAR_PIX_MESMO_REPRESENTANTE';
      }
    );
    return flt.length > 0 ? true : false;
  }

  isRoleFaturar(): boolean {
    const flt = this.currentUserSalesApp.user.authorityDTOs.filter(
      (auth: any) => {
        return auth.name === 'ROLE_SALES_PAGINA_VENDA_FUNCAO_BOTAO_FATURAR';
      }
    );
    return flt.length > 0 ? true : false;
  }

  isRoleFaturarLote(): boolean {
    const flt = this.currentUserSalesApp.user.authorityDTOs.filter(
      (auth: any) => {
        return auth.name === 'ROLE_SALES_PAGINA_VENDA_FUNCAO_BOTAO_FATURAR_LOTE';
      }
    );
    return flt.length > 0 ? true : false;
  }

  isRoleCancelar(): boolean {
    const flt = this.currentUserSalesApp.user.authorityDTOs.filter(
      (auth: any) => {
        return auth.name === 'ROLE_SALES_PAGINA_VENDA_FUNCAO_BOTAO_CANCELAR';
      }
    );
    return flt.length > 0 ? true : false;
  }

  isRoleDesFaturar(): boolean {
    const flt = this.currentUserSalesApp.user.authorityDTOs.filter(
      (auth: any) => {
        return auth.name === 'ROLE_SALES_PAGINA_VENDA_FUNCAO_BOTAO_DESFATURAR';
      }
    );
    return flt.length > 0 ? true : false;
  }

  isRoleDesConfirmar(): boolean {
    const flt = this.currentUserSalesApp.user.authorityDTOs.filter(
      (auth: any) => {
        return (
          auth.name === 'ROLE_SALES_PAGINA_VENDA_FUNCAO_BOTAO_DESCONFIRMAR'
        );
      }
    );
    return flt.length > 0 ? true : false;
  }

  isRoleMarcarCarregado(): boolean {
    return true;
  }
  isRoleMarcarAguardandoCarregamento(): boolean {
    return true;
  }

  isRoleAssumirCaixa(): boolean {
    const flt = this.currentUserSalesApp.user.authorityDTOs.filter(
      (auth: any) => {
        return (
          auth.name === 'ROLE_SALES_PAGINA_VENDA_FUNCAO_BOTAO_ASSUMIR_CAIXA'
        );
      }
    );
    return flt.length > 0 ? true : false;
  }

  isRoleConfirmar(): boolean {
    const flt = this.currentUserSalesApp.user.authorityDTOs.filter(
      (auth: any) => {
        return auth.name === 'ROLE_SALES_PAGINA_VENDA_FUNCAO_BOTAO_CONFIRMAR';
      }
    );
    return flt.length > 0 ? true : false;
  }

  isRoleAlteraAcrescimoCondicao(): boolean {
    const flt = this.currentUserSalesApp.user.authorityDTOs.filter(
      (auth: any) => {
        return auth.name === 'ROLE_SALES_PAGINA_VENDA_FUNCAO_ALT_ACRE_CONDICAO';
      }
    );
    return flt.length > 0 ? true : false;
  }

  isRoleAlteraAlmoxarifado(): boolean {
    const flt = this.currentUserSalesApp.user.authorityDTOs.filter(
      (auth: any) => {
        return auth.name === 'ROLE_SALES_PAGINA_VENDA_FUNCAO_ACESSO_ESTOQUES';
      }
    );
    return flt.length > 0 ? true : false;
  }

  isRoleAprovarSuperior(): boolean {
    const flt = this.currentUserSalesApp.user.authorityDTOs.filter(
      (auth: any) => {
        return (
          auth.name ===
          'ROLE_SALES_PAGINA_VENDA_FUNCAO_AUTORIZA_DESCONTO_SUPERIOR'
        );
      }
    );
    return flt.length > 0 ? true : false;
  }

  isRoleValidar(): boolean {
    const flt = this.currentUserSalesApp.user.authorityDTOs.filter(
      (auth: any) => {
        return auth.name === 'ROLE_SALES_PAGINA_VENDA_FUNCAO_BOTAO_VALIDAR';
      }
    );
    return flt.length > 0 ? true : false;
  }

  isRoleImprimir(): boolean {
    const flt = this.currentUserSalesApp.user.authorityDTOs.filter(
      (auth: any) => {
        return auth.name === 'ROLE_SALES_PAGINA_VENDA_FUNCAO_BOTAO_IMPRIMIR';
      }
    );
    return flt.length > 0 ? true : false;
  }

  isRoleImprimirSelected(): boolean {
    const flt = this.currentUserSalesApp.user.authorityDTOs.filter(
      (auth: any) => {
        return auth.name === 'ROLE_SALES_PAGINA_VENDA_FUNCAO_BOTAO_IMPRIMIR_MULTIPLOS_SELECIONADOS';
      }
    );
    return flt.length > 0 ? true : false;
  }

  isRoleImprimirSemFaturar(): boolean {
    const flt = this.currentUserSalesApp.user.authorityDTOs.filter(
      (auth: any) => {
        return this.isRoleImprimir() &&
        auth.name === 'ROLE_SALES_PAGINA_VENDA_FUNCAO_BOTAO_IMPRIMIR_SEM_FATURAR';
      }
    );
    return flt.length > 0 ? true : false;
  }

  // isBotaoAprovar(): boolean {
  //   if (
  //     this.isAcoesVisiveis() &&
  //     (this.vendaDTO.vendaStatusAtualDTO.vendaStatusLabelDTO.sigla === 'AAE' ||
  //       this.vendaDTO.vendaStatusAtualDTO.vendaStatusLabelDTO.sigla === 'AAF')
  //       &&
  //       (this.isRoleAprovar() || (
  //         this.isRoleAprovarPixMesmoUsuario() && this.vendaDTO.usuarioInclusao === this.currentUserSalesApp.username && this.vendaDTO.condicaoPagamentoDTO?.nome.indexOf('PIX') !== -1
  //       )
  //     )
  //   ) {
  //     return true;
  //   } else {
  //     return false;
  //   }
  // }

  isBotaoAprovar(): boolean {
    if (this.isAcoesVisiveis()) {
      if (this.vendaDTO.vendaStatusAtualDTO.vendaStatusLabelDTO.sigla === 'AAE') {
        if (this.isRoleAprovar()) {
          return true;
        } else {
          return false;
        }
      } else if (this.vendaDTO.vendaStatusAtualDTO.vendaStatusLabelDTO.sigla === 'AAF') {
        if ( this.isRoleAprovar() ||
          (this.isRoleAprovarPixMesmoUsuario() && this.vendaDTO.usuarioInclusao === this.currentUserSalesApp.username && this.vendaDTO.condicaoPagamentoDTO?.nome.indexOf('PIX') !== -1)) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }      
    } else {
      return false;
    }
  }


  isBotaoFaturar(): boolean {
    if (
      this.isAcoesVisiveis() &&
      this.isRoleFaturar() &&
      this.vendaDTO.vendaStatusAtualDTO.vendaStatusLabelDTO.sigla === 'AFA'
    ) {
      return true;
    } else {
      return false;
    }
  }
  isBotaoDesFaturar(): boolean {
    if (
      this.isAcoesVisiveis() &&
      this.isRoleDesFaturar() &&
      this.vendaDTO.vendaStatusAtualDTO.vendaStatusLabelDTO.flgFat > 0
    ) {
      return true;
    } else {
      return false;
    }
  }
  isBotaoCancelar(): boolean {
    if (
      this.isAcoesVisiveis() &&
      this.isRoleCancelar() &&
      (this.vendaDTO.vendaStatusAtualDTO.vendaStatusLabelDTO.sigla === 'AB' ||
        this.vendaDTO.vendaStatusAtualDTO.vendaStatusLabelDTO.sigla === 'CF' ||
        this.vendaDTO.vendaStatusAtualDTO.vendaStatusLabelDTO.sigla === 'AAE' ||
        this.vendaDTO.vendaStatusAtualDTO.vendaStatusLabelDTO.sigla === 'AE' ||
        this.vendaDTO.vendaStatusAtualDTO.vendaStatusLabelDTO.sigla === 'AAF' ||
        this.vendaDTO.vendaStatusAtualDTO.vendaStatusLabelDTO.sigla === 'AF' ||
        this.vendaDTO.vendaStatusAtualDTO.vendaStatusLabelDTO.sigla === 'AFA')
    ) {
      return true;
    } else {
      return false;
    }
  }

  isBotaoMarcarCarregado(): boolean {
    if (
      this.isAcoesVisiveis() &&
      this.isRoleMarcarCarregado() &&
      
        (
          this.vendaDTO.vendaStatusAtualDTO.vendaStatusLabelDTO.flgFat !== null &&
          this.vendaDTO.vendaStatusAtualDTO.vendaStatusLabelDTO.flgFat > 0 &&
          this.vendaDTO.vendaStatusAtualDTO.vendaStatusLabelDTO.sigla === 'ACR'
        )
    ) {
      return true;
    } else {
      return false;
    }
  }

  isBotaoMarcarAguardandoCarregamento(): boolean {
    if (
      this.isAcoesVisiveis() &&
      this.isRoleMarcarAguardandoCarregamento() &&
      
        (
          this.vendaDTO.vendaStatusAtualDTO.vendaStatusLabelDTO.flgFat !== null &&
          this.vendaDTO.vendaStatusAtualDTO.vendaStatusLabelDTO.flgFat > 0 &&
          (this.vendaDTO.vendaStatusAtualDTO.vendaStatusLabelDTO.sigla === 'CRR' || this.vendaDTO.vendaStatusAtualDTO.vendaStatusLabelDTO.sigla === 'FA')
        )
    ) {
      return true;
    } else {
      return false;
    }
  }

  isBotaoAssumirCaixa(): boolean {
    if (
      this.isAcoesVisiveis() &&
      this.isRoleAssumirCaixa() &&
      
        (
          this.vendaDTO.vendaStatusAtualDTO.vendaStatusLabelDTO.flgFat !== null &&
          this.vendaDTO.vendaStatusAtualDTO.vendaStatusLabelDTO.flgFat > 0
        )
    ) {
      return true;
    } else {
      return false;
    }
  }

  isBotaoDesConfirmar(): boolean {
    if (
      this.isAcoesVisiveis() &&
      this.isRoleDesConfirmar() &&
      (this.vendaDTO.vendaStatusAtualDTO.vendaStatusLabelDTO.sigla === 'CF' ||
        this.vendaDTO.vendaStatusAtualDTO.vendaStatusLabelDTO.sigla === 'AAE' ||
        this.vendaDTO.vendaStatusAtualDTO.vendaStatusLabelDTO.sigla === 'AE' ||
        this.vendaDTO.vendaStatusAtualDTO.vendaStatusLabelDTO.sigla === 'AAF' ||
        this.vendaDTO.vendaStatusAtualDTO.vendaStatusLabelDTO.sigla === 'AF' ||
        this.vendaDTO.vendaStatusAtualDTO.vendaStatusLabelDTO.sigla === 'AFA')
    ) {
      return true;
    } else {
      return false;
    }
  }

  isBotaoPrint2(): boolean {
    if (this.isAcoesVisiveis() && this.isRoleImprimir()) {
      return true;
    } else {
      return false;
    }
  }

  isBotaoPrintSelected(): boolean {
    if (
      this.isRoleImprimirSelected()
    ) {
      return true;
    } else {
      return false;
    }
  }

  isBotaoFaturarTodos(): boolean {
    if (
      this.isRoleFaturarLote() &&
      this.pageVenda != null &&
      this.pageVenda.content.length > 0
    ) {
      return true;
    } else {
      return false;
    }
  }

  isBotaoPrint(): boolean {
    if (
      this.isAcoesVisiveis() && 
      this.vendaDTO.vendaStatusAtualDTO.vendaStatusLabelDTO.flgFat > 0 &&
      this.isRoleImprimir()
  ) {
      return true;
    } else if (
      this.isAcoesVisiveis() && 
      this.vendaDTO.vendaStatusAtualDTO.vendaStatusLabelDTO.flgFat === 0 &&
      this.isRoleImprimirSemFaturar()
    ) {
      return true;
    } else {
      return false;
    }
  }
  
  openPrintPageBkp(): void {
    this.vendaDTO.statusConfirmacao =
      this._vendaService.getUltStatusConfirmacao(this.vendaDTO);
    this.vendaDTO.statusAprovacao = this._vendaService.getUltStatusAprovado(
      this.vendaDTO
    );
    this.vendaDTO.statusFaturamento = this._vendaService.getUltStatusFaturado(
      this.vendaDTO
    );

    const id = new Date().getTime();
    const key =
      this.currentUserSalesApp.username +
      '_' +
      id.toString() +
      '_' +
      this.vendaDTO.id;

    const fltEstoque = this.estoqueAlmoxarifados.filter((ea) => {
      return ea.id == this.vendaDTO.estoqueAlmoxarifadoId;
    });

    if (fltEstoque.length > 0) {
      this.vendaDTO.estoqueAlmoxarifadoDTO = fltEstoque[0];
    }

    this._vendaService
      .storageSet(key, { id: 'venda', data: this.vendaDTO })
      .subscribe(
        (resp) => {
          // console.log(resp);
          // console.log('Deu tudo certo, vamos imprimir');
          const hrefFull =
            this._vendaService.hrefContext() + 'print/venda/' + key;
          // console.log(hrefFull);
          this.router.navigate([]).then((result) => {
            window.open(hrefFull, '_blank');
          });
          this.cdr.detectChanges();
        },
        (error) => {
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
        }
      );
  }

  openPrintTermalPage(): void {
    this.vendaDTO.statusConfirmacao =
      this._vendaService.getUltStatusConfirmacao(this.vendaDTO);
    this.vendaDTO.statusAprovacao = this._vendaService.getUltStatusAprovado(
      this.vendaDTO
    );
    this.vendaDTO.statusFaturamento = this._vendaService.getUltStatusFaturado(
      this.vendaDTO
    );

    const id = new Date().getTime();
    const key =
      this.currentUserSalesApp.username +
      '_' +
      id.toString() +
      '_' +
      this.vendaDTO.id;

    const fltEstoque = this.estoqueAlmoxarifados.filter((ea) => {
      return ea.id == this.vendaDTO.estoqueAlmoxarifadoId;
    });

    if (fltEstoque.length > 0) {
      this.vendaDTO.estoqueAlmoxarifadoDTO = fltEstoque[0];
    }

    this._vendaService
      .storageSet(key, { id: 'venda', data: this.vendaDTO })
      .subscribe(
        (resp) => {
          // console.log(resp);
          console.log('Deu tudo certo, vamos imprimir');
          const hrefFull =
            this._vendaService.hrefContext() + 'print/venda2/' + key;
          // console.log(hrefFull);
          this.router.navigate([]).then((result) => {
            window.open(hrefFull, '_blank');
          });
          this.cdr.detectChanges();
        },
        (error) => {
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
        }
      );
  }

  onTable(): void {
    this.unsetSelected();
    if (this.pageVenda != null && this.pageVenda.content.length > 0) {
      this.statusForm = 3;
    } else {
      this.pop('error', 'Erro', 'Procure primeiro.');
    }
    this.cdr.detectChanges();
  }
  onActivate(event: any) {
    if (
      event.type === 'dblclick' ||
      (event.type === 'keydown' && event.event.keyCode === 13)
    ) {
      this.editando();
    }
  }

  imprimirVarios(): void {
    const flt = this.pageVenda.content.filter(ct => {
      if (!this.isUndefined(ct.imprime) && ct.imprime !== null && ct.imprime === true) {
        return true;
      } else {
        return false;
      }
    });

    if (flt.length > 0) {
        this.openPrintPage2(flt);
    }
  }

  getAlmoxarifadoById(id: number): EstoqueAlmoxarifadoDTO | undefined {
    const fltEstoque = this.estoqueAlmoxarifados.filter((ea) => {
      return ea.id === id;
    });
    if (fltEstoque.length > 0) {
      return fltEstoque[0];
    } else {
      return undefined;
    }
  }

  selecionarTodasAsVendas(): void {
    this.pageVenda.content.forEach((vd) => {
      vd.imprime = true;
    });
    this.pageVenda.content = [...this.pageVenda.content];
  }

  openPrintPage(): void {
    const pesVenda: PesqVendaArrayBody = {
      ids: []
    };
    pesVenda.ids.push(this.vendaDTO.id!);
    
    this.printAllSelectedByArray(pesVenda);
  }

  faturarTodos(): void {
    const vd = this.pageVenda.content.filter(pv => {
      return (Object.prototype.hasOwnProperty.call(pv, 'imprime') && pv.imprime === true);
    });

    if (vd.length === 0) {
      this.toastr.warning('Selecione alguma pre-venda para tentar faturar', '');
    } else {

     const bodyPost: BodyPostIds = {
        ids: [],
        vendaPesquisaDTO: this.vendaPesquisaDTO
     };

      vd.forEach(fi => {
        bodyPost.ids.push(fi.id);
      });

      this.spinner.show('fullSpinner');
      this._vendaService.postFaturarMultiplasVendas(bodyPost)
      .subscribe({
        next: (data) => {
          console.log(data);
          this.spinner.hide('fullSpinner');

          this.pageVenda = data.page;
          this.cdr.detectChanges();
          
          const activeModal = this._modalService.open(
            ModalFaturarMultiplasComponent,
            { size: 'xl', scrollable: true, backdrop: true }
          );
          activeModal.componentInstance.faturarVendaReturn = data;
          activeModal.result.then(
            (result: FaturarVendaItemReturn[]) => {
              if (result != null && this.isUndefined(result) == false && this.isArray(result) == true && result.length > 0) {
                const pesVenda: PesqVendaArrayBody = {
                  ids: []
                };
          
                result.forEach(fi => {
                  pesVenda.ids.push(fi.vendaId);
                });
          
                this.printAllSelectedByArray(pesVenda);
              }
            },
            (error) => {
              console.log(error);
            }
          );
        },
        error: (err) => {
          console.log(err);
          this.spinner.hide('fullSpinner');
          this.toastr.error('Erro ao faturar vendas, contate o administrador','ERRO');
          this.cdr.detectChanges();
        }
      });

      
    }
  }

  printAllSelected(): void {
    const vd = this.pageVenda.content.filter(pv => {
      return (Object.prototype.hasOwnProperty.call(pv, 'imprime') && pv.imprime === true);
    });

    if (vd.length === 0) {
      this.toastr.warning('Nada para imprimir', '');
    } else {
      const pesVenda: PesqVendaArrayBody = {
        ids: []
      };

      vd.forEach(fi => {
        pesVenda.ids.push(fi.id);
      });

      this.printAllSelectedByArray(pesVenda);
    }
  }

  printAllSelectedByArray(pesVenda: PesqVendaArrayBody): void {
      this.spinner.show('fullSpinner');
      this._vendaService.findAllVendasByIdsNode(pesVenda)
      .subscribe({
        next: (data) => {
          console.log(data);
          this.spinner.hide('fullSpinner');

          const id = new Date().getTime();
          const key =
          this.currentUserSalesApp.username +
          '_' +
          id.toString() +
          '_multiple';

          this._vendaService
          .storageSet(key, { id: 'vdprint', data: data })
          .subscribe(
            () => {
              // console.log(resp);
              // console.log('Deu tudo certo, vamos imprimir');
              const hrefFull =
                this._vendaService.hrefContext() + 'print/vd-print/' + key;
              // console.log(hrefFull);
              this.router.navigate([]).then(() => {
                window.open(hrefFull, '_blank');
              });
              this.cdr.detectChanges();
            },
            (error) => {
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
            }
          );


        },
        error: (err) => {
          console.log(err);
          this.spinner.hide('fullSpinner');
        }
      });
  }

  propertyExistsInAnyObject(property: string, ...objects: any[]): boolean {
    for (const obj of objects) {
        if (obj && Object.prototype.hasOwnProperty.call(obj, property)) {
            return true;
        }
    }
    return false;
}

  openPrintPage2(flt: VendaPag[]): void {

    const pesVenda: PesqVendaArrayBody = {
      ids: []
    };

    flt.forEach(fi => {
      pesVenda.ids.push(fi.id);
    });
    this.spinner.show('fullSpinner');
    this._vendaService.findAllVendasByIdsNode(pesVenda)
    .subscribe({
      next: (data) => {
        this.spinner.hide('fullSpinner');
        
      const id = new Date().getTime();
      const key =
      this.currentUserSalesApp.username +
      '_' +
      id.toString() +
      '_multiple';

    

    this._vendaService
      .storageSet(key, { id: 'vendas', data: data })
      .subscribe(
        (resp) => {
          // console.log(resp);
          // console.log('Deu tudo certo, vamos imprimir');
          const hrefFull =
            this._vendaService.hrefContext() + 'print/vendas/' + key;
          // console.log(hrefFull);
          this.router.navigate([]).then((result) => {
            window.open(hrefFull, '_blank');
          });
          this.cdr.detectChanges();
        },
        (error) => {
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
        }
      );

      },
      error: (err) => {
        this.spinner.hide('fullSpinner');
        console.log(err);
        this.toastr.error('Erro ao buscar vendas, contate o administrador','ERRO');
      }
    });

    /*
    const id = new Date().getTime();
    const key =
      this.currentUserSalesApp.username +
      '_' +
      id.toString() +
      '_multiple';

    const fltEstoque = this.estoqueAlmoxarifados.filter((ea) => {
      return ea.id == this.vendaDTO.estoqueAlmoxarifadoId;
    });

    if (fltEstoque.length > 0) {
      this.vendaDTO.estoqueAlmoxarifadoDTO = fltEstoque[0];
    }

    this._vendaService
      .storageSet(key, { id: 'venda', data: this.vendaDTO })
      .subscribe(
        (resp) => {
          // console.log(resp);
          // console.log('Deu tudo certo, vamos imprimir');
          const hrefFull =
            this._vendaService.hrefContext() + 'print/venda/' + key;
          // console.log(hrefFull);
          this.router.navigate([]).then((result) => {
            window.open(hrefFull, '_blank');
          });
          this.cdr.detectChanges();
        },
        (error) => {
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
        }
      );
      */
  }


}
