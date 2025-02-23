export class DTOPartialTableOptions {
    skip: number;
    take: number;
    total: number;
    search: string;
    constructor() {
        this.skip = 0;
        this.take = 5;
        this.total = 0;
        this.search = '';
    }
}

export interface DTODictionary {
    header: {
        firstPage: string;
        previousPage: string;
        nextPage: string;
        lastPage: string;
        selector: {
            title: string;
            takeAll: string;
        };
    }

}