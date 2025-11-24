import React, { useState } from 'react';
import { Button } from '../components/Button';
import { Lock } from 'lucide-react';

interface AdminLoginProps {
  onLogin: () => void;
  onCancel: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin, onCancel }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this goes to backend. Here, simple hardcoded check.
    if (password === 'teacher123') {
      onLogin();
    } else {
      setError(true);
      setPassword('');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-lg p-8 border border-gray-100">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">教师通道</h2>
          <p className="text-sm text-gray-500 mt-1">输入密码以管理内容</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
              className={`block w-full rounded-md shadow-sm sm:text-sm p-2.5 border ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'}`}
              placeholder="••••••••"
            />
            {error && <p className="mt-1 text-xs text-red-600">密码错误。请尝试 'teacher123'。</p>}
          </div>

          <Button type="submit" className="w-full">
            登录
          </Button>
          <Button type="button" variant="ghost" className="w-full" onClick={onCancel}>
            返回作品墙
          </Button>
        </form>
      </div>
    </div>
  );
};