import { getDatabase } from "@/lib/mongodb";

export interface TrafficRecord {
  id?: string;
  path: string;
  referrer: string;
  ip: string;
  userAgent: string;
  device: string;
  browser: string;
  timestamp: Date;
}

// In-memory fallback if MongoDB is not running
const memoryTraffic: TrafficRecord[] = [];

function detectDevice(userAgent: string): string {
  if (!userAgent) return "Desktop";
  const ua = userAgent.toLowerCase();
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return "Tablet";
  }
  if (
    /Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(
      ua
    )
  ) {
    return "Mobile";
  }
  return "Desktop";
}

function detectBrowser(userAgent: string): string {
  if (!userAgent) return "Unknown";
  const ua = userAgent.toLowerCase();
  if (ua.includes("edg/")) return "Edge";
  if (ua.includes("chrome") && !ua.includes("edg")) return "Chrome";
  if (ua.includes("safari") && !ua.includes("chrome")) return "Safari";
  if (ua.includes("firefox")) return "Firefox";
  if (ua.includes("opera") || ua.includes("opr/")) return "Opera";
  return "Other";
}

export async function logTraffic(
  path: string,
  referrer: string,
  userAgent: string,
  ip: string
): Promise<void> {
  const record: TrafficRecord = {
    path: path || "/",
    referrer: referrer || "Direct",
    userAgent: userAgent || "Unknown",
    ip: ip || "127.0.0.1",
    device: detectDevice(userAgent),
    browser: detectBrowser(userAgent),
    timestamp: new Date(),
  };

  try {
    const db = await getDatabase();
    const collection = db.collection("traffic");
    await collection.insertOne(record);
  } catch (error) {
    console.warn("Could not save traffic to MongoDB, saving in memory:", error);
    memoryTraffic.unshift(record);
    if (memoryTraffic.length > 500) {
      memoryTraffic.pop();
    }
  }
}

export async function getTrafficAndPaymentsData() {
  try {
    const db = await getDatabase();
    const trafficCol = db.collection("traffic");
    const paymentsCol = db.collection("payments");

    const [trafficDocs, paymentDocs, totalTrafficCount, totalPaymentsCount] = await Promise.all([
      trafficCol.find({}).sort({ timestamp: -1 }).limit(100).toArray(),
      paymentsCol.find({}).sort({ createdAt: -1 }).limit(100).toArray(),
      trafficCol.countDocuments(),
      paymentsCol.countDocuments(),
    ]);

    const completed = paymentDocs.filter((p) => p.status === "completed" || !p.status);
    const failed = paymentDocs.filter((p) => p.status === "failed");
    const pending = paymentDocs.filter((p) => p.status === "pending");

    const totalRevenue = completed.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const totalVisits = Math.max(totalTrafficCount, trafficDocs.length);
    const conversionRate = totalVisits > 0 ? ((completed.length / totalVisits) * 100).toFixed(1) : "0.0";

    return {
      metrics: {
        totalVisits,
        totalPayments: totalPaymentsCount,
        completedCount: completed.length,
        failedCount: failed.length,
        pendingCount: pending.length,
        totalRevenue: Number(totalRevenue.toFixed(2)),
        conversionRate,
      },
      traffic: trafficDocs.map((t) => ({
        id: t._id.toString(),
        path: t.path,
        referrer: t.referrer,
        ip: t.ip,
        device: t.device,
        browser: t.browser,
        timestamp: t.timestamp,
      })),
      payments: paymentDocs.map((p) => ({
        id: p._id.toString(),
        name: p.name,
        email: p.email,
        reference: p.reference,
        amount: p.amount || 49.0,
        currency: p.currency || "EUR",
        status: p.status || "completed",
        createdAt: p.createdAt,
      })),
      source: "mongodb",
    };
  } catch (err) {
    console.warn("Traffic query fell back to memory:", err);
    return {
      metrics: {
        totalVisits: memoryTraffic.length,
        totalPayments: 0,
        completedCount: 0,
        failedCount: 0,
        pendingCount: 0,
        totalRevenue: 0,
        conversionRate: "0.0",
      },
      traffic: memoryTraffic,
      payments: [],
      source: "memory-fallback",
    };
  }
}
