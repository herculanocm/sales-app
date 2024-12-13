import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';
import { UserAux, GenericPageable, AdminUserDTO, Organization, KeyValueConfig } from './access.utils';

@Injectable()
export class AccessService {
  PRINCIPAL_BACKEND_URL_API = environment.PRINCIPAL_BACKEND_URL_API;
  _urlOrganization = '/api/v1/organizations';
  _urlKeyValueConfig = '/api/v1/key-value-config';
  constructor(private _http: HttpClient) { }
  postOrPutUser(usuario: any, status: number): Observable<UserAux> {
    if (status === 1) {
      return this._http.post<UserAux>(this.PRINCIPAL_BACKEND_URL_API + '/api/admin/users', usuario);
    } else {
      return this._http.put<UserAux>(this.PRINCIPAL_BACKEND_URL_API + '/api/admin/users', usuario);
    }
  }
  getUsers(page: GenericPageable): Observable<AdminUserDTO[]> {
    return this._http.get<AdminUserDTO[]>(this.PRINCIPAL_BACKEND_URL_API + '/api/admin/users');
  }
  deleteUser(login: string): Observable<any> {
    return this._http.delete<any>(this.PRINCIPAL_BACKEND_URL_API + '/api/admin/users/' + login);
  }
  getUserByLogin(login: string): Observable<AdminUserDTO> {
    return this._http.get<AdminUserDTO>(this.PRINCIPAL_BACKEND_URL_API + '/api/admin/users/' + login);
  }
  postOrPutOrganization(organization: Organization | any, status: number): Observable<Organization> {
    if (status === 1) {
      return this._http.post<Organization>(
        this.PRINCIPAL_BACKEND_URL_API + this._urlOrganization,
        organization,
      );
    } else {
      return this._http.put<Organization>(
        this.PRINCIPAL_BACKEND_URL_API + this._urlOrganization,
        organization,
      );
    }
  }
  getAllOrganization(): Observable<Organization[]> {
    return this._http.get<Organization[]>(this.PRINCIPAL_BACKEND_URL_API + this._urlOrganization);
  }

  deleteOrganizationById(organizationId: number): Observable<any> {
    return this._http.delete<any>(this.PRINCIPAL_BACKEND_URL_API + this._urlOrganization + "/" + organizationId);
  }

  getAllEnableOrganization(): Observable<Organization[]> {
    return this._http.get<Organization[]>(this.PRINCIPAL_BACKEND_URL_API + this._urlOrganization + '/enabled');
  }

  getAllEnableOrganizationByUser(): Observable<Organization[]> {
    return this._http.get<Organization[]>(this.PRINCIPAL_BACKEND_URL_API + this._urlOrganization + '/active-by-user');
  }

  getAllConfigs(): Observable<KeyValueConfig[]> {
    return this._http.get<KeyValueConfig[]>(this.PRINCIPAL_BACKEND_URL_API + this._urlKeyValueConfig);
  }

  postOrPutKeyValueConfig(keyValueConfig: KeyValueConfig | any, status: number): Observable<KeyValueConfig> {
    if (status === 1) {
      return this._http.post<KeyValueConfig>(
        this.PRINCIPAL_BACKEND_URL_API + this._urlKeyValueConfig,
        keyValueConfig,
      );
    } else {
      return this._http.put<KeyValueConfig>(
        this.PRINCIPAL_BACKEND_URL_API + this._urlKeyValueConfig,
        keyValueConfig,
      );
    }
  }

  deleteConfigByKey(key: string): Observable<any> {
    return this._http.delete<any>(this.PRINCIPAL_BACKEND_URL_API + this._urlKeyValueConfig + "/" + key);
  }
}
