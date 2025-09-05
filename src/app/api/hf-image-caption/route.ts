import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Image Captioning API has been removed (project deprecated)." },
    { status: 410 }
  );
}
