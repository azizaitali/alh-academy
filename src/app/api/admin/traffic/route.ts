import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/app/api/admin/auth/route";
import { getTrafficAndPaymentsData } from "@/lib/traffic";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cookieToken = req.cookies.get("admin_token")?.value;
  const token = authHeader?.replace("Bearer ", "") || cookieToken || null;

  if (!verifyAdminToken(token)) {
    return NextResponse.json(
      { success: false, error: "Unauthorized access. Admin credentials required." },
      { status: 401 }
    );
  }

  try {
    const data = await getTrafficAndPaymentsData();
    return NextResponse.json({
      success: true,
      ...data,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to load traffic data: " + String(error) },
      { status: 500 }
    );
  }
}
