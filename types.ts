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
  dataUrl: string; // This will now be a Firebase Storage URL for new uploads
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

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export type ViewState = 'GALLERY' | 'UPLOAD' | 'LOGIN' | 'SETUP';