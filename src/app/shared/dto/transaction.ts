export interface DTOTransaction {
    transactionId: string;
    name: string;
    amount: number;
    amountString: string;
    date: Date;
    description: string;
    categoryId: string;
    categoryName: string;
    categoryType: number;
    created: Date;
}