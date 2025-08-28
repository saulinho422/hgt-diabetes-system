import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const InsulinChart = () => {
  // Dados de exemplo baseados na planilha
  const data = {
    labels: ['21/08', '22/08', '23/08', '24/08', '25/08', '26/08', '27/08'],
    datasets: [
      {
        label: 'Café da Manhã',
        data: [1, 2, 2, 2, 1, 1, 2],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
        borderRadius: 4,
      },
      {
        label: 'Almoço',
        data: [1, 1, 2, 1, 1, 2, 1],
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 1,
        borderRadius: 4,
      },
      {
        label: 'Jantar',
        data: [1, 2, 3, 2, 2, 2, 2],
        backgroundColor: 'rgba(245, 158, 11, 0.8)',
        borderColor: 'rgb(245, 158, 11)',
        borderWidth: 1,
        borderRadius: 4,
      },
      {
        label: 'Ao Deitar',
        data: [0, 2, 2, 0, 0, 0, 1],
        backgroundColor: 'rgba(139, 92, 246, 0.8)',
        borderColor: 'rgb(139, 92, 246)',
        borderWidth: 1,
        borderRadius: 4,
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
            return context.dataset.label + ': ' + context.parsed.y + ' unidades';
          },
          footer: function(tooltipItems) {
            let total = 0;
            tooltipItems.forEach(function(tooltipItem) {
              total += tooltipItem.parsed.y;
            });
            return 'Total do dia: ' + total + ' unidades';
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
        },
        stacked: true,
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Insulina (unidades)',
          font: {
            size: 12,
            weight: '600'
          }
        },
        min: 0,
        max: 12,
        grid: {
          color: 'rgba(156, 163, 175, 0.2)'
        },
        ticks: {
          callback: function(value) {
            return value + ' u';
          }
        },
        stacked: true,
      },
    },
    elements: {
      bar: {
        borderWidth: 1
      }
    }
  };

  return (
    <div className="chart-responsive">
      <Bar data={data} options={options} />
    </div>
  );
};

export default InsulinChart;
