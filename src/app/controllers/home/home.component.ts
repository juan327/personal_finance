import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DTOTransaction } from 'src/app/shared/dto/transaction';
import { CategoryEntity } from 'src/app/shared/entities/category';
import { TransactionEntity } from 'src/app/shared/entities/transaction';
import { GenericService } from 'src/app/shared/services/generic.service';

import { HighchartsChartModule } from 'highcharts-angular';
import { HighchartService } from 'src/app/shared/services/highchart.service';
import * as Highcharts from 'highcharts';
import { Chart } from 'highcharts';
import { darkTheme } from 'src/app/shared/themes/highcharts/highcharts.dark.theme'; // Importa el tema
import { DTOHighchartSeries } from 'src/app/shared/dto/generic';
import { IndexeddbService } from 'src/app/shared/services/indexeddb.service';
import { TableComponent } from 'src/app/shared/partials/table/table.component';
Highcharts.setOptions(darkTheme); // Aplica el tema

@Component({
  selector: 'app-home',
  imports: [RouterOutlet, CommonModule, HighchartsChartModule, TableComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  standalone: true,
  providers: [DatePipe, DecimalPipe, GenericService],
})

export class HomeComponent implements OnInit {
  constructor() { }

  public readonly _genericService = inject(GenericService);
  public readonly _highchartService = inject(HighchartService);
  private readonly _indexeddbService = inject(IndexeddbService);

  public _transactions: DTOTransaction[] = [];
  public _categories: CategoryEntity[] = [];
  public _results: {
    incomes: DTOTransaction[],
    expenses: DTOTransaction[],
    totalIncomes: string,
    totalExpenses: string,
    total: string,
  } = {
      incomes: [],
      expenses: [],
      totalIncomes: '0',
      totalExpenses: '0',
      total: '0',
    };

  public chart: Chart | null = null;

  ngOnInit(): void {
    this._indexeddbService.getAllItems<TransactionEntity>('transactions', 'created', 'desc').then(response => {
      if (response.length > 0) {
        this._transactions = response.map((item: TransactionEntity) => {
          console.log(item);
          const objReturn: DTOTransaction = {
            transactionId: item.transactionId,
            name: item.name,
            amount: item.amount,
            date: item.date,
            description: item.description,
            categoryId: item.categoryId,
            categoryName: item.category.name,
            categoryType: item.category.type,
            created: item.created,
          };
          return objReturn;
        });
      }

      const options: Highcharts.Options = this.getChartOptions();
      this.chart = this._highchartService.buildChart('container', options);
      this.updateResults();
    }, error => {
      console.error(error);
    });
  }

  ngAfterViewInit(): void {
  }

  ngOnDestroy(): void {

  }

  public updateResults(): void {
    const incomes = this._transactions.filter(c => c.categoryType === 1);
    const expenses = this._transactions.filter(c => c.categoryType === 2);

    const totalIncomes = incomes.reduce((a, b) => a + b.amount, 0);
    const totalExpenses = expenses.reduce((a, b) => a + b.amount, 0);

    const responsetotalIncomes = this._genericService.convertToCurrencyFormat(totalIncomes);
    if (!responsetotalIncomes.confirmation) {
      alert(responsetotalIncomes.message);
      return;
    }
    const responseTotalExpenses = this._genericService.convertToCurrencyFormat(totalExpenses);
    if (!responseTotalExpenses.confirmation) {
      alert(responseTotalExpenses.message);
      return;
    }
    const responseTotal = this._genericService.convertToCurrencyFormat(totalIncomes - totalExpenses);
    if (!responseTotal.confirmation) {
      alert(responseTotal.message);
      return;
    }

    this._results.incomes = incomes;
    this._results.expenses = expenses;
    this._results.totalIncomes = responsetotalIncomes.data;
    this._results.totalExpenses = responseTotalExpenses.data;
    this._results.total = responseTotal.data;
  }

  private getChartOptions(): Highcharts.Options {
    const dataIncomes: {
      name: string;
      y: number;
    }[] = [];
    const dataExpenses: {
      name: string;
      y: number;
    }[] = [];

    const categories = this._genericService.getMonthsFromYear(2025);
    console.log(this._transactions);

    for (let i = 0; i < categories.length; i++) {
      const item = categories[i];
      const amountIncomes = this._transactions.reduce((a, b) => a + (b.categoryType === 1 && b.date >= item.dateStart && b.date <= item.dateEnd ? b.amount : 0), 0);
      const amountExpenses = this._transactions.reduce((a, b) => a + (b.categoryType === 2 && b.date >= item.dateStart && b.date <= item.dateEnd ? b.amount : 0), 0);

      const responseIncomes = this._genericService.convertToNumberDecimal(amountIncomes);
      if (!responseIncomes.confirmation) {
        continue;
      }
      const responseExpenses = this._genericService.convertToNumberDecimal(amountExpenses);
      if (!responseExpenses.confirmation) {
        continue;
      }

      dataIncomes.push({
        name: item.name,
        y: responseIncomes.data,
      });

      dataExpenses.push({
        name: item.name,
        y: responseExpenses.data,
      });
    }

    const series: DTOHighchartSeries<any>[] = [
      {
        name: 'Ingresos',
        data: dataIncomes,
        color: '#00C853',
      },
      {
        name: 'Gastos',
        data: dataExpenses,
        color: '#FF0000',
      }
    ];

    return {
      chart: {
        type: 'column'
      },
      title: {
        text: 'Rendimiento del año'
      },
      xAxis: {
        categories: categories.map(c => c.name),
        crosshair: true,
        accessibility: {
          description: 'Countries'
        }
      },
      yAxis: {
        min: 0,
        title: {
          text: 'AÑO 2025'
        }
      },
      plotOptions: {
        column: {
          pointPadding: 0.2,
          borderWidth: 0
        }
      },
      tooltip: {
        valuePrefix: '$'
      },
      series: series as any
    };
  }

}
