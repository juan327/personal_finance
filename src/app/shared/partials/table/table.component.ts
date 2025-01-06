import { Component, ContentChild, EventEmitter, inject, input, Input, OnInit, Output, TemplateRef } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'partial-table',
  templateUrl: './table.component.html',
  styleUrl: './table.component.css',
  standalone: true,
  imports: [CommonModule],
})

export class TableComponent implements OnInit {
  constructor() { }

  @ContentChild('caption') templateCaption!: TemplateRef<any>;
  @ContentChild('header') templateHeader!: TemplateRef<any>;
  @ContentChild('body') templateBody!: TemplateRef<any>;
  @ContentChild('footer') templateFooter!: TemplateRef<any>;

  @Output() public readonly eventOnChange = new EventEmitter<number>();
  @Output() public readonly eventOnLoad = new EventEmitter<any>();
  
  @Input() public _values: any[] = [];
  @Input() public _options: {
    skip: number;
    take: number;
  } = {
      skip: 0,
      take: 5,
    };

  public readonly _listTake: number[] = [5, 10, 20, 50];
  public _selectedTake: number = 5;

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.eventOnLoad.emit(this._options);
  }

  ngOnDestroy(): void {

  }
  
  public selectTake(event: any): void {
    this._selectedTake = parseInt(event.target.value);
    this.eventOnChange.emit(this._selectedTake);
  }

}
