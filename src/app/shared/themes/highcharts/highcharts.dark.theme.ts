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
    gridLineColor: '#333', // Color de líneas de la cuadrícula
    labels: {
      style: {
        color: '#FFF'
      }
    },
    lineColor: '#333',
    tickColor: '#333'
  },
  yAxis: {
    gridLineColor: '#333',
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
    backgroundColor: 'rgba(0, 0, 0, 0.8)', // Fondo semi-transparente
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
