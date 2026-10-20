import { NextRequest, NextResponse } from "next/server";
import { logTraffic } from "@/lib/traffic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const path = body.path || "/";
    const referrer = body.referrer || req.headers.get("referer") || "Direct";
    const userAgent = req.headers.get("user-agent") || "Unknown";
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0] ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    await logTraffic(path, referrer, userAgent, ip);

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
