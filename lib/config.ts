// Configuration file for backend API connections

// Backend API URL - update this to your backend server address
export const BACKEND_API_URL = "http://localhost:8478";

// Set a reasonable direct upload size for Windows (much smaller to avoid buffer issues)
export const MAX_DIRECT_UPLOAD_SIZE = 10 * 1024 * 1024; // 10MB for direct upload on Windows

// Set chunk size for large file uploads (smaller to avoid buffer overflows)
export const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks to avoid buffer issues

// API request timeout (milliseconds)
export const API_REQUEST_TIMEOUT = 180000; // 3 minutes
