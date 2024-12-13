import { Pipe, PipeTransform } from '@angular/core';
import { ClienteStatusLabelDTO } from '@modules/shared/models/cliente';

@Pipe({
    name: 'clienteStatusLabelFilter',
    pure: false,
})
export class ClienteStatusLabelFilter implements PipeTransform {
    transform(itens: ClienteStatusLabelDTO[], filter: any): any {
        if (!itens || !filter) {
            return itens;
        }
        return itens.filter(item => item.status === filter);
    }
}
