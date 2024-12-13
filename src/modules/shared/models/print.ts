import { VendaDTO } from "./venda";

export class PrintObjectVenda {
    id!: string;
    data!: VendaDTO;
}


export interface PrintObjectVendaV2 {
    id: string;
    data: VendaDTO[];
}
