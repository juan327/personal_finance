import { DatePipe, DecimalPipe } from '@angular/common';
import { inject, Injectable, OnInit } from '@angular/core';
import { Chart } from 'highcharts';
import * as Highcharts from 'highcharts';

@Injectable({
    providedIn: 'root',
})

export class HighchartService {
    constructor() { }

    public buildChart(id: string, options: Highcharts.Options): Highcharts.Chart {
        return Highcharts.chart(id, options);
    }

    public updateChart(chart: Chart | null, options: Highcharts.Options): void {
        if(chart === null) return;
        chart.showLoading();
        setTimeout(() => {
            chart.update(options);
            chart.hideLoading();
        }, 10);
    }
}
