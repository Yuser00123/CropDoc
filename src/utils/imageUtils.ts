/**
 * Converts a File into a base64 string, optionally resizing if dimensions exceed maxDimension
 * to ensure fast uploads and stay well under request payloads.
 */
export async function processImageFile(file: File, maxDimension: number = 1024): Promise<{
  base64: string;
  mimeType: string;
  dataUrl: string;
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read image file"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Failed to load image"));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve({
            base64: (reader.result as string).split(",")[1],
            mimeType: file.type || "image/jpeg",
            dataUrl: reader.result as string,
          });
          return;
        }

        // Draw and compress slightly for fast transmission and LLM vision inference
        ctx.drawImage(img, 0, 0, width, height);
        const mimeType = "image/jpeg";
        const dataUrl = canvas.toDataURL(mimeType, 0.85);
        const base64 = dataUrl.split(",")[1];

        resolve({ base64, mimeType, dataUrl });
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Fetch an image URL and convert to Base64
 */
export async function fetchImageUrlAsBase64(url: string): Promise<{
  base64: string;
  mimeType: string;
  dataUrl: string;
}> {
  if (url.startsWith("data:")) {
    const mimeMatch = url.match(/^data:([^;]+);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";
    const base64 = url.split(",")[1] || "";
    return { base64, mimeType, dataUrl: url };
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load sample image (Status ${response.status})`);
  }
  const blob = await response.blob();
  const file = new File([blob], "sample-leaf.jpg", { type: blob.type || "image/jpeg" });
  return processImageFile(file);
}
