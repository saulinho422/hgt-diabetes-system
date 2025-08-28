import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const TimeInRangeChart = () => {
  const data = {
    labels: [
      'Abaixo do Alvo (< 70 mg/dL)',
      'No Alvo (70-180 mg/dL)', 
      'Acima do Alvo (181-250 mg/dL)',
      'Muito Alto (> 250 mg/dL)'
    ],
    datasets: [
      {
        label: 'Tempo em Range',
        data: [4, 78, 16, 2],
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',    // Vermelho para baixo
          'rgba(34, 197, 94, 0.8)',    // Verde para alvo
          'rgba(245, 158, 11, 0.8)',   // Laranja para alto
          'rgba(220, 38, 127, 0.8)',   // Rosa para muito alto
        ],
        borderColor: [
          'rgb(239, 68, 68)',
          'rgb(34, 197, 94)',
          'rgb(245, 158, 11)',
          'rgb(220, 38, 127)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 11,
            weight: '500'
          },
          generateLabels: function(chart) {
            const original = ChartJS.defaults.plugins.legend.labels.generateLabels;
            const labels = original.call(this, chart);
            
            labels.forEach((label, index) => {
              const value = chart.data.datasets[0].data[index];
              label.text = `${label.text}: ${value}%`;
            });
            
            return labels;
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#374151',
        bodyColor: '#374151',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed;
            return `${label}: ${value}% do tempo`;
          }
        }
      },
    },
    cutout: '60%',
    elements: {
      arc: {
        borderWidth: 2,
      }
    }
  };

  const centerText = {
    id: 'centerText',
    beforeDraw: function(chart) {
      const { ctx, width, height } = chart;
      const targetPercentage = data.datasets[0].data[1]; // Tempo no alvo
      
      ctx.save();
      ctx.font = 'bold 24px Arial';
      ctx.fillStyle = '#22c55e';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const centerX = width / 2;
      const centerY = height / 2;
      
      ctx.fillText(`${targetPercentage}%`, centerX, centerY - 10);
      
      ctx.font = '12px Arial';
      ctx.fillStyle = '#6b7280';
      ctx.fillText('Tempo no Alvo', centerX, centerY + 15);
      
      ctx.restore();
    }
  };

  return (
    <div className="space-y-4">
      <div className="chart-responsive h-80">
        <Doughnut data={data} options={options} plugins={[centerText]} />
      </div>
      
      {/* Métricas Adicionais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-3 bg-red-50 rounded-lg">
          <div className="text-lg font-bold text-red-700">4%</div>
          <div className="text-xs text-red-600">Hipoglicemia</div>
        </div>
        
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-lg font-bold text-green-700">78%</div>
          <div className="text-xs text-green-600">No Alvo</div>
        </div>
        
        <div className="text-center p-3 bg-orange-50 rounded-lg">
          <div className="text-lg font-bold text-orange-700">16%</div>
          <div className="text-xs text-orange-600">Hiperglicemia</div>
        </div>
        
        <div className="text-center p-3 bg-pink-50 rounded-lg">
          <div className="text-lg font-bold text-pink-700">2%</div>
          <div className="text-xs text-pink-600">Muito Alto</div>
        </div>
      </div>
      
      {/* Comparação com Metas */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold text-gray-800 mb-3">Comparação com Metas Clínicas</h4>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Tempo no Alvo (Meta: {'>'} 70%)</span>
            <div className="flex items-center space-x-2">
              <div className="w-20 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: '78%' }}
                ></div>
              </div>
              <span className="text-sm font-medium text-green-600">✓ 78%</span>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Hipoglicemia (Meta: {'<'} 4%)</span>
            <div className="flex items-center space-x-2">
              <div className="w-20 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-red-500 h-2 rounded-full" 
                  style={{ width: '4%' }}
                ></div>
              </div>
              <span className="text-sm font-medium text-green-600">✓ 4%</span>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Hiperglicemia (Meta: {'<'} 25%)</span>
            <div className="flex items-center space-x-2">
              <div className="w-20 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-orange-500 h-2 rounded-full" 
                  style={{ width: '18%' }}
                ></div>
              </div>
              <span className="text-sm font-medium text-green-600">✓ 18%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeInRangeChart;
