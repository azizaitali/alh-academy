import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/app/api/admin/auth/route";
import {
  fetchTikkiePaymentRequestWithPayments,
  getTikkieCredentials,
} from "@/lib/tikkie-api";

export async function GET(req: NextRequest) {
  // 1. Verify admin token
  const authHeader = req.headers.get("authorization");
  const cookieToken = req.cookies.get("admin_token")?.value;
  const token = authHeader?.replace("Bearer ", "") || cookieToken || null;

  if (!verifyAdminToken(token)) {
    return NextResponse.json(
      { success: false, error: "Unauthorized access. Admin credentials required." },
      { status: 401 }
    );
  }

  // 2. Extract query parameters
  const { searchParams } = new URL(req.url);
  const requestedToken = searchParams.get("paymentRequestToken") || undefined;
  const forceMock = searchParams.get("mock") === "true";

  try {
    const data = await fetchTikkiePaymentRequestWithPayments({
      paymentRequestToken: requestedToken,
      forceMock,
    });

    return NextResponse.json(data);
  } catch (error: unknown) {
    const creds = getTikkieCredentials();
    return NextResponse.json(
      {
        success: false,
        error:
          "Internal server error while fetching Tikkie data: " +
          (error instanceof Error ? error.message : String(error)),
        credentialsStatus: creds,
      },
      { status: 500 }
    );
  }
}
