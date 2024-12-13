import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';
import { LoginVM, TokenReturn, UserAccountAux, JWTAux, StoredSalesProfile } from './auth.utils';
import jwt_decode from 'jwt-decode';

@Injectable()
export class AuthUtilsService {

  PRINCIPAL_BACKEND_URL_API = environment.PRINCIPAL_BACKEND_URL_API;
  _urlMenuReport = '/api/v1/menu-reports';
  constructor(private _http: HttpClient) { }

  authenticate(loginVM: LoginVM): Observable<TokenReturn> {
    return this._http.post<TokenReturn>(this.PRINCIPAL_BACKEND_URL_API + '/api/authenticate', loginVM);
  }

  getExpiryTime(): number {
    const decodedToken = this.getDecodeToken();
    return decodedToken &&
    Object.prototype.hasOwnProperty.call(decodedToken, 'exp') &&
    decodedToken.exp != null ? decodedToken.exp : -1;
  }

  isTokenExpired(): boolean {
      const expiryTime: number = this.getExpiryTime();
      // console.log(expiryTime);
      if (expiryTime > 0) {
        return ((1000 * expiryTime) - (new Date()).getTime()) < 5000;
      } else {
        return true;
      }
  }

  getAccount(): Observable<UserAccountAux> {
    return this._http.get<UserAccountAux>(this.PRINCIPAL_BACKEND_URL_API + '/api/account');
  }

  getAccountFromLocalStorage(): StoredSalesProfile {
    return this.getObjectFromLocalStorage(environment.PRINCIPAL_APP_ACCOUNT_KEY);
  }

  setAccountToLocalStorage(obj: any): void {
    this.removeAccountFromLocalStorage();
    this.saveObjectToLocalStorage(environment.PRINCIPAL_APP_ACCOUNT_KEY, obj);
  }

  saveIdTokenPrincipalApp(id_token: string): void {
    this.removeIdTokenPrincipalApp();
    this.saveItemStringToLocalStorage(environment.PRINCIPAL_ID_TOKEN_KEY, id_token);
  }

  removeAccountFromLocalStorage(): void {
    console.log('removendo');
    this.removeItemFromLocalStorage(environment.PRINCIPAL_APP_ACCOUNT_KEY);
  }

  removeItemFromLocalStorage(key: string): void {
    localStorage.removeItem(key);
  }

  saveObjectToLocalStorage(key: string, value: object): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  saveItemStringToLocalStorage(key: string, value: string): void {
    localStorage.setItem(key, value);
  }

  getObjectFromLocalStorage(key: string): any {
    return JSON.parse(localStorage.getItem(key)!);
  }

  getRawStringFromLocalStorage(key: string): string {
    let ret = localStorage.getItem(key);
    if (ret == null) {
      ret =  '';
    }
    return ret;
  }

  removeIdTokenPrincipalApp(): void {
    this.removeItemFromLocalStorage(environment.PRINCIPAL_ID_TOKEN_KEY);
  }

  getIdTokenPrincipalApp(): string {
    return this.getRawStringFromLocalStorage(environment.PRINCIPAL_ID_TOKEN_KEY);
  }

  getDecodeToken(): JWTAux {
    const token = this.getIdTokenPrincipalApp();
    if (token != null && token.length > 0) {
      return jwt_decode(this.getIdTokenPrincipalApp());
    } else {
      const jwtAux: JWTAux = {
        exp: -1,
        auth: '',
        iat: 0,
        sub: '',
      };
      return jwtAux;
    }
  }

  getRolesFromDecodedToken(): string[] {
    const jwtAux = this.getDecodeToken();
    const roles = jwtAux.auth.split(' ');
    return roles;
  }

  resetInitPassword(email: string): Observable<any> {
    return this._http.post<any>(this.PRINCIPAL_BACKEND_URL_API + '/api/account/reset-password/init', email);
  }

  resetPasswordByResetkey(key: string, newPassword: string): Observable<any> {
    return this._http.post<any>(this.PRINCIPAL_BACKEND_URL_API + '/api/account/reset-password/finish', {key: key, newPassword: newPassword});
  }

  getAuthoritiesPublicUser(): Observable<string[]> {
      return this._http.get<string[]>(this.PRINCIPAL_BACKEND_URL_API + '/api/authorities');
  }

  saveAuthoritiesPublicUser(role: string | null): Observable<string[]> {
    return this._http.get<string[]>(this.PRINCIPAL_BACKEND_URL_API + '/api/authorities/' + role);
  }

  deleteAuthoritiesPublicUser(role: string): Observable<string[]> {
    return this._http.delete<string[]>(this.PRINCIPAL_BACKEND_URL_API + '/api/authorities/' + role);
  }

  getRoleNameCut(role: string): string {
    const roleKey = 'ROLE_';
    const roleGrpKey = 'ROLE_GRP_';
    role = role.trim().toUpperCase();

    if (role.includes(roleKey)) {
      return role.substring(roleKey.length);
    } else if (role.includes(roleGrpKey)) {
      return role.substring(roleGrpKey.length);
    } else {
      return role;
    }
  }

  getAllActiveMenuReportsByUser(): Observable<any> {
    return this._http.get<any>(this.PRINCIPAL_BACKEND_URL_API + this._urlMenuReport + '/active-by-user');
  }
}
