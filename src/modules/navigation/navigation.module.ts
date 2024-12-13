/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@modules/icons/icons.module';
import { AuthUtilsModule } from '@modules/auth-utils/auth-utils.module';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';

import * as navigationContainers from './containers';

import * as layoutContainers from './layouts';

import * as navigationComponents from './components';

import * as navigationServices from './services';
import { RouterModule } from '@angular/router';

@NgModule({
    imports: [CommonModule, RouterModule, IconsModule, AuthUtilsModule, NgbDropdownModule],
    declarations: [...navigationContainers.containers, ...layoutContainers.layouts, ...navigationComponents.components],
    exports: [...navigationContainers.containers, ...navigationComponents.components, ...layoutContainers.layouts],
    providers: [...navigationServices.services],
})
export class NavigationModule { }
