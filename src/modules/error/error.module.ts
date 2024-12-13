/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

/* Modules */
import { NavigationModule } from '@modules/navigation/navigation.module';

/* Components */
import * as errorComponents from './components';

/* Containers */
import * as errorContainers from './containers';

/* Guards */
import * as errorGuards from './guards';

/* Services */
import { IconsModule } from '@modules/icons/icons.module';

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        ReactiveFormsModule,
        FormsModule,
        NavigationModule,
        IconsModule,
    ],
    providers: [...errorGuards.guards],
    declarations: [...errorContainers.containers, ...errorComponents.components],
    exports: [...errorContainers.containers, ...errorComponents.components],
})
export class ErrorModule {}
