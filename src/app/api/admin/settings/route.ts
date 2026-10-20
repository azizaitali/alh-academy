import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/app/api/admin/auth/route";
import { getAppSettings, updateAppSettings, AppSettings } from "@/lib/settings";

function checkAuth(req: NextRequest): boolean {
  const authHeader = req.headers.get("authorization");
  const cookieToken = req.cookies.get("admin_token")?.value;
  const token = authHeader?.replace("Bearer ", "") || cookieToken || null;
  return verifyAdminToken(token);
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json(
      { success: false, error: "Unauthorized access." },
      { status: 401 }
    );
  }

  try {
    const settings = await getAppSettings();
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to retrieve settings: " + String(error) },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json(
      { success: false, error: "Unauthorized access." },
      { status: 401 }
    );
  }

  try {
    const body: Partial<AppSettings> = await req.json();

    // Basic validation
    if (body.defaultTikkieUrl && !body.defaultTikkieUrl.startsWith("http")) {
      return NextResponse.json(
        { success: false, error: "Default Tikkie URL must be a valid HTTP/HTTPS URL." },
        { status: 400 }
      );
    }

    const updated = await updateAppSettings(body);
    return NextResponse.json({
      success: true,
      message: "Settings successfully saved to database.",
      settings: updated,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to save settings: " + String(error) },
      { status: 500 }
    );
  }
}
