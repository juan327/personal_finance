import { Component, ContentChild, EventEmitter, inject, OnInit, Output, Renderer2, TemplateRef } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'partial-modal',
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css',
  standalone: true,
  imports: [CommonModule],
})

export class ModalComponent implements OnInit {
    constructor() {}

    @ContentChild('header') templateHeader!: TemplateRef<any>;
    @ContentChild('body') templateBody!: TemplateRef<any>;
    @ContentChild('footer') templateFooter!: TemplateRef<any>;

    @Output() public readonly eventCloseModal = new EventEmitter<any>();
    private readonly _renderer = inject(Renderer2);
    
    ngOnInit(): void {
      this._renderer.setStyle(document.body, 'overflow', 'hidden');
    }

    ngAfterViewInit(): void {
    }

    ngAfterContentInit(): void {
    }

    ngOnDestroy(): void {
      this._renderer.setStyle(document.body, 'overflow', 'auto');
    }

    public closeModal(): void {
      this.eventCloseModal.emit();
    }
}
