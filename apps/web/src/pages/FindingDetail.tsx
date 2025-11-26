import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, FileCode, GitBranch } from 'lucide-react';
import { api } from '../lib/api';
import clsx from 'clsx';

const severityColors = {
  critical: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
  high: 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800',
  medium: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
  low: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
  info: 'bg-deloitte-gray-100 dark:bg-deloitte-gray-700 text-deloitte-gray-700 dark:text-deloitte-gray-400 border-deloitte-gray-200 dark:border-deloitte-gray-600',
};

export function FindingDetailPage() {
  const { id } = useParams<{ id: string }>();
  
  const { data: finding, isLoading } = useQuery({
    queryKey: ['finding', id],
    queryFn: () => api.getFinding(id!),
    enabled: !!id,
  });
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  if (!finding) {
    return <div>Finding not found</div>;
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          to={`/scans/${finding.scanId}`}
          className="p-2 hover:bg-deloitte-gray-100 dark:hover:bg-deloitte-gray-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Finding Details</h1>
          <p className="text-deloitte-gray-600 dark:text-deloitte-gray-400">
            {finding.lawSection}
          </p>
        </div>
      </div>
      
      {/* Severity badge */}
      <div>
        <span className={clsx('inline-block px-4 py-2 rounded-lg text-sm font-medium capitalize', severityColors[finding.severity as keyof typeof severityColors])}>
          {finding.severity} Severity • {finding.confidence}% Confidence
        </span>
      </div>
      
      {/* Law excerpt */}
      <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Legislative Requirement
            </div>
            <p className="text-blue-800 dark:text-blue-200">
              {finding.lawExcerpt}
            </p>
          </div>
        </div>
      </div>
      
      {/* Code location */}
      <div className="bg-white dark:bg-deloitte-gray-800 rounded-xl border border-deloitte-gray-200 dark:border-deloitte-gray-700 p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FileCode className="w-5 h-5" />
          Code Location
        </h2>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-deloitte-gray-600 dark:text-deloitte-gray-400">File:</span>
            <code className="px-2 py-1 bg-deloitte-gray-100 dark:bg-deloitte-gray-700 rounded font-mono">
              {finding.filePath}
            </code>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-deloitte-gray-600 dark:text-deloitte-gray-400">Lines:</span>
            <code className="px-2 py-1 bg-deloitte-gray-100 dark:bg-deloitte-gray-700 rounded font-mono">
              {finding.lineStart}-{finding.lineEnd}
            </code>
          </div>
        </div>
      </div>
      
      {/* Rationale */}
      <div className="bg-white dark:bg-deloitte-gray-800 rounded-xl border border-deloitte-gray-200 dark:border-deloitte-gray-700 p-6">
        <h2 className="text-lg font-semibold mb-4">Rationale</h2>
        <p className="text-deloitte-gray-700 dark:text-deloitte-gray-300 leading-relaxed">
          {finding.rationale}
        </p>
      </div>
      
      {/* Recommendation */}
      <div className="bg-deloitte-green/5 border border-deloitte-green/20 rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4 text-deloitte-green">Recommendation</h2>
        <p className="text-deloitte-gray-700 dark:text-deloitte-gray-300 leading-relaxed">
          {finding.recommendation}
        </p>
      </div>
      
      {/* Mock action */}
      <div className="flex gap-3">
        <button className="px-6 py-3 bg-deloitte-green hover:bg-deloitte-green-dark text-white rounded-lg transition-colors">
          Propose Fix (PR)
        </button>
        <button className="px-6 py-3 border border-deloitte-gray-300 dark:border-deloitte-gray-600 hover:bg-deloitte-gray-50 dark:hover:bg-deloitte-gray-800 rounded-lg transition-colors">
          Mark as False Positive
        </button>
      </div>
    </div>
  );
}

