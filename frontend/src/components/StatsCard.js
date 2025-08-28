import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const StatsCard = ({ title, value, icon: Icon, trend, color, subtitle }) => {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  const getColorClasses = () => {
    switch (color) {
      case 'green':
        return {
          bg: 'bg-green-50',
          icon: 'bg-green-100 text-green-600',
          border: 'border-l-green-500'
        };
      case 'red':
        return {
          bg: 'bg-red-50',
          icon: 'bg-red-100 text-red-600',
          border: 'border-l-red-500'
        };
      case 'blue':
        return {
          bg: 'bg-blue-50',
          icon: 'bg-blue-100 text-blue-600',
          border: 'border-l-blue-500'
        };
      case 'orange':
        return {
          bg: 'bg-orange-50',
          icon: 'bg-orange-100 text-orange-600',
          border: 'border-l-orange-500'
        };
      default:
        return {
          bg: 'bg-gray-50',
          icon: 'bg-gray-100 text-gray-600',
          border: 'border-l-gray-500'
        };
    }
  };

  const colorClasses = getColorClasses();

  return (
    <div className={`stat-card ${colorClasses.border}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
          <div className="flex items-center space-x-2">
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {getTrendIcon()}
          </div>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses.icon}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
