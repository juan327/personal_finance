export class DTOResponse {
    message: string;
    exception: string;
    confirmation: boolean;

    constructor() {
        this.message = '';
        this.exception = '';
        this.confirmation = false;
    }
}

export class DTOResponseWithData<T> extends DTOResponse {
    data: T;

    constructor() {
        super();
        this.data = null as T;
    }
}

export interface DTOHighchartSeries<T> {
    id?: string;
    color: string;
    name: string;
    data: T[];
}

export interface DTOResponseListPagination<T> {
    items: T[];
    total: number;
}

export interface DTOLocalStorage {
    currency: string;
    language: string;
    minutesOfDifferenceTimeZone: number;
}