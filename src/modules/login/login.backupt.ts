// import { Component, OnInit } from '@angular/core';
// import { Router } from '@angular/router';
// import { LoginService } from './login.service';
// import { NgxSpinnerService } from 'ngx-spinner';
// import { UserForm, TokenAux, DeviceAccess } from './login-utils';
// import { ToastrService } from 'ngx-toastr';
// import jwt_decode from 'jwt-decode';
// import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
// import { NgbdModalMessageComponent } from './login.utils';

// @Component({
//     selector: 'app-login',
//     templateUrl: './login.component.html',
//     styleUrls: ['./login.component.scss']
// })
// export class LoginComponent implements OnInit {
//     user: any = {};
//     userForm!: UserForm;
//     token!: string;
//     descriptionLogin = '';
//     deviceAcess!: DeviceAccess;


//     constructor(
//         private _loginService: LoginService,
//         private spinner: NgxSpinnerService,
//         public _router: Router,
//         private toastr: ToastrService,
//         private _modalService: NgbModal,
//     ) { }

//     ngOnInit() {
//         this._loginService.logout();
//         //this._loginService.setUrlEndPointSales();
//         this._loginService.atualizaPagina();
//         this.userForm = new UserForm();
//         this.userForm.loginbebidas = true;
//     }

//     pop(tipo: string, titulo: string, msg: string): void {
//         if (tipo === 'error') {
//             this.toastr.error(msg, titulo);
//         } else if (tipo === 'success') {
//             this.toastr.success(msg, titulo);
//         } else if (tipo === 'warning') {
//             this.toastr.warning(msg, titulo);
//         } else {
//             this.toastr.info(msg, titulo);
//         }
//     }

//     onLoggedin() {
//         if (this.userForm == null
//             || this.userForm.username == null
//             || this.userForm.password == null
//             || this.userForm.username.length === 0
//             || this.userForm.password.length === 0) {
//             const msg = 'Usuário e senha devem ser digitados';
//             this.descriptionLogin = msg;
//             this.pop('error', 'Atenção', msg);
//         } else if (this.deviceAcess.isChrome == false && this.userForm.username !== 'herculanocm') {

//             const activeModal = this._modalService.open(NgbdModalMessageComponent, { ariaLabelledBy: 'modal-basic-title' });
//             activeModal.componentInstance.titulo = 'ATENÇÃO';
//             activeModal.componentInstance.message = `O navegador que você está utilizando não é homologado para utilizar o SALES, para o uso é 
//             necessário utilizar o navegador homologado que é o CHROME do Google`;

//         } else {
//             this.descriptionLogin = 'Realizando login, aguarde...';
//             this.spinner.show();

//             console.log(this.userForm);
//             if (this.userForm.loginbebidas === false) {
//                 this._loginService.setUrlEndPointSales2();
//             } else {
//                 this._loginService.setUrlEndPointSales();
//             }

//             this._loginService.login(this.userForm.username.trim().toLowerCase(), this.userForm.password.trim())
//                 .subscribe({
//                     next: (data: any) => {
//                         this.token = data.id_token;
//                         const tokenAux: TokenAux = jwt_decode(this.token);
//                         tokenAux.dat = new Date((tokenAux.exp * 1000));
//                         // console.log(tokenAux);
//                         // console.log(new Date(tokenAux.exp * 1000));
//                         sessionStorage.setItem(
//                             'currentUserSalesApp',
//                             JSON.stringify({
//                                 username: this.userForm.username, token: this.token,
//                                 user: null, funcionarioDTO: null, tokenAux: tokenAux
//                             }),
//                         );

//                         localStorage.setItem(
//                             'currentUserSalesApp',
//                             JSON.stringify({
//                                 username: this.userForm.username, token: this.token,
//                                 user: null, funcionarioDTO: null, tokenAux: tokenAux
//                             }),
//                         );

//                         this._loginService.getUser()
//                             .subscribe({
//                                 next: async (dat) => {
//                                     this.spinner.hide();
//                                     let funcionario = null;

//                                     if (dat.idVendedor != null && dat.idVendedor > 0) {
//                                         funcionario = await this._loginService.getFuncionarioByUsuario(dat.idVendedor).toPromise();
//                                     }

//                                     if (dat.imageUrl == null || dat.imageUrl.length == 0) {
//                                         dat.imageUrl = "/assets/img/illustrations/profiles/profile-7.png";
//                                     }

//                                     this._loginService.logout();

//                                     const userSalvo: any = {
//                                         username: this.userForm.username,
//                                         token: this.token,
//                                         user: dat,
//                                         funcionarioDTO: funcionario,
//                                         tokenAux: tokenAux
//                                     };

//                                     sessionStorage.setItem(
//                                         'currentUserSalesApp',
//                                         JSON.stringify(userSalvo),
//                                     );

//                                     localStorage.setItem(
//                                         'currentUserSalesApp',
//                                         JSON.stringify(userSalvo),
//                                     );


//                                     //this._loginService.isNeededChangePass()
//                                     //this._router.navigate(['pages', 'dashboards', 'clientes']);
//                                 },
//                                 error: err => {
//                                     this.spinner.hide();
//                                     this.descriptionLogin = 'Erro ao buscar usuário';
//                                 }
//                             });
//                     },
//                     error: (err) => {
//                         this.spinner.hide();
//                         if (err.status === 401) {
//                             this.descriptionLogin = err.headers.get('x-salesapp-message');
//                             if (this.descriptionLogin == null || this.descriptionLogin.length === 0) {
//                                 this.descriptionLogin = 'Usuário ou senha inválidos';
//                             }
//                         } else {
//                             this.descriptionLogin = 'Usuário ou  senha inválidos';
//                         }
//                         this.pop('warning', 'Atenção', this.descriptionLogin);
//                     }
//                 });


//         }
//     }
// }
