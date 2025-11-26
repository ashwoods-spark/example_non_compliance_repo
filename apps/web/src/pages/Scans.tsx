import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter } from 'lucide-react';
import { api } from '../lib/api';
import clsx from 'clsx';

export function ScansPage() {
  const [repoUrl, setRepoUrl] = useState('');
  const [branch, setBranch] = useState('main');
  const [creating, setCreating] = useState(false);
  
  const { data: scans, refetch } = useQuery({
    queryKey: ['scans'],
    queryFn: () => api.getScans(),
  });
  
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    
    try {
      await api.createScan(repoUrl, branch);
      setRepoUrl('');
      setBranch('main');
      refetch();
    } catch (err) {
      console.error('Failed to create scan:', err);
    } finally {
      setCreating(false);
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400';
      case 'running':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400';
      case 'failed':
        return 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400';
      default:
        return 'bg-deloitte-gray-100 dark:bg-deloitte-gray-700 text-deloitte-gray-700 dark:text-deloitte-gray-400';
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Create new scan */}
      <div className="bg-white dark:bg-deloitte-gray-800 rounded-xl border border-deloitte-gray-200 dark:border-deloitte-gray-700 p-6">
        <h2 className="text-lg font-semibold mb-4">Create New Scan</h2>
        <form onSubmit={handleCreate} className="flex gap-4">
          <input
            type="url"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            placeholder="Repository URL"
            className="flex-1 px-4 py-2 border border-deloitte-gray-300 dark:border-deloitte-gray-600 rounded-lg focus:ring-2 focus:ring-deloitte-green focus:border-transparent dark:bg-deloitte-gray-700"
            required
          />
          <input
            type="text"
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            placeholder="Branch"
            className="w-32 px-4 py-2 border border-deloitte-gray-300 dark:border-deloitte-gray-600 rounded-lg focus:ring-2 focus:ring-deloitte-green focus:border-transparent dark:bg-deloitte-gray-700"
          />
          <button
            type="submit"
            disabled={creating}
            className="inline-flex items-center gap-2 px-6 py-2 bg-deloitte-green hover:bg-deloitte-green-dark text-white rounded-lg transition-colors disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            Create Scan
          </button>
        </form>
      </div>
      
      {/* Scans list */}
      <div className="bg-white dark:bg-deloitte-gray-800 rounded-xl border border-deloitte-gray-200 dark:border-deloitte-gray-700">
        <div className="p-6 border-b border-deloitte-gray-200 dark:border-deloitte-gray-700">
          <h2 className="text-lg font-semibold">All Scans</h2>
        </div>
        <div className="divide-y divide-deloitte-gray-200 dark:divide-deloitte-gray-700">
          {scans && scans.length > 0 ? (
            scans.map((scan: any) => (
              <Link
                key={scan.id}
                to={`/scans/${scan.id}`}
                className="block p-6 hover:bg-deloitte-gray-50 dark:hover:bg-deloitte-gray-750 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium">{scan.repoUrl}</div>
                    <div className="text-sm text-deloitte-gray-600 dark:text-deloitte-gray-400 mt-1">
                      Branch: {scan.branch} • Created: {new Date(scan.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {scan.coveragePct && (
                      <div className="text-sm text-deloitte-gray-600 dark:text-deloitte-gray-400">
                        {scan.coveragePct}% coverage
                      </div>
                    )}
                    <span className={clsx('px-3 py-1 rounded-full text-sm capitalize', getStatusColor(scan.status))}>
                      {scan.status}
                    </span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="p-12 text-center text-deloitte-gray-500 dark:text-deloitte-gray-400">
              No scans yet. Create your first scan above.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

