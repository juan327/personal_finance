import { Component, inject, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { GenericService } from '../services/generic.service';
import { DTODictionary } from './dto/layout';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-layout',
  imports: [RouterModule],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css',
  standalone: true,
})

export class LayoutComponent implements OnInit {

  private readonly _titleService: Title = inject(Title);
  private readonly _genericService = inject(GenericService);
  private readonly _localStorage = this._genericService.getDataLocalStorage();
  public _dictionary: DTODictionary | null = null;
  constructor() { }

  private readonly _router = inject(Router);
  public _menu: {
    path: string;
    label: string;
    icon: string;
  }[] = [];

  public _selectedMenu = this._menu[0];

  async ngOnInit(): Promise<void> {
      
    this._router.events.subscribe(async (event) => {
      if (event instanceof NavigationEnd) {
        await this.loadDictionary();
        const findObj = this._menu.find((item) => item.path === event.url);
        if (findObj !== undefined) {
          this._selectedMenu = findObj;
        }
      }
    });
  }

  ngAfterViewInit(): void {

  }

  ngAfterContentInit(): void {
  }

  ngOnDestroy(): void {

  }

  private async loadDictionary(): Promise<void> {
    try {
      var response = await this._genericService.getDictionary<DTODictionary>(`shared/components/${this._localStorage.language}.json`);
      if (!response.confirmation) {
        return;
      }
      this._dictionary = response.data;
      this._titleService.setTitle(this._dictionary.title);
      this._menu = [
        { path: '/', label: this._dictionary.menu.home, icon: 'pi pi-home' },
        { path: '/incomes', label: this._dictionary.menu.incomes, icon: 'pi pi-money-bill' },
        { path: '/expenses', label: this._dictionary.menu.expenses, icon: 'pi pi-receipt' },
        { path: '/configuration', label: this._dictionary.menu.configuration, icon: 'pi pi-cog' },
      ];
    }
    catch (error: any) {
      console.error(error);
    }
  }
}
