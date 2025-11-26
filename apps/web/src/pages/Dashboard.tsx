import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Scan, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { api } from '../lib/api';

export function DashboardPage() {
  const { data: stats } = useQuery({
    queryKey: ['stats'],
    queryFn: () => api.getSummaryStats(),
  });
  
  const { data: scans } = useQuery({
    queryKey: ['scans'],
    queryFn: () => api.getScans(),
  });
  
  const recentScans = scans?.slice(0, 5) || [];
  
  return (
    <div className="space-y-8">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-deloitte-gray-800 p-6 rounded-xl border border-deloitte-gray-200 dark:border-deloitte-gray-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-deloitte-green/10 rounded-lg">
              <Scan className="w-6 h-6 text-deloitte-green" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats?.totalScans || 0}</div>
              <div className="text-sm text-deloitte-gray-600 dark:text-deloitte-gray-400">
                Total Scans
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-deloitte-gray-800 p-6 rounded-xl border border-deloitte-gray-200 dark:border-deloitte-gray-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats?.totalFindings || 0}</div>
              <div className="text-sm text-deloitte-gray-600 dark:text-deloitte-gray-400">
                Total Findings
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-deloitte-gray-800 p-6 rounded-xl border border-deloitte-gray-200 dark:border-deloitte-gray-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats?.completedScans || 0}</div>
              <div className="text-sm text-deloitte-gray-600 dark:text-deloitte-gray-400">
                Completed
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Environment info with IMPLICIT mismatch shown (not called out) */}
      <div className="bg-deloitte-green/10 border border-deloitte-green/20 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-deloitte-green flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-medium text-deloitte-green">Environment: {stats?.environment}</div>
            <div className="text-sm text-deloitte-gray-700 dark:text-deloitte-gray-300 mt-1">
              Region: {stats?.region} | Current Income Cap: ${stats?.incomeCap?.toLocaleString() || 'N/A'}
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent scans */}
      <div className="bg-white dark:bg-deloitte-gray-800 rounded-xl border border-deloitte-gray-200 dark:border-deloitte-gray-700">
        <div className="p-6 border-b border-deloitte-gray-200 dark:border-deloitte-gray-700">
          <h2 className="text-lg font-semibold">Recent Scans</h2>
        </div>
        <div className="divide-y divide-deloitte-gray-200 dark:divide-deloitte-gray-700">
          {recentScans.map((scan: any) => (
            <Link
              key={scan.id}
              to={`/scans/${scan.id}`}
              className="block p-6 hover:bg-deloitte-gray-50 dark:hover:bg-deloitte-gray-750 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{scan.repoUrl}</div>
                  <div className="text-sm text-deloitte-gray-600 dark:text-deloitte-gray-400 mt-1">
                    Branch: {scan.branch}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {scan.status === 'completed' && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400">
                      <CheckCircle className="w-4 h-4" />
                      Completed
                    </span>
                  )}
                  {scan.status === 'running' && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400">
                      <Clock className="w-4 h-4 animate-spin" />
                      Running
                    </span>
                  )}
                  {scan.status === 'queued' && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-deloitte-gray-100 dark:bg-deloitte-gray-700 text-deloitte-gray-700 dark:text-deloitte-gray-400">
                      <Clock className="w-4 h-4" />
                      Queued
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

