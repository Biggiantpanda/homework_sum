import React from 'react';
import { HomeworkItem, FileType } from '../types';
import { Trash2, FileText, Image as ImageIcon, Sparkles } from 'lucide-react';

interface HomeworkCardProps {
  item: HomeworkItem;
  isAdmin: boolean;
  onDelete: (id: string) => void;
}

export const HomeworkCard: React.FC<HomeworkCardProps> = ({ item, isAdmin, onDelete }) => {
  const isImage = item.fileType === FileType.IMAGE;

  return (
    <div className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col h-full">
      {/* Thumbnail Area */}
      <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden flex items-center justify-center">
        {isImage ? (
          <img 
            src={item.dataUrl} 
            alt={`Homework by ${item.studentName}`} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex flex-col items-center text-gray-400">
            <FileText className="w-16 h-16 mb-2" />
            <span className="text-sm font-medium">{item.fileType === FileType.WORD ? 'Word' : 'PDF'} 文档</span>
          </div>
        )}
        
        {/* Type Badge */}
        <div className="absolute top-3 left-3">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium backdrop-blur-sm
            ${item.fileType === FileType.IMAGE ? 'bg-indigo-900/70 text-white' : 'bg-gray-900/70 text-white'}`}>
            {isImage ? <ImageIcon className="w-3 h-3 mr-1" /> : <FileText className="w-3 h-3 mr-1" />}
            {item.fileType}
          </span>
        </div>

        {/* AI Badge */}
        {item.isAnalyzing ? (
           <div className="absolute bottom-3 right-3 bg-amber-100/90 text-amber-800 px-2 py-1 rounded text-xs font-bold animate-pulse flex items-center shadow-sm">
             <Sparkles className="w-3 h-3 mr-1" /> AI 分析中...
           </div>
        ) : item.subject ? (
          <div className="absolute bottom-3 right-3 bg-amber-400/90 text-white px-2 py-1 rounded text-xs font-bold shadow-sm flex items-center backdrop-blur-sm">
             <Sparkles className="w-3 h-3 mr-1" /> {item.subject}
          </div>
        ) : null}
      </div>

      {/* Content Area */}
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-bold text-gray-900 line-clamp-1">{item.studentName}</h3>
            <p className="text-xs text-gray-500">{new Date(item.uploadDate).toLocaleDateString('zh-CN')}</p>
          </div>
        </div>

        {/* AI Content */}
        {item.summary && (
          <div className="mb-3 p-2 bg-indigo-50 rounded-lg border border-indigo-100">
             <p className="text-xs text-indigo-800 line-clamp-2 italic">"{item.summary}"</p>
             {item.aiComment && (
                <div className="mt-1 flex justify-end">
                    <span className="text-[10px] font-bold text-indigo-600 bg-white px-1.5 rounded-full border border-indigo-100">
                        {item.aiComment}
                    </span>
                </div>
             )}
          </div>
        )}

        <div className="mt-auto pt-3 flex justify-between items-center border-t border-gray-100">
          <a 
            href={item.dataUrl} 
            download={`${item.studentName}_${item.fileName}`}
            className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            下载原文件
          </a>
          
          {isAdmin && (
            <button 
              onClick={() => onDelete(item.id)}
              className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"
              title="删除作品"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};