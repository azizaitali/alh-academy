import { getDatabase } from "@/lib/mongodb";
import { CoursePlan, AppSettings, defaultSettings } from "./settings-types";

export type { CoursePlan, AppSettings };
export { defaultSettings };

// In-memory fallback in case MongoDB is temporarily unavailable
let memorySettings: AppSettings = { ...defaultSettings };

export async function getAppSettings(): Promise<AppSettings> {
  try {
    const db = await getDatabase();
    const collection = db.collection("settings");
    const doc = await collection.findOne({ key: "app_settings" });
    if (doc) {
      return {
        defaultTikkieUrl: doc.defaultTikkieUrl || defaultSettings.defaultTikkieUrl,
        coursePlans: Array.isArray(doc.coursePlans) && doc.coursePlans.length > 0
          ? doc.coursePlans
          : defaultSettings.coursePlans,
        academyName: doc.academyName || defaultSettings.academyName,
        supportEmail: doc.supportEmail || defaultSettings.supportEmail,
        currency: doc.currency || defaultSettings.currency,
        maintenanceMode: Boolean(doc.maintenanceMode),
        allowCustomTikkieUrl: doc.allowCustomTikkieUrl ?? defaultSettings.allowCustomTikkieUrl,
        updatedAt: doc.updatedAt,
      };
    }
    // Initialize if empty
    await collection.updateOne(
      { key: "app_settings" },
      { $setOnInsert: { ...defaultSettings, key: "app_settings", createdAt: new Date() } },
      { upsert: true }
    );
    return defaultSettings;
  } catch (error) {
    console.warn("Using in-memory settings fallback:", error);
    return memorySettings;
  }
}

export async function updateAppSettings(newSettings: Partial<AppSettings>): Promise<AppSettings> {
  const merged: AppSettings = {
    ...memorySettings,
    ...newSettings,
    updatedAt: new Date(),
  };

  try {
    const db = await getDatabase();
    const collection = db.collection("settings");
    await collection.updateOne(
      { key: "app_settings" },
      {
        $set: {
          ...newSettings,
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );
    memorySettings = merged;
    return merged;
  } catch (error) {
    console.warn("MongoDB settings update failed, saved to memory:", error);
    memorySettings = merged;
    return merged;
  }
}
