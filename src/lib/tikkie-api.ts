// ABN AMRO Tikkie API v2 Integration Helper

export interface TikkiePayment {
  paymentToken: string;
  amountInCents: number;
  currency: string;
  createdDateTime: string;
  counterPartyName?: string;
  counterPartyAccountNumber?: string;
  description?: string;
  refunds?: Array<{
    refundToken: string;
    amountInCents: number;
    description?: string;
    createdDateTime: string;
  }>;
}

export interface TikkiePaymentRequest {
  paymentRequestToken: string;
  amountInCents?: number | null;
  currency?: string;
  description: string;
  url: string;
  expiryDate?: string;
  createdDateTime: string;
  status: "OPEN" | "CLOSED" | "EXPIRED" | string;
  numberOfPayments: number;
  totalAmountPaidInCents: number;
}

export interface TikkieCredentialsStatus {
  apiKey: string | null;
  appToken: string | null;
  defaultPaymentRequestToken: string | null;
  hasApiKey: boolean;
  hasAppToken: boolean;
  hasPaymentRequestToken: boolean;
  isSandbox: boolean;
  baseUrl: string;
}

/**
 * Reads and inspects Tikkie environment configuration.
 * Supports various naming formats (Api-Key, API_KEY, X-App-Token, PaymentRequestToken, etc.)
 */
export function getTikkieCredentials(): TikkieCredentialsStatus {
  const apiKey =
    process.env["Api-Key"] ||
    process.env["api-key"] ||
    process.env.API_KEY ||
    process.env.TIKKIE_API_KEY ||
    process.env["NEXT_PUBLIC_TIKKIE_API_KEY"] ||
    null;

  const appToken =
    process.env["X-App-Token"] ||
    process.env["x-app-token"] ||
    process.env.X_APP_TOKEN ||
    process.env.TIKKIE_X_APP_TOKEN ||
    process.env.TIKKIE_APP_TOKEN ||
    process.env["NEXT_PUBLIC_TIKKIE_APP_TOKEN"] ||
    null;

  const defaultPaymentRequestToken =
    process.env["PaymentRequestToken"] ||
    process.env.PaymentRequestToken ||
    process.env.PAYMENT_REQUEST_TOKEN ||
    process.env.TIKKIE_PAYMENT_REQUEST_TOKEN ||
    null;

  const isSandbox =
    process.env.TIKKIE_SANDBOX === "true" ||
    process.env.TIKKIE_ENVIRONMENT === "sandbox";

  const baseUrl = isSandbox
    ? "https://api-sandbox.abnamro.com/v2/tikkie"
    : "https://api.abnamro.com/v2/tikkie";

  return {
    apiKey,
    appToken,
    defaultPaymentRequestToken,
    hasApiKey: Boolean(apiKey && apiKey.trim().length > 0),
    hasAppToken: Boolean(appToken && appToken.trim().length > 0),
    hasPaymentRequestToken: Boolean(
      defaultPaymentRequestToken && defaultPaymentRequestToken.trim().length > 0
    ),
    isSandbox,
    baseUrl,
  };
}

/**
 * Mock data generator for testing and demonstration when live API keys are not configured
 */
export function getSampleTikkieData(requestedToken: string) {
  const token = requestedToken || "fUKzY6Fc7DCaCYwSwfu38H";
  const paymentRequest: TikkiePaymentRequest = {
    paymentRequestToken: token,
    amountInCents: 24900,
    currency: "EUR",
    description: "ALH Academy Tuition Fee",
    url: `https://tikkie.me/pay/AlHimmah/${token}`,
    expiryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    createdDateTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: "OPEN",
    numberOfPayments: 4,
    totalAmountPaidInCents: 99600,
  };

  const payments: TikkiePayment[] = [
    {
      paymentToken: "pay_9f83a21b-6c41-412e-9d2a-115f0134bc01",
      amountInCents: 24900,
      currency: "EUR",
      createdDateTime: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      counterPartyName: "Fatima Al-Mansoor",
      counterPartyAccountNumber: "NL42INGB0001234567",
      description: "Tuition ALH Academy - Fatima",
      refunds: [],
    },
    {
      paymentToken: "pay_8a72b10c-5b30-401d-8c19-004e9023ab99",
      amountInCents: 24900,
      currency: "EUR",
      createdDateTime: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      counterPartyName: "Tariq Benali",
      counterPartyAccountNumber: "NL91ABNA0417892345",
      description: "Tuition ALH Academy - Tariq",
      refunds: [],
    },
    {
      paymentToken: "pay_7c61a09b-4a29-390c-7b08-993d8012ba88",
      amountInCents: 24900,
      currency: "EUR",
      createdDateTime: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(),
      counterPartyName: "Zainab El Idrissi",
      counterPartyAccountNumber: "NL18RABO0309876543",
      description: "Tuition ALH Academy - Zainab",
      refunds: [],
    },
    {
      paymentToken: "pay_6b509f8a-3918-289b-6a97-882c7901ab77",
      amountInCents: 24900,
      currency: "EUR",
      createdDateTime: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      counterPartyName: "Youssef Amrani",
      counterPartyAccountNumber: "NL55KNAB0201122334",
      description: "Tuition ALH Academy - Youssef",
      refunds: [],
    },
  ];

  return { paymentRequest, payments };
}

/**
 * Fetches the Payment Request details and all payments for a given paymentRequestToken
 * from the ABN AMRO Tikkie API v2.
 */
export async function fetchTikkiePaymentRequestWithPayments(options: {
  paymentRequestToken?: string;
  forceMock?: boolean;
}) {
  const creds = getTikkieCredentials();
  const tokenToUse =
    options.paymentRequestToken?.trim() ||
    creds.defaultPaymentRequestToken?.trim() ||
    "";

  // If force mock requested or credentials not configured
  if (options.forceMock || !creds.hasApiKey || !creds.hasAppToken) {
    if (!tokenToUse && !options.forceMock) {
      return {
        success: false,
        configured: false,
        credentialsStatus: creds,
        error:
          "Tikkie API credentials not fully configured. Please provide 'Api-Key' and 'X-App-Token' in your environment or .env.local.",
        payments: [],
        totalPaymentsCount: 0,
        totalAmountPaidInCents: 0,
      };
    }

    const sample = getSampleTikkieData(tokenToUse);
    return {
      success: true,
      configured: creds.hasApiKey && creds.hasAppToken,
      credentialsStatus: creds,
      isMock: true,
      paymentRequest: sample.paymentRequest,
      payments: sample.payments,
      totalPaymentsCount: sample.payments.length,
      totalAmountPaidInCents: sample.paymentRequest.totalAmountPaidInCents,
    };
  }

  if (!tokenToUse) {
    return {
      success: false,
      configured: true,
      credentialsStatus: creds,
      error:
        "No PaymentRequestToken provided. Set PaymentRequestToken in your environment or enter a token in the input field.",
      payments: [],
      totalPaymentsCount: 0,
      totalAmountPaidInCents: 0,
    };
  }

  const headers: Record<string, string> = {
    "API-Key": creds.apiKey!,
    "X-App-Token": creds.appToken!,
    Accept: "application/json",
  };

  try {
    // 1. Fetch Payment Request metadata
    const requestUrl = `${creds.baseUrl}/paymentrequests/${encodeURIComponent(tokenToUse)}`;
    const reqRes = await fetch(requestUrl, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    let paymentRequestData: TikkiePaymentRequest | null = null;
    if (reqRes.ok) {
      const rawReq = await reqRes.json();
      paymentRequestData = {
        paymentRequestToken: rawReq.paymentRequestToken || tokenToUse,
        amountInCents: rawReq.amountInCents ?? null,
        currency: rawReq.currency || "EUR",
        description: rawReq.description || "",
        url: rawReq.url || `https://tikkie.me/pay/${tokenToUse}`,
        expiryDate: rawReq.expiryDate,
        createdDateTime: rawReq.createdDateTime || new Date().toISOString(),
        status: rawReq.status || "OPEN",
        numberOfPayments: rawReq.numberOfPayments ?? 0,
        totalAmountPaidInCents: rawReq.totalAmountPaidInCents ?? 0,
      };
    } else {
      let errDetails = `HTTP ${reqRes.status} ${reqRes.statusText}`;
      try {
        const errJson = await reqRes.json();
        if (errJson.errors && Array.isArray(errJson.errors)) {
          errDetails = errJson.errors
            .map((e: { message?: string; code?: string }) => e.message || e.code)
            .join("; ");
        } else if (errJson.message) {
          errDetails = errJson.message;
        }
      } catch {
        // use default statusText
      }

      if (reqRes.status === 404) {
        return {
          success: false,
          configured: true,
          credentialsStatus: creds,
          error: `Payment Request token "${tokenToUse}" was not found on Tikkie (404). Check if the token is correct.`,
          payments: [],
          totalPaymentsCount: 0,
          totalAmountPaidInCents: 0,
        };
      }

      if (reqRes.status === 401 || reqRes.status === 403) {
        return {
          success: false,
          configured: true,
          credentialsStatus: creds,
          error: `ABN AMRO Authorization failed (${reqRes.status}): ${errDetails}. Please verify your Api-Key and X-App-Token.`,
          payments: [],
          totalPaymentsCount: 0,
          totalAmountPaidInCents: 0,
        };
      }

      return {
        success: false,
        configured: true,
        credentialsStatus: creds,
        error: `Failed to fetch payment request (${reqRes.status}): ${errDetails}`,
        payments: [],
        totalPaymentsCount: 0,
        totalAmountPaidInCents: 0,
      };
    }

    // 2. Fetch all payments for this payment request
    //https://api.abnamro.com/v2/tikkie/paymentrequests/sycjQ68VxcMqWg9r9PZX9X/payments?pageNumber=0&pageSize=50
    const paymentsUrl = `${creds.baseUrl}/paymentrequests/${encodeURIComponent(
      tokenToUse
    )}/payments?pageNumber=0&pageSize=50`;

    const payRes = await fetch(paymentsUrl, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    if (!payRes.ok) {
      let errDetails = `HTTP ${payRes.status} ${payRes.statusText}`;
      try {
        const errJson = await payRes.json();
        if (errJson.errors && Array.isArray(errJson.errors)) {
          errDetails = errJson.errors
            .map((e: { message?: string; code?: string }) => e.message || e.code)
            .join("; ");
        } else if (errJson.message) {
          errDetails = errJson.message;
        }
      } catch {
        // use fallback
      }

      return {
        success: false,
        configured: true,
        credentialsStatus: creds,
        paymentRequest: paymentRequestData,
        error: `Payment Request was found, but fetching payments failed (${payRes.status}): ${errDetails}`,
        payments: [],
        totalPaymentsCount: 0,
        totalAmountPaidInCents: paymentRequestData?.totalAmountPaidInCents || 0,
      };
    }

    const payData = await payRes.json();
    const rawPayments: Array<Record<string, unknown>> = Array.isArray(payData.payments)
      ? payData.payments
      : [];

    const normalizedPayments: TikkiePayment[] = rawPayments.map((p) => ({
      paymentToken: String(p.paymentToken || ""),
      amountInCents: Number(p.amountInCents || 0),
      currency: String(p.currency || "EUR"),
      createdDateTime: String(p.createdDateTime || new Date().toISOString()),
      counterPartyName: (p.counterPartyName || p.consumerName || "") as string,
      counterPartyAccountNumber: (p.counterPartyAccountNumber ||
        p.counterAccountIban ||
        "") as string,
      description: (p.description || "") as string,
      refunds: Array.isArray(p.refunds)
        ? (p.refunds as TikkiePayment["refunds"])
        : [],
    }));

    const totalAmount = normalizedPayments.reduce(
      (sum, p) => sum + (p.amountInCents || 0),
      0
    );

    return {
      success: true,
      configured: true,
      isMock: false,
      credentialsStatus: creds,
      paymentRequest: paymentRequestData,
      payments: normalizedPayments,
      totalPaymentsCount: payData.totalElementCount ?? normalizedPayments.length,
      totalAmountPaidInCents:
        paymentRequestData?.totalAmountPaidInCents ?? totalAmount,
    };
  } catch (err: unknown) {
    return {
      success: false,
      configured: true,
      credentialsStatus: creds,
      error: `Network error connecting to Tikkie API: ${err instanceof Error ? err.message : String(err)
        }`,
      payments: [],
      totalPaymentsCount: 0,
      totalAmountPaidInCents: 0,
    };
  }
}
