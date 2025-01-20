import { DatePipe, DecimalPipe } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { DTOResponseWithData } from '../dto/generic';

@Injectable({
    providedIn: 'root',
})

export class GenericService {
    constructor() { }

    private readonly _datePipe = inject(DatePipe);
    private readonly _decimalPipe = inject(DecimalPipe);
    
    /**
     * Setea el valor de un LocalStorage
     * @param key Llave del LocalStorage
     * @param value Valor del LocalStorage
     */
    public setLocalStorage(key: string, value: any): void {
        localStorage.setItem(key, JSON.stringify(value));
    }

    /**
     * Obtiene el valor de un LocalStorage en base al tipo de dato que se ingrese
     * @param key Llave del LocalStorage
     * @returns T | null
     */
    public getLocalStorage<T>(key: string): T | null {
        const value = localStorage.getItem(key);
        if (value === null || value === 'null' || value === 'undefined' || value === '' || value === undefined) {
            return null;
        }
        return JSON.parse(value);
    }

    /**
     * Elimina el valor de un LocalStorage
     * @param key Llave del LocalStorage
     */
    public removeLocalStorage(key: string): void {
        localStorage.removeItem(key);
    }

    /**
     * Setea el idioma
     * @param language Idioma a establecer (es o en)
     */
    public setLanguage(language: string): void {
        this.setLocalStorage('language', language);
        //this._languageSubject.next(language);
    }

    /**
     * Obtiene el idioma
     * @returns string
     */
    public getLanguage(): string {
        const language = this.getLocalStorage<string>('language');
        if(language === null) {
            return 'en';
        }
        return language;
    }

    /**
     * Obtiene la fecha y hora actual en UTC.
     * 
     * @returns Date
     */
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
     * @returns Date
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

    /**
     * Formatea una fecha a yyyy-MM-ddThh:mm:ss.mmm
     * @param date Fecha a formatear
     * @returns string
     */
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

    /**
     * Transforma una fecha a un string
     * @param date Fecha a transformar
     * @param format Formato de la fecha (default yyyy-MM-dd)
     * @returns string | null
     */
    public transformDateToString(date: Date, format: string = 'yyyy-MM-dd'): string | null {
        return this._datePipe.transform(date, format);
    }

    /**
     * Agrega ceros a la izquierda de un número
     * @param number Número a agregar ceros
     * @param length Longitud del número
     * @returns string
     */
    private padWithZeros(number: number, length: number): string {
        return number.toString().padStart(length, '0');
    }

    /**
     * Genera un guid
     * @returns string
     */
    public generateGuid(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    /**
     * Parsea un texto a un número
     * @param text Texto a parsear
     * @returns DTOResponseWithData<number>
     */
    public parseNumber(text: string): DTOResponseWithData<number> {
        var objReturn: DTOResponseWithData<number> = { message: '', exception: '', confirmation: false, data: NaN };
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

    /**
     * Convierte un número a formato de moneda
     * @param value Número a convertir
     * @returns DTOResponseWithData<string>
     */
    public convertToCurrencyFormat(value: number): DTOResponseWithData<string> {
        var objReturn: DTOResponseWithData<string> = { message: '', exception: '', confirmation: false, data: '' };
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

    /**
     * Convierte un número a formato decimal
     * @param value Número a convertir
     * @returns DTOResponseWithData<number>
     */
    public convertToNumberDecimal(value: number): DTOResponseWithData<number> {
        var objReturn: DTOResponseWithData<number> = { message: '', exception: '', confirmation: false, data: 0 };
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

    /**
     * Transforma un número a formato de moneda
     * @param value Número a transformar
     * @returns string
     */
    public transformNumberToCurrencyFormat(value: number): string {
        return this._decimalPipe.transform(value, '1.2-2') || '0.00';
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
