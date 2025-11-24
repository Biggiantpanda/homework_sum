import React, { useState, useRef } from 'react';
import { Button } from '../components/Button';
import { UploadCloud, File, X, AlertCircle } from 'lucide-react';

interface UploadPageProps {
  onUpload: (name: string, file: File) => Promise<void>;
  onCancel: () => void;
}

export const UploadPage: React.FC<UploadPageProps> = ({ onUpload, onCancel }) => {
  const [studentName, setStudentName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    setError(null);
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    if (!validTypes.includes(file.type)) {
      setError("请上传图片 (JPG, PNG), PDF, 或 Word 文档。");
      return;
    }
    
    // Size limit 5MB
    if (file.size > 5 * 1024 * 1024) {
      setError("文件大小必须小于 5MB。");
      return;
    }

    setSelectedFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !selectedFile) return;

    setIsUploading(true);
    try {
      await onUpload(studentName, selectedFile);
    } catch (err) {
      setError("上传失败，请重试。");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-12 px-4 sm:px-6">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-indigo-600 px-6 py-4">
          <h2 className="text-xl font-bold text-white flex items-center">
            <UploadCloud className="w-6 h-6 mr-2" />
            提交作业
          </h2>
          <p className="text-indigo-100 text-sm mt-1">上传你的作品到班级展示墙。</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              你的姓名
            </label>
            <input
              type="text"
              id="name"
              required
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="例如：张三"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              作业文件
            </label>
            
            {!selectedFile ? (
              <div 
                className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg transition-colors cursor-pointer
                  ${dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400'}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
              >
                <div className="space-y-1 text-center">
                  <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600 justify-center">
                    <span className="relative font-medium text-indigo-600 rounded-md focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                      点击上传文件
                    </span>
                    <p className="pl-1">或拖拽文件到此处</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    支持 PNG, JPG, PDF, DOCX (最大 5MB)
                  </p>
                </div>
                <input 
                  ref={inputRef}
                  id="file-upload" 
                  name="file-upload" 
                  type="file" 
                  className="hidden" 
                  onChange={handleChange}
                  accept=".jpg,.jpeg,.png,.webp,.pdf,.doc,.docx"
                />
              </div>
            ) : (
              <div className="mt-1 flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 rounded bg-indigo-100 flex items-center justify-center text-indigo-600">
                    <File className="w-6 h-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="ml-4 bg-white rounded-full p-1 text-gray-400 hover:text-red-500 focus:outline-none shadow-sm border border-gray-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="pt-4 flex items-center justify-end space-x-3 border-t border-gray-100">
            <Button type="button" variant="ghost" onClick={onCancel}>
              取消
            </Button>
            <Button 
              type="submit" 
              isLoading={isUploading}
              disabled={!studentName || !selectedFile}
            >
              提交作业
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};