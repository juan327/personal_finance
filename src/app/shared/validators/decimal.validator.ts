import { AbstractControl, ValidatorFn } from '@angular/forms';

export function DecimalValidator(maxDecimals: number): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const value = control.value;

    // Permitir valores nulos o vacíos (no requeridos por defecto)
    if (value === null || value === undefined || value === '') {
      return null;
    }

    // Expresión regular para validar números con decimales
    const decimalPattern = new RegExp(`^\\d+(\\.\\d{1,${maxDecimals}})?$`);

    if (!decimalPattern.test(value)) {
      return { invalidDecimal: { maxDecimals, actualValue: value } };
    }

    return null;
  };
}
