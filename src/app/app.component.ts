import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LayoutComponent } from 'src/app/shared/components/layout.component';
import { IndexeddbService } from './shared/services/indexeddb.service';
import { CategoryEntity } from './shared/entities/category';
import { GenericService } from './shared/services/generic.service';
import { DatePipe, DecimalPipe } from '@angular/common';
import { EnumTableName } from './shared/enums/generic.enum';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LayoutComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  standalone: true,
  providers: [GenericService, DatePipe, DecimalPipe],
})

export class AppComponent implements OnInit {
  title = 'personal_finance';
  private readonly _indexeddbService = inject(IndexeddbService);
  private readonly _genericService = inject(GenericService);

  constructor() { }

  ngOnInit(): void {
    const tables = [
      {tableName: EnumTableName.categories, primaryKey: 'categoryId', indexes: [{name: 'categoryId', unique: true}, {name: 'name', unique: false}, {name: 'created', unique: false}]},
      {tableName: EnumTableName.transactions, primaryKey: 'transactionId', indexes: [{name: 'transactionId', unique: true}, {name: 'name', unique: false}, {name: 'created', unique: false}]},
    ];

    this._indexeddbService.initDB(tables);
    
    this._indexeddbService.getAllItems<CategoryEntity>(EnumTableName.categories, 'created', 'asc').then(response => {
      if(response.total <= 0) {
        this._indexeddbService.addItem<CategoryEntity>(EnumTableName.categories, {
          categoryId: this._genericService.generateGuid(),
          name: 'Otros',
          type: 1,
          created: new Date(),
          isDefault: true,
        });
        this._indexeddbService.addItem<CategoryEntity>(EnumTableName.categories, {
          categoryId: this._genericService.generateGuid(),
          name: 'Otros',
          type: 2,
          created: new Date(),
          isDefault: true,
        });
      }
    }, error => {
      console.error(error);
    });
  }
}
