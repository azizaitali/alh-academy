import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";

// In-memory fallback in case MongoDB server is temporarily unreachable in dev environment
const memoryFallbackPayments: Array<{
  _id: string;
  name: string;
  email: string;
  reference: string;
  createdAt: Date;
  amount?: number;
  isMockFallback?: boolean;
}> = [];

function generatePaymentReference(): string {
  const prefix = "ALH";
  const year = new Date().getFullYear();
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${year}-${randomPart}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, amount, customTikkieUrl } = body;

    // Validate inputs
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Please enter your full name." },
        { status: 400 }
      );
    }

    if (
      !email ||
      typeof email !== "string" ||
      !email.includes("@") ||
      !email.includes(".")
    ) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    const reference = generatePaymentReference();
    const createdAt = new Date();

    // The required document structure according to user requirements:
    // contains name, email address, reference, and creation date and time
    const paymentDocument = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      reference: reference,
      createdAt: createdAt,
      amount: typeof amount === "number" ? amount : 49.0,
      currency: "EUR",
      status: "pending",
    };

    let insertedId: string | null = null;
    let savedToMongoDB = false;
    let errorMessage: string | null = null;

    try {
      const db = await getDatabase();
      const collection = db.collection("payments");
      const result = await collection.insertOne(paymentDocument);
      insertedId = result.insertedId.toString();
      savedToMongoDB = true;
    } catch (dbErr: unknown) {
      console.warn("MongoDB connection notice:", dbErr);
      const errMsg = dbErr instanceof Error ? dbErr.message : "MongoDB connection failed";
      errorMessage = errMsg;

      // Fallback in-memory store so the app remains fully functional in local dev previews
      const fallbackDoc = {
        _id: `mem_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        ...paymentDocument,
        isMockFallback: true,
      };
      memoryFallbackPayments.unshift(fallbackDoc);
      insertedId = fallbackDoc._id;
    }

    // Determine Tikkie URL to return
    const baseTikkieUrl =
      customTikkieUrl ||
      process.env.NEXT_PUBLIC_DEFAULT_TIKKIE_URL ||
      "https://tikkie.me/pay/ALHAcademy/course-fee";

    // Append reference if standard query params supported
    const tikkieUrlWithRef = baseTikkieUrl.includes("?")
      ? `${baseTikkieUrl}&ref=${encodeURIComponent(reference)}`
      : `${baseTikkieUrl}?ref=${encodeURIComponent(reference)}`;

    return NextResponse.json(
      {
        success: true,
        message: savedToMongoDB
          ? "Payment record successfully saved to MongoDB collection 'payments'!"
          : "Saved to local memory fallback (MongoDB is not currently running).",
        savedToMongoDB,
        errorMessage: savedToMongoDB ? null : errorMessage,
        payment: {
          id: insertedId,
          name: paymentDocument.name,
          email: paymentDocument.email,
          reference: paymentDocument.reference,
          createdAt: paymentDocument.createdAt,
          amount: paymentDocument.amount,
          currency: paymentDocument.currency,
        },
        tikkieUrl: tikkieUrlWithRef,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Error processing payment:", error);
    const message = error instanceof Error ? error.message : "Failed to record payment";
    return NextResponse.json(
      { error: "Server error processing payment.", details: message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    try {
      const db = await getDatabase();
      const collection = db.collection("payments");
      const payments = await collection
        .find({})
        .sort({ createdAt: -1 })
        .limit(20)
        .toArray();

      return NextResponse.json({
        success: true,
        source: "mongodb",
        count: payments.length,
        payments: payments.map((p) => ({
          id: p._id.toString(),
          name: p.name,
          email: p.email,
          reference: p.reference,
          createdAt: p.createdAt,
          amount: p.amount,
          currency: p.currency,
          status: p.status || "completed",
        })),
      });
    } catch {
      return NextResponse.json({
        success: true,
        source: "memory-fallback",
        count: memoryFallbackPayments.length,
        payments: memoryFallbackPayments,
      });
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error fetching payments";
    return NextResponse.json(
      { error: "Unable to retrieve payments.", details: message },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { reference, status } = body;

    if (!reference || !status) {
      return NextResponse.json(
        { error: "Reference and status are required." },
        { status: 400 }
      );
    }

    let updated = false;

    try {
      const db = await getDatabase();
      const collection = db.collection("payments");
      const result = await collection.updateOne(
        { reference },
        { $set: { status, updatedAt: new Date() } }
      );
      updated = result.matchedCount > 0;
    } catch {
      const found = memoryFallbackPayments.find((p) => p.reference === reference);
      if (found) {
        (found as Record<string, unknown>).status = status;
        updated = true;
      }
    }

    return NextResponse.json({ success: true, updated, status });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error updating payment status";
    return NextResponse.json(
      { error: "Unable to update payment status.", details: message },
      { status: 500 }
    );
  }
}

