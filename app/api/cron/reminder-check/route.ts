import { NextResponse, type NextRequest } from "next/server";
import { runReminderCheck } from "@/lib/reminder-cron";

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  const queryParam = request.nextUrl.searchParams.get("secret");
  const isAuthorized =
    secret && (authHeader === `Bearer ${secret}` || queryParam === secret);

  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await runReminderCheck();
  return NextResponse.json(result);
}
