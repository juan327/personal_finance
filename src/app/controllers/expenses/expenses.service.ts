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
import { DTOLocalStorage, DTOResponse, DTOResponseWithData } from 'src/app/shared/dto/generic';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DecimalValidator } from 'src/app/shared/validators/decimal.validator';
import { EnumTableName } from 'src/app/shared/enums/generic.enum';
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
     * Carga todas las categorías
     * @returns Promise<DTOResponseWithData<CategoryEntity[]>>
     */
    public async loadCategories(): Promise<DTOResponseWithData<CategoryEntity[]>> {
        var objReturn: DTOResponseWithData<CategoryEntity[]> = new DTOResponseWithData<CategoryEntity[]>();
        try {
            await this._indexeddbService.getAllItems<CategoryEntity>(EnumTableName.categories, 'name', 'desc').then(response => {
                objReturn.data = response.items.filter(c => c.type === this._categoryType);
                objReturn.confirmation = true;
                objReturn.message = 'Categorías cargadas correctamente';
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

    /**
     * Carga las transacciones para la tabla
     * @param _partialTableOptions Opciones del partial table
     * @param _transactions Transacciones cargadas
     * @param _categories Categorías cargadas
     * @param _localStorage LocalStorage cargado
     * @param _chart Gráfico cargado
     * @returns Promise<DTOResponseWithData<DTOLoadTable>>
     */
    public async loadTable(_partialTableOptions: DTOPartialTableOptions, _transactions: DTOTransaction[], _categories: CategoryEntity[],
        _localStorage: DTOLocalStorage, _chart: Chart | null): Promise<DTOResponseWithData<DTOLoadTable>> {

        var objReturn: DTOResponseWithData<DTOLoadTable> = new DTOResponseWithData<DTOLoadTable>();
        try {
            await this._indexeddbService.getAllItems<TransactionEntity>(EnumTableName.transactions, 'created', 'desc').then(response => {
                if (response.total > 0) {
                    const search = _partialTableOptions.search.trim().toLowerCase();
                    _transactions = response.items.filter(c => c.category.type === this._categoryType
                        && (c.name.toLowerCase().includes(search)
                            || c.description.toLowerCase().includes(search)
                            || c.category.name.toLowerCase().includes(search))).map((item: TransactionEntity) => {
                                const objReturn: DTOTransaction = {
                                    transactionId: item.transactionId,
                                    name: item.name,
                                    amount: item.amount,
                                    amountString: this._genericService.convertToCurrencyFormat(item.amount).data,
                                    date: item.date,
                                    description: item.description,
                                    categoryId: item.categoryId,
                                    categoryName: item.category.name,
                                    categoryType: item.category.type,
                                    created: this._genericService.addMinutesToDate(item.created, _localStorage.minutesOfDifferenceTimeZone),
                                };
                                return objReturn;
                            });
                    _partialTableOptions.total = _transactions.length;
                }

                const responseChartOptions = this.getChartOptions(_transactions, _categories, _localStorage);
                if (!responseChartOptions.confirmation) {
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
                    partialTableOptions: _partialTableOptions,
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
        catch (error: any) {
            console.error(error);
            objReturn.message = error.message;
            objReturn.exception = error.toString();
        }
        return objReturn;
    }

    /**
     * Devuelve el modal abierto
     * @param _categories Categorías cargadas
     * @param item Transacción seleccionada
     * @returns DTOResponseWithData<DTOModalOpen>
     */
    public modalOpen(_categories: CategoryEntity[], item: DTOTransaction | null = null): DTOResponseWithData<FormGroup> {
        var objReturn: DTOResponseWithData<FormGroup> = new DTOResponseWithData<FormGroup>();
        try {
            if (item !== null) {
                objReturn.data = this._fb.group({
                    opc: ['Edit'],
                    opcLabel: ['Editar'],
                    transactionId: [item.transactionId, [Validators.required]],
                    name: [item.name, [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
                    amount: [item.amountString, [Validators.required, DecimalValidator(2)]],
                    date: [this._genericService.transformDateToString(item.date), [Validators.required]],
                    categoryId: [item.categoryId, [Validators.required]],
                    description: [item.description],
                });
            } else {
                objReturn.data = this._fb.group({
                    opc: ['Create'],
                    opcLabel: ['Crear'],
                    name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
                    amount: ['', [Validators.required, DecimalValidator(2)]],
                    date: [this._genericService.transformDateToString(this._genericService.getDateTimeNowUtc()), [Validators.required]],
                    categoryId: [_categories[0].categoryId, [Validators.required]],
                    description: [''],
                });
            }

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

    /**
     * Crea o actualiza la transacción
     * @param modelForm Formulario cargado
     * @param _categories Categorías cargadas
     * @returns Promise<DTOResponse>
     */
    public async createOrUpdate(modelForm: FormGroup, _categories: CategoryEntity[]): Promise<DTOResponse> {
        var objReturn: DTOResponse = new DTOResponse();
        try {
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
                await this._indexeddbService.getItem<TransactionEntity>(EnumTableName.transactions, model.transactionId).then(async response => {
                    response.name = model.name;
                    response.amount = responseAmount.data;
                    response.date = new Date(model.date);
                    response.description = model.description;
                    response.categoryId = model.categoryId;
                    response.category = findCategory;

                    await this._indexeddbService.updateItem<TransactionEntity>(EnumTableName.transactions, response.transactionId, response).then(response => {
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
                    created: this._genericService.getDateTimeNowUtc(),
                };

                await this._indexeddbService.addItem<TransactionEntity>(EnumTableName.transactions, newObj).then(response => {
                    objReturn.confirmation = true;
                    objReturn.message = 'Transacción creada correctamente';
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

    /**
     * Elimina la transacción
     * @param transactionId Id de la transacción
     * @returns Promise<DTOResponse>
     */
    public async delete(transactionId: string): Promise<DTOResponse> {
        var objReturn: DTOResponse = new DTOResponse();
        try {
            await this._indexeddbService.deleteItem(EnumTableName.transactions, transactionId).then(response => {
                objReturn.confirmation = true;
                objReturn.message = 'Transacción eliminada correctamente';
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

    /**
     * Devuelve las opciones del gráfico
     * @param _transactions Transacciones cargadas
     * @param _categories Categorías cargadas
     * @param _localStorage LocalStorage cargado
     * @returns DTOResponseWithData<Highcharts.Options>
     */
    private getChartOptions(_transactions: DTOTransaction[], _categories: CategoryEntity[], _localStorage: any): DTOResponseWithData<Highcharts.Options> {
        var objReturn: DTOResponseWithData<Highcharts.Options> = new DTOResponseWithData<Highcharts.Options>();
        try {
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
                    text: 'Distribución de gastos',
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
        catch (error: any) {
            console.error(error);
            objReturn.message = error.message;
            objReturn.exception = error.toString();
        }
        return objReturn;
    }

}
