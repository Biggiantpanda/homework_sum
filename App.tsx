import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { HomeworkCard } from './components/HomeworkCard';
import { UploadPage } from './pages/UploadPage';
import { AdminLogin } from './pages/AdminLogin';
import { HomeworkItem, FileType, ViewState } from './types';
import { analyzeHomeworkImage } from './services/geminiService';
import { Inbox } from 'lucide-react';
import { Button } from './components/Button';

// Mock Initial Data for Demonstration
const MOCK_DATA: HomeworkItem[] = [
  {
    id: '1',
    studentName: '李明',
    fileName: 'math_homework.jpg',
    fileType: FileType.IMAGE,
    dataUrl: 'https://picsum.photos/400/300?random=1',
    uploadDate: Date.now() - 100000,
    subject: '数学',
    summary: '一页解X的代数方程练习。',
    aiComment: '排版很整洁！',
    isAnalyzing: false
  },
  {
    id: '2',
    studentName: '王芳',
    fileName: 'history_essay.pdf',
    fileType: FileType.PDF,
    dataUrl: '', // PDFs don't have easy previews in this demo without backend
    uploadDate: Date.now() - 200000,
    isAnalyzing: false
  }
];

const App: React.FC = () => {
  const [items, setItems] = useState<HomeworkItem[]>(MOCK_DATA);
  const [currentView, setCurrentView] = useState<ViewState>('GALLERY');
  const [isAdmin, setIsAdmin] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Simple Notification System
  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleLogout = () => {
    setIsAdmin(false);
    showNotification("已退出登录");
  };

  const handleDelete = (id: string) => {
    if (window.confirm("确定要删除这个作品吗？")) {
      setItems(prev => prev.filter(item => item.id !== id));
      showNotification("作品已删除");
    }
  };

  const handleUpload = async (name: string, file: File) => {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        const base64Data = e.target?.result as string;
        
        let fileType = FileType.UNKNOWN;
        if (file.type.includes('image')) fileType = FileType.IMAGE;
        else if (file.type.includes('pdf')) fileType = FileType.PDF;
        else if (file.type.includes('word')) fileType = FileType.WORD;

        const newItem: HomeworkItem = {
          id: Date.now().toString(),
          studentName: name,
          fileName: file.name,
          fileType,
          dataUrl: base64Data,
          uploadDate: Date.now(),
          isAnalyzing: fileType === FileType.IMAGE // Only analyze images
        };

        setItems(prev => [newItem, ...prev]);
        setCurrentView('GALLERY');
        showNotification("作业上传成功！");
        resolve();

        // Trigger AI Analysis for Images
        if (fileType === FileType.IMAGE) {
          // Extract base64 without prefix
          const base64Content = base64Data.split(',')[1];
          try {
            const analysis = await analyzeHomeworkImage(base64Content, file.type);
            
            // Update the item with AI results
            setItems(prev => prev.map(item => {
              if (item.id === newItem.id) {
                return {
                  ...item,
                  isAnalyzing: false,
                  subject: analysis.subject,
                  summary: analysis.summary,
                  aiComment: analysis.comment
                };
              }
              return item;
            }));
          } catch (err) {
            console.error("AI Analysis failed", err);
             setItems(prev => prev.map(item => {
              if (item.id === newItem.id) return { ...item, isAnalyzing: false };
              return item;
            }));
          }
        }
      };

      reader.onerror = () => reject(new Error("File reading failed"));
      reader.readAsDataURL(file);
    });
  };

  // Render Content based on View State
  const renderContent = () => {
    if (currentView === 'LOGIN') {
      return (
        <AdminLogin 
          onLogin={() => {
            setIsAdmin(true);
            setCurrentView('GALLERY');
            showNotification("欢迎回来，老师！");
          }}
          onCancel={() => setCurrentView('GALLERY')}
        />
      );
    }

    if (currentView === 'UPLOAD') {
      return (
        <UploadPage 
          onUpload={handleUpload}
          onCancel={() => setCurrentView('GALLERY')}
        />
      );
    }

    // Gallery View
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
             <h1 className="text-3xl font-bold text-gray-900">信息科技作品展示墙</h1>
             <p className="text-gray-500 mt-1">
               {items.length === 0 ? "暂无作品。" : `共展示 ${items.length} 份作品。`}
             </p>
          </div>
          
          {items.length === 0 && (
             <Button onClick={() => setCurrentView('UPLOAD')}>
               上传第一份作业
             </Button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
              <Inbox className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">这里静悄悄的</h3>
            <p className="text-gray-500 mt-1">同学们还没有上传作业。</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map(item => (
              <HomeworkCard 
                key={item.id} 
                item={item} 
                isAdmin={isAdmin}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar 
        currentView={currentView}
        onChangeView={setCurrentView}
        isAdmin={isAdmin}
        onLogout={handleLogout}
      />
      
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-4 z-50 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg text-sm animate-fade-in-down flex items-center">
          <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
          {notification}
        </div>
      )}

      {/* Main Content */}
      <main>
        {renderContent()}
      </main>

      {/* Footer Info for Demo Purpose */}
      <div className="max-w-7xl mx-auto px-4 py-6 text-center text-xs text-gray-400 border-t border-gray-200 mt-12">
        <p>班级作业展示 Demo • 由 Gemini AI 驱动</p>
        <p className="mt-1">注意：本演示没有后台服务器，刷新页面后上传的文件会消失。</p>
      </div>

      {/* Helper icon for simple notification */}
      <div style={{ display: 'none' }}>
        <CheckCircle />
      </div>
    </div>
  );
};

// Simple icon for notification component inside App
function CheckCircle(props: React.SVGProps<SVGSVGElement>) {
    return (
      <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
    )
}

export default App;