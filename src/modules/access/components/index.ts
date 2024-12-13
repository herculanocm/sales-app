import { CreateUserComponent } from './create-user/create-user.component';
import { FindUserComponent } from './find-user/find-user.component';
import { RolesComponent } from './roles/roles.component';
import { OrganizationComponent } from './organization/organization.component';
import { NgbdModalConfirmComponent } from './util/modal-confirm.component';
import { KeyValueConfigComponent } from './key-value-config/key-value-config.component';

export const containers = [
    CreateUserComponent,
    FindUserComponent,
    RolesComponent,
    OrganizationComponent,
    NgbdModalConfirmComponent,
    KeyValueConfigComponent,
];

export * from './create-user/create-user.component';
export * from './find-user/find-user.component';
export * from './roles/roles.component';
export * from './organization/organization.component';
export * from './key-value-config/key-value-config.component';
