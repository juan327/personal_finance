import { Component, ContentChild, effect, EventEmitter, inject, input, Input, OnChanges, OnInit, Output, signal, SimpleChanges, TemplateRef } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DTODictionary, DTOPartialTableOptions } from './dto/dtoTable';
import { GenericService } from '../../services/generic.service';

@Component({
  selector: 'partial-table',
  templateUrl: './table.component.html',
  styleUrl: './table.component.css',
  standalone: true,
  imports: [CommonModule],
})

export class TableComponent implements OnInit, OnChanges {

  @ContentChild('caption') templateCaption!: TemplateRef<any>;
  @ContentChild('header') templateHeader!: TemplateRef<any>;
  @ContentChild('body') templateBody!: TemplateRef<any>;
  @ContentChild('bodyMobile') templateBodyMobile!: TemplateRef<any>;
  @ContentChild('footer') templateFooter!: TemplateRef<any>;

  @Output() public readonly eventOnChange = new EventEmitter<DTOPartialTableOptions>();
  @Output() public readonly eventOnLoad = new EventEmitter<DTOPartialTableOptions>();

  private readonly _genericService = inject(GenericService);
  private readonly _localStorage = this._genericService.getDataLocalStorage();
  public _dictionary: DTODictionary | null = null;

  @Input() public _values: any[] = [];
  @Input() public _options: DTOPartialTableOptions = {
    skip: 0,
    take: 5,
    total: 0,
    search: '',
  };

  public _valuesView: any[] = [];

  public readonly _listTake: any[] = [
    { label: '5', value: 5 },
    { label: '10', value: 10 },
    { label: '20', value: 20 },
    { label: '50', value: 50 },
    { label: '100', value: 100 },
    { label: 'Todos', value: -1 },
  ];
  public _listPages: number[] = [];
  public _actualPage: number = 1;
  public _totalPages: number = 0;

  public _signal_htmlView = signal<string>('');

  constructor() {
  }

  async ngOnInit(): Promise<void> {
    await this.loadDictionary();
  }

  ngAfterViewInit(): void {
    //this.eventOnLoad.emit(this._options);
  }

  ngOnDestroy(): void {

  }

  private async loadDictionary(): Promise<void> {
    try {
      var response = await this._genericService.getDictionary<DTODictionary>(`shared/partials/table/${this._localStorage.language}.json`);
      if (!response.confirmation) {
        return;
      }
      this._dictionary = response.data;
    }
    catch (error: any) {
      console.error(error);
    }
  }

  ngOnChanges(simpleChanges: SimpleChanges) {
    const changes = simpleChanges['_values'];
    if (changes) {
      this.loadTable();

      this._listPages = [];
      this._totalPages = this.getTotalPages();
      if (this._actualPage > this._totalPages && this._totalPages > 0) {
        this.changePage(this._totalPages);
      }
      for (let i = 0; i < this._totalPages; i++) {
        this._listPages.push(i + 1);
      }
    }
  }

  private loadTable(): void {
    if (this._options.take < 0) {
      this._valuesView = this._values;
      return;
    }

    this._valuesView = [];

    var count: number = 0;
    for (let i = 0; i < this._values.length; i++) {
      const item = this._values[i];

      if (count >= this._options.skip && this._valuesView.length < this._options.take) {
        this._valuesView.push(item); // Agrega el valor a los resultados
      }
      count++;
      if (this._valuesView.length >= this._options.take) {
        break;
      }
    }
    this.updateResumeHtmlView();
  }

  public selectTake(event: any): void {
    this._options.take = parseInt(event.target.value);
    this.updateResumeHtmlView();
    this.eventOnChange.emit(this._options);
  }

  private getTotalPages(): number {
    if (this._options.take < 0) {
      return 1;
    }
    return Math.ceil(this._values.length / this._options.take);
  }

  public changePage(page: number): void {
    if (page <= 0 || page > this._totalPages) return;
    this._actualPage = page;
    this._options.skip = (page - 1) * this._options.take;
    this.updateResumeHtmlView();
    this.eventOnChange.emit(this._options);
  }

  public search(event: any): void {
    this._options.search = event.target.value;
    this.updateResumeHtmlView();
    this.eventOnChange.emit(this._options);
  }

  private updateResumeHtmlView() {
    if(this._localStorage.language === 'es') {
      this._signal_htmlView.set(`Mostrando ${this._options.skip + 1} al ${this._options.skip + this._valuesView.length} de ${this._options.total} registros`);
    } else {
      this._signal_htmlView.set(`Showing ${this._options.skip + 1} to ${this._options.skip + this._valuesView.length} of ${this._options.total} records`);
    }
  }

  public getKeysOfObject(obj: any): string[] {
    return Object.keys(obj);
  }

}
