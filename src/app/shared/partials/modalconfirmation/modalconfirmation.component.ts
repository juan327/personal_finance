import { Component, ContentChild, EventEmitter, inject, OnInit, Output, Renderer2, TemplateRef } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { GenericService } from '../../services/generic.service';

@Component({
  selector: 'partial-modalconfirmation',
  templateUrl: './modalconfirmation.component.html',
  styleUrl: './modalconfirmation.component.css',
  standalone: true,
  imports: [CommonModule],
})

export class ModalConfirmationComponent implements OnInit {
  constructor() { }

  @ContentChild('header') templateHeader!: TemplateRef<any>;
  @ContentChild('body') templateBody!: TemplateRef<any>;

  @Output() public readonly eventOnSuccess = new EventEmitter<any>();
  @Output() public readonly eventOnCancel = new EventEmitter<any>();
  
  private readonly _genericService = inject(GenericService);
  public readonly _localStorage = this._genericService.getDataLocalStorage();
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

  public onSuccess(): void {
    this.eventOnSuccess.emit();
  }

  public onCancel(): void {
    this.eventOnCancel.emit();
  }

  public closeModal(): void {
    this.eventOnCancel.emit();
  }
}
