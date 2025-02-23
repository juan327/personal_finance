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
import { DTOLocalStorage } from 'src/app/shared/dto/generic';
import { DTODictionary } from './dto/configuration.dto';

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

  public _localStorage: DTOLocalStorage = this._genericService.getDataLocalStorage();
  public _dictionary: DTODictionary | null = null;
  
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
  }[] = [];
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
  }[] = [];

  async ngOnInit(): Promise<void> {
    await this.loadDictionary();
    this._selectedCurrency = this._localStorage.currency;
    this._selectedLanguage = this._localStorage.language;
    await this.loadTable();
  }

  ngAfterViewInit(): void {
  }

  ngAfterContentInit(): void {
  }

  ngOnDestroy(): void {
  }

  private async loadDictionary(): Promise<void> {
    const response = await this._configurationService.getDictionary(this._localStorage);
    if (!response.confirmation) {
      return;
    }
    this._dictionary = response.data;
    this._languages  = [
        { value: 'en', label: this._dictionary.cardCombo.language.english },
        { value: 'es', label: this._dictionary.cardCombo.language.spanish },
      ];
    this._categoryTypes = [
          { value: 1, label: this._dictionary.modalCreate.type.income },
          { value: 2, label: this._dictionary.modalCreate.type.expense },
        ]
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
    if(this._dictionary === null) return;
    var response = this._configurationService.modalOpen(this._dictionary, this._categories, item);
    if (!response.confirmation) {
      alert(response.message);
      return;
    }

    this._form = response.data;
    this._selectedCategory = item;
    this._modals.category = true;
  }

  public onCloseModal(): void {
    this._modals.category = false;
  }

  public async onSubmitForm(modelForm: FormGroup): Promise<void> {
    var response = await this._configurationService.createOrUpdate(modelForm);
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

  public onChangeLanguage(event: any): void {
    this._genericService.setLocalStorage('language', event.target.value);
    window.location.reload();
  }

}
