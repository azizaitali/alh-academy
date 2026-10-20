import { NextResponse } from "next/server";
import { getAppSettings } from "@/lib/settings";

export async function GET() {
  try {
    const settings = await getAppSettings();
    return NextResponse.json({
      success: true,
      settings: {
        defaultTikkieUrl: settings.defaultTikkieUrl,
        coursePlans: settings.coursePlans,
        academyName: settings.academyName,
        supportEmail: settings.supportEmail,
        currency: settings.currency,
        maintenanceMode: settings.maintenanceMode,
        allowCustomTikkieUrl: settings.allowCustomTikkieUrl,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: "Failed to load settings: " + String(err) },
      { status: 500 }
    );
  }
}
