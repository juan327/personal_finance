import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalComponent } from 'src/app/shared/partials/modal/modal.component';
import { FormsModule } from '@angular/forms';
import { InputNumberComponent } from 'src/app/shared/partials/inputnumber/inputnumber.component';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { GenericService } from 'src/app/shared/services/generic.service';
import { CategoryEntity } from 'src/app/shared/entities/category';
import { DTOTransaction } from 'src/app/shared/dto/transaction';

import { HighchartsChartModule } from 'highcharts-angular';
import * as Highcharts from 'highcharts';
import { Chart } from 'highcharts';
import { darkTheme } from 'src/app/shared/themes/highcharts/highcharts.dark.theme'; // Importa el tema
import { TableComponent } from 'src/app/shared/partials/table/table.component';
import { ModalConfirmationComponent } from 'src/app/shared/partials/modalconfirmation/modalconfirmation.component';
import { DTOPartialTableOptions } from 'src/app/shared/partials/table/dto/dtoTable';
import { ExpensesService } from './expenses.service';
Highcharts.setOptions(darkTheme); // Aplica el tema

@Component({
  selector: 'app-expenses',
  imports: [CommonModule, FormsModule, HighchartsChartModule, ReactiveFormsModule, ModalComponent, InputNumberComponent, TableComponent, ModalConfirmationComponent],
  templateUrl: './expenses.component.html',
  styleUrl: './expenses.component.css',
  standalone: true,
  providers: [ExpensesService, GenericService, DatePipe, DecimalPipe],
})

export class ExpensesComponent implements OnInit {
  constructor() { }

  public readonly _genericService = inject(GenericService);
  public readonly _expensesService = inject(ExpensesService);

  public _modals = {
    income: false,
    deleteIncome: false,
  };
  public _form: FormGroup | null = null;
  public _incomes: DTOTransaction[] = [];
  public _selectedIncome: DTOTransaction | null = null;
  public _categories: CategoryEntity[] = [];

  public chart: Chart | null = null;
  public _options: DTOPartialTableOptions = {
    search: '',
    skip: 0,
    take: 5,
    total: 0,
  };

  public _localStorage: {
    currency: string;
  } = {
    currency: this._genericService.getLocalStorage<string>('currency') || '$',
  };

  ngOnInit(): void {
    this.loadCategories();
  }

  ngAfterViewInit(): void {
  }

  ngOnDestroy(): void {
  }

  public async loadCategories(): Promise<void> {
    const response = await this._expensesService.loadCategories();
    if(!response.confirmation) {
      return;
    }
    this._categories = response.data;
    await this.loadTable();
  }

  public async loadTable(): Promise<void> {
    const response = await this._expensesService.loadTable(this._options, this._incomes, this._categories, this._localStorage, this.chart);
    if(!response.confirmation) {
      return;
    }
    
    this._options = response.data.options;
    this._incomes = response.data.transactions;
    this._categories = response.data.categories;
    this.chart = response.data.chart;
  }

  public onOpenModal(item: DTOTransaction | null = null): void {
    var response = this._expensesService.modalOpen(this._form, this._selectedIncome, this._categories, item);
    if(!response.confirmation) {
      alert(response.message);
      return;
    }

    this._form = response.data.form;
    this._selectedIncome = response.data.selectedIncome;
    this._modals.income = true;
  }

  public closeModal(): void {
    this._modals.income = false;
    this._form = null;
  }

  public async submitForm(modelForm: FormGroup): Promise<void> {
    var response = await this._expensesService.createAndUpdate(modelForm, this._categories);
    if(!response.confirmation) {
      alert(response.message);
      return;
    }
    this._modals.income = false;
    this.loadTable();
  }

  public modalOpenDelete(item: DTOTransaction): void {
    this._selectedIncome = item;
    this._modals.deleteIncome = true;
  }

  public async onDelete(item: DTOTransaction): Promise<void> {
    const response = await this._expensesService.delete(item.transactionId);
    if(!response.confirmation) {
      alert(response.message);
      return;
    }
    this._modals.deleteIncome = false;
    this.loadTable();
  }

  public getTotal(): number {
    return this._incomes.reduce((a, b) => a + b.amount, 0);
  }

  public loadPartialTable(item: DTOPartialTableOptions): void {
    this._options = item;
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
