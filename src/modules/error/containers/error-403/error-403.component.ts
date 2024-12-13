import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector: 'app-error-403',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './error-403.component.html',
    styleUrls: ['error-403.component.scss'],
})
export class Error403Component { }

