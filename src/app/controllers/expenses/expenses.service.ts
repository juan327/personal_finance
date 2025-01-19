import { DatePipe, DecimalPipe } from '@angular/common';
import { inject, Injectable, OnInit } from '@angular/core';
import { DTOTransaction } from 'src/app/shared/dto/transaction';
import { TransactionEntity } from 'src/app/shared/entities/transaction';
import { DTOPartialTableOptions } from 'src/app/shared/partials/table/dto/dtoTable';
import { IndexeddbService } from 'src/app/shared/services/indexeddb.service';

//#region imports highcharts
import { Chart } from 'highcharts';
import { HighchartService } from 'src/app/shared/services/highchart.service';
import { GenericService } from 'src/app/shared/services/generic.service';
import { CategoryEntity } from 'src/app/shared/entities/category';
import { DTOLoadTable, DTOModalOpen } from './dto/expenses.dto';
import { DTOResponseApi, DTOResponseApiWithData } from 'src/app/shared/dto/generic';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DecimalValidator } from 'src/app/shared/validators/decimal.validator';
//#endregion

@Injectable({
    providedIn: 'root',
})

export class ExpensesService {
    constructor() { }

    //#region injectables
    private readonly _indexeddbService = inject(IndexeddbService);
    private readonly _highchartService = inject(HighchartService);
    private readonly _genericService = inject(GenericService);
    private readonly _fb = inject(FormBuilder);
    //#endregion

    //#region private properties
    private readonly _categoryType: number = 2;
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

    /**
     * Carga todas las categorías
     * @returns Promise<DTOResponseApiWithData<CategoryEntity[]>>
     */
    public async loadCategories(): Promise<DTOResponseApiWithData<CategoryEntity[]>> {
        var objReturn: DTOResponseApiWithData<CategoryEntity[]> = this.getDefaultObjReturnWithData();
        try
        {
            await this._indexeddbService.getAllItems<CategoryEntity>('categories', 'name', 'desc').then(response => {
                objReturn.data = response.items.filter(c => c.type === this._categoryType);
                objReturn.confirmation = true;
                objReturn.message = 'Categorías cargadas correctamente';
            }, error => {
                console.error(error);
                objReturn.message = error.message;
                objReturn.exception = error.toString();
            });
        }
        catch (error: any)
        {
            console.error(error);
            objReturn.message = error.message;
            objReturn.exception = error.toString();
        }
        return objReturn;
    }

    public async loadTable(_options: DTOPartialTableOptions, _transactions: DTOTransaction[], _categories: CategoryEntity[],
        _localStorage: any, _chart: Chart | null): Promise<DTOResponseApiWithData<DTOLoadTable>> {

        var objReturn: DTOResponseApiWithData<DTOLoadTable> = this.getDefaultObjReturnWithData();
        try
        {
            await this._indexeddbService.getAllItems<TransactionEntity>('transactions', 'created', 'desc').then(response => {
                if (response.total > 0) {
                    const search = _options.search.trim().toLowerCase();
                    _transactions = response.items.filter(c => c.category.type === this._categoryType
                        && (c.name.toLowerCase().includes(search)
                            || c.description.toLowerCase().includes(search)
                            || c.category.name.toLowerCase().includes(search))).map((item: TransactionEntity) => {
                                const objReturn: DTOTransaction = {
                                    transactionId: item.transactionId,
                                    name: item.name,
                                    amount: item.amount,
                                    amountString: `${this._genericService.convertToCurrencyFormat(item.amount).data}`,
                                    date: item.date,
                                    description: item.description,
                                    categoryId: item.categoryId,
                                    categoryName: item.category.name,
                                    categoryType: item.category.type,
                                    created: item.created,
                                };
                                return objReturn;
                            });
                    _options.total = _transactions.length;
                }
    
                const responseChartOptions = this.getChartOptions(_transactions, _categories, _localStorage);
                if(!responseChartOptions.confirmation) {
                    objReturn.message = responseChartOptions.message;
                    objReturn.exception = responseChartOptions.exception;
                } else {
                    if (_transactions.length > 1 && _chart !== null) {
                        this._highchartService.updateChart(_chart, responseChartOptions.data);
                    } else {
                        _chart = this._highchartService.buildChart('container', responseChartOptions.data);
                    }
                }
                objReturn.data = {
                    options: _options,
                    transactions: _transactions,
                    categories: _categories,
                    chart: _chart,
                };
                objReturn.confirmation = true;
                objReturn.message = 'Tabla cargada correctamente';
            }, error => {
                console.error(error);
                objReturn.message = error.message;
                objReturn.exception = error.toString();
            });
        }
        catch (error: any)
        {
            console.error(error);
            objReturn.message = error.message;
            objReturn.exception = error.toString();
        }
        return objReturn;
    }

    public modalOpen(_form: FormGroup | null, _selectedIncome: DTOTransaction | null, _categories: CategoryEntity[], item: DTOTransaction | null = null): DTOResponseApiWithData<DTOModalOpen> {
        var objReturn: DTOResponseApiWithData<DTOModalOpen> = this.getDefaultObjReturnWithData();
        try
        {
            if (item !== null) {
                _selectedIncome = item;
                _form = this._fb.group({
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
                _selectedIncome = null;
                _form = this._fb.group({
                    opc: ['Create'],
                    opcLabel: ['Crear'],
                    name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
                    amount: ['', [Validators.required, DecimalValidator(2)]],
                    date: [this._genericService.transformDateToString(this._genericService.getDateTimeNowUtc()), [Validators.required]],
                    categoryId: [_categories[0].categoryId, [Validators.required]],
                    description: [''],
                });
            }

            objReturn.data = {
                selectedIncome: _selectedIncome,
                form: _form,
            };
            objReturn.confirmation = true;
            objReturn.message = 'Modal abierto correctamente';
        }
        catch (error: any)
        {
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

            const responseAmount = this._genericService.parseNumber(model.amount.replace('.', ''));
            if (!responseAmount.confirmation) {
                objReturn.message = responseAmount.message;
                objReturn.exception = responseAmount.exception;
                return objReturn;
            }
            const findCategory = _categories.find((item) => item.categoryId === model.categoryId && item.type === this._categoryType);
            if (findCategory === undefined) {
                objReturn.message = 'No se encontró la categoría';
                return objReturn;
            }

            if (model.opc === 'Edit') {
                await this._indexeddbService.getItem<TransactionEntity>('transactions', model.transactionId).then(async response => {
                    response.name = model.name;
                    response.amount = responseAmount.data;
                    response.date = new Date(model.date);
                    response.description = model.description;
                    response.categoryId = model.categoryId;
                    response.category = findCategory;
        
                    await this._indexeddbService.updateItem<TransactionEntity>('transactions', response.transactionId, response).then(response => {
                        objReturn.confirmation = true;
                        objReturn.message = 'Transacción actualizada correctamente';
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

                await this._indexeddbService.addItem<TransactionEntity>('transactions', newObj).then(response => {
                    objReturn.confirmation = true;
                    objReturn.message = 'Transacción creada correctamente';
                }, error => {
                    console.error(error);
                    objReturn.message = error.message;
                    objReturn.exception = error.toString();
                });
            }
        }
        catch (error: any)
        {
            console.error(error);
            objReturn.message = error.message;
            objReturn.exception = error.toString();
        }
        return objReturn;
    }

    public async delete(transactionId: string): Promise<DTOResponseApi> {
        var objReturn: DTOResponseApi = this.getDefaultObjReturn();
        try
        {
            await this._indexeddbService.deleteItem('transactions', transactionId).then(response => {
                objReturn.confirmation = true;
                objReturn.message = 'Transacción eliminada correctamente';
            }, error => {
                console.error(error);
                objReturn.message = error.message;
                objReturn.exception = error.toString();
            });
        }
        catch (error: any)
        {
            console.error(error);
            objReturn.message = error.message;
            objReturn.exception = error.toString();
        }
        return objReturn;
    }

    private getChartOptions(_transactions: DTOTransaction[], _categories: CategoryEntity[], _localStorage: any): DTOResponseApiWithData<Highcharts.Options> {
        var objReturn: DTOResponseApiWithData<Highcharts.Options> = this.getDefaultObjReturnWithData();
        try
        {
            const data: {
                id: string;
                name: string;
                y: number;
                selected: boolean;
                sliced: boolean;
            }[] = [];
            const total = _transactions.reduce((a, b) => a + b.amount, 0);
    
            for (let i = 0; i < _categories.length; i++) {
                const item = _categories[i];
                const amount = _transactions.reduce((a, b) => a + (b.categoryId === item.categoryId ? b.amount : 0), 0);
                const amountString = this._genericService.convertToCurrencyFormat(amount).data;
                const porcent: number = total > 0 ? ((amount * 100) / total) : 0;
                const porcentString = this._genericService.parseNumber(porcent.toFixed(2)).data;
    
                data.push({
                    id: item.categoryId,
                    name: `${item.name} (${_localStorage.currency} ${amountString})`,
                    y: porcentString,
                    selected: false,
                    sliced: false,
                });
            }
    
            if (data.length > 0) {
                const findHightPorcent = data.reduce((a, b) => a.y > b.y ? a : b);
                findHightPorcent.name = `<b style="color: var(--color-green); font-size: 0.9rem;">${findHightPorcent.name}</b>`;
            }
    
            objReturn.data = {
                title: {
                    text: 'Distribución de ingresos',
                },
                subtitle: {
                    text: _transactions.length > 0 ? '' : 'Sin datos',
                },
                tooltip: {
                    valueSuffix: '%',
                },
                series: _transactions.length > 0 ? [
                    {
                        type: 'pie',
                        name: 'Porcentaje',
                        showInLegend: true,
                        data: data,
                    }
                ] : [],
            };
            objReturn.confirmation = true;
            objReturn.message = 'Opciones del gráfico cargadas correctamente';
        }
        catch (error: any)
        {
            console.error(error);
            objReturn.message = error.message;
            objReturn.exception = error.toString();
        }
        return objReturn;
    }

}
