import { FormGroup } from "@angular/forms";
import { DTOTransaction } from "src/app/shared/dto/transaction";
import { CategoryEntity } from "src/app/shared/entities/category";
import { DTOPartialTableOptions } from "src/app/shared/partials/table/dto/dtoTable";

export interface DTOLoadTable {
    partialTableOptions: DTOPartialTableOptions;
    categories: CategoryEntity[];
}

export interface DTOModalOpen {
    selectedCategory: CategoryEntity | null;
    form: FormGroup | null;
}