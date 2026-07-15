import { NextResponse } from "next/server";
import { createPrivatePhotoUpload } from "@/lib/private-photo-storage";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { type?: string; size?: number };
    const upload = await createPrivatePhotoUpload({ type: body.type || "", size: Number(body.size) });
    return NextResponse.json(upload);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Não foi possível preparar o envio.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
