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

export interface DTOResults {
    incomes: DTOTransaction[];
    expenses: DTOTransaction[];
    totalIncomes: string;
    totalExpenses: string;
    total: string;
    totalInt: number;
}