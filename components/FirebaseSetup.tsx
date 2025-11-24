import React, { useState } from 'react';
import { Button } from './Button';
import { Database, CheckCircle, ExternalLink, Settings, AlertTriangle, Loader2 } from 'lucide-react';
import { firebaseService } from '../services/firebase';
import { dbService } from '../services/db';

interface FirebaseSetupProps {
  onComplete: () => void;
}

export const FirebaseSetup: React.FC<FirebaseSetupProps> = ({ onComplete }) => {
  const [configJson, setConfigJson] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'parsing' | 'connecting' | 'success'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStatus('parsing');

    try {
      // 1. Parse JSON
      let jsonStr = configJson;
      const firstBrace = configJson.indexOf('{');
      const lastBrace = configJson.lastIndexOf('}');
      
      if (firstBrace !== -1 && lastBrace !== -1) {
        jsonStr = configJson.substring(firstBrace, lastBrace + 1);
      }

      let config;
      try {
          config = new Function(`return ${jsonStr}`)();
      } catch (parseErr) {
          throw new Error("无法解析配置格式。请确保复制了包含 { ... } 的内容。");
      }

      if (!config.apiKey || !config.projectId) {
        throw new Error("配置无效：缺少 apiKey 或 projectId 字段。");
      }

      // 2. Initialize temporary instance
      setStatus('connecting');
      await firebaseService.initialize(config);

      // 3. Test real connection
      try {
        await dbService.testConnection();
      } catch (connErr: any) {
        let msg = connErr.message;
        // Translate common Firestore errors for better UX
        if (connErr.code === 'permission-denied') {
           msg = "权限被拒绝。请检查您是否在 Firebase 控制台的 Rules 设置中开启了读写权限（或选择了 Test Mode）。";
        } else if (connErr.code === 'failed-precondition' || connErr.code === 'unimplemented' || connErr.message.includes('Cloud Firestore API has not been used')) {
           msg = "数据库未创建。请去 Firebase 控制台 -> Build -> Firestore Database 点击 'Create database'。";
        } else if (connErr.code === 'unavailable') {
           msg = "网络连接失败，无法连接到 Firebase 服务器。";
        }
        throw new Error(`连接测试失败: ${msg}`);
      }

      // 4. Save and Finish
      setStatus('success');
      firebaseService.saveConfig(config);
      
      // Small delay for UX
      setTimeout(() => {
        onComplete();
      }, 500);

    } catch (err: any) {
      console.error(err);
      setStatus('idle');
      setError(err.message || "配置验证失败");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white max-w-2xl w-full rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-indigo-900 px-8 py-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-800 rounded-lg">
              <Database className="w-6 h-6 text-indigo-200" />
            </div>
            <h1 className="text-2xl font-bold">系统初始化</h1>
          </div>
          <p className="text-indigo-200 text-sm">
            配置 Firebase 以开启全班云端同步功能。
          </p>
        </div>

        <div className="p-8">
          <div className="mb-6 bg-blue-50 border border-blue-100 rounded-xl p-4">
            <h3 className="font-bold text-blue-900 flex items-center mb-2 text-sm">
              <Settings className="w-4 h-4 mr-2" />
              配置步骤
            </h3>
            <ol className="list-decimal list-inside space-y-1 text-xs text-blue-800">
              <li>访问 <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" className="text-blue-600 underline font-medium hover:text-blue-800 inline-flex items-center">Firebase 控制台 <ExternalLink className="w-3 h-3 ml-1"/></a> 并登录。</li>
              <li>创建新项目 -> 添加 Web 应用 (`&lt;/&gt;`) -> 复制 <code>const firebaseConfig = &#123;...&#125;</code> 代码。</li>
              <li><span className="font-bold text-red-600">关键：</span>去 <strong>Firestore Database</strong> 点击 <strong>Create Database</strong> (选 Test mode)。</li>
              <li><span className="font-bold text-red-600">关键：</span>去 <strong>Storage</strong> 点击 <strong>Get Started</strong> (选 Test mode)。</li>
            </ol>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="config" className="block text-sm font-medium text-gray-700 mb-2">
                粘贴配置代码
              </label>
              <textarea
                id="config"
                rows={6}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 font-mono text-xs bg-slate-50 p-4 transition-colors"
                placeholder={`const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  ...
};`}
                value={configJson}
                onChange={(e) => setConfigJson(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-start text-red-700 text-xs">
                <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                <span className="flex-1 break-all">{error}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
                <p className="text-xs text-gray-400">配置仅保存在本地浏览器</p>
                <Button 
                  type="submit" 
                  disabled={status !== 'idle'}
                  className="w-48"
                >
                  {status === 'idle' && <>测试连接并保存 <CheckCircle className="w-4 h-4 ml-2" /></>}
                  {status === 'parsing' && <>解析配置中...</>}
                  {status === 'connecting' && <><Loader2 className="animate-spin w-4 h-4 mr-2" /> 正在连接云端...</>}
                  {status === 'success' && <>连接成功！进入系统</>}
                </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};