import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Trade from "@/models/tradeModel";
import mongoose from "mongoose";

// =======================
// GET TRADE BY ID
// =======================

export async function GET(req, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid trade ID.",
        },
        { status: 400 }
      );
    }

    const trade = await Trade.findById(id);

    if (!trade) {
      return NextResponse.json(
        {
          success: false,
          message: "Trade not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        trade,
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
// UPDATE TRADE
// =======================

export async function PATCH(req, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid trade ID.",
        },
        { status: 400 }
      );
    }

    const body = await req.json();

    const updatedTrade = await Trade.findByIdAndUpdate(
      id,
      body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedTrade) {
      return NextResponse.json(
        {
          success: false,
          message: "Trade not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Trade updated successfully.",
        trade: updatedTrade,
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
// DELETE TRADE
// =======================

export async function DELETE(req, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid trade ID.",
        },
        { status: 400 }
      );
    }

    const deletedTrade = await Trade.findByIdAndDelete(id);

    if (!deletedTrade) {
      return NextResponse.json(
        {
          success: false,
          message: "Trade not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Trade deleted successfully.",
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
