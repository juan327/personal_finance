export interface DTOInputdatetimeMonth {
    month: number;
    monthString: string;
    year: number;
    days: DTOInputdatetimeMonthDay[];
}

export interface DTOInputdatetimeMonthDay {
    code: string;
    datetime: Date;
    year: number;
    month: number;
    day: number;
    isActualMonth: boolean;
}

export interface DTOInputdatetimeMonthDatetime {
    code: string;
    datetime: Date;
}