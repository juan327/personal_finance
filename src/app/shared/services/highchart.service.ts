import { Injectable } from '@angular/core';
import { Chart } from 'highcharts';
import * as Highcharts from 'highcharts';

@Injectable({
    providedIn: 'root',
})

export class HighchartService {
    constructor() { }

    /**
     * Crea un gráfico
     * @param id Id del gráfico
     * @param options Opciones del gráfico
     * @returns Highcharts.Chart
     */
    public buildChart(id: string, options: Highcharts.Options): Highcharts.Chart {
        return Highcharts.chart(id, options);
    }

    /**
     * Actualiza un gráfico
     * @param chart Gráfico a actualizar
     * @param options Opciones del gráfico
     */
    public updateChart(chart: Chart | null, options: Highcharts.Options): void {
        if(chart === null) return;
        chart.update(options);
    }
}
