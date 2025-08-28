import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const InsulinEffectivenessChart = ({ period }) => {
  // Dados de eficácia da insulina
  const data = {
    labels: ['Sem', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
    datasets: [
      {
        type: 'bar',
        label: 'Insulina Aplicada (unidades)',
        data: [28, 32, 26, 30, 28, 24, 26],
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
        yAxisID: 'y',
      },
      {
        type: 'line',
        label: 'Glicemia Média (mg/dL)',
        data: [145, 132, 158, 142, 148, 165, 152],
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.3,
        yAxisID: 'y1',
        pointBackgroundColor: 'rgb(239, 68, 68)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
      },
      {
        type: 'line',
        label: 'Eficácia (%)',
        data: [82, 88, 75, 85, 80, 72, 78],
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.3,
        yAxisID: 'y2',
        pointBackgroundColor: 'rgb(16, 185, 129)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
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
            let label = context.dataset.label || '';
            if (label.includes('Insulina')) {
              return label + ': ' + context.parsed.y + ' u';
            } else if (label.includes('Glicemia')) {
              return label + ': ' + context.parsed.y + ' mg/dL';
            } else if (label.includes('Eficácia')) {
              return label + ': ' + context.parsed.y + '%';
            }
            return label + ': ' + context.parsed.y;
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
          text: 'Dia da Semana',
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
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Insulina (unidades)',
          font: {
            size: 12,
            weight: '600'
          },
          color: 'rgb(59, 130, 246)'
        },
        grid: {
          color: 'rgba(156, 163, 175, 0.2)'
        },
        ticks: {
          color: 'rgb(59, 130, 246)'
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Glicemia (mg/dL)',
          font: {
            size: 12,
            weight: '600'
          },
          color: 'rgb(239, 68, 68)'
        },
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          color: 'rgb(239, 68, 68)'
        }
      },
      y2: {
        type: 'linear',
        display: false,
        min: 0,
        max: 100,
      }
    },
  };

  return (
    <div className="space-y-4">
      <div className="chart-responsive h-80">
        <Chart data={data} options={options} />
      </div>
      
      {/* Análise de Correlação */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">Correlação Insulina-Glicemia</h4>
          <div className="text-2xl font-bold text-blue-700 mb-1">-0.65</div>
          <div className="text-sm text-blue-600">Correlação negativa moderada</div>
        </div>
        
        <div className="p-4 bg-green-50 rounded-lg">
          <h4 className="font-semibold text-green-800 mb-2">Dose Mais Eficaz</h4>
          <div className="text-2xl font-bold text-green-700 mb-1">28-30u</div>
          <div className="text-sm text-green-600">Range ótimo identificado</div>
        </div>
        
        <div className="p-4 bg-orange-50 rounded-lg">
          <h4 className="font-semibold text-orange-800 mb-2">Oportunidade</h4>
          <div className="text-2xl font-bold text-orange-700 mb-1">Fins de Semana</div>
          <div className="text-sm text-orange-600">Ajustar doses para maior eficácia</div>
        </div>
      </div>
    </div>
  );
};

export default InsulinEffectivenessChart;
