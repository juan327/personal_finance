import { inject, Injectable, OnInit } from '@angular/core';
import { DTOPartialTableOptions } from 'src/app/shared/partials/table/dto/dtoTable';
import { IndexeddbService } from 'src/app/shared/services/indexeddb.service';

//#region imports highcharts
import { GenericService } from 'src/app/shared/services/generic.service';
import { CategoryEntity } from 'src/app/shared/entities/category';
import { DTOLoadTable, DTOModalOpen } from './dto/configuration.dto';
import { DTOResponseApi, DTOResponseApiWithData } from 'src/app/shared/dto/generic';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TransactionEntity } from 'src/app/shared/entities/transaction';
//#endregion

@Injectable({
    providedIn: 'root',
})

export class ConfigurationService {
    constructor() { }

    //#region injectables
    private readonly _indexeddbService = inject(IndexeddbService);
    private readonly _genericService = inject(GenericService);
    private readonly _fb = inject(FormBuilder);
    //#endregion

    /**
     * Devuelve un objeto con los valores por defecto de un DTOResponseApi
     * @returns DTOResponseApi
     */
    private getDefaultObjReturn(): DTOResponseApi {
        return {
            message: '',
            confirmation: false,
        };
    }

    /**
     * Devuelve un objeto con los valores por defecto de un DTOResponseApiWithData
     * @returns DTOResponseApiWithData
     */
    private getDefaultObjReturnWithData<T>(): DTOResponseApiWithData<T> {
        return {
            message: '',
            confirmation: false,
            data: null as T,
        };
    }

    public async loadTable(_partialTableOptions: DTOPartialTableOptions, _categories: CategoryEntity[]): Promise<DTOResponseApiWithData<DTOLoadTable>> {

        var objReturn: DTOResponseApiWithData<DTOLoadTable> = this.getDefaultObjReturnWithData();
        try {
            await this._indexeddbService.getAllItems<CategoryEntity>('categories', 'created', 'desc').then(response => {
              if (response.total > 0) {
                const search = _partialTableOptions.search.trim().toLowerCase();
                _categories = response.items.filter(c => c.name.toLowerCase().includes(search));
                _partialTableOptions.total = _categories.length;
              }

              objReturn.data = {
                  partialTableOptions: _partialTableOptions,
                  categories: _categories,
              };
              objReturn.confirmation = true;
              objReturn.message = 'Tabla cargada correctamente';
            }, error => {
              console.error(error);
            });
        }
        catch (error: any) {
            console.error(error);
            objReturn.message = error.message;
            objReturn.exception = error.toString();
        }
        return objReturn;
    }

    public modalOpen(_form: FormGroup | null, _selectedCategory: CategoryEntity | null, _categories: CategoryEntity[], item: CategoryEntity | null = null): DTOResponseApiWithData<DTOModalOpen> {
        var objReturn: DTOResponseApiWithData<DTOModalOpen> = this.getDefaultObjReturnWithData();
        try {
            if (item !== null) {
              _selectedCategory = item;
              _form = this._fb.group({
                opc: ['Edit'],
                opcLabel: ['Editar'],
                categoryId: [item.categoryId, [Validators.required]],
                name: [item.name, [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
                type: [item.type, [Validators.required]],
              });
            } else {
              _form = this._fb.group({
                opc: ['Create'],
                opcLabel: ['Crear'],
                name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
                type: [1, [Validators.required]],
              });
            }

            objReturn.data = {
                selectedCategory: _selectedCategory,
                form: _form,
            };
            objReturn.confirmation = true;
            objReturn.message = 'Modal abierto correctamente';
        }
        catch (error: any) {
            console.error(error);
            objReturn.message = error.message;
            objReturn.exception = error.toString();
        }
        return objReturn;
    }

    public async createAndUpdate(modelForm: FormGroup, _categories: CategoryEntity[]): Promise<DTOResponseApi> {
        var objReturn: DTOResponseApi = this.getDefaultObjReturn();
        try
        {
            const model = modelForm.value;
            const responseInt = this._genericService.parseNumber(model.type);
            if(!responseInt.confirmation) {
              objReturn.message = responseInt.message;
              objReturn.exception = responseInt.exception;
              return objReturn;
            }
        
            if (model.opc === 'Edit') {
              await this._indexeddbService.getItem<CategoryEntity>('categories', model.categoryId).then(async response => {
                response.name = model.name;
                response.type = responseInt.data;
        
                await this._indexeddbService.updateItem<CategoryEntity>('categories', response.categoryId, response).then(response => {
                    objReturn.confirmation = true;
                    objReturn.message = 'Categoria actualizada correctamente';
                }, error => {
                  console.error(error);
                  objReturn.message = error.message;
                  objReturn.exception = error.toString();
                });
              }, error => {
                console.error(error);
                objReturn.message = error.message;
                objReturn.exception = error.toString();
              });
            } else {
              const newObj: CategoryEntity = {
                categoryId: this._genericService.generateGuid(),
                name: model.name,
                type: responseInt.data,
                created: new Date(),
                isDefault: false,
              };
        
              await this._indexeddbService.addItem<CategoryEntity>('categories', newObj).then(response => {
                objReturn.confirmation = true;
                objReturn.message = 'Categoria creada correctamente';
              }, error => {
                console.error(error);
                objReturn.message = error.message;
                objReturn.exception = error.toString();
              });
            }
        }
        catch (error: any) {
            console.error(error);
            objReturn.message = error.message;
            objReturn.exception = error.toString();
        }
        return objReturn;
    }

    public async delete(categoryId: string): Promise<DTOResponseApi> {
        var objReturn: DTOResponseApi = this.getDefaultObjReturn();
        try {
            await this._indexeddbService.deleteItem('categories', categoryId).then(response => {
              this._indexeddbService.getAllItems<TransactionEntity>('transactions', 'created', 'desc').then(response => {
                if (response.total > 0) {
                  response.items.filter(c => c.categoryId === categoryId).forEach(async item => {
                    await this._indexeddbService.deleteItem('transactions', item.transactionId);
                  });
                }
              }, error => {
                console.error(error);
                objReturn.message = error.message;
                objReturn.exception = error.toString();
              });
              objReturn.confirmation = true;
              objReturn.message = 'Categoria eliminada correctamente';
            }, error => {
              console.error(error);
              objReturn.message = error.message;
              objReturn.exception = error.toString();
            });
        }
        catch (error: any) {
            console.error(error);
            objReturn.message = error.message;
            objReturn.exception = error.toString();
        }
        return objReturn;
    }

}
