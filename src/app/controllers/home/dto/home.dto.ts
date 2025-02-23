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

export interface DTOLoadYears {
    years: number[];
}

export class DTOResults {
    incomes: DTOTransaction[];
    expenses: DTOTransaction[];
    totalIncomes: string;
    totalExpenses: string;
    total: string;
    totalInt: number;
    constructor() {
        this.incomes = [];
        this.expenses = [];
        this.totalIncomes = '0';
        this.totalExpenses = '0';
        this.total = '0';
        this.totalInt = 0;
    }
}

export interface DTODictionary {
    cardTotal: string;
    cardTotalIncomes: string;
    cardTotalExpenses: string;
    cardYear: string;

    cardChart: {
        title: string;
        leftText: string;
        incomes: string;
        expenses: string;
    };

    cardTitleTable: string;
    cardHeaderTable: {
        category: string;
        name: string;
        amount: string;
        date: string;
        created: string;
    };
}