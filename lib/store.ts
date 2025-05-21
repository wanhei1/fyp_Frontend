// Simple in-memory store for demo purposes
// In a real application, you would use a database or other persistent storage

interface ProcessingState {
  id?: string;
  videoPath?: string;
  resultDir?: string;
  status:
    | "idle"
    | "preparing"
    | "uploading"
    | "processing"
    | "completed"
    | "error";
  message?: string;
  progress?: number;
  params?: {
    minJumpDuration: string;
    maxJumpDuration: string;
    maxCpuUsage: string;
    numWorkers: string;
  };
  results?: {
    video_path?: string;
    jumps_detected: number;
    jump_timestamps: { video?: string; start: number; end: number }[];
    output_files: string[];
    summary_file?: string;
    videos?: string[];
  };
  error?: string;
}

// In-memory store (will be reset on server restart)
let processingState: ProcessingState | null = null;
let listeners: Array<(state: ProcessingState | null) => void> = [];

export const store = {
  // Get the current processing state (original method)
  getProcessingState: () => processingState,

  // Get state (new method to match component usage)
  getState: () => processingState,

  // Set the processing state
  setProcessingState: (state: ProcessingState | null) => {
    processingState = state;
    // Notify listeners when state changes
    listeners.forEach((listener) => listener(processingState));
  },

  // Update the processing state
  updateProcessingState: (update: Partial<ProcessingState>) => {
    if (processingState) {
      processingState = { ...processingState, ...update };
      // Notify listeners when state changes
      listeners.forEach((listener) => listener(processingState));
    }
  },

  // Subscribe to state changes (new method to match component usage)
  subscribe: (listener: (state: ProcessingState | null) => void) => {
    listeners.push(listener);
    // Return unsubscribe function
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  },
};
