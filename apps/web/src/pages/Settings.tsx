import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export function SettingsPage() {
  const { data: stats } = useQuery({
    queryKey: ['stats'],
    queryFn: () => api.getSummaryStats(),
  });
  
  return (
    <div className="space-y-6">
      <p className="text-deloitte-gray-600 dark:text-deloitte-gray-400">
        System configuration and settings
      </p>
      
      <div className="bg-white dark:bg-deloitte-gray-800 rounded-xl border border-deloitte-gray-200 dark:border-deloitte-gray-700">
        <div className="p-6 border-b border-deloitte-gray-200 dark:border-deloitte-gray-700">
          <h2 className="text-lg font-semibold">Environment</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex justify-between">
            <span className="text-deloitte-gray-600 dark:text-deloitte-gray-400">Environment</span>
            <span className="font-medium">{stats?.environment || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-deloitte-gray-600 dark:text-deloitte-gray-400">Region</span>
            <span className="font-medium">{stats?.region || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-deloitte-gray-600 dark:text-deloitte-gray-400">Income Cap (Current)</span>
            <span className="font-medium">${stats?.incomeCap?.toLocaleString() || 'N/A'}</span>
          </div>
        </div>
      </div>
      
      <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
        <div className="text-sm text-yellow-800 dark:text-yellow-200">
          Note: Some configuration values may differ from legislative requirements. 
          Run scans to identify discrepancies.
        </div>
      </div>
    </div>
  );
}

