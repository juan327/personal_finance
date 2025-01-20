import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { DTOTransaction } from 'src/app/shared/dto/transaction';
import { CategoryEntity } from 'src/app/shared/entities/category';
import { TransactionEntity } from 'src/app/shared/entities/transaction';
import { GenericService } from 'src/app/shared/services/generic.service';

import { HighchartsChartModule } from 'highcharts-angular';
import { HighchartService } from 'src/app/shared/services/highchart.service';
import * as Highcharts from 'highcharts';
import { Chart } from 'highcharts';
import { darkTheme } from 'src/app/shared/themes/highcharts/highcharts.dark.theme'; // Importa el tema
import { DTOHighchartSeries, DTOLocalStorage } from 'src/app/shared/dto/generic';
import { TableComponent } from 'src/app/shared/partials/table/table.component';
import { DTOPartialTableOptions } from 'src/app/shared/partials/table/dto/dtoTable';
import { DTOResults } from './dto/home.dto';
import { HomeService } from './home.service';
Highcharts.setOptions(darkTheme); // Aplica el tema

@Component({
  selector: 'app-home',
  imports: [CommonModule, HighchartsChartModule, TableComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  standalone: true,
  providers: [HomeService, DatePipe, DecimalPipe, GenericService],
})

export class HomeComponent implements OnInit {
  constructor() { }

  public readonly _genericService = inject(GenericService);
  public readonly _highchartService = inject(HighchartService);
  private readonly _homeService = inject(HomeService);

  public _transactions: DTOTransaction[] = [];
  public _categories: CategoryEntity[] = [];
  public _results: DTOResults = {
      incomes: [],
      expenses: [],
      totalIncomes: '0',
      totalExpenses: '0',
      total: '0',
      totalInt: 0,
    };
  public _partialTableOptions: DTOPartialTableOptions = {
    search: '',
    skip: 0,
    take: 5,
    total: 0,
  };

  public _chart: Chart | null = null;

  public _localStorage: DTOLocalStorage = {
    currency: this._genericService.getLocalStorage<string>('currency') || '$',
    language: this._genericService.getLocalStorage<string>('language') || 'es',
    minutesOfDifferenceTimeZone: -300,
  };

  ngOnInit(): void {
    this.loadTable();
  }

  ngAfterViewInit(): void {
  }

  ngOnDestroy(): void {

  }

  public async loadTable(): Promise<void> {
    const response = await this._homeService.loadTable(this._partialTableOptions, this._transactions, this._categories, this._localStorage, this._chart);
    if (!response.confirmation) {
      return;
    }

    this._partialTableOptions = response.data.partialTableOptions;
    this._transactions = response.data.transactions;
    this._categories = response.data.categories;
    this._chart = response.data.chart;
    this.updateResults();
  }

  public async updateResults(): Promise<void> {
    const response = await this._homeService.updateResults(this._results, this._transactions);
    if (!response.confirmation) {
      return;
    }

    this._results = response.data;
  }

  public loadPartialTable(item: DTOPartialTableOptions): void {
    this._partialTableOptions = item;
    this.loadTable();
  }

  public changePartialTable(item: DTOPartialTableOptions): void {
    this._partialTableOptions = item;
    this.loadTable();
  }

}
