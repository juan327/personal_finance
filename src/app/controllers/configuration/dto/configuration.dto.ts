import { FormGroup } from "@angular/forms";
import { DTOTransaction } from "src/app/shared/dto/transaction";
import { CategoryEntity } from "src/app/shared/entities/category";
import { DTOPartialTableOptions } from "src/app/shared/partials/table/dto/dtoTable";

export interface DTOLoadTable {
    partialTableOptions: DTOPartialTableOptions;
    categories: CategoryEntity[];
}

export interface DTOModalOpen {
    form: FormGroup | null;
}

export interface DTODictionary {
    cardTitle: string;
    cardCombo: {
        currency: string;
        language: {
            label: string;
            spanish: string;
            english: string;
        };
    };
    cardTable: {
        title: string;
        button: string;
        search: string;
        header: {
            type: string;
            name: string;
            created: string;
        };
        opc: {
            edit: string;
            delete: string;
        };
    };
    modalCreate: {
        title: string;
        name: string;
        type: {
            label: string;
            income: string;
            expense: string;
        };
        opc: {
            create: string;
            edit: string;
        }
    };
    modalDelete: {
        title: string;
        body: string;
    };

}