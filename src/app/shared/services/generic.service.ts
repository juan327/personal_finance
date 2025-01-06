import { DatePipe, DecimalPipe } from '@angular/common';
import { inject, Injectable, OnInit } from '@angular/core';
import { DTOResponseApi, DTOResponseApiWithData } from '../dto/generic';
import { CategoryEntity } from '../entities/category';
import { TransactionEntity } from '../entities/transaction';

@Injectable({
    providedIn: 'root',
})

export class GenericService {
    constructor() { }

    private readonly _datePipe = inject(DatePipe);
    private readonly _decimalPipe = inject(DecimalPipe);

    public getDateTimeNow(): Date {
        try {
            var dateTimeNow: Date = new Date();

            // Obtener la fecha y hora actual en UTC
            return new Date(dateTimeNow.getFullYear(),
                dateTimeNow.getMonth(),
                dateTimeNow.getDate(),
                dateTimeNow.getHours(),
                dateTimeNow.getMinutes(),
                dateTimeNow.getSeconds(),
                dateTimeNow.getMilliseconds());
        }
        catch {
            return new Date();
        }
    }

    /**
     * Obtiene la fecha y hora actual en UTC.
     * 
     * @returns {Date} - La fecha y hora actual en UTC.
     */
    public getDateTimeNowUtc(): Date {
        try {
            var dateTimeNow: Date = new Date();

            // Obtener la fecha y hora actual en UTC
            return new Date(dateTimeNow.getUTCFullYear(),
                dateTimeNow.getUTCMonth(),
                dateTimeNow.getUTCDate(),
                dateTimeNow.getUTCHours(),
                dateTimeNow.getUTCMinutes(),
                dateTimeNow.getUTCSeconds(),
                dateTimeNow.getUTCMilliseconds());
        }
        catch {
            return new Date();
        }
    }

    public formatDateTotring(date: Date): string {
        const year = this._datePipe.transform(date, 'yyyy');
        const month = this._datePipe.transform(date, 'MM');
        const day = this._datePipe.transform(date, 'dd');
        const hours = this._datePipe.transform(date, 'HH');
        const minutes = this._datePipe.transform(date, 'mm');
        const seconds = this._datePipe.transform(date, 'ss');
        const milliseconds = this.padWithZeros(date.getMilliseconds(), 3);

        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}`;
    }

    public transformDateToString(date: Date, format: string = 'yyyy-MM-dd'): string | null {
        return this._datePipe.transform(date, format);
    }

    private padWithZeros(num: number, length: number): string {
        return num.toString().padStart(length, '0');
    }

    public generateGuid(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    public parseNumber(text: string): DTOResponseApiWithData<number> {
        var objReturn: DTOResponseApiWithData<number> = { message: '', exception: '', confirmation: false, data: NaN };
        try {
            const convertNumber: number = Number(text); // Usamos Number() para convertir el string a número
            if (isNaN(convertNumber)) {
                // Si la conversión no fue exitosa, retornamos NaN o algún valor predeterminado
                objReturn.data = 0;
            }
            objReturn.data = convertNumber;
            objReturn.confirmation = true;
            objReturn.message = 'Conversión exitosa';
        }
        catch (ex: any) {
            objReturn.message = ex.message;
            objReturn.exception = ex.toString();
        }
        return objReturn;
    }

    public convertToCurrencyFormat(value: number): DTOResponseApiWithData<string> {
        var objReturn: DTOResponseApiWithData<string> = { message: '', exception: '', confirmation: false, data: '' };
        try {
            // Convertimos el número a cadena y agregamos ceros si es necesario
            let monto = value.toString().padStart(3, '0');  // Asegura que tenga al menos 3 caracteres
            const enteros = monto.slice(0, monto.length - 2);  // Toma los enteros (todo excepto los últimos 2 dígitos)
            const decimales = monto.slice(-2);  // Toma los últimos 2 dígitos como decimales
    
            const responseParseNumber = this.parseNumber(`${enteros}.${decimales}`);
            if(!responseParseNumber.confirmation) {
                objReturn.message = responseParseNumber.message;
                objReturn.exception = responseParseNumber.exception;
                return objReturn;
            }

            objReturn.data = this.transformNumberToCurrencyFormat(responseParseNumber.data);
            objReturn.confirmation = true;
            objReturn.message = 'Conversión exitosa';
        }
        catch (ex: any) {
            objReturn.message = ex.message;
            objReturn.exception = ex.toString();
        }
        return objReturn;
    }

    public convertToNumberDecimal(value: number): DTOResponseApiWithData<number> {
        var objReturn: DTOResponseApiWithData<number> = { message: '', exception: '', confirmation: false, data: 0 };
        try {
            // Convertimos el número a cadena y agregamos ceros si es necesario
            let monto = value.toString().padStart(3, '0');  // Asegura que tenga al menos 3 caracteres
            const enteros = monto.slice(0, monto.length - 2);  // Toma los enteros (todo excepto los últimos 2 dígitos)
            const decimales = monto.slice(-2);  // Toma los últimos 2 dígitos como decimales
    
            const responseParseNumber = this.parseNumber(`${enteros}.${decimales}`);
            if(!responseParseNumber.confirmation) {
                objReturn.message = responseParseNumber.message;
                objReturn.exception = responseParseNumber.exception;
                return objReturn;
            }

            objReturn.data = responseParseNumber.data;
            objReturn.confirmation = true;
            objReturn.message = 'Conversión exitosa';
        }
        catch (ex: any) {
            objReturn.message = ex.message;
            objReturn.exception = ex.toString();
        }
        return objReturn;
    }

    public transformNumberToCurrencyFormat(value: number): string {
        return this._decimalPipe.transform(value, '1.2-2') || '0.00';
    }

    public getDataTest(): { categories: CategoryEntity[], incomes: TransactionEntity[] } {
        const categories: CategoryEntity[] = [
            { categoryId: this.generateGuid(), name: 'Sueldo', type: 1, created: new Date() },
            { categoryId: this.generateGuid(), name: 'Extra', type: 1, created: new Date() },
            { categoryId: this.generateGuid(), name: 'Servicios', type: 1, created: new Date() },
            { categoryId: this.generateGuid(), name: 'Otros', type: 1, created: new Date() },
            { categoryId: this.generateGuid(), name: 'Dulces', type: 2, created: new Date() },
            { categoryId: this.generateGuid(), name: 'Ropa', type: 2, created: new Date() },
            { categoryId: this.generateGuid(), name: 'Servicios', type: 2, created: new Date() },
            { categoryId: this.generateGuid(), name: 'Otros', type: 2, created: new Date() },
        ];
        const incomes: TransactionEntity[] = [
            { transactionId: this.generateGuid(), name: 'Ingreso 1', amount: 10000, date: new Date(), description: 'Descripción 1', categoryId: categories[0].categoryId, category: categories[0], created: new Date() },
            { transactionId: this.generateGuid(), name: 'Ingreso 2', amount: 20000, date: new Date(), description: 'Descripción 2', categoryId: categories[1].categoryId, category: categories[1], created: new Date() },
            { transactionId: this.generateGuid(), name: 'Ingreso 3', amount: 30000, date: new Date(), description: 'Descripción 3', categoryId: categories[2].categoryId, category: categories[2], created: new Date() },
            { transactionId: this.generateGuid(), name: 'Ingreso 4', amount: 40000, date: new Date(), description: 'Descripción 4', categoryId: categories[3].categoryId, category: categories[3], created: new Date() },
            
            { transactionId: this.generateGuid(), name: 'Ingreso 5', amount: 50000, date: new Date(), description: 'Descripción 5', categoryId: categories[4].categoryId, category: categories[4], created: new Date() },
            { transactionId: this.generateGuid(), name: 'Ingreso 6', amount: 60000, date: new Date(), description: 'Descripción 6', categoryId: categories[5].categoryId, category: categories[5], created: new Date() },
            { transactionId: this.generateGuid(), name: 'Ingreso 7', amount: 70000, date: new Date(), description: 'Descripción 7', categoryId: categories[6].categoryId, category: categories[6], created: new Date() },
            { transactionId: this.generateGuid(), name: 'Ingreso 8', amount: 80000, date: new Date(), description: 'Descripción 8', categoryId: categories[7].categoryId, category: categories[7], created: new Date() },
        ];
        return { categories, incomes };
    }


    /**
     * Devuelve una lista de los 12 meses del año con su nombre, fecha de inicio y fin
     * @param year El año para el cual se desea generar la lista
     * @returns Un arreglo de objetos con name, dateStart y dateEnd
     */
    getMonthsFromYear(year: number): { name: string, dateStart: Date, dateEnd: Date }[] {
      const months = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ];
  
      return months.map((monthName, index) => {
        const startDate = new Date(year, index, 1);
        const endDate = new Date(year, index + 1, 0); // Último día del mes actual
  
        return {
          name: monthName,
          dateStart: startDate,
          dateEnd: endDate
        };
      });
    }

}
