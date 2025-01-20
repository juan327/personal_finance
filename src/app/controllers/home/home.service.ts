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
import { DTOLoadTable, DTOModalOpen, DTOResults } from './dto/home.dto';
import { DTOHighchartSeries, DTOLocalStorage, DTOResponseApi, DTOResponseApiWithData } from 'src/app/shared/dto/generic';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DecimalValidator } from 'src/app/shared/validators/decimal.validator';
//#endregion

@Injectable({
    providedIn: 'root',
})

export class HomeService {
    constructor() { }

    //#region injectables
    private readonly _indexeddbService = inject(IndexeddbService);
    private readonly _highchartService = inject(HighchartService);
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

    public async loadTable(_partialTableOptions: DTOPartialTableOptions, _transactions: DTOTransaction[], _categories: CategoryEntity[],
        _localStorage: DTOLocalStorage, _chart: Chart | null): Promise<DTOResponseApiWithData<DTOLoadTable>> {
        
        var objReturn: DTOResponseApiWithData<DTOLoadTable> = this.getDefaultObjReturnWithData();
        try
        {
            await this._indexeddbService.getAllItems<TransactionEntity>('transactions', 'created', 'desc').then(response => {
                if (response.total > 0) {
                    _partialTableOptions.total = response.total;
                    _transactions = response.items.map((item: TransactionEntity) => {
                        const objReturn: DTOTransaction = {
                            transactionId: item.transactionId,
                            name: item.name,
                            amount: item.amount,
                            amountString: `${_localStorage.currency} ${this._genericService.convertToCurrencyFormat(item.amount).data}`,
                            date: item.date,
                            description: item.description,
                            categoryId: item.categoryId,
                            categoryName: item.category.name,
                            categoryType: item.category.type,
                            created: item.created,
                        };
                        return objReturn;
                    });
                }
    
                const responseChartOptions = this.getChartOptions(_transactions, _localStorage);
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

    public updateResults(_results: DTOResults, _transactions: DTOTransaction[]): DTOResponseApiWithData<DTOResults> {
        var objReturn: DTOResponseApiWithData<DTOResults> = this.getDefaultObjReturnWithData();
        try 
        {
            const incomes = _transactions.filter(c => c.categoryType === 1);
            const expenses = _transactions.filter(c => c.categoryType === 2);
    
            const totalIncomes = incomes.reduce((a, b) => a + b.amount, 0);
            const totalExpenses = expenses.reduce((a, b) => a + b.amount, 0);
    
            const responsetotalIncomes = this._genericService.convertToCurrencyFormat(totalIncomes);
            if (!responsetotalIncomes.confirmation) {
                alert(responsetotalIncomes.message);
                return objReturn;
            }
            const responseTotalExpenses = this._genericService.convertToCurrencyFormat(totalExpenses);
            if (!responseTotalExpenses.confirmation) {
                alert(responseTotalExpenses.message);
                return objReturn;
            }
            const responseTotal = this._genericService.convertToCurrencyFormat(totalIncomes - totalExpenses);
            if (!responseTotal.confirmation) {
                alert(responseTotal.message);
                return objReturn;
            }
    
            objReturn.data = {
                incomes: incomes,
                expenses: expenses,
                totalIncomes: responsetotalIncomes.data,
                totalExpenses: responseTotalExpenses.data,
                total: responseTotal.data,
                totalInt: totalIncomes - totalExpenses,
            };
            objReturn.confirmation = true;
            objReturn.message = 'Resultados cargados correctamente';
        }
        catch (error: any)
        {
            console.error(error);
            objReturn.message = error.message;
            objReturn.exception = error.toString();
        }
        return objReturn;
    }

    private getChartOptions(_transactions: DTOTransaction[], _localStorage: any): DTOResponseApiWithData<Highcharts.Options> {
        var objReturn: DTOResponseApiWithData<Highcharts.Options> = this.getDefaultObjReturnWithData();
        try {
            const dataIncomes: {
                name: string;
                y: number;
            }[] = [];
            const dataExpenses: {
                name: string;
                y: number;
            }[] = [];

            const categories = this._genericService.getMonthsFromYear(2025);

            for (let i = 0; i < categories.length; i++) {
                const item = categories[i];
                const amountIncomes = _transactions.reduce((a, b) => a + (b.categoryType === 1 && b.date >= item.dateStart && b.date <= item.dateEnd ? b.amount : 0), 0);
                const amountExpenses = _transactions.reduce((a, b) => a + (b.categoryType === 2 && b.date >= item.dateStart && b.date <= item.dateEnd ? b.amount : 0), 0);

                const responseIncomes = this._genericService.convertToNumberDecimal(amountIncomes);
                if (!responseIncomes.confirmation) {
                    continue;
                }
                const responseExpenses = this._genericService.convertToNumberDecimal(amountExpenses);
                if (!responseExpenses.confirmation) {
                    continue;
                }

                dataIncomes.push({
                    name: item.name,
                    y: responseIncomes.data,
                });

                dataExpenses.push({
                    name: item.name,
                    y: responseExpenses.data,
                });
            }

            const series: DTOHighchartSeries<any>[] = [
                {
                    name: 'Ingresos',
                    data: dataIncomes,
                    color: 'var(--color-green)',
                },
                {
                    name: 'Gastos',
                    data: dataExpenses,
                    color: 'var(--color-red)',
                }
            ];

            objReturn.data = {
                chart: {
                    type: 'column'
                },
                title: {
                    text: 'Rendimiento del año'
                },
                xAxis: {
                    categories: categories.map(c => c.name),
                    crosshair: true,
                    accessibility: {
                        description: 'Countries'
                    }
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: 'AÑO 2025'
                    }
                },
                plotOptions: {
                    column: {
                        pointPadding: 0.2,
                        borderWidth: 0
                    }
                },
                tooltip: {
                    valuePrefix: _localStorage.currency + ' '
                },
                series: series as any
            };
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
