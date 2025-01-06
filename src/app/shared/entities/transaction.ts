import { CategoryEntity } from "./category";

export interface TransactionEntity {
    transactionId: string;
    name: string;
    amount: number;
    date: Date;
    description: string;
    categoryId: string;
    category: CategoryEntity;
    created: Date;
}