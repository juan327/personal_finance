import { Component, ContentChild, EventEmitter, forwardRef, inject, Input, OnInit, Output, TemplateRef } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'partial-inputnumber',
  templateUrl: './inputnumber.component.html',
  styleUrl: './inputnumber.component.css',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule]
})

export class InputNumberComponent implements OnInit {
  constructor() { }

  public _value: string = '';
  @Input() public _id: string = '';
  @Input() public _formControlName: string = '';
  @Input() public _autocomplete: string = '';
  @Input() public _form: FormGroup | null = null;

  ngOnInit(): void {
    if(this._form !== null) {
      this._value = this.parseNumberString(this._form.controls[this._formControlName].value as string);
    }
  }

  ngAfterViewInit(): void {
  }

  ngOnDestroy(): void {

  }

  private parseNumberString(value: string): string {
    if(value === null || value === undefined || value === '') {
      return '0.00';
    }
    if(value.includes('.')) {
      return value;
    }
    if(value.length >= 3) {
      const decimal = value.slice(-2);
      return value.slice(0, -2) + '.' + decimal;
    } else if (value.length === 2) {
      return `0.${value}`;
    } else {
      return `0.0${value}`;
    }
  }

  public onUpdateValue(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = this.resetNumber(input.value);

    if(!this.validateNumbers(input.value)) {
      input.value = this._value;
      return;
    }
    this._value = input.value;
    if(this._form !== null) {
      this._form.controls[this._formControlName].setValue(this._value);
    }
  }

  /**
   * 
   * @param value - El valor a formatear.
   * @returns - El valor formateado.
   */
  private resetNumber(value: string): string {
    if(value === null || value === undefined || value === '') {
      return '0.00';
    }
    const decimal = value.slice(value.indexOf('.'));
    if(decimal.length > 3) {
      return value.slice(0, value.indexOf('.') + 3);
    }
    return value;
  }


  /**
 * Valida si el texto ingresado es un número y/o un punto.
 * 
 * @param {string} text - El texto a validar.
 * @returns {boolean} - `true` si el texto es un número válido y/o un punto, `false` de lo contrario.
 */
  private validateNumbers(text: string): boolean {
    const regex = /^[0-9.]+$/;
    return regex.test(text);
  }

  public onBlur(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = this.resetNumber(input.value);

    if(!input.value.includes('.')) {
      input.value = input.value !== '' ? input.value + '.00' : input.value;
    }

    if(input.value.startsWith('.')) {
      input.value = input.value.replace('.', '0.');
    }

    const decimal = input.value.slice(input.value.indexOf('.'));
    if(decimal.length === 2) {
      input.value = input.value + '0';
    }

    if(input.value.endsWith('.')) {
      input.value = input.value + '00';
    }

    this._value = input.value;
    if(this._form !== null) {
      this._form.controls[this._formControlName].setValue(this._value);
    }
  }

}
