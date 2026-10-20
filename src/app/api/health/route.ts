import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";

export async function GET() {
  try {
    const db = await getDatabase();
    // Test command
    const pingResult = await db.command({ ping: 1 });
    const collections = await db.listCollections().toArray();
    const paymentsCount = await db.collection("payments").countDocuments();

    return NextResponse.json({
      status: "connected",
      database: db.databaseName,
      ping: pingResult,
      paymentsCollectionExists: collections.some((c) => c.name === "payments"),
      paymentsCount,
      timestamp: new Date(),
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Connection failed";
    return NextResponse.json(
      {
        status: "disconnected",
        error: msg,
        hint: "Ensure MongoDB is running locally at mongodb://127.0.0.1:27017 or set MONGODB_URI in .env.local",
        timestamp: new Date(),
      },
      { status: 503 }
    );
  }
}
