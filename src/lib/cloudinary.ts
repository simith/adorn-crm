import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadToCloudinary(imageData: Buffer, filename: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const base64Data = imageData.toString("base64");
        const dataUri = `data:image/jpeg;base64,${base64Data}`;

        cloudinary.uploader.upload(
            dataUri,
            {
                folder: "adorn-tryon",
                public_id: filename.replace(/\.[^/.]+$/, ""),
                resource_type: "image",
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else if (result) {
                    resolve(result.secure_url);
                } else {
                    reject(new Error("No result from Cloudinary"));
                }
            },
        );
    });
}

// Parse JPEG dimensions from buffer
function getJpegDimensions(buffer: Buffer): { width: number; height: number } | null {
    try {
        let offset = 2;
        while (offset < buffer.length) {
            if (buffer[offset] !== 0xff) return null;
            const marker = buffer[offset + 1];
            if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
                const height = buffer.readUInt16BE(offset + 5);
                const width = buffer.readUInt16BE(offset + 7);
                return { width, height };
            }
            const length = buffer.readUInt16BE(offset + 2);
            offset += 2 + length;
        }
    } catch {
        return null;
    }
    return null;
}

// Parse PNG dimensions from buffer
function getPngDimensions(buffer: Buffer): { width: number; height: number } | null {
    try {
        if (buffer.subarray(0, 8).toString("hex") === "89504e470d0a1a0a") {
            const width = buffer.readUInt32BE(16);
            const height = buffer.readUInt32BE(20);
            return { width, height };
        }
    } catch {
        return null;
    }
    return null;
}

export function getImageDimensions(buffer: Buffer): { width: number; height: number } | null {
    if (buffer[0] === 0xff && buffer[1] === 0xd8) {
        return getJpegDimensions(buffer);
    }
    if (buffer[0] === 0x89 && buffer[1] === 0x50) {
        return getPngDimensions(buffer);
    }
    return null;
}
