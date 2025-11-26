import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Scan, 
  Upload, 
  BookOpen, 
  Settings, 
  LogOut 
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { useAuthStore } from '../store';
import clsx from 'clsx';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Scans', href: '/scans', icon: Scan },
  { name: 'Rulesets', href: '/rulesets', icon: BookOpen },
  { name: 'Uploads', href: '/uploads', icon: Upload },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { displayName, clearAuth } = useAuthStore();
  
  const handleLogout = () => {
    clearAuth();
    window.location.href = '/login';
  };
  
  return (
    <div className="min-h-screen bg-white dark:bg-deloitte-gray-900 text-deloitte-black dark:text-white">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-deloitte-black dark:bg-deloitte-gray-950 text-white">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-deloitte-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-deloitte-green rounded-lg flex items-center justify-center font-bold">
                AU
              </div>
              <div>
                <div className="font-semibold">Benefits Platform</div>
                <div className="text-xs text-deloitte-gray-400">Legacy Demo</div>
              </div>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href || 
                (item.href !== '/' && location.pathname.startsWith(item.href));
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={clsx(
                    'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                    isActive
                      ? 'bg-deloitte-green text-white'
                      : 'text-deloitte-gray-300 hover:bg-deloitte-gray-800'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
          
          {/* User */}
          <div className="p-4 border-t border-deloitte-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-deloitte-green flex items-center justify-center text-sm font-semibold">
                  {displayName?.[0] || 'D'}
                </div>
                <span className="text-sm">{displayName || 'Demo User'}</span>
              </div>
              <button
                onClick={handleLogout}
                className="p-1 hover:bg-deloitte-gray-800 rounded transition-colors"
                aria-label="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="ml-64">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white dark:bg-deloitte-gray-900 border-b border-deloitte-gray-200 dark:border-deloitte-gray-800">
          <div className="flex items-center justify-between px-8 py-4">
            <h1 className="text-2xl font-semibold">
              {navigation.find((item) => {
                if (item.href === '/') return location.pathname === '/';
                return location.pathname.startsWith(item.href);
              })?.name || 'Page'}
            </h1>
            <ThemeToggle />
          </div>
        </header>
        
        {/* Page content */}
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

