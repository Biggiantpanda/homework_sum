import { HomeworkItem, FileType } from '../types';
import { firebaseService } from './firebase';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, orderBy, limit } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const COLLECTION_NAME = 'homeworks';

class DatabaseService {
  
  async init(): Promise<boolean> {
    return firebaseService.initialize();
  }

  // 测试连接是否真正可用（检查数据库是否存在且有权限）
  async testConnection(): Promise<void> {
    if (!firebaseService.db) throw new Error("SDK 未初始化");
    
    try {
        // 尝试读取1条数据来验证权限和数据库状态
        // 即使集合不存在，Firestore 也会返回空数组而不是报错，除非没有权限或数据库未创建
        const q = query(collection(firebaseService.db, COLLECTION_NAME), limit(1));
        await getDocs(q);
    } catch (e: any) {
        console.error("Test connection failed", e);
        // 抛出原始错误以便 UI 层处理具体的错误信息
        throw e;
    }
  }

  async getAllHomework(): Promise<HomeworkItem[]> {
    if (!firebaseService.db) throw new Error("Database not initialized");

    try {
      const q = query(collection(firebaseService.db, COLLECTION_NAME), orderBy("uploadDate", "desc"));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          studentName: data.studentName,
          fileName: data.fileName,
          fileType: data.fileType,
          dataUrl: data.dataUrl,
          uploadDate: data.uploadDate,
          subject: data.subject,
          summary: data.summary,
          aiComment: data.aiComment,
          isAnalyzing: data.isAnalyzing
        } as HomeworkItem;
      });
    } catch (error) {
      console.error("Error getting documents: ", error);
      throw error;
    }
  }

  async uploadFile(file: File): Promise<string> {
    if (!firebaseService.storage) throw new Error("Storage not initialized");
    
    const uniqueName = `${Date.now()}_${Math.random().toString(36).substring(2)}_${file.name}`;
    const storageRef = ref(firebaseService.storage, `homeworks/${uniqueName}`);
    
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  }

  async addHomework(item: HomeworkItem): Promise<string> {
    if (!firebaseService.db) throw new Error("Database not initialized");
    
    const docRef = await addDoc(collection(firebaseService.db, COLLECTION_NAME), {
      studentName: item.studentName,
      fileName: item.fileName,
      fileType: item.fileType,
      dataUrl: item.dataUrl,
      uploadDate: item.uploadDate,
      isAnalyzing: item.isAnalyzing,
      ...(item.subject && { subject: item.subject }),
      ...(item.summary && { summary: item.summary }),
      ...(item.aiComment && { aiComment: item.aiComment }),
    });

    return docRef.id;
  }

  async updateHomework(item: HomeworkItem): Promise<void> {
    if (!firebaseService.db) throw new Error("Database not initialized");
    
    const docRef = doc(firebaseService.db, COLLECTION_NAME, item.id);
    await updateDoc(docRef, {
        subject: item.subject,
        summary: item.summary,
        aiComment: item.aiComment,
        isAnalyzing: item.isAnalyzing
    });
  }

  async deleteHomework(id: string): Promise<void> {
    if (!firebaseService.db) throw new Error("Database not initialized");
    
    try {
       const docRef = doc(firebaseService.db, COLLECTION_NAME, id);
       await deleteDoc(docRef);
    } catch(e) {
        console.error("Delete failed", e);
        throw e;
    }
  }
}

export const dbService = new DatabaseService();