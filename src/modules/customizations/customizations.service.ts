import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';
import { GroupUser, MenuReport, PbiReportContentDTO, PbiWorkspaceContentDTO } from './customizations.utils';

@Injectable()
export class CustomizationsService {
  PRINCIPAL_BACKEND_URL_API = environment.PRINCIPAL_BACKEND_URL_API;
  _urlGroup = '/api/v1/group-users';
  _urlMenuReport = '/api/v1/menu-reports';

  constructor(private _http: HttpClient) { }
  deleteUser(login: string): Observable<any> {
    return this._http.delete<any>(this.PRINCIPAL_BACKEND_URL_API + '/api/admin/users/' + login);
  }

  searchGroup(group: GroupUser | any): Observable<GroupUser[]> {
    return this._http.post<GroupUser[]>(this.PRINCIPAL_BACKEND_URL_API + this._urlGroup + '/search', group);
  }

  getAllGroups(): Observable<GroupUser[]> {
    return this._http.get<GroupUser[]>(this.PRINCIPAL_BACKEND_URL_API + this._urlGroup);
  }

  getAllActiveGroupsByUser(): Observable<GroupUser[]> {
    return this._http.get<GroupUser[]>(this.PRINCIPAL_BACKEND_URL_API + this._urlGroup + '/active-by-user');
  }

  getAllActiveGroupsByOrganization(organizationId: number): Observable<GroupUser[]> {
    return this._http.get<GroupUser[]>(this.PRINCIPAL_BACKEND_URL_API + this._urlGroup + '/organization/' + organizationId);
  }

  deleteGroupById(groupId: number): Observable<any> {
    return this._http.delete<any>(this.PRINCIPAL_BACKEND_URL_API + this._urlGroup + "/" + groupId);
  }

  postOrPutGroup(group: GroupUser, status: number): Observable<GroupUser> {
    if (status === 1) {
      return this._http.post<GroupUser>(
        this.PRINCIPAL_BACKEND_URL_API + this._urlGroup,
        group,
      );
    } else {
      return this._http.put<GroupUser>(
        this.PRINCIPAL_BACKEND_URL_API + this._urlGroup,
        group,
      );
    }
  }
  getAllWorkspacesPbi(): Observable<PbiWorkspaceContentDTO> {
    return this._http.get<PbiWorkspaceContentDTO>(this.PRINCIPAL_BACKEND_URL_API + '/api/v1/pbi-utils-workspace');
  }
  getAllReporstPbiByWorkspaceId(workspaceId: string): Observable<PbiReportContentDTO> {
    return this._http.get<PbiReportContentDTO>(this.PRINCIPAL_BACKEND_URL_API + '/api/v1/pbi-utils-report/'+ workspaceId);
  }

  postOrPutMenuReport(menuReport: MenuReport, status: number): Observable<MenuReport> {
    if (status === 1) {
      return this._http.post<MenuReport>(
        this.PRINCIPAL_BACKEND_URL_API + this._urlMenuReport,
        menuReport,
      );
    } else {
      return this._http.put<MenuReport>(
        this.PRINCIPAL_BACKEND_URL_API + this._urlMenuReport,
        menuReport,
      );
    }
  }

  getAllActiveMenuReportsByUser(): Observable<MenuReport[]> {
    return this._http.get<MenuReport[]>(this.PRINCIPAL_BACKEND_URL_API + this._urlMenuReport + '/active-by-user');
  }

  getAllMenuReportsByUser(): Observable<MenuReport[]> {
    return this._http.get<MenuReport[]>(this.PRINCIPAL_BACKEND_URL_API + this._urlMenuReport + '/all-by-user');
  }

  deleteMenuReportById(menuId: number): Observable<any> {
    return this._http.delete<any>(this.PRINCIPAL_BACKEND_URL_API + this._urlMenuReport + "/" + menuId);
  }


}
