import { Component, ContentChild, EventEmitter, forwardRef, inject, Input, OnInit, Output, TemplateRef } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'partial-inputnumber',
  templateUrl: './inputnumber.component.html',
  styleUrl: './inputnumber.component.css',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputNumberComponent),
      multi: true,
    },
  ],
})

export class InputNumberComponent implements OnInit {
  constructor() { }

  public value: string = '';
  private onChange = (value: string) => { };
  private onTouched = () => { };

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.onChange(this.value);
    this.onTouched();
  }

  ngAfterContentInit(): void {
  }

  ngOnDestroy(): void {

  }

  private writeValue(value: string): void {
    this.value = this.resetNumber(value);
  }

  private registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  public updateValue(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = this.resetNumber(input.value);

    if(!this.validateNumbers(input.value)) {
      input.value = this.value;
      this.onChange(this.value);
      this.onTouched();
      return;
    }
    this.value = input.value;
    this.onChange(this.value);
    this.onTouched();
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

    this.value = input.value;
    this.onChange(this.value);
    this.onTouched();
  }

}
