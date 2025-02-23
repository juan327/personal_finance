import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
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
import { DTOLocalStorage } from 'src/app/shared/dto/generic';
import { InputDatetimeComponent } from 'src/app/shared/partials/inputdatetime/inputdatetime.component';
import { SelectComponent } from 'src/app/shared/partials/select/select.component';
import { DTODictionary } from './dto/expenses.dto';
Highcharts.setOptions(darkTheme); // Aplica el tema

@Component({
  selector: 'app-expenses',
  imports: [CommonModule, FormsModule, HighchartsChartModule, ReactiveFormsModule, ModalComponent, InputNumberComponent,
    TableComponent, ModalConfirmationComponent, InputDatetimeComponent, SelectComponent],
  templateUrl: './expenses.component.html',
  styleUrl: './expenses.component.css',
  standalone: true,
  providers: [ExpensesService, GenericService, DatePipe, DecimalPipe],
})

export class ExpensesComponent implements OnInit {
  constructor() {}

  //#region injectables
  public readonly _genericService = inject(GenericService);
  public readonly _expensesService = inject(ExpensesService);
  //#endregion
  
  public _localStorage: DTOLocalStorage = this._genericService.getDataLocalStorage();
  public _dictionary: DTODictionary | null = null;

  //#region variables
  public _form: FormGroup | null = null;
  public _transactions: DTOTransaction[] = [];
  public _selectedTransaction: DTOTransaction | null = null;
  public _categories: CategoryEntity[] = [];
  public _chart: Chart | null = null;

  public _modals = {
    transaction: false,
    deleteTransaction: false,
  };

  public _partialTableOptions: DTOPartialTableOptions = new DTOPartialTableOptions();
  //#endregion


  async ngOnInit(): Promise<void> {
    await this._expensesService.initialize();
    this._dictionary = this._expensesService.getDictionary();
    await this.loadCategories();
  }

  ngAfterViewInit(): void {
  }

  ngOnDestroy(): void {
  }

  public async loadCategories(): Promise<void> {
    const response = await this._expensesService.loadCategories();
    if (!response.confirmation) {
      return;
    }
    this._categories = response.data;
    await this.loadTable();
  }

  public async loadTable(): Promise<void> {
    const response = await this._expensesService.loadTable({
      _partialTableOptions: this._partialTableOptions,
      _transactions: this._transactions,
      _categories: this._categories,
      _chart: this._chart,
    });
    if (!response.confirmation) {
      return;
    }

    this._partialTableOptions = response.data.partialTableOptions;
    this._transactions = response.data.transactions;
    this._categories = response.data.categories;
    this._chart = response.data.chart;
  }

  public onOpenModal(item: DTOTransaction | null = null): void {
    if(this._dictionary === null) return;
    var response = this._expensesService.modalOpen(this._categories, item);
    if (!response.confirmation) {
      alert(response.message);
      return;
    }

    this._form = response.data;
    this._selectedTransaction = item;
    this._modals.transaction = true;
  }

  public onCloseModal(): void {
    this._modals.transaction = false;
    this._form = null;
  }

  public async onSubmitForm(modelForm: FormGroup): Promise<void> {
    var response = await this._expensesService.createOrUpdate(modelForm, this._categories);
    if (!response.confirmation) {
      alert(response.message);
      return;
    }
    this._modals.transaction = false;
    this.loadTable();
  }

  public onModalOpenDelete(item: DTOTransaction): void {
    this._selectedTransaction = item;
    this._modals.deleteTransaction = true;
  }

  public async onDelete(item: DTOTransaction): Promise<void> {
    const response = await this._expensesService.delete(item.transactionId);
    if (!response.confirmation) {
      alert(response.message);
      return;
    }
    this._modals.deleteTransaction = false;
    this.loadTable();
  }

  public onLoadPartialTable(item: DTOPartialTableOptions): void {
    this._partialTableOptions = item;
  }

  public onChangePartialTable(item: DTOPartialTableOptions): void {
    this._partialTableOptions = item;
    this.loadTable();
  }

  public search(event: any): void {
    this._partialTableOptions.search = event.target.value;
    this.loadTable();
  }

}
