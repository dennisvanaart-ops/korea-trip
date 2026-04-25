import { NextRequest, NextResponse } from "next/server";
import { getFlightProvider } from "@/lib/flights/provider";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const flightNumber = searchParams.get("flightNumber");
  const date = searchParams.get("date");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  if (!flightNumber || !date || !from || !to) {
    return NextResponse.json(
      { error: "Missing required parameters: flightNumber, date, from, to" },
      { status: 400 }
    );
  }

  try {
    const provider = getFlightProvider();
    const status = await provider.getStatus({ flightNumber, date, from, to });
    return NextResponse.json(status, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60" },
    });
  } catch (err) {
    console.error("[flights/status]", err);
    return NextResponse.json(
      { error: "Live status tijdelijk niet beschikbaar." },
      { status: 503 }
    );
  }
}
