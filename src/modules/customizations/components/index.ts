import { MenusComponent } from './menus/menus.component';
import { GroupsComponent } from './groups/groups.component';
import { NgbdModalConfirmComponent } from './utils/modal-confirm.component';
import { ReportsComponent } from './reports/reports.component';

export const containers = [
    MenusComponent,
    GroupsComponent,
    NgbdModalConfirmComponent,
    ReportsComponent,
];

export * from './menus/menus.component';
export * from './groups/groups.component';
export * from './utils/modal-confirm.component';
export * from './reports/reports.component';
