import { NextResponse } from "next/server";

// Backend API URL - same as defined in process/route.ts
const BACKEND_API_URL = "http://localhost:8478";

export async function GET(request: Request) {
  try {
    // Get the job ID from the query parameters
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("jobId");

    if (!jobId) {
      return NextResponse.json(
        { error: "Job ID is required" },
        { status: 400 }
      );
    }

    // Fetch the job status from the backend
    const response = await fetch(`${BACKEND_API_URL}/job-status/${jobId}`);

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to get results: ${response.statusText}` },
        { status: response.status }
      );
    }

    // Get the results data
    const jobStatus = await response.json();

    // Return the results
    return NextResponse.json(jobStatus);
  } catch (error) {
    console.error("Error fetching results:", error);
    return NextResponse.json(
      { error: "Failed to retrieve results" },
      { status: 500 }
    );
  }
}
