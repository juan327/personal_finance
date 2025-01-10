import * as Highcharts from 'highcharts';

export const darkTheme: Highcharts.Options = {
  chart: {
    backgroundColor: 'transparent', // Fondo negro
  },
  title: {
    style: {
      color: '#FFF', // Texto blanco
      fontSize: '16px'
    }
  },
  xAxis: {
    gridLineColor: 'var(--color-black-border)', // Color de líneas de la cuadrícula
    labels: {
      style: {
        color: '#FFF'
      }
    },
    lineColor: 'var(--color-black-border)',
    tickColor: 'var(--color-black-border)'
  },
  yAxis: {
    gridLineColor: 'var(--color-black-border)',
    labels: {
      style: {
        color: '#FFF'
      }
    },
    title: {
      style: {
        color: '#FFF'
      }
    }
  },
  legend: {
    itemStyle: {
      color: '#FFF'
    },
    itemHoverStyle: {
      color: '#CCC'
    }
  },
  tooltip: {
    backgroundColor: 'var(--color-black)', // Fondo semi-transparente
    style: {
      color: '#FFF' // Texto blanco
    }
  },
  plotOptions: {
    series: {
      dataLabels: {
        color: '#FFF'
      },
      marker: {
        lineColor: '#333'
      }
    }
  },
  credits: {
    enabled: false // Elimina el crédito de Highcharts si no es necesario
  }
};
