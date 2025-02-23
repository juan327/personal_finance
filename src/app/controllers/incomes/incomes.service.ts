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
import { DTODictionary, DTOLoadTable, DTOModalOpen } from './dto/incomes.dto';
import { DTOLocalStorage, DTOResponse, DTOResponseWithData } from 'src/app/shared/dto/generic';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DecimalValidator } from 'src/app/shared/validators/decimal.validator';
import { EnumTableName } from 'src/app/shared/enums/generic.enum';
//#endregion

@Injectable({
    providedIn: 'root',
})

export class IncomesService {

    //#region injectables
    private readonly _indexeddbService = inject(IndexeddbService);
    private readonly _highchartService = inject(HighchartService);
    private readonly _genericService = inject(GenericService);
    private readonly _fb = inject(FormBuilder);
    //#endregion

    //#region private properties
    private readonly _categoryType: number = 1;
    private readonly _localStorage: DTOLocalStorage = this._genericService.getDataLocalStorage();
    private _dictionary: DTODictionary | null = null;
    //#endregion

    constructor()
    {
    }

    public async initialize(): Promise<void> {
        await this.loadDictionary();
    }

    private async loadDictionary(): Promise<void> {
        try {
            var response = await this._genericService.getDictionary<DTODictionary>(`incomes/${this._localStorage.language}.json`);
            if (!response.confirmation) {
                return;
            }
            this._dictionary = response.data;
        }
        catch (error: any) {
            console.error(error);
        }
    }

    public getLocalStorage(): DTOLocalStorage {
        return this._localStorage;
    }

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
                objReturn.message = this._localStorage.language === 'es' ? 'Categorías cargadas correctamente' : 'Categories loaded successfully';
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
     * @param _chart Gráfico cargado
     * @returns Promise<DTOResponseWithData<DTOLoadTable>>
     */
    public async loadTable(model: {_partialTableOptions: DTOPartialTableOptions, _transactions: DTOTransaction[], _categories: CategoryEntity[],
        _chart: Chart | null}): Promise<DTOResponseWithData<DTOLoadTable>> {

        var objReturn: DTOResponseWithData<DTOLoadTable> = new DTOResponseWithData<DTOLoadTable>();
        try {
            await this._indexeddbService.getAllItems<TransactionEntity>(EnumTableName.transactions, 'created', 'desc').then(response => {
                if (response.total > 0) {
                    const search = model._partialTableOptions.search.trim().toLowerCase();
                    model._transactions = response.items.filter(c => c.category.type === this._categoryType
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
                                    created: item.created,
                                };
                                return objReturn;
                            });
                    model._partialTableOptions.total = model._transactions.length;
                }

                const responseChartOptions = this.getChartOptions(model._transactions, model._categories);
                if (!responseChartOptions.confirmation) {
                    objReturn.message = responseChartOptions.message;
                    objReturn.exception = responseChartOptions.exception;
                } else {
                    if (model._transactions.length > 1 && model._chart !== null) {
                        this._highchartService.updateChart(model._chart, responseChartOptions.data);
                    } else {
                        model._chart = this._highchartService.buildChart('chart', responseChartOptions.data);
                    }
                }
                objReturn.data = {
                    partialTableOptions: model._partialTableOptions,
                    transactions: model._transactions,
                    categories: model._categories,
                    chart: model._chart,
                };
                objReturn.confirmation = true;
                objReturn.message = this._localStorage.language === 'es' ? 'Tabla cargada correctamente' : 'Table loaded successfully';
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
     * @returns DTOResponseWithData<FormGroup>
     */
    public modalOpen(_categories: CategoryEntity[], item: DTOTransaction | null = null): DTOResponseWithData<FormGroup> {
        var objReturn: DTOResponseWithData<FormGroup> = new DTOResponseWithData<FormGroup>();
        try {
            if (item !== null) {
                objReturn.data = this._fb.group({
                    opc: ['Edit'],
                    opcLabel: [this._dictionary?.modalCreate.opc.edit],
                    transactionId: [item.transactionId, [Validators.required]],
                    name: [item.name, [Validators.required]],
                    amount: [item.amount.toString(), [Validators.required, DecimalValidator(2)]],
                    date: [item.date, [Validators.required]],
                    categoryId: [item.categoryId, [Validators.required]],
                    description: [item.description],
                });
            } else {
                objReturn.data = this._fb.group({
                    opc: ['Create'],
                    opcLabel: [this._dictionary?.modalCreate.opc.create],
                    name: ['', [Validators.required]],
                    amount: ['0', [Validators.required, DecimalValidator(2)]],
                    date: [this._genericService.getDateTimeNow(), [Validators.required]],
                    categoryId: [_categories[0].categoryId, [Validators.required]],
                    description: [''],
                });
            }

            objReturn.confirmation = true;
            objReturn.message = this._localStorage.language === 'es' ? 'Modal abierto correctamente' : 'Modal opened successfully';
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
                objReturn.message = this._localStorage.language === 'es' ? 'No se encontró la categoría' : 'Category not found';
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
                        objReturn.message = this._localStorage.language === 'es' ? 'Transacción actualizada correctamente' : 'Transaction updated successfully';
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
                    created: this._genericService.getDateTimeNow(),
                };

                await this._indexeddbService.addItem<TransactionEntity>(EnumTableName.transactions, newObj).then(response => {
                    objReturn.confirmation = true;
                    objReturn.message = this._localStorage.language === 'es' ? 'Transacción creada correctamente' : 'Transaction created successfully';
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
                objReturn.message = this._localStorage.language === 'es' ? 'Transacción eliminada correctamente' : 'Transaction deleted successfully';
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
     * @returns DTOResponseWithData<Highcharts.Options>
     */
    private getChartOptions(_transactions: DTOTransaction[], _categories: CategoryEntity[]): DTOResponseWithData<Highcharts.Options> {
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
            const responseTotal = this._genericService.convertToCurrencyFormat(total);

            for (let i = 0; i < _categories.length; i++) {
                const item = _categories[i];
                const amount = _transactions.reduce((a, b) => a + (b.categoryId === item.categoryId ? b.amount : 0), 0);
                const amountString = this._genericService.convertToCurrencyFormat(amount).data;
                const porcent: number = total > 0 ? ((amount * 100) / total) : 0;
                const porcentString = this._genericService.parseNumber(porcent.toFixed(2)).data;

                data.push({
                    id: item.categoryId,
                    name: `${item.name} (${this._localStorage.currency} ${amountString})`,
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
                    text: `${this._dictionary?.cardChart.title} (${this._localStorage.currency} ${responseTotal.data})`,
                },
                subtitle: {
                    text: _transactions.length > 0 ? '' : this._dictionary?.cardChart.noData,
                },
                tooltip: {
                    valueSuffix: '%',
                },
                series: _transactions.length > 0 ? [
                    {
                        type: 'pie',
                        name: this._dictionary?.cardChart.percentage,
                        showInLegend: true,
                        data: data,
                    }
                ] : [],
            };
            objReturn.confirmation = true;
            objReturn.message = this._localStorage.language === 'es' ? 'Opciones del gráfico cargadas correctamente' : 'Chart options loaded successfully';
        }
        catch (error: any) {
            console.error(error);
            objReturn.message = error.message;
            objReturn.exception = error.toString();
        }
        return objReturn;
    }

    public getDictionary(): DTODictionary | null {
        return this._dictionary;
    }

}
