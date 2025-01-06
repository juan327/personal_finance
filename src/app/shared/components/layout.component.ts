import { Component, inject, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-layout',
  imports: [RouterModule],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css',
  standalone: true,
})

export class LayoutComponent implements OnInit {
    constructor() {}

    private readonly _router = inject(Router);
    public readonly _menu = [
      { path: '/home', label: 'Resumen' },
      { path: '/incomes', label: 'Ingresos' },
      { path: '/expenses', label: 'Gastos' },
    ];

    public _selectedMenu = this._menu[0];
    
    ngOnInit(): void {
      this._router.events.subscribe((event) => {
        if (event instanceof NavigationEnd) {
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
}
