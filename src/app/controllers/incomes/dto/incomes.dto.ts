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
    selectedIncome: DTOTransaction | null;
    form: FormGroup | null;
}