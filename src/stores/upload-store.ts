import { create } from "zustand";
import { UploadTask } from "@/features/uploads/types";

interface UploadStore {
  tasks: UploadTask[];
  addTask: (task: UploadTask) => void;
  updateTaskProgress: (id: string, uploadedBytes: number) => void;
  updateTaskStatus: (id: string, status: UploadTask["status"], error?: string) => void;
  clearCompleted: () => void;
}

// Client-only global store for active uploads progress
export const useUploadStore = create<UploadStore>((set) => ({
  tasks: [],
  
  addTask: (task) =>
    set((state) => ({
      tasks: [task, ...state.tasks],
    })),
    
  updateTaskProgress: (id, uploadedBytes) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id ? { ...t, uploadedBytes: Math.min(uploadedBytes, t.size) } : t
      ),
    })),
    
  updateTaskStatus: (id, status, error) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id ? { ...t, status, error } : t
      ),
    })),
    
  clearCompleted: () =>
    set((state) => ({
      tasks: state.tasks.filter((t) => t.status !== "completed" && t.status !== "cancelled"),
    })),
}));
