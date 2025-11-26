import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { BookOpen, Plus } from 'lucide-react';
import { api } from '../lib/api';
import clsx from 'clsx';

export function RulesetsPage() {
  const { data: rulesets } = useQuery({
    queryKey: ['rulesets'],
    queryFn: () => api.getRulesets(),
  });
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400';
      case 'draft':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400';
      case 'archived':
        return 'bg-deloitte-gray-100 dark:bg-deloitte-gray-700 text-deloitte-gray-700 dark:text-deloitte-gray-400';
      default:
        return 'bg-deloitte-gray-100 dark:bg-deloitte-gray-700';
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-deloitte-gray-600 dark:text-deloitte-gray-400">
          Manage legislative rulesets and compliance rules
        </p>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-deloitte-green hover:bg-deloitte-green-dark text-white rounded-lg transition-colors">
          <Plus className="w-4 h-4" />
          New Ruleset
        </button>
      </div>
      
      <div className="bg-white dark:bg-deloitte-gray-800 rounded-xl border border-deloitte-gray-200 dark:border-deloitte-gray-700">
        <div className="p-6 border-b border-deloitte-gray-200 dark:border-deloitte-gray-700">
          <h2 className="text-lg font-semibold">Rulesets</h2>
        </div>
        <div className="divide-y divide-deloitte-gray-200 dark:divide-deloitte-gray-700">
          {rulesets && rulesets.length > 0 ? (
            rulesets.map((ruleset: any) => (
              <Link
                key={ruleset.id}
                to={`/rulesets/${ruleset.id}`}
                className="block p-6 hover:bg-deloitte-gray-50 dark:hover:bg-deloitte-gray-750 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-deloitte-green/10 rounded-lg">
                      <BookOpen className="w-6 h-6 text-deloitte-green" />
                    </div>
                    <div>
                      <div className="font-medium">{ruleset.name}</div>
                      <div className="text-sm text-deloitte-gray-600 dark:text-deloitte-gray-400 mt-1">
                        Version {ruleset.version} • {ruleset.rules?.length || 0} rules • Source: {ruleset.source}
                      </div>
                    </div>
                  </div>
                  <span className={clsx('px-3 py-1 rounded-full text-sm capitalize', getStatusColor(ruleset.status))}>
                    {ruleset.status}
                  </span>
                </div>
              </Link>
            ))
          ) : (
            <div className="p-12 text-center text-deloitte-gray-500 dark:text-deloitte-gray-400">
              No rulesets yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

