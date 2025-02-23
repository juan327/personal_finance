import { FormGroup } from "@angular/forms";
import { Chart } from "highcharts";
import { DTOTransaction } from "src/app/shared/dto/transaction";
import { CategoryEntity } from "src/app/shared/entities/category";
import { DTOPartialTableOptions } from "src/app/shared/partials/table/dto/dtoTable";

export interface DTOLoadTable {
    partialTableOptions: DTOPartialTableOptions;
    transactions: DTOTransaction[];
    categories: CategoryEntity[];
    chart: Chart | null;
}

export interface DTOModalOpen {
    form: FormGroup | null;
}

export interface DTODictionary {
    cardTable: {
        title: string;
        button: string;
        search: string;
        header: {
            category: string;
            name: string;
            amount: string;
            date: string;
            created: string;
        };
        opc: {
            edit: string;
            delete: string;
        };
    };
    cardChart: {
        title: string;
        percentage: string
        noData: string;
    };
    modalCreate: {
        title: string;
        name: string;
        amount: string;
        date: string;
        category: string;
        description: string;
        opc: {
            create: string;
            edit: string;
        }
    };
    modalDelete: {
        title: string;
        body: string;
    }
}