export interface DTOResponseApi {
    message: string;
    exception?: string;
    confirmation: boolean;
}

export interface DTOResponseApiWithData<T> extends DTOResponseApi {
    data: T;
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
}