import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { ModalComponent } from 'src/app/shared/partials/modal/modal.component';
import { FormsModule } from '@angular/forms';
import { InputNumberComponent } from 'src/app/shared/partials/inputnumber/inputnumber.component';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { DecimalValidator } from 'src/app/shared/validators/decimal.validator';
import { GenericService } from 'src/app/shared/services/generic.service';
import { TransactionEntity } from 'src/app/shared/entities/transaction';
import { CategoryEntity } from 'src/app/shared/entities/category';
import { DTOTransaction } from 'src/app/shared/dto/transaction';

import { HighchartsChartModule } from 'highcharts-angular';
import { HighchartService } from 'src/app/shared/services/highchart.service';
import * as Highcharts from 'highcharts';
import { Chart } from 'highcharts';
import { darkTheme } from 'src/app/shared/themes/highcharts/highcharts.dark.theme'; // Importa el tema
import { IndexeddbService } from 'src/app/shared/services/indexeddb.service';
import { TableComponent } from 'src/app/shared/partials/table/table.component';
Highcharts.setOptions(darkTheme); // Aplica el tema

@Component({
  selector: 'app-expenses',
  imports: [RouterOutlet, CommonModule, FormsModule, HighchartsChartModule, ReactiveFormsModule, ModalComponent, InputNumberComponent, TableComponent],
  templateUrl: './expenses.component.html',
  styleUrl: './expenses.component.css',
  standalone: true,
  providers: [GenericService, DatePipe, DecimalPipe],
})

export class ExpensesComponent implements OnInit {
  constructor() { }

  public readonly _genericService = inject(GenericService);
  public readonly _highchartService = inject(HighchartService);
  public readonly _indexeddbService = inject(IndexeddbService);

  public _modals = {
    income: false,
  }
  private readonly _fb = inject(FormBuilder);
  public _form: FormGroup | null = null;
  public _incomes: DTOTransaction[] = [];
  public _categories: CategoryEntity[] = [];

  public chart: Chart | null = null;
  private readonly _categoryType: number = 2;

  ngOnInit(): void {
    const responseTest = this._genericService.getDataTest();
    
    this._indexeddbService.getAllItems<CategoryEntity>('categories', 'name', 'asc').then(response => {
      if(response.length > 0) {
        this._categories = response.filter(c=>c.type === this._categoryType);

        this.loadTable();
      }
    }, error => {
      console.error(error);
    });
  }

  ngAfterViewInit(): void {
  }

  ngAfterContentInit(): void {
  }

  ngOnDestroy(): void {
  }

  public loadTable(): void {
    this._indexeddbService.getAllItems<TransactionEntity>('transactions', 'created', 'asc').then(response => {
      if(response.length > 0) {
        this._incomes = response.filter(c=>c.category.type === this._categoryType).map((item: TransactionEntity) => {
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
      if(this._incomes.length > 1 && this.chart !== null) {
        this._highchartService.updateChart(this.chart, options);
      } else {
        this.chart = this._highchartService.buildChart('container', options);
      }
    }, error => {
      console.error(error);
    });
  }

  public openModal(): void {
    this._form = this._fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      amount: ['', [Validators.required, DecimalValidator(2)]],
      date: [this._genericService.transformDateToString(this._genericService.getDateTimeNowUtc()), Validators.required],
      categoryId: [this._categories[0].categoryId, Validators.required],
      description: [''],
    });
    this._modals.income = true;
  }

  public closeModal(): void {
    this._modals.income = false;
    this._form = null;
  }

  public submitForm(modelForm: FormGroup): void {
    const model = modelForm.value;

    const responseAmount = this._genericService.parseNumber(model.amount.replace('.', ''));
    if (!responseAmount.confirmation) {
      alert(responseAmount.message);
      return;
    }
    const findCategory = this._categories.find((item) => item.categoryId === model.categoryId && item.type === this._categoryType);
    if(findCategory === undefined) {
      alert('No se encontró la categoría');
      return;
    }

    const newObj: TransactionEntity = {
      transactionId: this._genericService.generateGuid(),
      name: model.name,
      amount: responseAmount.data,
      date: new Date(model.date),
      description: model.description,
      categoryId: model.categoryId,
      category: findCategory,
      created: new Date(),
    };

    this._indexeddbService.addItem<TransactionEntity>('transactions', newObj).then(response => {
      this._modals.income = false;
      this.loadTable();
    }, error => {
      console.error(error);
    });
  }

  public getTotal(): number {
    return this._incomes.reduce((a, b) => a + b.amount, 0);
  }

  private getChartOptions(): Highcharts.Options {
    const data: {
      id: string;
      name: string;
      y: number;
      selected: boolean;
      sliced: boolean;
    }[] = [];
    const total = this._incomes.reduce((a, b) => a + b.amount, 0);
    
    for (let i = 0; i < this._categories.length; i++) {
      const item = this._categories[i];
      const amount = this._incomes.reduce((a, b) => a + (b.categoryId === item.categoryId ? b.amount : 0), 0);
      const amountString = this._genericService.convertToCurrencyFormat(amount).data;
      const porcent: number = total > 0 ? ((amount * 100) / total) : 0;
      const porcentString = this._genericService.parseNumber(porcent.toFixed(2)).data;

      data.push({
        id: item.categoryId,
        name: `${item.name} ($${amountString})`,
        y: porcentString,
        selected: false,
        sliced: false,
      });
    }

    const findHightPorcent = data.reduce((a, b) => a.y > b.y ? a : b);
    findHightPorcent.name = `<b style="color: var(--color-green); font-size: 0.9rem;">${findHightPorcent.name}</b>`;

    return {
      title: {
        text: 'Distribución de gastos',
      },
      subtitle: {
        text: this._incomes.length > 0 ? '' : 'Sin datos',
      },
      tooltip: {
        valueSuffix: '%',
      },
      series: this._incomes.length > 0 ? [
        {
          type: 'pie',
          name: 'Porcentaje',
          showInLegend: true,
          data: data,
        }
      ] : [],
    };
  }

}
