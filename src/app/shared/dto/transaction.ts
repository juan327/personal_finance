export interface DTOTransaction {
    transactionId: string;
    name: string;
    amount: number;
    date: Date;
    description: string;
    categoryId: string;
    categoryName: string;
    categoryType: number;
    created: Date;
}