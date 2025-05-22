import { NextResponse } from "next/server";
import { BACKEND_API_URL } from "@/lib/config";

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
        { error: `Failed to get image: ${response.statusText}` },
        { status: response.status }
      );
    }

    // Get the image data as a blob
    const imageData = await response.blob();

    // Determine content type based on file extension
    let contentType = "image/png"; // default
    if (filename.endsWith(".jpg") || filename.endsWith(".jpeg")) {
      contentType = "image/jpeg";
    } else if (filename.endsWith(".csv")) {
      contentType = "text/csv";
    }

    // Return the image with appropriate headers
    return new NextResponse(imageData, {
      headers: {
        "Content-Type": response.headers.get("Content-Type") || contentType,
        "Content-Disposition": `inline; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Error fetching image:", error);
    return NextResponse.json(
      { error: "Failed to retrieve image" },
      { status: 500 }
    );
  }
}
