import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LayoutComponent } from 'src/app/shared/components/layout.component';
import { IndexeddbService } from './shared/services/indexeddb.service';
import { CategoryEntity } from './shared/entities/category';
import { GenericService } from './shared/services/generic.service';
import { DatePipe, DecimalPipe } from '@angular/common';

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
      {tableName: 'categories', primaryKey: 'categoryId', indexes: [{name: 'categoryId', unique: true}, {name: 'name', unique: false}, {name: 'created', unique: false}]},
      {tableName: 'transactions', primaryKey: 'transactionId', indexes: [{name: 'transactionId', unique: true}, {name: 'name', unique: false}, {name: 'created', unique: false}]},
    ];

    const listTemp = ['Categoria 1', 'Categoria 2', 'Categoria 3', 'Categoria 4', 'Otros'];
    this._indexeddbService.initDB(tables);
    
    this._indexeddbService.getAllItems<CategoryEntity>('categories', 'created', 'asc').then(response => {
      if(response.total <= 0) {

        listTemp.forEach(item => {
          this._indexeddbService.addItem<CategoryEntity>('categories', {
            categoryId: this._genericService.generateGuid(),
            name: item,
            type: 1,
            created: new Date(),
          });
          this._indexeddbService.addItem<CategoryEntity>('categories', {
            categoryId: this._genericService.generateGuid(),
            name: item,
            type: 2,
            created: new Date(),
          });
        });
      }
    }, error => {
      console.error(error);
    });
  }
}
