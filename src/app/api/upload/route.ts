import { auth } from "@/lib/auth";
import { uploadService } from "@/server/services";

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

// Note: Uploaded files are served directly from Cloudflare R2 via their public URL.
// Cache-control headers for R2-served files should be configured at the R2 bucket level
// (see task 6.9). R2 files are content-addressable (unique keys per upload), so they
// can be cached aggressively: "public, max-age=31536000, immutable".

const ALLOWED_TYPES_BY_FOLDER: Record<string, string[]> = {
  resumes: ["application/pdf"],
  images: ["image/jpeg", "image/png", "image/webp"],
};

const DEFAULT_ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
];

export async function POST(request: Request) {
  // 1. Check authentication
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 2. Read uploaded file from FormData
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return Response.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // 3. Get optional folder field
    const folder = formData.get("folder") as string | null;

    // 4. Determine allowed types based on folder
    const allowedTypes = folder && ALLOWED_TYPES_BY_FOLDER[folder]
      ? ALLOWED_TYPES_BY_FOLDER[folder]
      : DEFAULT_ALLOWED_TYPES;

    // Convert File to Buffer for validation and upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Validate the file
    const validation = uploadService.validateFile(
      buffer,
      allowedTypes,
      MAX_SIZE_BYTES
    );

    if (!validation.valid) {
      return Response.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // 5. Upload the file
    const result = await uploadService.uploadFile(buffer, {
      filename: file.name,
      contentType: file.type,
      folder: folder ?? undefined,
    });

    // 6. Return the URL on success
    // Upload mutation responses must not be cached
    return Response.json(
      { url: result.url },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Upload failed:", error);
    return Response.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}
