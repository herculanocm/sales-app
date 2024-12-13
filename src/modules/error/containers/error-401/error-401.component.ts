import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector: 'app-error-401',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './error-401.component.html',
    styleUrls: ['error-401.component.scss'],
})
export class Error401Component { }

