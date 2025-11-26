import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store';
import { api } from '../lib/api';

export function LoginPage() {
  const [email, setEmail] = useState('demo@example.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await api.login(email, password);
      setAuth(response.token, response.displayName);
      navigate('/');
    } catch (err) {
      setError('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-deloitte-black to-deloitte-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-deloitte-gray-800 rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-deloitte-green rounded-xl mb-4">
            <span className="text-2xl font-bold text-white">AU</span>
          </div>
          <h1 className="text-2xl font-bold text-deloitte-black dark:text-white">
            Benefits Platform
          </h1>
          <p className="text-deloitte-gray-600 dark:text-deloitte-gray-400 mt-2">
            Legacy Demo - Compliance Scanner
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-deloitte-black dark:text-white">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-deloitte-gray-300 dark:border-deloitte-gray-600 rounded-lg focus:ring-2 focus:ring-deloitte-green focus:border-transparent dark:bg-deloitte-gray-700 dark:text-white"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2 text-deloitte-black dark:text-white">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-deloitte-gray-300 dark:border-deloitte-gray-600 rounded-lg focus:ring-2 focus:ring-deloitte-green focus:border-transparent dark:bg-deloitte-gray-700 dark:text-white"
              required
            />
          </div>
          
          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-deloitte-green hover:bg-deloitte-green-dark text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        <div className="mt-6 text-center text-sm text-deloitte-gray-600 dark:text-deloitte-gray-400">
          Demo credentials pre-filled
        </div>
      </div>
    </div>
  );
}

