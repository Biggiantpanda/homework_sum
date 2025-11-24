import React from 'react';
import { ViewState } from '../types';
import { Button } from './Button';
import { LayoutGrid, Upload, ShieldCheck, LogOut } from 'lucide-react';

interface NavbarProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  isAdmin: boolean;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onChangeView, isAdmin, onLogout }) => {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center cursor-pointer" onClick={() => onChangeView('GALLERY')}>
            <div className="flex-shrink-0 flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                H
              </div>
              <span className="font-bold text-xl text-gray-900 tracking-tight">班级<span className="text-indigo-600">作业展示</span></span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {currentView !== 'UPLOAD' && (
               <Button 
                variant="primary" 
                onClick={() => onChangeView('UPLOAD')}
                className="hidden sm:inline-flex"
               >
                 <Upload className="w-4 h-4 mr-2" />
                 上传作业
               </Button>
            )}

            {currentView === 'UPLOAD' && (
              <Button variant="secondary" onClick={() => onChangeView('GALLERY')}>
                <LayoutGrid className="w-4 h-4 mr-2" />
                返回作品墙
              </Button>
            )}

            {isAdmin ? (
              <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium border border-green-200">
                <ShieldCheck className="w-4 h-4" />
                <span>管理员模式</span>
                <button 
                  onClick={onLogout}
                  className="ml-2 p-1 hover:bg-green-100 rounded-full text-green-800 transition-colors"
                  title="退出登录"
                >
                  <LogOut className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => onChangeView('LOGIN')}
                className="text-sm text-gray-500 hover:text-indigo-600 font-medium transition-colors"
              >
                教师登录
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};