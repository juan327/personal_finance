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

import { IndexeddbService } from 'src/app/shared/services/indexeddb.service';
import { TableComponent } from 'src/app/shared/partials/table/table.component';
import { ModalConfirmationComponent } from 'src/app/shared/partials/modalconfirmation/modalconfirmation.component';
import { DTOPartialTableOptions } from 'src/app/shared/partials/table/dto/dtoTable';

@Component({
  selector: 'app-configuration',
  imports: [RouterOutlet, CommonModule, FormsModule, ReactiveFormsModule, ModalComponent, InputNumberComponent, TableComponent, ModalConfirmationComponent],
  templateUrl: './configuration.component.html',
  styleUrl: './configuration.component.css',
  standalone: true,
  providers: [GenericService, DatePipe, DecimalPipe],
})

export class ConfigurationComponent implements OnInit {
  constructor() { }

  public readonly _genericService = inject(GenericService);
  public readonly _indexeddbService = inject(IndexeddbService);
  private readonly _fb = inject(FormBuilder);

  public _categories: CategoryEntity[] = [];
  public _selectedCategory: CategoryEntity | null = null;
  public _selectedCurrency: string = '$';
  public _currencies: {
    value: string;
    label: string;
  }[] = [
      { value: '$', label: '$ USD' }, { value: '€', label: '€ EUR' }, { value: 'S/.', label: 'S/. PEN' }
    ];
  public _options: DTOPartialTableOptions = {
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
  public _types: {
    value: number;
    label: string;
  }[] = [
      { value: 1, label: 'Ingreso' },
      { value: 2, label: 'Gasto' },
    ]

  ngOnInit(): void {
    this.loadTable();
  }

  ngAfterViewInit(): void {
  }

  ngAfterContentInit(): void {
  }

  ngOnDestroy(): void {
  }

  public loadTable(): void {
    this._indexeddbService.getAllItems<CategoryEntity>('categories', 'created', 'desc').then(response => {
      if (response.total > 0) {
        const search = this._options.search.trim().toLowerCase();
        this._categories = response.items.filter(c => c.name.toLowerCase().includes(search));
        this._options.total = this._categories.length;
      }
    }, error => {
      console.error(error);
    });
  }

  public openModal(item: CategoryEntity | null = null): void {
    if (item !== null) {
      this._selectedCategory = item;
      this._form = this._fb.group({
        opc: ['Edit'],
        opcLabel: ['Editar'],
        categoryId: [item.categoryId, [Validators.required]],
        name: [item.name, [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
        type: [item.type, [Validators.required]],
      });
    } else {
      this._form = this._fb.group({
        opc: ['Create'],
        opcLabel: ['Crear'],
        name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
        type: [1, [Validators.required]],
      });
    }
    this._modals.category = true;
  }

  public closeModal(): void {
    this._modals.category = false;
  }

  public async submitForm(modelForm: FormGroup): Promise<void> {
    const model = modelForm.value;
    const responseInt = this._genericService.parseNumber(model.type);
    if(!responseInt.confirmation) {
      alert(responseInt.message);
      return;
    }

    if (model.opc === 'Edit') {
      this._indexeddbService.getItem<CategoryEntity>('categories', model.categoryId).then(response => {
        response.name = model.name;
        response.type = responseInt.data;

        this._indexeddbService.updateItem<CategoryEntity>('categories', response.categoryId, response).then(response => {
          this._modals.category = false;
          this.loadTable();
        }, error => {
          console.error(error);
        });
      }, error => {
        console.error(error);
      });
    } else {
      const newObj: CategoryEntity = {
        categoryId: this._genericService.generateGuid(),
        name: model.name,
        type: responseInt.data,
        created: new Date(),
        isDefault: false,
      };

      this._indexeddbService.addItem<CategoryEntity>('categories', newObj).then(response => {
        this._modals.category = false;
        this.loadTable();
      }, error => {
        console.error(error);
      });
    }
  }

  public modalOpenDelete(item: CategoryEntity): void {
    this._selectedCategory = item;
    this._modals.deleteCategory = true;
  }

  public onDelete(item: CategoryEntity): void {
    this._indexeddbService.deleteItem('categories', item.categoryId).then(response => {
      this._indexeddbService.getAllItems<TransactionEntity>('transactions', 'created', 'desc').then(response => {
        if (response.total > 0) {
          response.items.filter(c => c.categoryId === item.categoryId).forEach(async item => {
            await this._indexeddbService.deleteItem('transactions', item.transactionId);
          });
        }
      }, error => {
        console.error(error);
      });

      this._modals.deleteCategory = false;
      this.loadTable();
    }, error => {
      console.error(error);
    });
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
