import { Component, ContentChild, EventEmitter, inject, Input, OnInit, Output, TemplateRef } from '@angular/core';
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
    constructor() {}

    @ContentChild('caption') templateCaption!: TemplateRef<any>;
    @ContentChild('header') templateHeader!: TemplateRef<any>;
    @ContentChild('body') templateBody!: TemplateRef<any>;
    @ContentChild('footer') templateFooter!: TemplateRef<any>;

    @Output() public readonly eventCloseModal = new EventEmitter<any>();
    @Input() public _values: any[] = []; 
    
    ngOnInit(): void {
    }

    ngAfterViewInit(): void {
    }

    ngAfterContentInit(): void {
    }

    ngOnDestroy(): void {

    }

}
