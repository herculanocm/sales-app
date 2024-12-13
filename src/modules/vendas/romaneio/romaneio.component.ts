import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ChangeDetectorRef,
} from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { AppVendaModalAlertComponent } from '../modals/app-venda-modal-alert/app-venda-modal-alert.component';
import { AppVendaModalConfirmComponent } from '../modals/app-venda-modal-confirm/app-venda-modal-confirm.component';
import { Router } from '@angular/router';
import { MessageAlertList } from '../modals/app-venda-modal-alert-list/app-venda-modal-alert-list-utils';
import { AppVendaModalAlertListComponent } from '../modals/app-venda-modal-alert-list/app-venda-modal-alert-list.component';
import moment from 'moment';
import 'moment/locale/pt-br';
import { ElementRef } from '@angular/core';
import { ViewChild } from '@angular/core';
import { AppVendaModalAlxConfirmComponent } from '../modals/app-venda-modal-confirm-alx/app-venda-modal-confirm-alx.component';
import { EstoqueAlmoxarifadoService } from '../../estoques/estoque-almoxarifado/estoque-almoxarifado.service';
import { EstoqueAlmoxarifadoDTO } from '../../estoques/estoque-almoxarifado/estoque-almoxarifado';
import { AppVendaModalAlertPreVendaComponent } from '../modals/app-venda-modal-prev/app-venda-modal-prev.component';
import { AppVendaModalAlertAcoesVendaComponent } from '../modals/app-venda-modal-acoes/app-venda-modal-acoes.component';
import { AppVendaModalMapComponent } from '../modals/app-venda-modal-map/app-venda-modal-map.component';
import { AppVendaModalWebRotaComponent } from '../modals/app-venda-modal-webrota/app-venda-modal-webrota.component';
import { ToastrService } from 'ngx-toastr';
import { ColumnMode, SelectionType } from '@swimlane/ngx-datatable';
import { CurrentUserSalesAppAux } from '@modules/shared/models/generic';
import {
  AgrupamentoAux,
  BuscaRomaneioVendaId,
  CondicoesVlrAux,
  PageRomaneio,
  RomaneioDTO,
  RomaneioPesquisaDTO,
  VendaStatusAux,
} from '@modules/shared/models/romaneio';
import { FuncionarioDTO } from '@modules/shared/models/funcionario';
import { VeiculoDTO } from '@modules/shared/models/veiculo';
import { VendaDTO } from '@modules/shared/models/venda';
import { FuncionarioService, VendaService } from '@modules/shared/services';
import { VeiculoService } from '@modules/veiculos/veiculo/veiculo.service';
import { RomaneioService } from '@modules/shared/services/romaneio.service';
import { MapsService } from '@modules/shared/services/maps.service';
import { lastValueFrom } from 'rxjs';
import { environment } from 'environments/environment';
import { AccessValidateComponent } from '@modules/shared/components';
import { AppRomModalSearchComponent } from '../modals/app-rom-modal-search/app-rom-modal-search.component';
import { AppModalRomaneioAddMultiplasComponent } from '../modals/app-rom-modal-msgs/app-rom-modal-msgs.component';

@Component({
  selector: 'app-romaneio',
  templateUrl: './romaneio.component.html',
  styleUrls: ['./romaneio.component.scss'],
})
export class RomaneioComponent implements OnInit, AfterViewInit {
  @ViewChild('veiculoId') veiculoId: ElementRef | undefined;
  ColumnMode: any;
  submitted: boolean;
  currentUserSalesApp!: CurrentUserSalesAppAux;
  statusForm: number;
  romaneioDTO!: RomaneioDTO;
  selected: any[] = [];
  selectedVenda: any[] = [];
  pageRomaneio!: PageRomaneio;
  romaneioPesquisaDTO!: RomaneioPesquisaDTO;
  motoristas!: FuncionarioDTO[] | undefined;
  veiculos!: VeiculoDTO[] | undefined;
  vendaDTOs!: VendaDTO[];
  condicoesVlrAux!: CondicoesVlrAux[];
  agrupamentoAux!: AgrupamentoAux[];
  flgPesquisando: number;
  estoqueAlmoxarifados: EstoqueAlmoxarifadoDTO[];
  qtdClientesVendas = 0;
  qtdVendas = 0;
  @ViewChild('mapContainer', { static: false })
  gmap!: ElementRef;
  // @ViewChild('mapContainer', { static: false }) set content(content: ElementRef) {
  //     if (content) {
  //         this.gmap = content;
  //     }
  // }

  // lat = -18.913664;
  // lng = -48.266560;

  lat = Number(-18.935358);
  lng = Number(-48.372155);

  latf = Number(-18.935960);
  lngf = Number(-48.372500);



  initialPosition = new google.maps.LatLng(this.lat, this.lng);
  finalPosition = new google.maps.LatLng(this.latf, this.lngf);
  directionsService!: google.maps.DirectionsService;
  directionsRenderer!: google.maps.DirectionsRenderer;

  route!: google.maps.Polyline;
  coordinates: google.maps.LatLng;
  mapOptions: google.maps.MapOptions;
  markers: any = [];
  map: any;
  selectionTypeSingle = SelectionType.single;

  rotaForm = new FormGroup({
    id: new FormControl<number | null>(null),
    veiculoDTO: new FormControl<VeiculoDTO | null>(null),
    motoristaDTO: new FormControl<FuncionarioDTO | null>(null),
    descricao: new FormControl(''),
    idVenda: new FormControl<number | null>(null),
    indStatus: new FormControl<string | null>(''),

    qtdAlteracao: new FormControl<number | null>(null),

    estoqueAlmoxarifadoId: new FormControl<number | null>(null, [
      Validators.required,
    ]),

    vlrTrocoDespesa: new FormControl<number | null>(null),
    vlrDiaria: new FormControl<number | null>(null),
    vlrAcessoria: new FormControl<number | null>(null),

    dtaEntrega: new FormControl<Date | null>(null),
    dtaCaixa: new FormControl<Date | null>(null, [Validators.required]),
  });

  constructor(
    private toastr: ToastrService,
    private _modalService: NgbModal,
    private _funcionarioService: FuncionarioService,
    private _veiculoService: VeiculoService,
    private _vendaService: VendaService,
    private spinner: NgxSpinnerService,
    private router: Router,
    private _romaneioService: RomaneioService,
    private _mapsService: MapsService,
    private cdr: ChangeDetectorRef,
    private _estoqueAlmoxarifado: EstoqueAlmoxarifadoService,
  ) {
    this.submitted = false;
    this.ColumnMode = ColumnMode;
    this.statusForm = 1;
    this.flgPesquisando = 0;
    this.estoqueAlmoxarifados = [];

    // Coordinates to set the center of the map
    this.coordinates = new google.maps.LatLng(this.lat, this.lng);

    this.mapOptions = {
      center: this.coordinates,
      zoom: 12,
      gestureHandling: 'cooperative',
      styles: [
        {
          featureType: 'poi.business',
          stylers: [{ visibility: 'off' }],
        },
        {
          featureType: 'transit',
          elementType: 'labels.icon',
          stylers: [{ visibility: 'off' }],
        },
      ],
    };
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
    this.veiculoId!.nativeElement.focus();
    this.mapInitializer();
  }

  mapInitializer() {
    this.map = new google.maps.Map(this.gmap.nativeElement, this.mapOptions);
    this.directionsService = new google.maps.DirectionsService();
    this.directionsRenderer = new google.maps.DirectionsRenderer();
    this.directionsRenderer.setMap(this.map);

    // Create a marker
    const initialMarker = new google.maps.Marker({
      position: this.initialPosition, // Initial position
      map: this.map,
      label: {
        text: 'Ponto Inicial',
        color: 'black',
        fontSize: '16px',
        fontWeight: 'bold',
      },
    });
  }

  isVendaWithoutLatLng(venda: VendaDTO): boolean {
    if (
      venda.latEntrega == null ||
      venda.latEntrega.length == 0 ||
      venda.lngEntrega == null ||
      venda.lngEntrega.length == 0
    ) {
      return true;
    } else {
      return false;
    }
  }

  removeDuplicatePoints(waypoints: google.maps.LatLng[]): google.maps.LatLng[] {
    if (!waypoints) {
      return [];
    }

    const uniqueWaypoints: google.maps.LatLng[] = [];
    const seenPoints: { [key: string]: boolean } = {};

    waypoints.forEach(waypoint => {
      const key = `${waypoint.lat()},${waypoint.lng()}`;
      if (!seenPoints[key]) {
        uniqueWaypoints.push(waypoint);
        seenPoints[key] = true;
      }
    });

    return uniqueWaypoints;
  }

  createRoute(startPoint: google.maps.LatLng, endPoint: google.maps.LatLng, waypoints: google.maps.LatLng[]): void {

    waypoints = this.removeDuplicatePoints(waypoints);

    const chunkSize = 23; // 23 waypoints per request to stay under the limit
    const waypointChunks = [];

    console.log(waypoints.length);

    // Split waypoints into chunks
    for (let i = 0; i < waypoints.length; i += chunkSize) {
      const chunk = waypoints.slice(i, i + chunkSize);
      if (i === 0) {
        // Include start point in the first chunk
        chunk.unshift(startPoint);
        //console.log('including start point', startPoint.lat(), startPoint.lng());
      }
      if (i + chunkSize >= waypoints.length) {
        // Include end point in the last chunk
        chunk.push(endPoint);
        //console.log('including end point', endPoint.lat(), endPoint.lng());
      }
      waypointChunks.push(chunk);
    }

    // Make separate requests for each chunk
    waypointChunks.forEach((chunk, index) => {
      console.log('-----------------------------------------');
      // chunk.map(waypoint => console.log(waypoint.lat(), waypoint.lng()));
      const request: google.maps.DirectionsRequest = {
        origin: index === 0 ? startPoint : chunk[0], // Start point for the first chunk, first waypoint for subsequent chunks
        destination: index === waypointChunks.length - 1 ? endPoint : chunk[chunk.length - 1], // End point for the last chunk, last waypoint for other chunks
        waypoints: chunk.slice(1, -1).map(waypoint => ({ location: waypoint, stopover: true })), // Convert LatLng objects to DirectionsWaypoint objects
        travelMode: google.maps.TravelMode.DRIVING,
        optimizeWaypoints: true,
        unitSystem: google.maps.UnitSystem.METRIC
      };

      this.directionsService.route(request, (response, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          this.directionsRenderer.setDirections(response);
        } else {
          console.log(request, status);
          console.log(response);
          ///window.alert('Directions request failed due to ' + status);
        }
      });
    });
  }

  // createRoute(startPoint: google.maps.LatLng, endPoint: google.maps.LatLng, waypoints: google.maps.LatLng[]): void {
  //   const request: google.maps.DirectionsRequest = {
  //     origin: startPoint,
  //     destination: endPoint,
  //     waypoints: waypoints.map(waypoint => ({ location: waypoint, stopover: true })),
  //     travelMode: google.maps.TravelMode.DRIVING,
  //     optimizeWaypoints: true,
  //     unitSystem: google.maps.UnitSystem.METRIC
  //   };

  //   this.directionsService.route(request, (response, status) => {
  //     if (status === google.maps.DirectionsStatus.OK) {
  //       this.directionsRenderer.setDirections(response);
  //     } else {
  //       window.alert('Directions request failed due to ' + status);
  //     }
  //   });
  // }

  addMap(): void {
    this.mapInitializer();
  }

  isArray(value: any): boolean {
    return Array.isArray(value);
  }

  get f() {
    return this.rotaForm.controls;
  }

  formToObject(): RomaneioDTO {
    const romaneioDTO: any = this.rotaForm.getRawValue();

    romaneioDTO.vendas = {
      vendas: this.vendaDTOs,
    };
    romaneioDTO.condicoes = {
      condicoes: this.condicoesVlrAux,
    };
    romaneioDTO.vlrTotal = this.getValorTotalVendas();

    return romaneioDTO;
  }

  onCadastra(): void {
    this.submitted = true;

    /*
        if (this.rotaForm.invalid) {
            this.msgAlerta('Atenção', 'Existe campos que ainda precisam ser preenchidos', 'error');
        } else if (this.vendaDTOs == null || this.vendaDTOs.length === 0) {
            this.msgAlerta('Atenção', 'Nenhuma venda foi adicionada ainda', 'error');
        } else {
        */
    if (this.rotaForm.invalid) {
      this.msgAlerta(
        'Atenção',
        'Existe campos que ainda precisam ser preenchidos',
        'error'
      );
    } else {
      const rotaForm: any = this.rotaForm.getRawValue();
      this.romaneioDTO = rotaForm;
      this.romaneioDTO.vendas = {
        vendas:
          this.vendaDTOs == null || this.vendaDTOs.length == 0
            ? []
            : this.vendaDTOs,
      };
      this.romaneioDTO.condicoes = {
        condicoes: this.condicoesVlrAux,
      };
      this.romaneioDTO.vlrTotal = this.getValorTotalVendas();

      this.spinner.show('fullSpinner');
      this._romaneioService
        .postOrPut(this.romaneioDTO, this.statusForm)
        .subscribe({
          next: (data) => {
            this.spinner.hide('fullSpinner');
            if (data.status) {
              this.dtoToForm(data.romaneioDTO);
              this.statusForm = 2;
              this.pageRomaneio.content = [];
              console.log('entrou');
            } else {
              const vsaux = data.vendaStatusAuxs;
              if (vsaux != null && vsaux.length > 0) {
                this.msgAlertaPreVenda(
                  'Atenção os seguintes pedidos abaixo não estão no status de faturado',
                  null,
                  'error',
                  vsaux
                );
              } else {
                this.msgAlerta('Atenção - Erro', data.msg, 'error');
              }
            }
            this.cdr.detectChanges();
          },
          error: (error) => {
            this.spinner.hide('fullSpinner');
            if (
              Object.prototype.hasOwnProperty.call(error, 'error') &&
              error.error != null
            ) {
              const messAL: MessageAlertList[] = [];

              if (
                Object.prototype.hasOwnProperty.call(
                  error.error,
                  'fieldErrors'
                ) &&
                error.error.fieldErrors != null &&
                error.error.fieldErrors.length > 0
              ) {
                for (let i = 0; i < error.error.fieldErrors.length; i++) {
                  const mess = new MessageAlertList();
                  mess.erro = error.error.fieldErrors[i].code;
                  mess.message = error.error.fieldErrors[i].message;
                  messAL.push(mess);
                }
              }

              this.msgAlertaList(error.error.message, messAL, 'error');
            }
            this.cdr.detectChanges();
          },
        });
    }
  }

  msgAlertaList(
    header: string,
    messAList: MessageAlertList[],
    modalType: string
  ): void {
    // console.log('alert list');
    // console.log(messAList);
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

  async onLimpa(): Promise<void> {
    this.onReset();
    await this.iniciaObjs();
    this.pop('success', 'Limpo com sucesso', '');
    this.cdr.detectChanges();
  }

  refreshMarkers(): void {
    this.markers = [];
    this.vendaDTOs.forEach(async (el) => {
      this.addMarker(el);
    });
    //this.cdr.detectChanges();
  }
  addMarker(venda: VendaDTO): void {
    let noLatnoLong = false;
    if (!this.isVendaWithoutLatLng(venda)) {
      const markerObj = {
        position: new google.maps.LatLng(
          Number(venda.latEntrega),
          Number(venda.lngEntrega)
        ),
        map: this.map,
        title: venda.id!.toString(),
        label: {
          text: venda.id!.toString(),
          color: 'black',
          fontSize: '16px',
          fontWeight: 'bold',
        },
        // animation: google.maps.Animation.DROP,
        icon: {
          url: this._mapsService.getImgTruckBase64(),
          fillColor: '#ea4435',
          scaledSize: new google.maps.Size(40, 40),
          labelOrigin: new google.maps.Point(15, -10),
        },
      };

      const marker: any = new google.maps.Marker({
        ...markerObj,
      });

      const panelContent =
        `
        <div>
            <h6>` +
        venda.id +
        ` </h6>
            <p style='margin: 0px; padding: 0px'><span style='font-weight:500;'>` +
        venda.clienteDTO!.nome +
        `</span>
            </p>
        </div>`;

      // creating a new info window with markers info
      const infoWindow = new google.maps.InfoWindow({
        content: panelContent,
      });

      // Add click event to open info window on marker

      marker.addListener('click', () => {
        infoWindow.open(marker.getMap(), marker);
      });

      // Adding marker to google map
      marker.setMap(this.map);

      this.markers.push(marker);

      //this.reorganizeRoute();

      //this.drawRoute();
    } else {
      console.log(venda);
      noLatnoLong = true;
    }

    if (noLatnoLong) {
      this.toastr.warning('Existe vendas sem latitude e longitude configuradas', '');
    }
  }

  // reorganizeRoute(): void {
  //     this.markers.sort((a: google.maps.Marker, b: google.maps.Marker) => {
  //         return a.getPosition()!.lat() - b.getPosition()!.lat();
  //     });
  // }


  //   async reorganizeRouteFromLocations(locations: google.maps.LatLng[], initialAndEndLocation: google.maps.LatLng): Promise<google.maps.LatLng[]> {
  //     // Create a DirectionsService instance
  //     const directionsService = new google.maps.DirectionsService();

  //     // Split the locations into groups of 25 or less
  //     const locationGroups: google.maps.LatLng[][] = [];
  //     for (let i = 0; i < locations.length; i += 25) {
  //         locationGroups.push(locations.slice(i, i + 25));
  //     }

  //     try {
  //         // Define the request options
  //         const requestOptions: google.maps.DirectionsRequest = {
  //             origin: initialAndEndLocation,
  //             destination: initialAndEndLocation,
  //             waypoints: [],
  //             optimizeWaypoints: true,
  //             travelMode: google.maps.TravelMode.DRIVING,
  //         };

  //         // Generate waypoints for each group of locations
  //         const promises = locationGroups.map(locationGroup => {
  //             const waypoints = locationGroup.map(location => ({ location, stopover: true }));
  //             const request = { ...requestOptions, waypoints };
  //             return new Promise<google.maps.DirectionsResult>((resolve, reject) => {
  //                 directionsService.route(request, (result, status) => {
  //                     if (status === google.maps.DirectionsStatus.OK && result && result.routes && result.routes.length > 0) {
  //                         resolve(result);
  //                     } else {
  //                         reject(`Error calculating route: ${status}`);
  //                     }
  //                 });
  //             });
  //         });

  //         // Wait for all route calculations to complete
  //         const routeResults = await Promise.all(promises);

  //         // Extract waypoints from optimized routes
  //         const optimizedWaypoints = routeResults.flatMap(routeResult => {
  //             const optimizedRoute = routeResult.routes[0];
  //             const waypointOrder = optimizedRoute.waypoint_order;
  //             return waypointOrder.map(index => {
  //                 const waypoints = routeResult.request.waypoints;
  //                 if (waypoints && waypoints[index] && waypoints[index].location) {
  //                     return waypoints[index].location;
  //                 }
  //                 return null; // or handle appropriately if waypoints[index] is undefined
  //             }).filter(waypoint => waypoint !== null) as google.maps.LatLng[];
  //         });

  //         return optimizedWaypoints;
  //     } catch (error) {
  //         console.error("An error occurred while reorganizing routes:", error);
  //         throw error; // Propagate the error
  //     }
  // }



  onDeleta(): void {
    console.log('iniciando');
    const id = this.rotaForm.controls.id.value;
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
            this._romaneioService.del(id).subscribe({
              next: async (resp: any) => {
                this.spinner.hide('fullSpinner');
                message = resp.message;
                this.pop('success', 'OK', message);
                await this.delay(1000);
                this.onLimpa();
                this.cdr.detectChanges();
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
        `Selecione uma rota primeiro,
            não é possível deletar sem um id válido`,
        'alert'
      );
    }
  }

  onPesquisa(): void {
    const rotaForm: any = this.rotaForm.getRawValue();
    this.romaneioPesquisaDTO.romaneioDTO = rotaForm;
    // this.romaneioPesquisaDTO.romaneioDTO.vendaDTOs = this.vendaDTOs;
    this.pesquisaRota(this.romaneioPesquisaDTO);
  }

  pesquisaRota(romaneioPesquisaDTO: RomaneioPesquisaDTO): void {
    this.spinner.show('fullSpinner');
    this._romaneioService.find(romaneioPesquisaDTO).subscribe({
      next: (data) => {
        this.spinner.hide('fullSpinner');
        // console.log(data);
        const pageRomaneio = data;

        this.pageRomaneio = pageRomaneio;

        // Encontrar o status atual para cada venda dentro da rota
        /*
                    for (let i = 0; i < this.pageRomaneio.content.length; i++) {
    
                        for (let j = 0; j < this.pageRomaneio.content[i].vendaDTOs.length; j++) {
    
                            if (this.pageRomaneio.content[i].vendaDTOs[j].vendaStatusAtualDTO == null) {
                                const statusAtual = this.pageRomaneio.content[i].vendaDTOs[j].vendaStatusDTOs.filter(vs => {
                                    return vs.flAtual === true;
                                });
                                this.pageRomaneio.content[i].vendaDTOs[j].vendaStatusAtual = statusAtual[0];
                            }
    
                        }
    
                    }
                    */

        if (this.pageRomaneio.content.length === 0) {
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
      error: (error) => {
        this.spinner.hide('fullSpinner');
        this.cdr.detectChanges();
      },
    });
  }

  ngOnInit(): void {
    this.currentUserSalesApp = JSON.parse(
      sessionStorage.getItem('currentUserSalesApp')!
    );

    this.createForm();
    this.iniciaObjs();
    this.cdr.detectChanges();
  }

  createForm(): void {
    // this.rotaForm = new FormGroup({
    //     id: new FormControl(''),
    //     veiculoDTO: new FormControl(null),
    //     motoristaDTO: new FormControl(null),
    //     descricao: new FormControl(''),
    //     idVenda: new FormControl(''),
    //     indStatus: new FormControl(''),

    //     estoqueAlmoxarifadoId: new FormControl(null, [Validators.required]),

    //     vlrTrocoDespesa: new FormControl(''),
    //     vlrDiaria: new FormControl(''),
    //     vlrAcessoria: new FormControl(''),

    //     dtaEntrega: new FormControl(''),
    //     dtaCaixa: new FormControl(null, [Validators.required]),
    // });
    this.rotaForm.controls.idVenda.disable();

    // dtaCaixa: new FormControl(this.convertDate(new Date(), 0), [Validators.required]),
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

  getStatusAtual(): string {
    if (
      this.romaneioDTO != null &&
      this.romaneioDTO.id > 0 &&
      this.romaneioDTO.indStatus != null
    ) {
      return this.romaneioDTO.indStatus;
    } else {
      return '';
    }
  }

  getTooltipIdVenda(): string {
    if (this.statusForm == 1) {
      return `Atenção, selecione o almoxarifado salve para depois adicionar as pré-vendas`;
    } else {
      return 'Digite a pré-venda';
    }
  }

  getStatusDescricao(): string {
    const sts = this.getStatusAtual();
    if (sts == 'A') {
      return 'Aberto';
    } else if (sts == 'F') {
      return 'Fechado';
    } else {
      return 'Indefinido';
    }
  }

  atualizaValorNF(target: any, vd: VendaDTO): void {
    const value = target.value;

    if (value != null && value.length > 0) {
      vd.nf = value;
    }
  }

  isDisableButton(): boolean {
    if (this.getStatusAtual() == 'F') {
      return false;
    } else {
      return true;
    }
  }

  isDisableAlterarDeletar(): boolean {
    if (this.getStatusAtual() == 'F') {
      return true;
    } else {
      return false;
    }
  }

  getTooltipButtonAcao(): string | null {
    if (this.isDisableAlterarDeletar()) {
      return 'O Romaneio deve ser aberto para esta ação';
    }
    return null;
  }

  getTooltipButton(tipo: string): string {
    if (this.isDisableButton()) {
      return 'Botão só pode ser acionado caso o romaneio esteja fechado';
    } else {
      return tipo;
    }
  }

  fechaRomaneio123(): void {
    const romaneioId = this.rotaForm.controls.id.value;

    if (
      this.romaneioDTO.vendas == null ||
      typeof this.romaneioDTO.vendas.vendas == 'undefined' ||
      this.romaneioDTO.vendas.vendas == null ||
      this.romaneioDTO.vendas.vendas.length == 0
    ) {
      this.pop('error', 'Não é possivel fechar o Romaneio sem vendas', '');
    } else {
      this.spinner.show('fullSpinner');

      this._romaneioService.getVendasDTOs(romaneioId!)
      .subscribe({
        next: (data) => {
          this.romaneioDTO.vendas.vendas = data;
          this.vendaDTOs = this.romaneioDTO.vendas.vendas;
          this.atualizaDependencias();

          this.cdr.detectChanges();



          const rotaForm: any = this.rotaForm.getRawValue();
      this.romaneioDTO = rotaForm;
      this.romaneioDTO.vendas = {
        vendas:
          this.vendaDTOs == null || this.vendaDTOs.length == 0
            ? []
            : this.vendaDTOs,
      };
      this.romaneioDTO.condicoes = {
        condicoes: this.condicoesVlrAux,
      };
      this.romaneioDTO.vlrTotal = this.getValorTotalVendas();

      this._romaneioService
        .postOrPut(this.romaneioDTO, this.statusForm)
        .subscribe({
          next: (data) => {

            if (data.status) {
              this.dtoToForm(data.romaneioDTO);

              this._romaneioService.fechaRomaneio(romaneioId!).subscribe({
                next: (data) => {
                  this.spinner.hide('fullSpinner');
        
                  if (data.status) {
                    this.dtoToForm(data.romaneioDTO);
                    this.statusForm = 2;
                    this.pageRomaneio.content = [];
                    this.pop('success', 'OK', 'Fechado com sucesso');
                  } else {
                    const vsaux = data.vendaStatusAuxs;
                    if (vsaux != null && vsaux.length > 0) {
                      this.msgAlertaPreVenda(
                        'Atenção os seguintes pedidos abaixo não estão no status de faturado',
                        null,
                        'error',
                        vsaux
                      );
                    } else {
                      this.msgAlerta('Atenção - Erro', data.msg, 'error');
                    }
                  }
                  this.cdr.detectChanges();
                },
                error: (error) => {
                  console.log(error);
                  this.spinner.hide('fullSpinner');
                  this.pop('error', 'ERROR', 'Contate o administrador, erro ao fechar o romaneio');
                  this.cdr.detectChanges();
                },
              });
            }

            
          },
          error: (error) => {
            this.spinner.hide('fullSpinner');
            if (
              Object.prototype.hasOwnProperty.call(error, 'error') &&
              error.error != null
            ) {
              const messAL: MessageAlertList[] = [];

              if (
                Object.prototype.hasOwnProperty.call(
                  error.error,
                  'fieldErrors'
                ) &&
                error.error.fieldErrors != null &&
                error.error.fieldErrors.length > 0
              ) {
                for (let i = 0; i < error.error.fieldErrors.length; i++) {
                  const mess = new MessageAlertList();
                  mess.erro = error.error.fieldErrors[i].code;
                  mess.message = error.error.fieldErrors[i].message;
                  messAL.push(mess);
                }
              }

              this.msgAlertaList(error.error.message, messAL, 'error');
            }
            this.cdr.detectChanges();
          },
        });

        },
        error: (err) => {
          console.log(err);
          this.spinner.hide('fullSpinner');
          this.pop('error', 'ERROR', 'Erro ao atualizar vendas');
          this.cdr.detectChanges();
        }
      });
  

      

      
    }
  }

  openPesquisaAvancada(): void {
    
    const activeModal = this._modalService.open(AppRomModalSearchComponent, {
      size: 'xl',
      backdrop: 'static',
    });
    activeModal.componentInstance.modalHeader = 'Pesquisa Avançada de Venda';
    activeModal.result.then(
      (result) => {
        if (result != null && this.isUndefined(result) === false && this.isArray(result) === true && result.length > 0) {
          this.spinner.show('fullSpinner');
          const resultVendas: number[] = [];
          result.forEach((v: any) => {
            resultVendas.push(v.id);
          });
          
          const idRomaneio = this.rotaForm.controls.id.value;

          this._romaneioService.checkVendas(resultVendas, idRomaneio!).subscribe({
            next: (data) => {
              console.log(data);
              this.spinner.hide('fullSpinner');
              
              data.forEach((v) => {

                if (v.status === true) {
                for(let i = 0; i < this.vendaDTOs.length; i++) {
                  if (this.vendaDTOs[i].id === v.vendaId) {
                    this.vendaDTOs.splice(i, 1);
                    break;
                  }
                }

                this.vendaDTOs.push(v.vendaDTO);
              }
              });
              this.vendaDTOs = [...this.vendaDTOs];
              console.log(this.vendaDTOs);

                this.atualizaDependencias();
                this.removeMarkers();
                this.refreshMarkers();


              const activeModal2 = this._modalService.open(AppModalRomaneioAddMultiplasComponent, {
                size: 'xl',
                backdrop: 'static',
              });
              activeModal2.componentInstance.checkVendas = data;
              activeModal2.result.then((result) => { console.log(result); }, (err) => { console.log(err); });

              
              // if (data.status == false) {
              //   this.msgAlerta(
              //     'Atenção - Não é possivel adicionar',
              //     data.msg,
              //     'error'
              //   );
              // } else {
              //   this.rotaForm.controls.idVenda.setValue(null);
  
              //   this.vendaDTOs.push(data.vendaDTO);
              //   this.vendaDTOs = [...this.vendaDTOs];
  
              //   this.atualizaDependencias();
              //   this.removeMarkers();
              //   this.refreshMarkers();

              
            },
            error: (err) => {
              this.spinner.hide('fullSpinner');
              console.log(err);
              this.cdr.detectChanges();
            },
          });

        
          
        } else {
          this.toastr.warning('Atenção nenhuma venda foi selecionada', '');
        }
      },
      (err) => {
        console.log(err);
      }
    );

  }

  fechaRomaneio(): void {
    const romaneioId = this.rotaForm.controls.id.value;

    if (
      this.romaneioDTO.vendas == null ||
      typeof this.romaneioDTO.vendas.vendas == 'undefined' ||
      this.romaneioDTO.vendas.vendas == null ||
      this.romaneioDTO.vendas.vendas.length == 0
    ) {
      this.pop('error', 'Não é possivel fechar o Romaneio sem vendas', '');
    } else {
      this.spinner.show('fullSpinner');
  
      

      this._romaneioService.fechaRomaneio(romaneioId!).subscribe({
        next: (data) => {
          this.spinner.hide('fullSpinner');

          if (data.status) {
            this.dtoToForm(data.romaneioDTO);
            this.statusForm = 2;
            this.pageRomaneio.content = [];
            this.pop('success', 'OK', 'Fechado com sucesso');
          } else {
            const vsaux = data.vendaStatusAuxs;
            if (vsaux != null && vsaux.length > 0) {
              this.msgAlertaPreVenda(
                'Atenção os seguintes pedidos abaixo não estão no status de faturado',
                null,
                'error',
                vsaux
              );
            } else {
              this.msgAlerta('Atenção - Erro', data.msg, 'error');
            }
          }
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.spinner.hide('fullSpinner');
          this.pop('error', 'ERROR', 'Contate o administrador');
          this.cdr.detectChanges();
        },
      });
    }
  }

  msgAuthorizate(messageHeader: string, messageBody: string): boolean {
    const activeModal = this._modalService.open(AccessValidateComponent);
    activeModal.componentInstance.modalHeader = messageHeader;
    activeModal.componentInstance.modalContent = messageBody;
    activeModal.result.then(
      (result) => {
        console.log(result);
        if (result.validate != null && this.isUndefined(result.validate) === false && result.validate === true) {
          console.log('entrou');
          return true;

        } else {
          return false;
        }
      },
      (error) => {
        console.log(error);
        return false;
      }
    );
    return false;
  }



  isUndefined(value: any): boolean {
    return typeof (value) === 'undefined';
  }

  isDateOlderThanToday(dateInput: Date | null): boolean {
    // Parse the input date using Moment.js
    const inputDate = moment(dateInput);
    
    // Check if the date is valid
    if (!inputDate.isValid()) {
        return false; // Invalid date
    }

    // Get the current date (without time)
    const today = moment().startOf('day');
    
    // Compare the input date with today's date
    return inputDate.isBefore(today);
}



  reabrirRomaneio(): void {
    let isBlock = false;
    let messageHeader = '';
    let messageBody = '';
    let qtdAlteracao = this.rotaForm.controls.qtdAlteracao.value;
    const dtaCaixa = this.rotaForm.controls.dtaCaixa.value;

    if (this.isUndefined(qtdAlteracao) || qtdAlteracao == null) {
      qtdAlteracao = 0;
    }


    if (qtdAlteracao != null && qtdAlteracao >= environment.ROMANEIO_QTD_ALTERACAO_LIMITES) {
      isBlock = true;
      messageHeader = 'Necessita de validação superior';
      messageBody = `Adicione um usuário que possua acesso para essa operação - O romaneio foi reaberto: ${qtdAlteracao} vezes`;
    }


    // if (this.isDateOlderThanToday(dtaCaixa)) {
    //   isBlock = true;
    //   messageHeader = 'Necessita de validação superior';
    //   messageBody = `Não é possivel reabrir romaneios cuja data do caixa já se passou`;
    // }



    if (isBlock) {
      const activeModal = this._modalService.open(AccessValidateComponent);
      activeModal.componentInstance.modalHeader = messageHeader;
      activeModal.componentInstance.modalContent = messageBody;
      activeModal.result.then(
        (result) => {
          console.log(result);
          if (result.validate != null && this.isUndefined(result.validate) === false && result.validate === true) {

            const activeModal = this._modalService.open(AppVendaModalConfirmComponent);
            activeModal.componentInstance.modalHeader = 'Confirme a reabertura';
            activeModal.componentInstance.modalContent = `Deseja realmente reabrir o romaneio?
            Essa ação irá gerar histórico e pode causar varios efeitos adversos nos movimentos, vendas e caixa, caso queira clique em sim.`;
            activeModal.componentInstance.modalType = 'confirm';
            activeModal.componentInstance.defaultLabel = 'Não';
            activeModal.result.then(
              (result) => {
                if (result === 'confirm') {
                  const romaneioId = this.rotaForm.controls.id.value;
                  this.spinner.show('fullSpinner');
                  this._romaneioService.reabrirRomaneio(romaneioId!).subscribe({
                    next: (data) => {
                      this.spinner.hide('fullSpinner');

                      if (data.status) {
                        this.dtoToForm(data.romaneioDTO);
                        this.statusForm = 2;
                        this.pageRomaneio.content = [];
                        this.pop('success', 'OK', 'Reaberto com sucesso');
                      } else {
                        const vsaux = data.vendaStatusAuxs;
                        if (vsaux != null && vsaux.length > 0) {
                          this.msgAlertaPreVenda(
                            'Atenção os seguintes pedidos abaixo não estão no status de faturado',
                            null,
                            'error',
                            vsaux
                          );
                        } else {
                          this.msgAlerta('Atenção - Erro', data.msg, 'error');
                        }
                      }
                      this.cdr.detectChanges();
                    },
                    error: (error) => {
                      this.spinner.hide('fullSpinner');
                      this.pop('error', 'ERROR', 'Contate o administrador');
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
        },
        (error) => {
          console.log(error);
        }
      );
    } else {


      const activeModal = this._modalService.open(AppVendaModalConfirmComponent);
      activeModal.componentInstance.modalHeader = 'Confirme a reabertura';
      activeModal.componentInstance.modalContent = `Deseja realmente reabrir o romaneio?
            Essa ação irá gerar histórico e pode causar varios efeitos adversos nos movimentos, vendas e caixa, caso queira clique em sim.`;
      activeModal.componentInstance.modalType = 'confirm';
      activeModal.componentInstance.defaultLabel = 'Não';
      activeModal.result.then(
        (result) => {
          if (result === 'confirm') {
            const romaneioId = this.rotaForm.controls.id.value;
            this.spinner.show('fullSpinner');
            this._romaneioService.reabrirRomaneio(romaneioId!).subscribe({
              next: (data) => {
                this.spinner.hide('fullSpinner');

                if (data.status) {
                  this.dtoToForm(data.romaneioDTO);
                  this.statusForm = 2;
                  this.pageRomaneio.content = [];
                  this.pop('success', 'OK', 'Reaberto com sucesso');
                } else {
                  const vsaux = data.vendaStatusAuxs;
                  if (vsaux != null && vsaux.length > 0) {
                    this.msgAlertaPreVenda(
                      'Atenção os seguintes pedidos abaixo não estão no status de faturado',
                      null,
                      'error',
                      vsaux
                    );
                  } else {
                    this.msgAlerta('Atenção - Erro', data.msg, 'error');
                  }
                }
                this.cdr.detectChanges();
              },
              error: (error) => {
                this.spinner.hide('fullSpinner');
                this.pop('error', 'ERROR', 'Contate o administrador');
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
  }
  async iniciaObjs(): Promise<void> {
    this.initDefaults();

    this.romaneioPesquisaDTO = new RomaneioPesquisaDTO();
    this.romaneioPesquisaDTO.dtaInicialPesquisa = moment().format('YYYY-MM-DD');
    this.romaneioPesquisaDTO.dtaFinalPesquisa = moment().format('YYYY-MM-DD');

    this.romaneioDTO = new RomaneioDTO();

    this.pageRomaneio = new PageRomaneio();
    this.pageRomaneio.content = [];

    this.motoristas = await this._funcionarioService
      .getAllActiveMotoristas()
      .toPromise();
    this.motoristas!.sort((v1, v2) => {
      if (v1.nome < v2.nome) {
        return -1;
      }
      if (v1.nome > v2.nome) {
        return 1;
      }
      return 0;
    });
    // console.log(this.motoristas);

    this.veiculos = await this._veiculoService.getAllActive().toPromise();

    this.veiculos!.sort((v1, v2) => {
      if (v1.nome < v2.nome) {
        return -1;
      }
      if (v1.nome > v2.nome) {
        return 1;
      }
      return 0;
    });

    this.getEstoqueAlmoxarifados();
    this.cdr.detectChanges();
  }

  getEstoqueAlmoxarifados(): void {
    this._estoqueAlmoxarifado.getAllActive().subscribe({
      next: (data) => {
        this.estoqueAlmoxarifados = data;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  initDefaults(): void {
    this.statusForm = 1;
    this.submitted = false;
    this.motoristas = [];
    this.veiculos = [];
    this.vendaDTOs = [];
    this.agrupamentoAux = [];
    this.iniciaResetaCondicoes();
  }

  voltar(): void {
    if (this.statusForm === 2) {
      this.statusForm = 2;
    } else {
      this.statusForm = 1;
    }
  }

  iniciaResetaCondicoes(): void {
    this.condicoesVlrAux = [];

    const dinheiro = new CondicoesVlrAux();
    dinheiro.ordem = 0;
    dinheiro.nome = 'Dinheiro';
    dinheiro.vlr = 0;

    const boleto = new CondicoesVlrAux();
    boleto.ordem = 1;
    boleto.nome = 'Boleto';
    boleto.vlr = 0;

    const cheque = new CondicoesVlrAux();
    cheque.ordem = 2;
    cheque.nome = 'Cheque';
    cheque.vlr = 0;

    const cartao = new CondicoesVlrAux();
    cartao.ordem = 3;
    cartao.nome = 'Cartão';
    cartao.vlr = 0;

    const pix = new CondicoesVlrAux();
    pix.ordem = 4;
    pix.nome = 'Pix';
    pix.vlr = 0;

    const nota = new CondicoesVlrAux();
    nota.ordem = 5;
    nota.nome = 'Nota';
    nota.vlr = 0;

    const boni = new CondicoesVlrAux();
    boni.ordem = 6;
    boni.nome = 'Bonificação';
    boni.vlr = 0;

    const troca = new CondicoesVlrAux();
    troca.ordem = 7;
    troca.nome = 'Troca';
    troca.vlr = 0;

    const outros = new CondicoesVlrAux();
    outros.ordem = 8;
    outros.nome = 'Outros';
    outros.vlr = 0;

    this.condicoesVlrAux.push(dinheiro);
    this.condicoesVlrAux.push(boleto);
    this.condicoesVlrAux.push(cheque);
    this.condicoesVlrAux.push(cartao);
    this.condicoesVlrAux.push(pix);
    this.condicoesVlrAux.push(nota);
    this.condicoesVlrAux.push(boni);
    this.condicoesVlrAux.push(troca);
    this.condicoesVlrAux.push(outros);
  }

  valoresECondicoes(): void {
    this.iniciaResetaCondicoes();

    for (let i = 0; i < this.vendaDTOs.length; i++) {
      const cond = this.vendaDTOs[i]
        .condicaoPagamentoDTO!.nome.toUpperCase()
        .trim();

      if (cond.indexOf('DINHEIRO') > -1) {
        this.condicoesVlrAux[0].vlr += this.vendaDTOs[i].vlrTotal;
      } else if (cond.indexOf('BOLETO') > -1) {
        this.condicoesVlrAux[1].vlr += this.vendaDTOs[i].vlrTotal;
      } else if (cond.indexOf('CHEQUE') > -1) {
        this.condicoesVlrAux[2].vlr += this.vendaDTOs[i].vlrTotal;
      } else if (cond.indexOf('CARTAO') > -1) {
        this.condicoesVlrAux[3].vlr += this.vendaDTOs[i].vlrTotal;
      } else if (cond.indexOf('PIX') > -1) {
        this.condicoesVlrAux[4].vlr += this.vendaDTOs[i].vlrTotal;
      } else if (cond.indexOf('NOTA') > -1) {
        this.condicoesVlrAux[5].vlr += this.vendaDTOs[i].vlrTotal;
      } else if (
        cond.indexOf('BONIFICACAO') > -1 ||
        cond.indexOf('BONIFICAÇÃO') > -1
      ) {
        this.condicoesVlrAux[6].vlr += this.vendaDTOs[i].vlrTotal;
      } else if (cond.indexOf('TROCA') > -1) {
        this.condicoesVlrAux[7].vlr += this.vendaDTOs[i].vlrTotal;
      } else {
        this.condicoesVlrAux[8].vlr += this.vendaDTOs[i].vlrTotal;
      }
    }
    this.cdr.detectChanges();
  }

  atualizaDependencias(): void {
    this.valoresECondicoes();
    this.agrupamentos();
    this.qtdClientesDistintos();
    this.cdr.detectChanges();
  }

  agrupamentos(): void {
    this.agrupamentoAux = [];

    for (let i = 0; i < this.vendaDTOs.length; i++) {
      for (let j = 0; j < this.vendaDTOs[i].vendaItemDTOs.length; j++) {
        let existe = false;
        for (let x = 0; x < this.agrupamentoAux.length; x++) {
          if (
            this.agrupamentoAux[x].nome.indexOf(
              this.vendaDTOs[i].vendaItemDTOs[j].itemUnidadeDTO.nome
            ) > -1
          ) {
            existe = true;
            this.agrupamentoAux[x].qtd +=
              this.vendaDTOs[i].vendaItemDTOs[j].qtd;
          }
        }

        if (existe === false) {
          const obj = new AgrupamentoAux();
          obj.nome = this.vendaDTOs[i].vendaItemDTOs[j].itemUnidadeDTO.nome;
          obj.qtd = this.vendaDTOs[i].vendaItemDTOs[j].qtd;
          this.agrupamentoAux.push(obj);
        }
      }
    }
    // console.log(this.agrupamentoAux);
    this.agrupamentoAux.sort((a, b) => {
      if (a.qtd < b.qtd) {
        return 1;
      }

      if (a.qtd > b.qtd) {
        return -1;
      }

      /*
            if (a.qtd === b.qtd && b.nome == 'UNIDADE') {
                return -1;
            }
            */

      return 0;
    });
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

  msgAlertaPreVenda(
    titulo: string,
    conteudo: string | null,
    tipo: string,
    vendaStatusAuxs: VendaStatusAux[]
  ): void {
    const activeModal = this._modalService.open(
      AppVendaModalAlertPreVendaComponent,
      { backdrop: true }
    );
    activeModal.componentInstance.modalHeader = titulo;
    activeModal.componentInstance.modalContent = conteudo;
    activeModal.componentInstance.modalType = tipo;
    activeModal.componentInstance.vendaStatusAuxs = vendaStatusAuxs;
    activeModal.result.then(
      (result) => {
        console.log(result);
      },
      (error) => {
        console.log(error);
      }
    );
  }

  delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  onReset() {
    this.submitted = false;
    this.qtdClientesVendas = 0;
    this.flgPesquisando = 0;
    this.removeMarkers();
    this.rotaForm.reset();
    this.rotaForm.enable();
    this.rotaForm.patchValue({
      dtaCaixa: null,
    });
    this.rotaForm.controls.idVenda.disable();
    this.rotaForm.controls.qtdAlteracao.disable();
  }

  unsetSelected(): void {
    if (this.selected != null) {
      this.selected.splice(0, this.selected.length);
    }
  }

  dtoToForm(romaneioDTO: RomaneioDTO): void {
    this.romaneioDTO = romaneioDTO;
    console.log(this.romaneioDTO);
    this.vendaDTOs = romaneioDTO.vendas.vendas;
    this.atualizaDependencias();

    this.rotaForm.patchValue({
      id: romaneioDTO.id,
      veiculoDTO: romaneioDTO.veiculoDTO,
      motoristaDTO: romaneioDTO.motoristaDTO,
      descricao: romaneioDTO.descricao,
      indStatus: romaneioDTO.indStatus,
      qtdAlteracao: romaneioDTO.qtdAlteracao,
      idVenda: null,

      estoqueAlmoxarifadoId: romaneioDTO.estoqueAlmoxarifadoId,

      vlrTrocoDespesa: romaneioDTO.vlrTrocoDespesa,
      vlrDiaria: romaneioDTO.vlrDiaria,
      vlrAcessoria: romaneioDTO.vlrAcessoria,

      dtaEntrega: romaneioDTO.dtaEntrega,
      dtaCaixa: romaneioDTO.dtaCaixa,
    });
    this.checkStatusForm();
  }

  checkStatusForm(): void {
    if (
      this.romaneioDTO != null &&
      this.romaneioDTO.id != null &&
      this.romaneioDTO.id > 0 &&
      this.romaneioDTO.indStatus != null
    ) {
      if (this.romaneioDTO.indStatus == 'F') {
        this.rotaForm.controls.id.disable();
        this.rotaForm.controls.veiculoDTO.disable();
        this.rotaForm.controls.motoristaDTO.disable();
        this.rotaForm.controls.descricao.disable();
        this.rotaForm.controls.vlrTrocoDespesa.disable();
        this.rotaForm.controls.vlrDiaria.disable();
        this.rotaForm.controls.estoqueAlmoxarifadoId.disable();

        this.rotaForm.controls.vlrAcessoria.disable();

        this.rotaForm.controls.dtaEntrega.disable();
        this.rotaForm.controls.dtaCaixa.disable();
        this.rotaForm.controls.idVenda.disable();
        this.rotaForm.controls.qtdAlteracao.disable();
      } else if (this.romaneioDTO.indStatus == 'A') {
        this.rotaForm.enable();
        this.rotaForm.controls.id.disable();
        this.rotaForm.controls.estoqueAlmoxarifadoId.disable();
        this.rotaForm.controls.qtdAlteracao.disable();
      }
    }
  }


  disablePesquisaAvancada(): boolean {
    if (
      this.romaneioDTO != null &&
      this.romaneioDTO.id != null &&
      this.romaneioDTO.id > 0 &&
      this.romaneioDTO.indStatus != null
    ) {
      if (this.romaneioDTO.indStatus == 'A') {
        return false;
      }
      return true;
    }
    return true; // Add this line
  }

  abreAcoes(): void {
    const versoes = this.romaneioDTO.versoes;

    versoes.versoes.sort((c1, c2) => {
      if (c1.dta < c2.dta) {
        return 1;
      }
      if (c1.dta > c2.dta) {
        return -1;
      }
      return 0;
    });

    const activeModal = this._modalService.open(
      AppVendaModalAlertAcoesVendaComponent
    );
    activeModal.componentInstance.modalHeader = 'Histórico de Ações';
    activeModal.componentInstance.modalContent = '';
    activeModal.componentInstance.modalType = 'alert';
    activeModal.componentInstance.versoesList = versoes;
    activeModal.result.then(
      (result) => {
        console.log(result);
      },
      (error) => {
        console.log(error);
      }
    );
  }

  onAlteraLatLong(vendaId: number): void {
    const flt = this.vendaDTOs.filter((vd) => {
      return vd.id == vendaId;
    });

    const activeModal = this._modalService.open(AppVendaModalMapComponent);
    activeModal.componentInstance.vendaDTO = flt[0];
    activeModal.result.then(
      (result) => {
        if (
          result != null &&
          typeof result.tipo != 'undefined' &&
          result.tipo != null &&
          result.tipo == 'confirm'
        ) {
          if (
            typeof result.vendaDTO != 'undefined' &&
            result.vendaDTO != null &&
            typeof result.vendaDTO.id != 'undefined' &&
            result.vendaDTO.id != null &&
            result.vendaDTO.id > 0
          ) {
            for (let i = 0; i < this.vendaDTOs.length; i++) {
              if (this.vendaDTOs[i].id === result.vendaDTO.id) {
                this.vendaDTOs.splice(i, 1);
              }
            }

            this.vendaDTOs.push(result.vendaDTO);
            this.vendaDTOs = [...this.vendaDTOs];
            this.atualizaDependencias();
            this.removeMarkers();
            this.refreshMarkers();

            this.pop('success', 'Alterado com sucesso', '');
            this.cdr.detectChanges();
          } else {
            this.pop('error', 'Erro ao buscar a venda', '');
          }
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }

  isAbreAcoes(): boolean {
    if (
      this.romaneioDTO != null &&
      this.romaneioDTO.id > 0 &&
      this.romaneioDTO.versoes != null &&
      this.romaneioDTO.versoes.versoes.length > 0
    ) {
      return true;
    } else {
      return false;
    }
  }

  isAbreHistoricos(): boolean {
    if (
      this.romaneioDTO != null &&
      this.romaneioDTO.id > 0 &&
      this.romaneioDTO.historicos != null &&
      this.romaneioDTO.historicos.historicos.length > 0
    ) {
      return true;
    } else {
      return false;
    }
  }

  abreHistoricos(): void {
    const id = new Date().getTime();
    const key =
      this.currentUserSalesApp.username +
      '_' +
      id.toString() +
      '_' +
      this.romaneioDTO.id;

    this._romaneioService
      .storageSet(key, {
        data: this.romaneioDTO.historicos,
      })
      .subscribe({
        next: (resp) => {
          console.log(resp);
          console.log('Deu tudo certo, vamos imprimir');
          const hrefFull =
            this._vendaService.hrefContext() +
            'print/romaneio-historico/' +
            key;
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

  compareVeiculo(v1: VeiculoDTO, v2: VeiculoDTO): boolean {
    return v1 && v2 ? v1.id === v2.id : v1 === v2;
  }

  compareMotorista(v1: FuncionarioDTO, v2: FuncionarioDTO): boolean {
    return v1 && v2 ? v1.id === v2.id : v1 === v2;
  }

  onLeftArray(): void {
    if (this.statusForm === 2) {
      for (let i = 0; i < this.pageRomaneio.content.length; i++) {
        const id = this.rotaForm.controls.id.value;
        if (
          id != null &&
          !isNaN(id) &&
          id === this.pageRomaneio.content[i].id
        ) {
          if (i - 1 >= 0) {
            this.selected = [];
            this.dtoToForm(this.pageRomaneio.content[i - 1]);
            this.selected.push(this.pageRomaneio.content[i - 1]);
            i = this.pageRomaneio.content.length + 1;
            this.removeMarkers();
            this.refreshMarkers();
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
      for (let i = 0; i < this.pageRomaneio.content.length; i++) {
        const id = this.rotaForm.controls.id.value;
        if (
          id != null &&
          !isNaN(id) &&
          id === this.pageRomaneio.content[i].id
        ) {
          if (i + 1 < this.pageRomaneio.content.length) {
            this.selected = [];
            this.dtoToForm(this.pageRomaneio.content[i + 1]);
            this.selected.push(this.pageRomaneio.content[i + 1]);
            i = this.pageRomaneio.content.length + 1;
            this.removeMarkers();
            this.refreshMarkers();
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

  onTable(): void {
    this.unsetSelected();
    if (this.pageRomaneio != null && this.pageRomaneio.content.length > 0) {
      this.statusForm = 3;
    } else {
      this.pop('error', 'Erro', 'Procure primeiro.');
    }
  }

  onRemoveVenda(id: number): void {
    const activeModal = this._modalService.open(AppVendaModalConfirmComponent);
    activeModal.componentInstance.modalHeader = 'Confirme';
    activeModal.componentInstance.modalContent =
      'Deseja realmente remover o pedido';
    activeModal.componentInstance.modalType = 'confirm';
    activeModal.componentInstance.defaultLabel = 'Não';
    activeModal.result.then(
      (result) => {
        if (
          typeof result !== 'undefined' &&
          result != null &&
          result === 'confirm'
        ) {
          let flgRemovido = false;
          for (let i = 0; i < this.vendaDTOs.length; i++) {
            if (this.vendaDTOs[i].id === id) {
              this.vendaDTOs.splice(i, 1);
              flgRemovido = true;
            }
          }

          if (flgRemovido === true) {
            this.vendaDTOs = [...this.vendaDTOs];
            this.atualizaDependencias();
            this.removeMarkers();
            this.refreshMarkers();
            this.pop('success', 'Removido com sucesso', '');
          } else {
            this.pop('error', 'Nada foi removido', '');
          }
        }
        this.cdr.detectChanges();
      },
      (error) => {
        console.log(error);
      }
    );
  }

  generateMov(): void {
    const movimentoId = this.romaneioDTO.movimentoId;
    let message = '';
    if (movimentoId != null && movimentoId > 0) {
      message = `ATENÇÃO - Já existe um ID de movimento vinculado a este romaneio
            clicando em sim será gerado outro movimento novamente e o novo ID será vinculado.`;
    } else {
      message = 'Deseja realmente gerar o movimento de saída?';
    }

    const activeModal = this._modalService.open(
      AppVendaModalAlxConfirmComponent
    );
    activeModal.componentInstance.modalHeader = 'Confirme';
    activeModal.componentInstance.modalContent = message;
    activeModal.componentInstance.estoqueAlmoxarifados =
      this.estoqueAlmoxarifados;
    activeModal.result.then(
      (result) => {
        console.log(result);
        if (
          typeof result !== 'undefined' &&
          result != null &&
          typeof result.code !== 'undefined' &&
          result.code === 1
        ) {
          this.spinner.show('fullSpinner');
          const rotaId = this.rotaForm.controls.id.value;
          this._romaneioService
            .generateMovimentoByRota(result.estoqueAlmoxarifadoId, rotaId!)
            .subscribe({
              next: (data) => {
                this.spinner.hide('fullSpinner');
                if (
                  typeof data.movimentoId != 'undefined' &&
                  data.movimentoId != null &&
                  data.movimentoId > 0
                ) {
                  this.romaneioDTO.movimentoId = data.movimentoId;
                }
                this.msgAlerta('Atenção', data.msg, 'success');
                this.cdr.detectChanges();
              },
              error: (error) => {
                this.spinner.hide('fullSpinner');
                this.pop(
                  'error',
                  'Erro ao gerar movimento, contate o administrador',
                  ''
                );
                console.log(error);
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

  openPrintPage(tipo: string): void {
    const id = new Date().getTime();
    const key =
      this.currentUserSalesApp.username +
      '_' +
      id.toString() +
      '_' +
      this.romaneioDTO.id;

    const estFlt = this.estoqueAlmoxarifados.filter((f) => {
      return f.id === this.romaneioDTO.estoqueAlmoxarifadoId;
    });

    this.romaneioDTO.estoqueAlmoxarifadoNome = estFlt[0].nome;

    this._romaneioService
      .storageSet(key, {
        id: 'rota-v1-' + tipo,
        data: this.romaneioDTO,
        rotaId: this.romaneioDTO.id,
        agrupamentos: this.agrupamentoAux,
        condicoes: this.condicoesVlrAux,
        qtdClientesVendas: this.qtdClientesVendas,
        qtdVendas: this.qtdVendas,
      })
      .subscribe({
        next: (resp) => {
          console.log(resp);
          console.log('Deu tudo certo, vamos imprimir');
          const hrefFull =
            this._vendaService.hrefContext() + 'print/romaneio/' + key;
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

  isEnviarWebRota(): boolean {
    if (this.getStatusAtual() == 'F') {
      return true;
    } else {
      return false;
    }
  }

  enviarWebRota(): void {
    if (
      this.romaneioDTO.veiculoDTO == null ||
      this.romaneioDTO.motoristaDTO == null
    ) {
      this.pop(
        'error',
        'Não é possivel enviar sem motorista ou sem veículo',
        ''
      );
    } else {
      if (
        this.romaneioDTO.vendas == null ||
        typeof this.romaneioDTO.vendas.vendas == 'undefined' ||
        this.romaneioDTO.vendas.vendas == null ||
        this.romaneioDTO.vendas.vendas.length == 0
      ) {
        this.pop('error', 'Não é possivel enviar sem vendas', '');
      } else {
        const activeModal = this._modalService.open(
          AppVendaModalWebRotaComponent
        );
        activeModal.componentInstance.romaneioDTO = this.romaneioDTO;
        activeModal.result.then(
          (result) => {
            if (result.status == 'OK') {
              this.pop('success', 'Romaneio transmitido com sucesso', '');
              this._romaneioService
                .updateRomaneioTransmitidoWebRota(this.romaneioDTO.id)
                .subscribe(
                  (data) => {
                    console.log(data);
                  },
                  (error) => {
                    console.log(error);
                  }
                );
            }
          },
          (error) => {
            console.log(error);
          }
        );
      }
    }
  }

  findVendaById(): void {
    this.spinner.show('vendaSpinner');
    const idVenda = this.rotaForm.controls.idVenda.value;
    let idRomaneio = this.rotaForm.controls.id.value;
    this.rotaForm.controls.idVenda.setValue(null);
    let estoqueAlmoxarifadoId =
      this.rotaForm.controls.estoqueAlmoxarifadoId.value;

    if (
      idRomaneio == null ||
      idRomaneio === 0 ||
      typeof idRomaneio != 'number'
    ) {
      idRomaneio = -1;
    }

    if (
      estoqueAlmoxarifadoId == null ||
      estoqueAlmoxarifadoId === 0 ||
      typeof estoqueAlmoxarifadoId != 'number'
    ) {
      estoqueAlmoxarifadoId = -1;
    }

    if (idVenda == null || typeof idVenda === 'undefined' || idVenda <= 0) {
      this.pop('error', 'Digite um id valido para procura', '');
      this.spinner.hide('vendaSpinner');
    } else {
      const flgVenda = this.vendaDTOs.filter((ve) => {
        return ve.id == idVenda;
      });

      if (flgVenda.length > 0) {
        this.pop('error', 'Venda com esse id já foi adicionado', '');
        this.spinner.hide('vendaSpinner');
      } else {
        this._romaneioService.checkVenda(idVenda, idRomaneio).subscribe({
          next: (data) => {
            this.spinner.hide('vendaSpinner');
            if (data.status == false) {
              this.msgAlerta(
                'Atenção - Não é possivel adicionar',
                data.msg,
                'error'
              );
            } else {
              this.rotaForm.controls.idVenda.setValue(null);

              this.vendaDTOs.push(data.vendaDTO);
              this.vendaDTOs = [...this.vendaDTOs];

              this.atualizaDependencias();
              this.removeMarkers();
              this.refreshMarkers();
            }
          },
          error: (err) => {
            this.spinner.hide('vendaSpinner');
            console.log(err);
            this.cdr.detectChanges();
          },
        });
      }
    }
  }

  qtdClientesDistintos(): void {
    const qtdCli: number[] = [];
    this.vendaDTOs.forEach((v) => {
      qtdCli.push(v.clienteDTO!.id);
    });
    const distinctArray = Array.from(new Set(qtdCli));
    this.qtdVendas = this.vendaDTOs.length;
    this.qtdClientesVendas = distinctArray.length;
  }

  findVendaByIdOld(): void {
    this.spinner.show('vendaSpinner');

    const idVenda = this.rotaForm.controls.idVenda.value;
    let idRomaneio = this.rotaForm.controls.id.value;

    this.rotaForm.controls.idVenda.setValue(null);

    let estoqueAlmoxarifadoId =
      this.rotaForm.controls.estoqueAlmoxarifadoId.value;

    if (
      idRomaneio == null ||
      idRomaneio === 0 ||
      typeof idRomaneio != 'number'
    ) {
      idRomaneio = -1;
    }

    if (
      estoqueAlmoxarifadoId == null ||
      estoqueAlmoxarifadoId === 0 ||
      typeof estoqueAlmoxarifadoId != 'number'
    ) {
      estoqueAlmoxarifadoId = -1;
    }

    if (idVenda == null || typeof idVenda === 'undefined' || idVenda <= 0) {
      this.pop('error', 'Digite um id valido para procura', '');
      this.spinner.hide('vendaSpinner');
    } else {
      const flgVenda = this.vendaDTOs.filter((ve) => {
        return ve.id === idVenda;
      });

      if (flgVenda.length > 0) {
        this.pop('error', 'Venda com esse id já foi adicionado', '');
        this.spinner.hide('vendaSpinner');
      } else {
        this._vendaService.findById(idVenda).subscribe({
          next: async (data) => {
            const retRomaneioVendaId: BuscaRomaneioVendaId =
              await this._romaneioService
                .getRomaneioIdByVenda(data.id!, idRomaneio!)
                .toPromise();

            if (data.estoqueAlmoxarifadoId != estoqueAlmoxarifadoId) {
              const alxFlt = this.estoqueAlmoxarifados.filter((fltEtq) => {
                return fltEtq.id === data.estoqueAlmoxarifadoId;
              });

              this.msgAlerta(
                'Atenção - Não é possivel adicionar',
                `
                                    O almoxarifado do romaneio é diferente do escolhido para está pré-venda.
                                    Estoque da pré-venda: ` + alxFlt[0].nome,
                'error'
              );
              this.spinner.hide('vendaSpinner');
            } else if (retRomaneioVendaId.status) {
              this.msgAlerta(
                'Atenção - Não é possivel adicionar',
                retRomaneioVendaId.msg,
                'error'
              );
              this.spinner.hide('vendaSpinner');
            } else if (
              data.vendaStatusAtualDTO.vendaStatusLabelDTO.sigla != 'FA'
            ) {
              this.msgAlerta(
                'Atenção - Não é possivel adicionar',
                `Somente pedidos com status de FATURADO podem ser adicionados, 
                                status atual: ` +
                data.vendaStatusAtualDTO.vendaStatusLabelDTO.label +
                ', pre-venda: ' +
                data.id,
                'error'
              );
              this.spinner.hide('vendaSpinner');
            } else {
              this.rotaForm.controls.idVenda.setValue(null);

              const flt = this.vendaDTOs.filter((v) => {
                return v.id === data.id;
              });

              if (flt == null || flt.length === 0) {
                if (data.latEntrega == null || data.latEntrega.length === 0) {
                  console.log('consultando endereco no google');
                  const uri = this._romaneioService.convertEndToStringURLGoogle(
                    data.logradouroEntrega!,
                    data.numEntrega!,
                    data.municipioEntrega!,
                    data.estadoEntrega!
                  );
                  const retGoogle = await this._romaneioService
                    .getLatLongGoogleDirect(uri)
                    .toPromise();

                  if (
                    retGoogle != null &&
                    retGoogle.status === 'OK' &&
                    retGoogle.results.length > 0
                  ) {
                    data.latEntrega =
                      retGoogle.results[0].geometry.location.lat.toString();
                    data.lngEntrega =
                      retGoogle.results[0].geometry.location.lng.toString();
                  }
                }

                this.vendaDTOs.push(data);
                this.vendaDTOs = [...this.vendaDTOs];

                this.atualizaDependencias();
                this.removeMarkers();
                this.refreshMarkers();
                this.spinner.hide('vendaSpinner');
              }
              this.spinner.hide('vendaSpinner');
            }
            this.cdr.detectChanges();
          },
          error: (error) => {
            this.spinner.hide('vendaSpinner');
            // const msg = 'Erro ao buscar a venda, print: ' + JSON.stringify(error);
            // this.pop('error', 'Erro', msg);
            console.log(error);
            this.cdr.detectChanges();
          },
        });
      }
    }
  }

  /*
            this.condicoesAux = [];
        for (let i = 0; i < this.vendaDTOs.length; i++) {
            let existe: boolean = false;

            for (let j = 0; j < this.condicoesAux.length; j++) {

                if (this.vendaDTOs[i].condicaoPagamentoDTO.id === this.condicoesAux[j].id) {
                    existe = true;
                    this.condicoesAux[j].vlr += this.vendaDTOs[i].vlrTotal;
                }
            }

            if (existe === false) {
                const obj = new CondicoesQtdAux();
                obj.id = this.vendaDTOs[i].condicaoPagamentoDTO.id;
                obj.nome = this.vendaDTOs[i].condicaoPagamentoDTO.nome;
                obj.vlr = this.vendaDTOs[i].vlrTotal;

                this.condicoesAux.push(obj);
            }
        }

        console.log(this.condicoesAux);
    */

  getEnderecoBairroCidade(row: any): string {
    const end =
      row.logradouroEntrega +
      ', ' +
      row.numEntrega +
      ' - ' +
      row.bairroEntrega +
      ' - ' +
      row.municipioEntrega;
    return end;
  }

  getValorTotalVendas(): number {
    let total = 0;
    for (let i = 0; i < this.vendaDTOs.length; i++) {
      total += this.vendaDTOs[i].vlrTotal;
    }
    return total;
  }

  onActivate(event: any) {
    if (
      event.type === 'dblclick' ||
      (event.type === 'keydown' && event.event.keyCode === 13)
    ) {
      this.editando();
    }
  }

  async atualizaVendas(id: number): Promise<VendaDTO[] | undefined> {
    const vendas = await lastValueFrom(this._romaneioService.getVendasDTOs(this.romaneioDTO.id));
    return vendas;
  }

  atualizarPreVendas(): void {
    if (
      this.romaneioDTO.vendas == null ||
      typeof this.romaneioDTO.vendas.vendas == 'undefined' ||
      this.romaneioDTO.vendas.vendas == null ||
      this.romaneioDTO.vendas.vendas.length == 0
    ) {
      this.pop('error', 'Não é possivel atualizar sem vendas', '');
    } else {
      const activeModal = this._modalService.open(
        AppVendaModalConfirmComponent
      );
      activeModal.componentInstance.modalHeader = 'Confirme';
      activeModal.componentInstance.modalContent = `Deseja realmente atualizar todas as vendas`;
      activeModal.componentInstance.modalType = 'confirm';
      activeModal.result.then(
        async (result) => {
          if (result == 'confirm') {
            this.spinner.show('fullSpinner');
            const rotaId = this.rotaForm.controls.id.value;
            const vendas = await lastValueFrom(this._romaneioService.getVendasDTOs(rotaId!));
            // this.spinner.hide('fullSpinner');
            this.romaneioDTO.vendas.vendas = vendas;
            this.vendaDTOs = this.romaneioDTO.vendas.vendas;
            this.atualizaDependencias();

            await this.delay(1000);

            this.onCadastra();

            this.cdr.detectChanges();
          }
        },
        (error) => {
          console.log(error);
        }
      );
    }
  }

  isDisableAtualizarPreVendas(): boolean {
    return true;
  }

  async editando(): Promise<void> {
    const sel: RomaneioDTO[] = this.pageRomaneio.content.filter((us) => {
      return us.id === this.selected[0].id;
    });

    this.romaneioDTO = sel[0];

    this.dtoToForm(this.romaneioDTO);
    this.statusForm = 2;

    setTimeout(() => {
      this.mapInitializer();
      this.removeMarkers();
      this.refreshMarkers();

      // const waypoints: google.maps.LatLng[] = [];
      // this.vendaDTOs.forEach((venda) => {
      //   if (
      //     this.isVendaWithoutLatLng(venda) === false && 
      //     this.isValidLatLng(parseFloat(venda.latEntrega!), parseFloat(venda.lngEntrega!)) &&
      //     ![10346, 13019, 13192, 
      //       13442, 10349, 13067 ,13014 , 13046, 10318,
      //       13014,13193 ,39,13194 , 13003,10341, 9346,10341 ,
      //       8861, 9352 ,10312 ,10313 ,9350 ,9344 ,13004 ,9344 ,10350 ,13016,
      //       13440 ,13441 , 10370 , 10348 ,13066 , 13208 , 9353 , 13065 ,13066 ,
      //       10347 ,13020 ,9342 ,13204 ,9356 ,13439 ,13008 ,9347 ,13015   

      //     ].includes(venda.clienteDTO?.id!)
      //   ) {
      //     console.log(venda.clienteDTO?.id, venda.clienteDTO?.nome, venda.latEntrega!, venda.lngEntrega!)
      //     waypoints.push(
      //       new google.maps.LatLng(
      //         parseFloat(venda.latEntrega!),
      //         parseFloat(venda.lngEntrega!)
      //       )
      //     );
      //   }
      // });

      //this.createRoute(this.initialPosition, this.initialPosition, waypoints);
      //this.reorganizeRouteFromVendaDTO();
      //this.drawRoute();
    }, 2000);
  }

  isValidLatLng(lat: number, lng: number): boolean {
    // Latitude must be between -90 and 90 degrees
    // Longitude must be between -180 and 180 degrees
    return (lat >= -90 && lat <= 90) && (lng >= -180 && lng <= 180);
  }

  setPage(pageInfo: any) {
    this.romaneioPesquisaDTO.pageSize = pageInfo.pageSize;
    this.romaneioPesquisaDTO.pageNumber = pageInfo.offset;
    this.pesquisaRota(this.romaneioPesquisaDTO);
  }

  removeMarkers(): void {
    if (this.markers != null && this.markers.length > 0) {
      this.markers.forEach((markerInfo: any) => {
        markerInfo.setMap(null);
      });
      this.markers = [];
    }
  }
}
