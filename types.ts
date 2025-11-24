export enum FileType {
  IMAGE = 'IMAGE',
  PDF = 'PDF',
  WORD = 'WORD',
  UNKNOWN = 'UNKNOWN'
}

export interface HomeworkItem {
  id: string;
  studentName: string;
  fileName: string;
  fileType: FileType;
  dataUrl: string; // Base64 data
  uploadDate: number;
  
  // AI Generated Metadata
  subject?: string;
  summary?: string;
  aiComment?: string;
  isAnalyzing: boolean;
}

export interface AiAnalysisResult {
  subject: string;
  summary: string;
  comment: string;
}

export type ViewState = 'GALLERY' | 'UPLOAD' | 'LOGIN';