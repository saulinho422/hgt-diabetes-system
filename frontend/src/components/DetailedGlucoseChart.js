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

const DetailedGlucoseChart = ({ period }) => {
  // Dados mais detalhados baseados no período
  const generateData = () => {
    const days = period === 'last7days' ? 7 : period === 'last30days' ? 30 : 90;
    const labels = [];
    const cafeData = [];
    const almocoData = [];
    const jantarData = [];
    const deitarData = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      labels.push(date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }));
      
      // Simular dados com variações realistas
      cafeData.push(Math.random() * 60 + 80); // 80-140
      almocoData.push(Math.random() * 80 + 100); // 100-180
      jantarData.push(Math.random() * 70 + 90); // 90-160
      deitarData.push(Math.random() * 50 + 80); // 80-130
    }

    return { labels, cafeData, almocoData, jantarData, deitarData };
  };

  const { labels, cafeData, almocoData, jantarData, deitarData } = generateData();

  const data = {
    labels,
    datasets: [
      {
        label: 'Café da Manhã',
        data: cafeData,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.3,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        fill: false,
      },
      {
        label: 'Almoço',
        data: almocoData,
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.3,
        pointBackgroundColor: 'rgb(16, 185, 129)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        fill: false,
      },
      {
        label: 'Jantar',
        data: jantarData,
        borderColor: 'rgb(245, 158, 11)',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        tension: 0.3,
        pointBackgroundColor: 'rgb(245, 158, 11)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        fill: false,
      },
      {
        label: 'Ao Deitar',
        data: deitarData,
        borderColor: 'rgb(139, 92, 246)',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        tension: 0.3,
        pointBackgroundColor: 'rgb(139, 92, 246)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        fill: false,
      },
      // Zona de alvo
      {
        label: 'Zona Alvo Superior',
        data: new Array(labels.length).fill(180),
        borderColor: 'rgba(239, 68, 68, 0.6)',
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 0,
        fill: false,
        tension: 0,
      },
      {
        label: 'Zona Alvo Inferior',
        data: new Array(labels.length).fill(70),
        borderColor: 'rgba(34, 197, 94, 0.6)',
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 0,
        fill: '+1',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0,
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
          },
          filter: function(item) {
            // Não mostrar as linhas de zona na legenda
            return !item.text.includes('Zona');
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
            if (context.dataset.label.includes('Zona')) return null;
            return context.dataset.label + ': ' + context.parsed.y.toFixed(0) + ' mg/dL';
          },
          afterBody: function(tooltipItems) {
            const glucose = tooltipItems[0]?.parsed?.y;
            if (!glucose) return [];
            
            if (glucose < 70) return ['⚠️ Hipoglicemia'];
            if (glucose > 180) return ['⚠️ Hiperglicemia'];
            if (glucose > 300) return ['🚨 Glicemia Crítica'];
            return ['✅ Dentro do alvo'];
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
    }
  };

  return (
    <div className="chart-responsive h-96">
      <Line data={data} options={options} />
    </div>
  );
};

export default DetailedGlucoseChart;
