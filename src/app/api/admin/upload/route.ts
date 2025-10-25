import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  const adminCheck = await requireAdmin(request);
  if (adminCheck instanceof NextResponse) return adminCheck;

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const folder = (formData.get("folder") as string) || "uploads";
    const resourceType = (formData.get("resource_type") as string) || "image"; // 'image' or 'video'

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type based on resource type
    let allowedTypes: string[];
    let maxSize: number;

    if (resourceType === "video") {
      allowedTypes = [
        "video/mp4",
        "video/webm",
        "video/ogg",
        "video/quicktime",
        "video/x-msvideo",
        "video/x-matroska",
      ];
      maxSize = 50 * 1024 * 1024; // 50MB for videos

      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          {
            error:
              "Invalid file type. Only MP4, WebM, OGG, MOV, AVI, and MKV videos are allowed.",
          },
          { status: 400 }
        );
      }
    } else {
      // Image validation (existing)
      allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
        "image/gif",
      ];
      maxSize = 10 * 1024 * 1024; // 10MB for images

      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          {
            error:
              "Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.",
          },
          { status: 400 }
        );
      }
    }

    // Validate file size
    if (file.size > maxSize) {
      const maxSizeMB = resourceType === "video" ? 50 : 10;
      return NextResponse.json(
        { error: `File size too large. Maximum ${maxSizeMB}MB allowed.` },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary with appropriate settings
    const uploadResult = await new Promise<UploadApiResponse>(
      (resolve, reject) => {
        const uploadOptions = {
          folder: `numa/${folder}`,
          resource_type: resourceType as "image" | "video",
          public_id: `${Date.now()}_${file.name.split(".")[0].replace(/[^a-zA-Z0-9]/g, "_")}`,
          ...(resourceType === "image"
            ? {
                transformation: [
                  {
                    quality: "auto",
                    fetch_format: "auto",
                  },
                ],
              }
            : {
                // Video-specific options
                resource_type: "video" as const,
                chunk_size: 6000000, // 6MB chunks for large videos
              }),
        };

        cloudinary.uploader
          .upload_stream(uploadOptions, (error, result) => {
            if (error) reject(error);
            else if (result) resolve(result);
            else reject(new Error("Upload failed"));
          })
          .end(buffer);
      }
    );

    return NextResponse.json({
      success: true,
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      width: uploadResult.width,
      height: uploadResult.height,
      format: uploadResult.format,
      bytes: uploadResult.bytes,
      duration: uploadResult.duration, // For videos
      originalName: file.name,
      folder: folder,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file to Cloudinary" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const adminCheck = await requireAdmin(request);
  if (adminCheck instanceof NextResponse) return adminCheck;

  try {
    const { searchParams } = new URL(request.url);
    const publicId = searchParams.get("publicId");

    if (!publicId) {
      return NextResponse.json(
        { error: "No publicId provided" },
        { status: 400 }
      );
    }

    // Delete from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);

    return NextResponse.json({
      success: true,
      result: result,
      message: "Image deleted successfully from Cloudinary",
    });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete image from Cloudinary" },
      { status: 500 }
    );
  }
}
