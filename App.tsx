import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HomeworkCard } from './components/HomeworkCard';
import { UploadPage } from './pages/UploadPage';
import { AdminLogin } from './pages/AdminLogin';
import { FirebaseSetup } from './components/FirebaseSetup';
import { HomeworkItem, FileType, ViewState } from './types';
import { analyzeHomeworkImage } from './services/geminiService';
import { dbService } from './services/db';
import { firebaseService } from './services/firebase';
import { Inbox, Cloud, Loader2, CheckCircle as CheckCircleIcon } from 'lucide-react';
import { Button } from './components/Button';

const App: React.FC = () => {
  const [items, setItems] = useState<HomeworkItem[]>([]);
  const [currentView, setCurrentView] = useState<ViewState>('GALLERY');
  const [isAdmin, setIsAdmin] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfigured, setIsConfigured] = useState(false);

  // 初始化加载数据
  useEffect(() => {
    const checkConfig = () => {
      const configured = firebaseService.isConfigured();
      setIsConfigured(configured);
      
      if (configured) {
        initApp();
      } else {
        setCurrentView('SETUP');
        setIsLoading(false);
      }
    };
    
    checkConfig();
  }, []);

  const initApp = async () => {
    try {
      setIsLoading(true);
      await dbService.init();
      const data = await dbService.getAllHomework();
      setItems(data);
      setIsConfigured(true);
      setCurrentView('GALLERY');
    } catch (error) {
      console.error("Failed to load data", error);
      // 如果是因为配置失效（比如数据库删了），这里也会报错
      // 我们可以提示用户，或者如果错误太严重，退回到 setup
      showNotification("连接云端数据失败");
    } finally {
      setIsLoading(false);
    }
  };

  // Callback for when setup is complete (no reload needed)
  const handleSetupComplete = () => {
    initApp();
  };

  // Simple Notification System
  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleLogout = () => {
    setIsAdmin(false);
    showNotification("已退出登录");
  };
  
  const handleResetConfig = () => {
      if (window.confirm("确定要清除配置吗？您将需要重新输入 Firebase 信息。")) {
          firebaseService.reset();
      }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("确定要删除这个作品吗？此操作无法撤销。")) {
      try {
        await dbService.deleteHomework(id);
        setItems(prev => prev.filter(item => item.id !== id));
        showNotification("作品已从云端删除");
      } catch (error) {
        showNotification("删除失败");
      }
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

        showNotification("正在上传文件到云端...");
        
        try {
          const storageUrl = await dbService.uploadFile(file);

          const newItem: HomeworkItem = {
            id: '', 
            studentName: name,
            fileName: file.name,
            fileType,
            dataUrl: storageUrl,
            uploadDate: Date.now(),
            isAnalyzing: fileType === FileType.IMAGE
          };

          const docId = await dbService.addHomework(newItem);
          const savedItem = { ...newItem, id: docId };
          
          setItems(prev => [savedItem, ...prev]);
          setCurrentView('GALLERY');
          showNotification("作业上传成功！已同步到云端。");
          resolve();

          if (fileType === FileType.IMAGE) {
            analyzeAndSave(savedItem, base64Data);
          }
        } catch (error) {
          console.error("Upload failed", error);
          showNotification("上传失败: " + (error as Error).message);
          reject(new Error("上传失败"));
        }
      };

      reader.onerror = () => reject(new Error("文件读取失败"));
      reader.readAsDataURL(file);
    });
  };

  const analyzeAndSave = async (item: HomeworkItem, base64ContentFull: string) => {
    const base64Content = base64ContentFull.split(',')[1];
    
    try {
      const analysis = await analyzeHomeworkImage(base64Content, 'image/jpeg');
      
      const updatedItem: HomeworkItem = {
        ...item,
        isAnalyzing: false,
        subject: analysis.subject,
        summary: analysis.summary,
        aiComment: analysis.comment
      };

      await dbService.updateHomework(updatedItem);
      setItems(prev => prev.map(i => i.id === item.id ? updatedItem : i));

    } catch (err) {
      console.error("AI Analysis failed", err);
      const failedItem = { ...item, isAnalyzing: false };
      await dbService.updateHomework(failedItem);
      setItems(prev => prev.map(i => i.id === item.id ? failedItem : i));
    }
  };

  const renderContent = () => {
    if (currentView === 'SETUP') {
      return <FirebaseSetup onComplete={handleSetupComplete} />;
    }

    if (isLoading) {
      return (
        <div className="flex flex-col justify-center items-center h-[60vh]">
           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
           <p className="text-gray-500">正在连接云端数据库...</p>
        </div>
      );
    }

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

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
             <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                信息科技作品展示墙
             </h1>
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
            <h3 className="text-lg font-medium text-gray-900">云端数据库是空的</h3>
            <p className="text-gray-500 mt-1">同学们上传的作品将实时同步到这里。</p>
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
      {currentView !== 'SETUP' && (
        <Navbar 
          currentView={currentView}
          onChangeView={setCurrentView}
          isAdmin={isAdmin}
          onLogout={handleLogout}
        />
      )}
      
      {notification && (
        <div className="fixed top-20 right-4 z-50 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg text-sm animate-fade-in-down flex items-center">
          <CheckCircleIcon className="w-4 h-4 mr-2 text-green-400" />
          {notification}
        </div>
      )}

      <main>
        {renderContent()}
      </main>

      {currentView !== 'SETUP' && (
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-xs text-gray-400 border-t border-gray-200 mt-12">
          <div className="flex items-center justify-center gap-2">
             <p className="flex items-center gap-1">
                <Cloud className="w-3 h-3 text-indigo-400" /> 
                云端同步已开启 (Firebase)
             </p>
             <span className="text-gray-300">|</span>
             <button onClick={handleResetConfig} className="hover:text-indigo-500 transition-colors">
                 重置配置
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;