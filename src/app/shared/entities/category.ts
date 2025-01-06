export interface CategoryEntity {
    categoryId: string;
    name: string;
    type: number; // 1 = Ingresos, 2 = Gastos
    created: Date;
}