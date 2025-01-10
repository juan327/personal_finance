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
import { ModalConfirmationComponent } from 'src/app/shared/partials/modalconfirmation/modalconfirmation.component';
import { DTOPartialTableOptions } from 'src/app/shared/partials/table/dto/dtoTable';
Highcharts.setOptions(darkTheme); // Aplica el tema

@Component({
  selector: 'app-incomes',
  imports: [RouterOutlet, CommonModule, FormsModule, HighchartsChartModule, ReactiveFormsModule, ModalComponent, InputNumberComponent, TableComponent, ModalConfirmationComponent],
  templateUrl: './incomes.component.html',
  styleUrl: './incomes.component.css',
  standalone: true,
  providers: [GenericService, DatePipe, DecimalPipe],
})

export class IncomesComponent implements OnInit {
  constructor() { }

  public readonly _genericService = inject(GenericService);
  public readonly _highchartService = inject(HighchartService);
  public readonly _indexeddbService = inject(IndexeddbService);

  public _modals = {
    income: false,
    deleteIncome: false,
  };
  private readonly _fb = inject(FormBuilder);
  public _form: FormGroup | null = null;
  public _incomes: DTOTransaction[] = [];
  public _selectedIncome: DTOTransaction | null = null;
  public _categories: CategoryEntity[] = [];

  public chart: Chart | null = null;
  private readonly _categoryType: number = 1;
  public _options: DTOPartialTableOptions = {
    search: '',
    skip: 0,
    take: 5,
    total: 0,
  };

  ngOnInit(): void {
    this._indexeddbService.getAllItems<CategoryEntity>('categories', 'name', 'desc').then(response => {
      if (response.total > 0) {
        this._categories = response.items.filter(c => c.type === this._categoryType);
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
    this._indexeddbService.getAllItems<TransactionEntity>('transactions', 'created', 'desc').then(response => {
      if (response.total > 0) {
        const search = this._options.search.trim().toLowerCase();
        this._incomes = response.items.filter(c => c.category.type === this._categoryType
          && (c.name.toLowerCase().includes(search)
            || c.description.toLowerCase().includes(search)
            || c.category.name.toLowerCase().includes(search))).map((item: TransactionEntity) => {
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
        this._options.total = this._incomes.length;
      }

      const options: Highcharts.Options = this.getChartOptions();
      if (this._incomes.length > 1 && this.chart !== null) {
        this._highchartService.updateChart(this.chart, options);
      } else {
        this.chart = this._highchartService.buildChart('container', options);
      }
    }, error => {
      console.error(error);
    });
  }

  public openModal(item: DTOTransaction | null = null): void {
    if (item !== null) {
      this._selectedIncome = item;
      this._form = this._fb.group({
        opc: ['Edit'],
        opcLabel: ['Editar'],
        transactionId: [item.transactionId, [Validators.required]],
        name: [item.name, [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
        amount: [this._genericService.convertToNumberDecimal(item.amount).data.toString(), [Validators.required, DecimalValidator(2)]],
        date: [this._genericService.transformDateToString(item.date), [Validators.required]],
        categoryId: [item.categoryId, [Validators.required]],
        description: [item.description],
      });
    } else {
      this._form = this._fb.group({
        opc: ['Create'],
        opcLabel: ['Crear'],
        name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
        amount: ['', [Validators.required, DecimalValidator(2)]],
        date: [this._genericService.transformDateToString(this._genericService.getDateTimeNowUtc()), [Validators.required]],
        categoryId: [this._categories[0].categoryId, [Validators.required]],
        description: [''],
      });
    }
    console.log(this._form.value);
    this._modals.income = true;
  }

  public closeModal(): void {
    this._modals.income = false;
    this._form = null;
  }

  public async submitForm(modelForm: FormGroup): Promise<void> {
    const model = modelForm.value;

    const responseAmount = this._genericService.parseNumber(model.amount.replace('.', ''));
    if (!responseAmount.confirmation) {
      alert(responseAmount.message);
      return;
    }
    const findCategory = this._categories.find((item) => item.categoryId === model.categoryId && item.type === this._categoryType);
    if (findCategory === undefined) {
      alert('No se encontró la categoría');
      return;
    }

    if (model.opc === 'Edit') {
      this._indexeddbService.getItem<TransactionEntity>('transactions', model.transactionId).then(response => {
        response.name = model.name;
        response.amount = responseAmount.data;
        response.date = new Date(model.date);
        response.description = model.description;
        response.categoryId = model.categoryId;
        response.category = findCategory;
  
        this._indexeddbService.updateItem<TransactionEntity>('transactions', response.transactionId, response).then(response => {
          this._modals.income = false;
          this.loadTable();
        }, error => {
          console.error(error);
        });
      }, error => { 
        console.error(error);
      });
    } else {
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
  }

  public modalOpenDelete(item: DTOTransaction): void {
    this._selectedIncome = item;
    this._modals.deleteIncome = true;
  }

  public onDelete(item: DTOTransaction): void {
    this._indexeddbService.deleteItem('transactions', item.transactionId).then(response => {
      this._modals.deleteIncome = false;
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

    if(data.length > 0) {
      const findHightPorcent = data.reduce((a, b) => a.y > b.y ? a : b);
      findHightPorcent.name = `<b style="color: var(--color-green); font-size: 0.9rem;">${findHightPorcent.name}</b>`;
    }

    return {
      title: {
        text: 'Distribución de ingresos',
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

  public loadPartialTable(item: DTOPartialTableOptions): void {
    this._options = item;
    this.loadTable();
  }

  public changePartialTable(item: DTOPartialTableOptions): void {
    this._options = item;
    this.loadTable();
  }

  public search(event: any): void {
    this._options.search = event.target.value;
    this.loadTable();
  }

}
