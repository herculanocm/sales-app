import { Component, Input } from '@angular/core';
import { ErrorSales } from './error';

@Component({
    selector: 'app-fields-erro-directive',
    templateUrl: './fields-erro.component.html',
    styleUrls: ['./fields-erro.component.css'],
})
export class FieldsErroComponent {
    @Input() servererror: ErrorSales;
    constructor() {
        this.servererror =  new ErrorSales();
    }

    isString(value: any): value is string {
        return typeof value === "string";
    }

    isArray(value: any): boolean {
        return Array.isArray(value);
    }
}
