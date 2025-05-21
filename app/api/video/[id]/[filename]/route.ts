import { NextResponse } from "next/server";

// Backend API URL - same as defined in process/route.ts
const BACKEND_API_URL = "http://localhost:8478";

export async function GET(
  request: Request,
  { params }: { params: { id: string; filename: string } }
) {
  try {
    const { id, filename } = params;
    const path = `${id}/${filename}`;

    // Proxy the request to the backend server
    const response = await fetch(`${BACKEND_API_URL}/file/${path}`);

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to get video: ${response.statusText}` },
        { status: response.status }
      );
    }

    // Get the video data as a blob
    const videoData = await response.blob();

    // Return the video with appropriate headers
    return new NextResponse(videoData, {
      headers: {
        "Content-Type": response.headers.get("Content-Type") || "video/mp4",
        "Content-Disposition": `inline; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Error fetching video:", error);
    return NextResponse.json(
      { error: "Failed to retrieve video" },
      { status: 500 }
    );
  }
}
