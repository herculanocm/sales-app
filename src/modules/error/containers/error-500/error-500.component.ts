import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector: 'app-error-500',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './error-500.component.html',
    styleUrls: ['error-500.component.scss'],
})
export class Error500Component { }
