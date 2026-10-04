import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const redirectTo = searchParams.get("redirect_to") || "/";

    let paymentId = "";
    let orderId = "";
    let signature = "";
    let errorCode = "";
    let errorDescription = "";

    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      paymentId = (formData.get("razorpay_payment_id") as string) || "";
      orderId = (formData.get("razorpay_order_id") as string) || "";
      signature = (formData.get("razorpay_signature") as string) || "";
      errorCode = (formData.get("error[code]") as string) || "";
      errorDescription = (formData.get("error[description]") as string) || "";
    } else if (contentType.includes("application/json")) {
      const json = await request.json().catch(() => ({}));
      paymentId = json.razorpay_payment_id || "";
      orderId = json.razorpay_order_id || "";
      signature = json.razorpay_signature || "";
      if (json.error) {
        errorCode = json.error.code || "";
        errorDescription = json.error.description || "";
      }
    } else {
      const text = await request.text();
      const params = new URLSearchParams(text);
      paymentId = params.get("razorpay_payment_id") || "";
      orderId = params.get("razorpay_order_id") || "";
      signature = params.get("razorpay_signature") || "";
      errorCode = params.get("error[code]") || "";
      errorDescription = params.get("error[description]") || "";
    }

    const targetUrl = new URL(redirectTo, request.url);
    targetUrl.searchParams.set("gateway", "razorpay");

    if (paymentId) {
      targetUrl.searchParams.set("payment_id", paymentId);
      targetUrl.searchParams.set("order_id", orderId);
      if (signature) {
        targetUrl.searchParams.set("signature", signature);
      }
    } else if (errorCode || errorDescription) {
      targetUrl.searchParams.set("payment_error", errorDescription || errorCode || "Payment failed");
      if (orderId) {
        targetUrl.searchParams.set("order_id", orderId);
      }
    }

    // Use 303 See Other so the browser switches from POST to GET
    return NextResponse.redirect(targetUrl, 303);
  } catch (err: any) {
    console.error("Razorpay callback route error:", err);
    const searchParams = request.nextUrl.searchParams;
    const redirectTo = searchParams.get("redirect_to") || "/";
    const targetUrl = new URL(redirectTo, request.url);
    targetUrl.searchParams.set("gateway", "razorpay");
    targetUrl.searchParams.set("payment_error", "Payment processing error");
    return NextResponse.redirect(targetUrl, 303);
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const redirectTo = searchParams.get("redirect_to") || "/";
  const targetUrl = new URL(redirectTo, request.url);

  searchParams.forEach((value, key) => {
    if (key !== "redirect_to") {
      targetUrl.searchParams.set(key, value);
    }
  });

  if (!targetUrl.searchParams.has("gateway")) {
    targetUrl.searchParams.set("gateway", "razorpay");
  }

  return NextResponse.redirect(targetUrl, 303);
}
