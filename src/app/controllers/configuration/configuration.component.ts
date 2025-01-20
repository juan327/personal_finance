import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalComponent } from 'src/app/shared/partials/modal/modal.component';
import { FormsModule } from '@angular/forms';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { GenericService } from 'src/app/shared/services/generic.service';
import { CategoryEntity } from 'src/app/shared/entities/category';

import { TableComponent } from 'src/app/shared/partials/table/table.component';
import { ModalConfirmationComponent } from 'src/app/shared/partials/modalconfirmation/modalconfirmation.component';
import { DTOPartialTableOptions } from 'src/app/shared/partials/table/dto/dtoTable';
import { ConfigurationService } from './configuration.service';

@Component({
  selector: 'app-configuration',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ModalComponent, TableComponent, ModalConfirmationComponent],
  templateUrl: './configuration.component.html',
  styleUrl: './configuration.component.css',
  standalone: true,
  providers: [ConfigurationService, GenericService, DatePipe, DecimalPipe],
})

export class ConfigurationComponent implements OnInit {
  constructor() { }

  public readonly _genericService = inject(GenericService);
  private readonly _configurationService = inject(ConfigurationService);

  public _categories: CategoryEntity[] = [];
  public _selectedCategory: CategoryEntity | null = null;

  public _selectedCurrency: string = '$';
  public _currencies: {
    value: string;
    label: string;
  }[] = [
      { value: '$', label: '$ USD' }, { value: '€', label: '€ EUR' }, { value: 'S/.', label: 'S/. PEN' }
    ];
  public _selectedLanguage: string = 'es';
  public _languages: {
    value: string;
    label: string;
  }[] = [
      { value: 'en', label: 'English' }, { value: 'es', label: 'Español' }
    ];
  public _partialTableOptions: DTOPartialTableOptions = {
    search: '',
    skip: 0,
    take: 5,
    total: 0,
  };

  public _form: FormGroup | null = null;
  public _modals = {
    category: false,
    deleteCategory: false,
  };
  public _categoryTypes: {
    value: number;
    label: string;
  }[] = [
      { value: 1, label: 'Ingreso' },
      { value: 2, label: 'Gasto' },
    ];

  ngOnInit(): void {
    this._selectedCurrency = this._genericService.getLocalStorage<string>('currency') || '$';
    this.loadTable();
  }

  ngAfterViewInit(): void {
  }

  ngAfterContentInit(): void {
  }

  ngOnDestroy(): void {
  }

  public async loadTable(): Promise<void> {
    const response = await this._configurationService.loadTable(this._partialTableOptions, this._categories);
    if (!response.confirmation) {
      return;
    }

    this._partialTableOptions = response.data.partialTableOptions;
    this._categories = response.data.categories;
  }

  public onOpenModal(item: CategoryEntity | null = null): void {
    var response = this._configurationService.modalOpen(this._form, this._selectedCategory, this._categories, item);
    if (!response.confirmation) {
      alert(response.message);
      return;
    }

    this._form = response.data.form;
    this._selectedCategory = response.data.selectedCategory;
    this._modals.category = true;
  }

  public onCloseModal(): void {
    this._modals.category = false;
  }

  public async onSubmitForm(modelForm: FormGroup): Promise<void> {
    var response = await this._configurationService.createAndUpdate(modelForm, this._categories);
    if (!response.confirmation) {
      alert(response.message);
      return;
    }
    this._modals.category = false;
    this.loadTable();
  }

  public onModalOpenDelete(item: CategoryEntity): void {
    this._selectedCategory = item;
    this._modals.deleteCategory = true;
  }

  public async onDelete(item: CategoryEntity): Promise<void> {
    const response = await this._configurationService.delete(item.categoryId);
    if (!response.confirmation) {
      alert(response.message);
      return;
    }
    this._modals.deleteCategory = false;
    this.loadTable();
  }

  public loadPartialTable(item: DTOPartialTableOptions): void {
    this._partialTableOptions = item;
    this.loadTable();
  }

  public changePartialTable(item: DTOPartialTableOptions): void {
    this._partialTableOptions = item;
    this.loadTable();
  }

  public onSearch(event: any): void {
    this._partialTableOptions.search = event.target.value;
    this.loadTable();
  }

  public onChangeCurrency(event: any): void {
    this._genericService.setLocalStorage('currency', event.target.value);
  }

}
