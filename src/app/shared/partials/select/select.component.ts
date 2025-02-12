import { Component, ContentChild, ElementRef, EventEmitter, forwardRef, HostListener, inject, Input, OnInit, Output, TemplateRef } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GenericService } from '../../services/generic.service';

@Component({
  selector: 'partial-select',
  templateUrl: './select.component.html',
  styleUrl: './select.component.css',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule]
})

export class SelectComponent implements OnInit {
  constructor() { }
  private readonly _genericService = inject(GenericService);

  @ContentChild('body') templateBody!: TemplateRef<any>;

  @Input() public _formControlName: string = '';
  @Input() public _form: FormGroup | null = null;
  @Input() public _options: any[] = [];
  @Input() public _label: string = '';
  @Input() public _value: string = '';

  public _optionsView: any[] = [];

  public _option: any | null = null;
  public _showOptions: boolean = false;

  ngOnInit(): void {
    if(this._options.length <= 0) return;
    
    if(this._form !== null) {
      const value: any = this._form.controls[this._formControlName].value;
      if(value !== null && value !== undefined) {
        const findOption = this._options.find(item => item[this._value] === value);
        if(findOption !== null && findOption !== undefined) {
          this._option = findOption;
        }
      }
    }
    this.loadOptions();
  }

  ngAfterViewInit(): void {
  }

  ngOnDestroy(): void {

  }

  private loadOptions(): void {
    this._optionsView = this._options;
  }

  public onShowOptions(event: MouseEvent, buttonClearOption: HTMLElement): void {
    if(event.target === buttonClearOption) {
      this.clearOption();
      return;
    }
    this._showOptions = !this._showOptions;
    this.loadOptions();
  }

  public onSearch(event: any): void {
    if(event.target.value === undefined || event.target.value === null || event.target.value === '') return;
    const text: string = event.target.value.toLowerCase().trim();
    this._optionsView = this._options.filter(item => item[this._label].toLowerCase().includes(text));
  }

  private clearOption(): void {
    this._option = null;
    this._showOptions = false;
    if(this._form !== null) {
      this._form.controls[this._formControlName].setValue(null);
    }
  }

  public onSelect(item: any): void {
    this._option = item;
    this._showOptions = false;

    if(this._form !== null) {
      this._form.controls[this._formControlName].setValue(item[this._value]);
    }
  }

  public onClickOutsideOptions(event: MouseEvent, contentOptions: HTMLDivElement): void {
    if(contentOptions === event.target) {
      this._showOptions = false;
    }
  }

}
