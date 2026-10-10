import { supabase } from "@/integrations/supabase/client";

const BUCKET = "product-images";

/**
 * Upload a single image file to Supabase Storage.
 * Returns the public URL of the uploaded image.
 */
export async function uploadProductImage(
  file: File,
  userId: string
): Promise<string> {
  // Generate unique filename
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 9);
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const filename = `${timestamp}-${random}.${ext}`;
  const path = `${userId}/${filename}`;

  // Upload
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });

  if (error) throw new Error(error.message);

  // Get public URL
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Upload multiple images.
 * Returns array of public URLs in the same order as inputs.
 */
export async function uploadProductImages(
  files: File[],
  userId: string
): Promise<string[]> {
  const urls = await Promise.all(
    files.map((file) => uploadProductImage(file, userId))
  );
  return urls;
}

/**
 * Delete an image from storage by its public URL.
 * Silently fails if the file doesn't exist.
 */
export async function deleteProductImage(publicUrl: string): Promise<void> {
  // Extract path from URL: everything after /product-images/
  const match = publicUrl.match(/\/product-images\/(.+)$/);
  if (!match) return;
  const path = match[1];

  await supabase.storage.from(BUCKET).remove([path]);
}

/**
 * Validate an image file before upload.
 * Returns null if valid, or an error message if invalid.
 */
export function validateImageFile(file: File): string | null {
  const MAX_SIZE_MB = 5;
  const MAX_SIZE = MAX_SIZE_MB * 1024 * 1024;
  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

  if (!ALLOWED_TYPES.includes(file.type)) {
    return `"${file.name}" must be JPG, PNG, or WEBP`;
  }
  if (file.size > MAX_SIZE) {
    return `"${file.name}" is larger than ${MAX_SIZE_MB}MB`;
  }
  return null;
}