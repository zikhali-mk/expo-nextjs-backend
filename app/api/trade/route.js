import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Trade from "@/models/tradeModel";

// =======================
// GET ALL TRADES
// =======================

export async function GET() {
  try {
    await connectDB();

    const trades = await Trade.find().sort({ createdAt: -1 });

    return NextResponse.json(
      {
        success: true,
        trades,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// =======================
// CREATE A NEW TRADE
// =======================

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();

    console.log("Received Body:", body);

    const trade = new Trade(body);

    await trade.save();

    return NextResponse.json(
      {
        success: true,
        message: "Trade created successfully.",
        trade,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
