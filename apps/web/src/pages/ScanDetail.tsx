import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { AlertTriangle, FileText, Download, Clock, ArrowLeft } from 'lucide-react';
import { api } from '../lib/api';
import clsx from 'clsx';

const severityColors = {
  critical: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
  high: 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800',
  medium: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
  low: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
  info: 'bg-deloitte-gray-100 dark:bg-deloitte-gray-700 text-deloitte-gray-700 dark:text-deloitte-gray-400 border-deloitte-gray-200 dark:border-deloitte-gray-600',
};

export function ScanDetailPage() {
  const { id } = useParams<{ id: string }>();
  
  const { data: scan, isLoading } = useQuery({
    queryKey: ['scan', id],
    queryFn: () => api.getScan(id!),
    enabled: !!id,
  });
  
  const { data: heatmap } = useQuery({
    queryKey: ['heatmap', id],
    queryFn: () => api.getScanHeatmap(id!),
    enabled: !!id,
  });
  
  const handleExport = async (format: string) => {
    if (!id) return;
    const result = await api.exportReport(id, format);
    window.open(result.url, '_blank');
  };
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  if (!scan) {
    return <div>Scan not found</div>;
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          to="/scans"
          className="p-2 hover:bg-deloitte-gray-100 dark:hover:bg-deloitte-gray-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{scan.repoUrl}</h1>
          <p className="text-deloitte-gray-600 dark:text-deloitte-gray-400">
            Branch: {scan.branch}
          </p>
        </div>
      </div>
      
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-deloitte-gray-800 p-4 rounded-xl border border-deloitte-gray-200 dark:border-deloitte-gray-700">
          <div className="text-sm text-deloitte-gray-600 dark:text-deloitte-gray-400">Status</div>
          <div className="text-xl font-semibold mt-1 capitalize">{scan.status}</div>
        </div>
        <div className="bg-white dark:bg-deloitte-gray-800 p-4 rounded-xl border border-deloitte-gray-200 dark:border-deloitte-gray-700">
          <div className="text-sm text-deloitte-gray-600 dark:text-deloitte-gray-400">Coverage</div>
          <div className="text-xl font-semibold mt-1">{scan.coveragePct ? `${scan.coveragePct}%` : 'N/A'}</div>
        </div>
        <div className="bg-white dark:bg-deloitte-gray-800 p-4 rounded-xl border border-deloitte-gray-200 dark:border-deloitte-gray-700">
          <div className="text-sm text-deloitte-gray-600 dark:text-deloitte-gray-400">Findings</div>
          <div className="text-xl font-semibold mt-1">{scan.findings?.length || 0}</div>
        </div>
        <div className="bg-white dark:bg-deloitte-gray-800 p-4 rounded-xl border border-deloitte-gray-200 dark:border-deloitte-gray-700">
          <div className="text-sm text-deloitte-gray-600 dark:text-deloitte-gray-400">Duration</div>
          <div className="text-xl font-semibold mt-1">
            {scan.finishedAt && scan.startedAt
              ? `${Math.round((new Date(scan.finishedAt).getTime() - new Date(scan.startedAt).getTime()) / 1000 / 60)}m`
              : 'N/A'}
          </div>
        </div>
      </div>
      
      {/* IMPLICIT MISMATCH in UI copy - tooltip mentions 12 months */}
      <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-medium text-blue-900 dark:text-blue-100">
              Scan Information
            </div>
            <div className="text-sm text-blue-800 dark:text-blue-200 mt-1">
              This scan checks compliance with SSA1991. Key requirements include residency of 12 months
              and income thresholds. See findings below for details.
            </div>
          </div>
        </div>
      </div>
      
      {/* Export actions */}
      <div className="flex gap-2">
        <button
          onClick={() => handleExport('json')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-deloitte-green hover:bg-deloitte-green-dark text-white rounded-lg transition-colors"
        >
          <Download className="w-4 h-4" />
          Export JSON
        </button>
        <button
          onClick={() => handleExport('csv')}
          className="inline-flex items-center gap-2 px-4 py-2 border border-deloitte-gray-300 dark:border-deloitte-gray-600 hover:bg-deloitte-gray-50 dark:hover:bg-deloitte-gray-800 rounded-lg transition-colors"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>
      
      {/* Heatmap */}
      {heatmap && heatmap.length > 0 && (
        <div className="bg-white dark:bg-deloitte-gray-800 rounded-xl border border-deloitte-gray-200 dark:border-deloitte-gray-700">
          <div className="p-6 border-b border-deloitte-gray-200 dark:border-deloitte-gray-700">
            <h2 className="text-lg font-semibold">File Heatmap</h2>
          </div>
          <div className="p-6 space-y-2">
            {heatmap.map((item: any) => (
              <div
                key={item.file}
                className="flex items-center justify-between p-3 rounded-lg border border-deloitte-gray-200 dark:border-deloitte-gray-700"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-deloitte-gray-400" />
                  <span className="text-sm font-mono">{item.file}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-deloitte-gray-600 dark:text-deloitte-gray-400">
                    {item.findingCount} {item.findingCount === 1 ? 'finding' : 'findings'}
                  </span>
                  <span className={clsx('px-2 py-1 rounded text-xs font-medium capitalize', severityColors[item.severity as keyof typeof severityColors])}>
                    {item.severity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Findings */}
      <div className="bg-white dark:bg-deloitte-gray-800 rounded-xl border border-deloitte-gray-200 dark:border-deloitte-gray-700">
        <div className="p-6 border-b border-deloitte-gray-200 dark:border-deloitte-gray-700">
          <h2 className="text-lg font-semibold">Findings</h2>
        </div>
        <div className="divide-y divide-deloitte-gray-200 dark:divide-deloitte-gray-700">
          {scan.findings && scan.findings.length > 0 ? (
            scan.findings.map((finding: any) => (
              <Link
                key={finding.id}
                to={`/findings/${finding.id}`}
                className="block p-6 hover:bg-deloitte-gray-50 dark:hover:bg-deloitte-gray-750 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={clsx('px-2 py-1 rounded text-xs font-medium capitalize', severityColors[finding.severity as keyof typeof severityColors])}>
                        {finding.severity}
                      </span>
                      <span className="text-sm text-deloitte-gray-600 dark:text-deloitte-gray-400">
                        {finding.lawSection}
                      </span>
                    </div>
                    <div className="font-medium mb-1">{finding.filePath}</div>
                    <p className="text-sm text-deloitte-gray-600 dark:text-deloitte-gray-400 line-clamp-2">
                      {finding.rationale}
                    </p>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="p-6 text-center text-deloitte-gray-500 dark:text-deloitte-gray-400">
              {scan.status === 'completed' ? 'No findings' : 'Scan in progress...'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

