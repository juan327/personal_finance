import { Component, ContentChild, ElementRef, EventEmitter, forwardRef, HostListener, inject, Input, OnInit, Output, TemplateRef } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GenericService } from '../../services/generic.service';
import { DTOInputdatetimeMonth, DTOInputdatetimeMonthDatetime, DTOInputdatetimeMonthDay } from './dto/dtoInputdatetime';

@Component({
  selector: 'partial-inputdatetime',
  templateUrl: './inputdatetime.component.html',
  styleUrl: './inputdatetime.component.css',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule]
})

export class InputDatetimeComponent implements OnInit {
  constructor() { }

  @Input() public _formControlName: string = '';
  @Input() public _autocomplete: string = '';
  @Input() public _form: FormGroup | null = null;

  private readonly _genericService = inject(GenericService);
  private readonly _formatDate: string = 'dd/MM/yyyy hh:mm a';

  public _value: string = '';
  public _month: DTOInputdatetimeMonth | null = null;
  public _selectedDay: DTOInputdatetimeMonthDatetime | null = null;

  public _showCalendar: boolean = false;
  public _actualYear: number = this._genericService.getDateTimeNow().getFullYear();
  public _actualMonth: number = this._genericService.getDateTimeNow().getMonth() + 1;

  public _typeBody: 'days' | 'months' | 'years' = 'days';
  public _listYears: number[] = [];

  ngOnInit(): void {
    this.loadCalendar();
  }

  ngAfterViewInit(): void {
  }

  ngOnDestroy(): void {

  }

  public onShowCalendar(): void {
    this._showCalendar = !this._showCalendar;
    this._typeBody = 'days';
    this._listYears = [];

    this.loadCalendar();
  }

  private loadCalendar(): void {
    try
    {
      if(this._form !== null) {
        const value: Date = this._form.controls[this._formControlName].value as Date;
        if(value !== null && value !== undefined) {
          this._actualYear = value.getFullYear();
          this._actualMonth = value.getMonth() + 1;
  
          this._month = this.generateCalendar(this._actualMonth, this._actualYear);
          this._value = this._genericService.transformDateToString(value, this._formatDate);
          
          const findDay = this._month.days.find(item => item.day === value.getDate() && item.month === this._actualMonth && item.year === this._actualYear);
          if(findDay !== undefined) {
            this._selectedDay = {
              code: findDay.code,
              datetime: new Date(findDay.datetime.getFullYear(), findDay.datetime.getMonth(), findDay.datetime.getDate(), value.getHours(), value.getMinutes()),
            };
          }
          return;
        }
      }
  
      this._month = this.generateCalendar(this._actualMonth, this._actualYear);
      const findDay = this._month.days.find(item => item.day === this._genericService.getDateTimeNow().getDate() && item.month === (this._genericService.getDateTimeNow().getMonth() + 1) && item.year === this._genericService.getDateTimeNow().getFullYear());
      if(findDay !== undefined) {
        this._selectedDay = findDay;
      }
    }
    catch(error: any) {
      console.error(error);
    }
  }

  public onChangeBackMonth() {
    if(this._typeBody === 'days') {
      this._actualMonth--;
      if(this._actualMonth < 1) {
        this._actualMonth = 12;
        this._actualYear--;
      }
    } else if(this._typeBody === 'months') {
      this._actualYear--;
    } else if(this._typeBody === 'years') {
      this._actualYear -= 10;
    }
    this._listYears = this.getDecadeYears(this._actualYear);
    this._month = this.generateCalendar(this._actualMonth, this._actualYear);
  }

  public onChangeNextMonth() {
    if(this._typeBody === 'days') {
      this._actualMonth++;
      if (this._actualMonth > 12) {
        this._actualMonth = 1;
        this._actualYear++;
      }
    } else if(this._typeBody === 'months') {
      this._actualYear++;
    } else if(this._typeBody === 'years') {
      this._actualYear += 10;
    }
    this._listYears = this.getDecadeYears(this._actualYear);
    this._month = this.generateCalendar(this._actualMonth, this._actualYear);
  }
  
  /**
   * Genera una lista de fechas en el formato requerido.
   * @param month Mes del año (1 = Enero, 12 = Diciembre).
   * @param year Año correspondiente.
   * @returns Lista de objetos con información de fechas.
   */
  private generateCalendar(month: number, year: number): DTOInputdatetimeMonth {
    const result: DTOInputdatetimeMonthDay[] = [];

    // Ajustar el mes (0 = Enero, 11 = Diciembre)
    const adjustedMonth = month - 1;

    // Obtener el primer día del mes
    const firstDayOfMonth = new Date(year, adjustedMonth, 1);
    const firstDayOfWeek = firstDayOfMonth.getDay(); // Día de la semana (0 = Domingo, 6 = Sábado)

    // Obtener el último día del mes
    const lastDayOfMonth = new Date(year, adjustedMonth + 1, 0);
    const lastDayOfWeek = lastDayOfMonth.getDay(); // Día de la semana (0 = Domingo, 6 = Sábado)

    // Rellenar días del mes anterior si no comienza en domingo
    if (firstDayOfWeek !== 0) {
      const daysToFill = firstDayOfWeek; // Número de días a rellenar
      for (let i = 0; i < daysToFill; i++) {
        const date = new Date(year, adjustedMonth, -i);
        result.unshift(this.createDateObject(date, false));
      }
    }

    // Agregar días del mes actual
    for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
      const date = new Date(year, adjustedMonth, day);
      result.push(this.createDateObject(date, true));
    }

    // Rellenar días del mes siguiente si no termina en sábado
    if (lastDayOfWeek !== 6) {
      const daysToFill = 6 - lastDayOfWeek; // Número de días a rellenar
      for (let i = 1; i <= daysToFill; i++) {
        const date = new Date(year, adjustedMonth + 1, i);
        result.push(this.createDateObject(date, false));
      }
    }

    return {
      month: month,
      monthString: this.getMonthString(month),
      year: year,
      days: result,
    };
  }

  /**
   * Crea un objeto con la información de una fecha.
   * @param date Instancia de Date.
   * @param isActualMonth Indica si pertenece al mes actual.
   * @returns Objeto con formato { date, dateString, day, isActualMonth }.
   */
  private createDateObject(datetime: Date, isActualMonth: boolean): DTOInputdatetimeMonthDay {
    return {
      code: this._genericService.transformDateToString(datetime, 'yyyyMMdd'),
      datetime: datetime,
      day: datetime.getDate(),
      month: datetime.getMonth() + 1,
      year: datetime.getFullYear(),
      isActualMonth,
    };
  }

  public onSelectDay(item: DTOInputdatetimeMonthDay) {
    if(this._selectedDay === null || !item.isActualMonth) return;

    const newDate: Date = new Date(item.datetime.getFullYear(), item.datetime.getMonth(), item.datetime.getDate(), this._selectedDay.datetime.getHours(), this._selectedDay.datetime.getMinutes());
    this._value = this._genericService.transformDateToString(newDate, this._formatDate);
    this._selectedDay = {
      code: item.code,
      datetime: newDate,
    };
    if(this._form !== null) {
      this._form.controls[this._formControlName].setValue(this._selectedDay.datetime);
    }
    this._showCalendar = false;
  }

  private getMonthString(month: number): string {
    switch (month) {
      case 1:
        return 'Enero';
      case 2:
        return 'Febrero';
      case 3:
        return 'Marzo';
      case 4:
        return 'Abril';
      case 5:
        return 'Mayo';
      case 6:
        return 'Junio';
      case 7:
        return 'Julio';
      case 8:
        return 'Agosto';
      case 9:
        return 'Septiembre';
      case 10:
        return 'Octubre';
      case 11:
        return 'Noviembre';
      case 12:
        return 'Diciembre';
      default:
        return '';
    }
  }

  public onChangeTime(minutes: number): void {
    if(this._selectedDay === null) return;
    const newDatetime = this._genericService.addMinutesToDate(this._selectedDay.datetime, minutes);

    this._selectedDay.datetime = new Date(this._selectedDay.datetime.getFullYear(), this._selectedDay.datetime.getMonth(), this._selectedDay.datetime.getDate(), newDatetime.getHours(), newDatetime.getMinutes());
    this._value = this._genericService.transformDateToString(this._selectedDay.datetime, this._formatDate);

    if(this._form !== null) {
      this._form.controls[this._formControlName].setValue(this._selectedDay.datetime);
    }
  }

  public onClickOutsideCalendar(event: any, contentCalendar: HTMLDivElement): void {
    if(contentCalendar === event.srcElement) {
      this._showCalendar = false;
    }
  }

  public onClearDatetime(): void {
    this._selectedDay = null;
    this._value = '';
    if(this._form !== null) {
      this._form.controls[this._formControlName].setValue(null);
    }
    this._showCalendar = false;
  }

  public onSelectDatetimeNow(): void {
    const datetime = this._genericService.getDateTimeNow();
    this._selectedDay = {
      code: this._genericService.transformDateToString(this._genericService.getDateTimeNow(), 'yyyyMMdd'),
      datetime: datetime,
    };
    this._value = this._genericService.transformDateToString(this._selectedDay.datetime, this._formatDate);
    if(this._form !== null) {
      this._form.controls[this._formControlName].setValue(this._selectedDay.datetime);
    }
    this._showCalendar = false;
  }

  public onChangeTypeBody(typeBody: 'days' | 'months' | 'years'): void {
    this._typeBody = typeBody;
    if(this._typeBody === 'years') {
      this._listYears = this.getDecadeYears(this._actualYear);
    }
  }

  public onSelectMonth(month: number): void {
    this._actualMonth = month;
    this._listYears = this.getDecadeYears(this._actualYear);
    this._month = this.generateCalendar(this._actualMonth, this._actualYear);
    this._typeBody = 'days';
  }

  public onChangeYear(year: number): void {
    this._actualYear = year;
    this._listYears = this.getDecadeYears(this._actualYear);
    this._month = this.generateCalendar(this._actualMonth, this._actualYear);
    this._typeBody = 'months';
  }

  private getDecadeYears(year: number): number[] {
    const startYear = Math.floor(year / 10) * 10; // Obtiene el primer año de la década
    return Array.from({ length: 10 }, (_, i) => startYear + i);
  }

}
