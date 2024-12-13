import { ChangeDetectionStrategy, Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { LayoutService } from '@modules/pages/services';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import moment from 'moment';
import { NgbdModalAlertMsgComponent } from '../utils/modal-alert-msg.component';
import { ConfGeraisService } from '@modules/shared/services';
import { CurrentUserLoged } from '@modules/shared/models/layout.utils';


@Component({
    selector: 'app-pages',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './pages.component.html',
})
export class PagesComponent implements OnInit, OnDestroy {

    currentUserSalesApp!: CurrentUserLoged;
    intervalLayout!: any;
    constructor(
        public _router: Router,
        private _layoutService: LayoutService,
        private _modalService: NgbModal,
        private _configService: ConfGeraisService,
    ) { }

    ngOnInit(): void {
        //console.log('pages component oninit');
        this.currentUserSalesApp = JSON.parse(sessionStorage.getItem('currentUserSalesApp')!);
        //console.log(this.currentUserSalesApp);

        this.getMessageByUser(this.currentUserSalesApp.user.id);


        if (!this._layoutService.isLoggedAndConfigsSession()) {
            alert('Usuário não encontrado, realize o login novamente');
            this._router.navigate(['login']);
        } else {

            this._layoutService.getDataAtual()
                .subscribe({
                    next: (data) => {



                        const dataExpiracao = moment(new Date(this.currentUserSalesApp.tokenAux.exp * 1000));
                        // const dataExpiracao = moment(new Date());
                        const dataAtual = moment(data.dataAtual);

                        // console.log(dataAtual);

                        if (dataExpiracao.isBefore(dataAtual)) {
                            // console.log('isBefore');
                            console.log('Deslogando pelo login');
                            alert('Seu tempo de login expirou e será deslogado, realize o login novamente');
                            this._router.navigate(['login']);
                        } else {


                            this.intervalLayout = setInterval(() => {
                                console.log('Iniciando, validações do layout...');
                                if (!this._layoutService.isLoggedAndConfigsSession()) {
                                    alert('Usuário não encontrado, realize o login novamente');
                                    this._router.navigate(['login']);
                                } else {
                                    console.log('Buscando data de expiração de login...');
                                    this._layoutService.getDataAtual()
                                        .subscribe({
                                            next: (datai) => {
                                                const dataExpiracaoi = moment(new Date(this.currentUserSalesApp.tokenAux.exp * 1000));
                                                // const dataExpiracao = moment(new Date());
                                                const dataAtuali = moment(datai.dataAtual);

                                                // console.log(dataAtual);

                                                if (dataExpiracaoi.isBefore(dataAtuali)) {
                                                    // console.log('isBefore');
                                                    console.log('Deslogando pelo login');
                                                    alert('Seu tempo de login expirou e será deslogado, realize o login novamente');
                                                    this._router.navigate(['login', 'logout']);
                                                } else {
                                                    console.log('Validação de cliente ok para data de expiração');
                                                }


                                            }
                                        });
                                }

                                // this.trackMe();


                            }, 50000);

                        }


                    },
                    error: () => {
                        alert('Sistema indisponivel ao buscar a data');
                        this._router.navigate(['login']);
                    }
                });
        }
    }

    getMessageByUser(userId: number): void {
        this._configService.getMsgByUser(userId)
        .subscribe({
            next: (data) => {
                console.log('Msg');
                console.log(data);
                this.msgAlerta('Atenção a Mensagem', data.msg, userId);
            },
            error: (err) => {
                console.log('Error when get message');
                console.log(err);
            }
        });
    }

    msgAlerta(titulo: string, msg: string, userId: number): void {
        const activeModal = this._modalService.open(NgbdModalAlertMsgComponent);
        activeModal.componentInstance.modalHeader = titulo;
        activeModal.componentInstance.modalContent = msg;
        activeModal.result.then((result) => {
            if (result === 'confirm') {
                this._configService.msgReaded(userId)
                    .subscribe({
                        next: (data) => {
                            console.log('Message Read');
                            console.log(data);
                        },
                        error: (err) => {
                            console.log('Error when update message read');
                            console.log(err);
                        }
                    });
            }
        }, (error) => { console.log(error) });
    }

    isLoggedAndConfigsSession(currentUserSalesApp: any): boolean {
        let isLoggedAndConfigs = false;
        if (currentUserSalesApp != null &&
            currentUserSalesApp.token != null && currentUserSalesApp.token.length > 0 &&
            currentUserSalesApp.user != null &&
            sessionStorage.getItem('urlEndPointSales') &&
            sessionStorage.getItem('urlEndPointNodejs')) {
            isLoggedAndConfigs = true;
        }

        return isLoggedAndConfigs;
    }

    ngOnDestroy(): void {
        clearInterval(this.intervalLayout);
    }
}
