import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: '',
                loadComponent: () => import('./controllers/home/home.component').then(m => m.HomeComponent),
            },
            {
                path: 'home',
                loadComponent: () => import('./controllers/home/home.component').then(m => m.HomeComponent),
            },
            {
                path: 'incomes',
                loadComponent: () => import('./controllers/incomes/incomes.component').then(m => m.IncomesComponent),
            },
            {
                path: 'expenses',
                loadComponent: () => import('./controllers/expenses/expenses.component').then(m => m.ExpensesComponent),
            },
        ]
    },
    {
        path: '**',
        redirectTo: ''
    }
];
