import { initializeApp, FirebaseApp, deleteApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";
import { FirebaseConfig } from "../types";

const STORAGE_KEY = "classroom_firebase_config";

class FirebaseService {
  private app: FirebaseApp | null = null;
  public db: Firestore | null = null;
  public storage: FirebaseStorage | null = null;

  isConfigured(): boolean {
    return !!localStorage.getItem(STORAGE_KEY);
  }

  saveConfig(config: FirebaseConfig) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    // Initialization is handled during the test phase or reload, 
    // but we ensure the instance is set.
    if (!this.app) {
        this.initialize(config);
    }
  }

  getConfig(): FirebaseConfig | null {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  async initialize(config?: FirebaseConfig): Promise<boolean> {
    const cfg = config || this.getConfig();
    if (!cfg) return false;

    try {
      // If an app exists, delete it to allow re-initialization with new config
      if (this.app) {
        try {
          await deleteApp(this.app);
        } catch (e) {
          console.warn("Error deleting existing app:", e);
        }
      }

      this.app = initializeApp(cfg);
      this.db = getFirestore(this.app);
      this.storage = getStorage(this.app);
      console.log("Firebase initialized successfully");
      return true;
    } catch (error) {
      console.error("Firebase initialization failed:", error);
      return false;
    }
  }

  reset() {
    localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  }
}

export const firebaseService = new FirebaseService();