import { NextResponse } from "next/server";
import { store } from "@/lib/store";
import {
  BACKEND_API_URL,
  MAX_DIRECT_UPLOAD_SIZE,
  CHUNK_SIZE,
  API_REQUEST_TIMEOUT,
} from "@/lib/config";

export const config = {
  api: {
    bodyParser: false,
    responseLimit: false,
  },
};

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    // Get the file count
    const fileCount = Number.parseInt(
      (formData.get("fileCount") as string) || "0"
    );

    if (fileCount === 0) {
      console.log("No video files provided in form data");
      return NextResponse.json(
        { error: "No video files provided" },
        { status: 400 }
      );
    }

    // Get parameters
    const minJumpDuration = formData.get("minJumpDuration") || "0.8";
    const maxJumpDuration = formData.get("maxJumpDuration") || "4.0";
    const maxCpuUsage = formData.get("maxCpuUsage") || "10";
    const numWorkers = formData.get("numWorkers") || "6";

    console.log(`Processing request with ${fileCount} files`);

    // Collect all video files from form data
    const filesToProcess = [];
    for (let i = 0; i < fileCount; i++) {
      const videoFile = formData.get(`video_${i}`) as File;
      if (videoFile) {
        filesToProcess.push(videoFile);
        console.log(
          `Found file: ${videoFile.name}, size: ${videoFile.size} bytes`
        );
      }
    }

    if (filesToProcess.length === 0) {
      console.log("No valid video files found after processing");
      return NextResponse.json(
        { error: "No valid video files found" },
        { status: 400 }
      );
    }

    // Check if we should use chunked upload (for large files)
    const shouldUseChunkedUpload = filesToProcess.some(
      (file) => file.size > MAX_DIRECT_UPLOAD_SIZE
    );

    // Update store to show processing is beginning
    store.setProcessingState({
      status: "preparing",
      message: "Preparing to upload videos...",
    });

    let jobId: string = "";
    let statusMessage: string = "";

    // Use chunked upload for large files
    if (shouldUseChunkedUpload) {
      // For simplicity, we'll just upload the first file when using chunked upload
      const file = filesToProcess[0];

      store.updateProcessingState({
        status: "uploading",
        message: `Preparing to upload ${file.name} in chunks (${(
          file.size /
          (1024 * 1024)
        ).toFixed(2)}MB)...`,
        progress: 0,
      });

      try {
        // 1. Create an upload session
        const sessionFormData = new FormData();
        sessionFormData.append("filename", file.name);
        sessionFormData.append("filesize", file.size.toString());
        sessionFormData.append("min_jump_duration", minJumpDuration as string);
        sessionFormData.append("max_jump_duration", maxJumpDuration as string);
        sessionFormData.append("max_cpu_usage", maxCpuUsage as string);
        sessionFormData.append("num_workers", numWorkers as string);

        console.log("Creating upload session...");
        const sessionResponse = await fetch(
          `${BACKEND_API_URL}/create-upload-session/`,
          {
            method: "POST",
            body: sessionFormData,
          }
        );

        if (!sessionResponse.ok) {
          throw new Error("Failed to create upload session");
        }

        const sessionData = await sessionResponse.json();
        const sessionId = sessionData.session_id;
        console.log(`Upload session created: ${sessionId}`);

        // 2. Upload file in chunks
        const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
        console.log(`Uploading file in ${totalChunks} chunks...`);

        for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
          const start = chunkIndex * CHUNK_SIZE;
          const end = Math.min(start + CHUNK_SIZE, file.size);
          const chunk = file.slice(start, end);

          // Update progress
          const uploadProgress = Math.round((chunkIndex / totalChunks) * 100);
          store.updateProcessingState({
            status: "uploading",
            message: `Uploading chunk ${chunkIndex + 1} of ${totalChunks}...`,
            progress: uploadProgress,
          });

          // Prepare chunk form data with proper multipart structure
          const chunkFormData = new FormData();
          chunkFormData.append("chunk_index", chunkIndex.toString());
          chunkFormData.append("total_chunks", totalChunks.toString());
          chunkFormData.append(
            "file",
            new Blob([chunk], { type: "application/octet-stream" }),
            "chunk"
          );

          // Upload chunk
          const chunkResponse = await fetch(
            `${BACKEND_API_URL}/upload-chunk/${sessionId}`,
            {
              method: "POST",
              body: chunkFormData,
            }
          );

          if (!chunkResponse.ok) {
            throw new Error(`Failed to upload chunk ${chunkIndex + 1}`);
          }

          const chunkResult = await chunkResponse.json();
          console.log(
            `Chunk ${chunkIndex + 1} uploaded, progress: ${
              typeof chunkResult.progress === "number"
                ? chunkResult.progress.toFixed(2)
                : "unknown"
            }%`
          );

          // If this is the last chunk, it will start processing and return a job ID
          if (chunkResult.job_id) {
            jobId = chunkResult.job_id;
            statusMessage = chunkResult.message;
            break;
          }
        }

        if (!jobId) {
          throw new Error("Failed to complete upload process - no job ID returned");
        }

        // 3. Update state to processing
        store.setProcessingState({
          id: jobId,
          videoPath: file.name,
          resultDir: "output",
          status: "processing",
          message: statusMessage || `Processing ${file.name}...`,
          params: {
            minJumpDuration: minJumpDuration as string,
            maxJumpDuration: maxJumpDuration as string,
            maxCpuUsage: maxCpuUsage as string,
            numWorkers: numWorkers as string,
          },
        });

        // Start polling for updates
        pollJobStatus(jobId);

        return NextResponse.json({
          id: jobId,
          status: "processing",
          message: statusMessage || `Started processing ${file.name}`,
        });
      } catch (error: any) {
        console.error("Error during chunked upload:", error);
        store.updateProcessingState({
          status: "error",
          error: error.message || "Failed to upload file in chunks",
        });

        return NextResponse.json(
          { error: error.message || "Failed to upload file in chunks" },
          { status: 500 }
        );
      }
    } else {
      // For smaller files, use the regular upload approach
      store.updateProcessingState({
        status: "uploading",
        message: `Uploading ${filesToProcess.length} file(s)...`,
        progress: 0,
      });

      const batchFormData = new FormData();

      // Add all files to form data
      filesToProcess.forEach((file) => {
        batchFormData.append("files", file);
      });

      // Add parameters
      batchFormData.append("min_jump_duration", minJumpDuration as string);
      batchFormData.append("max_jump_duration", maxJumpDuration as string);
      batchFormData.append("max_cpu_usage", maxCpuUsage as string);
      batchFormData.append("num_workers", numWorkers as string);

      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        API_REQUEST_TIMEOUT
      );

      try {
        const response = await fetch(`${BACKEND_API_URL}/process-videos/`, {
          method: "POST",
          body: batchFormData,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          let errorMessage = "Failed to process videos";

          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.error || errorMessage;
          } catch (e) {
            if (errorText) errorMessage = errorText;
          }

          throw new Error(errorMessage);
        }

        const result = await response.json();
        jobId = result.job_id;

        // Store processing parameters
        store.setProcessingState({
          id: jobId,
          videoPath: filesToProcess[0].name,
          resultDir: "output",
          status: "processing",
          message: `Processing ${filesToProcess.length} videos...`,
          params: {
            minJumpDuration: minJumpDuration as string,
            maxJumpDuration: maxJumpDuration as string,
            maxCpuUsage: maxCpuUsage as string,
            numWorkers: numWorkers as string,
          },
        });

        // Start polling for updates
        pollJobStatus(jobId);

        return NextResponse.json({
          id: jobId,
          status: "processing",
          message: result.message,
        });
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        console.error("Fetch error:", fetchError);

        if (fetchError.name === "AbortError") {
          const errorMessage =
            "Request timed out. The video files may be too large.";
          store.updateProcessingState({
            status: "error",
            error: errorMessage,
          });
          return NextResponse.json({ error: errorMessage }, { status: 500 });
        }

        if (fetchError.cause && fetchError.cause.code === "ENOBUFS") {
          const errorMessage =
            "Network buffer overflow. The video files are too large to send at once. Try uploading smaller files or fewer files at a time.";
          store.updateProcessingState({
            status: "error",
            error: errorMessage,
          });
          return NextResponse.json({ error: errorMessage }, { status: 500 });
        }

        store.updateProcessingState({
          status: "error",
          error: fetchError.message || "Failed to process videos",
        });
        return NextResponse.json(
          { error: fetchError.message || "Failed to process videos" },
          { status: 500 }
        );
      }
    }
  } catch (error: any) {
    console.error("Error processing request:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to process videos";

    // Update the store with the error
    store.updateProcessingState({
      status: "error",
      error: errorMessage,
    });

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// Poll job status until completion or error
async function pollJobStatus(jobId: string) {
  try {
    console.log(`Polling job status for job ${jobId}`);
    const response = await fetch(`${BACKEND_API_URL}/job-status/${jobId}`);

    if (!response.ok) {
      throw new Error(`Failed to get job status: ${response.statusText}`);
    }

    const jobStatus = await response.json();
    console.log(`Job ${jobId} status:`, jobStatus.status);

    if (jobStatus.status === "completed") {
      // Job completed successfully
      console.log(`Job ${jobId} completed successfully`);
      store.updateProcessingState({
        status: "completed",
        results: jobStatus.results,
      });
      return;
    } else if (jobStatus.status === "error") {
      // Job failed
      console.log(`Job ${jobId} failed with error:`, jobStatus.error);
      store.updateProcessingState({
        status: "error",
        error: jobStatus.error || "Unknown error occurred",
      });
      return;
    }

    // If still processing, update progress if available
    if (jobStatus.processed_videos && jobStatus.total_videos) {
      const progress = Math.round(
        (jobStatus.processed_videos / jobStatus.total_videos) * 100
      );
      store.updateProcessingState({
        status: "processing",
        message: `Processing video ${jobStatus.processed_videos} of ${jobStatus.total_videos}...`,
        progress,
      });
    }

    // Poll again after a delay
    setTimeout(() => pollJobStatus(jobId), 2000);
  } catch (error) {
    console.error("Error polling job status:", error);
    store.updateProcessingState({
      status: "error",
      error: "Failed to get processing status",
    });
  }
}
