import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: Request) {
  try {
    const { photoURL } = await request.json();
    if (!photoURL) return NextResponse.json({ message: "No URL provided" }, { status: 400 });

    // Extraire la clé du fichier de l'URL (ex: members/123-image.jpg)
    // On suppose que ton URL est https://invity.site/members/xxx
    const url = new URL(photoURL);
    const key = url.pathname.startsWith('/') ? url.pathname.substring(1) : url.pathname;

    const cmd = new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
    });

    await r2.send(cmd);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("R2 Delete Error:", error);
    return NextResponse.json({ error: "Failed to delete from R2" }, { status: 500 });
  }
}