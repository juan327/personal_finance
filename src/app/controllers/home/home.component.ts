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
import { DTODictionary, DTOResults } from './dto/home.dto';
import { HomeService } from './home.service';
import { FormsModule } from '@angular/forms';
Highcharts.setOptions(darkTheme); // Aplica el tema

@Component({
  selector: 'app-home',
  imports: [CommonModule, HighchartsChartModule, TableComponent, FormsModule],
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
  public _results: DTOResults = new DTOResults();
  public _partialTableOptions: DTOPartialTableOptions = new DTOPartialTableOptions();

  public _chart: Chart | null = null;

  public _localStorage: DTOLocalStorage = this._genericService.getDataLocalStorage();
  public _dictionary: DTODictionary | null = null;

  public _listYears: number[] = [];
  public _selectedYear: number = 0;

  async ngOnInit(): Promise<void> {
    await this.loadDictionary();
    await this.loadYears();
    await this.loadTable();
  }

  ngAfterViewInit(): void {
  }

  ngOnDestroy(): void {

  }

  private async loadDictionary(): Promise<void> {
    const response = await this._homeService.getDictionary(this._localStorage);
    if (!response.confirmation) {
      return;
    }
    this._dictionary = response.data;
  }

  private async loadYears(): Promise<void> {
    const response = await this._homeService.loadYears();
    if (!response.confirmation) {
      return;
    }
    if(response.data.length <= 0) return;
    this._listYears = response.data;
    this._selectedYear = this._listYears[0];
  }

  public async loadTable(): Promise<void> {
    if(this._dictionary === null) return;
    const response = await this._homeService.loadTable(
      {
        _partialTableOptions: this._partialTableOptions,
        _transactions: this._transactions,
        _categories: this._categories, 
        _localStorage: this._localStorage, 
        _chart: this._chart, 
        _selectedYear: this._selectedYear,
        _dictionary: this._dictionary
      });
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

  public changeYear(event: any): void {
    this._selectedYear = parseInt(event.target.value);
    this.loadTable();
  }

}
