import type { DiscCondition } from '../types/database';

export const formatCondition = (condition: DiscCondition | undefined): string => {
  if (!condition) return 'Unknown';
  return condition.replace('_', ' ').toUpperCase();
};

export const getConditionColor = (condition: DiscCondition | undefined): string => {
  if (!condition) return 'bg-gray-100 text-gray-800';
  
  const colors = {
    new: 'bg-green-100 text-green-800',
    like_new: 'bg-blue-100 text-blue-800',
    good: 'bg-yellow-100 text-yellow-800',
    fair: 'bg-orange-100 text-orange-800',
    poor: 'bg-red-100 text-red-800',
  };
  return colors[condition] || 'bg-gray-100 text-gray-800';
};