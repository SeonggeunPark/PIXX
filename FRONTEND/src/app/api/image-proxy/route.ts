// app/api/image-proxy/route.ts

import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");

  if (!url) {
    return new NextResponse("Missing 'url' query parameter", { status: 400 });
  }

  try {
    const imageRes = await fetch(url);

    if (!imageRes.ok) {
      return new NextResponse("Failed to fetch image", { status: 502 });
    }

    const contentType = imageRes.headers.get("content-type") || "image/jpeg";
    const buffer = await imageRes.arrayBuffer();

    return new NextResponse(Buffer.from(buffer), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400", // 1일 캐싱
      },
    });
  } catch (error) {
    console.log(error);
    return new NextResponse("Proxy error", { status: 500 });
  }
}
