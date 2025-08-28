import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const GlucoseChart = () => {
  // Dados de exemplo baseados na planilha
  const data = {
    labels: ['21/08', '22/08', '23/08', '24/08', '25/08', '26/08', '27/08'],
    datasets: [
      {
        label: 'Café da Manhã',
        data: [77, 102, 106, 113, 84, 74, 142],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.3,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
      },
      {
        label: 'Almoço',
        data: [79, 96, 103, 78, 78, 121, 78],
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.3,
        pointBackgroundColor: 'rgb(16, 185, 129)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
      },
      {
        label: 'Jantar',
        data: [95, 116, 189, 108, 114, 130, 113],
        borderColor: 'rgb(245, 158, 11)',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        tension: 0.3,
        pointBackgroundColor: 'rgb(245, 158, 11)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
      },
      {
        label: 'Ao Deitar',
        data: [null, 113, 103, null, null, null, 92],
        borderColor: 'rgb(139, 92, 246)',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        tension: 0.3,
        pointBackgroundColor: 'rgb(139, 92, 246)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        spanGaps: true,
      }
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: '500'
          }
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#374151',
        bodyColor: '#374151',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context) {
            return context.dataset.label + ': ' + context.parsed.y + ' mg/dL';
          }
        }
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Data',
          font: {
            size: 12,
            weight: '600'
          }
        },
        grid: {
          display: false
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Glicemia (mg/dL)',
          font: {
            size: 12,
            weight: '600'
          }
        },
        min: 50,
        max: 300,
        grid: {
          color: 'rgba(156, 163, 175, 0.2)'
        },
        ticks: {
          callback: function(value) {
            return value + ' mg/dL';
          }
        }
      },
    },
    elements: {
      line: {
        borderWidth: 3
      },
      point: {
        hoverRadius: 8
      }
    },
    // Linhas de referência para valores normais
    annotation: {
      annotations: {
        normalMin: {
          type: 'line',
          yMin: 70,
          yMax: 70,
          borderColor: 'rgba(34, 197, 94, 0.5)',
          borderWidth: 2,
          borderDash: [5, 5],
          label: {
            content: 'Min Normal (70)',
            enabled: true,
            position: 'end'
          }
        },
        normalMax: {
          type: 'line',
          yMin: 180,
          yMax: 180,
          borderColor: 'rgba(239, 68, 68, 0.5)',
          borderWidth: 2,
          borderDash: [5, 5],
          label: {
            content: 'Max Normal (180)',
            enabled: true,
            position: 'end'
          }
        }
      }
    }
  };

  return (
    <div className="chart-responsive">
      <Line data={data} options={options} />
    </div>
  );
};

export default GlucoseChart;
