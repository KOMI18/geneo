import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
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
    const { fileName, fileType } = await request.json();
    
    
    const fileKey = `members/${Date.now()}-${fileName.replace(/\s+/g, '-')}`;

    const cmd = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: fileKey,
      ContentType: fileType,
    });

    const signedUrl = await getSignedUrl(r2, cmd, { expiresIn: 3600 });
    const publicUrl = `${process.env.NEXT_PUBLIC_R2_URL}/${fileKey}`;

    return NextResponse.json({ signedUrl, publicUrl });
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de la génération" }, { status: 500 });
  }
}