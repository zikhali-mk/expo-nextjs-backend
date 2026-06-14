import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Account from "@/models/account";

// GET ACCOUNT
export async function GET() {
  try {
    await connectDB();

    const account = await Account.findOne();

    return NextResponse.json(account);
  } catch (error) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}

// CREATE ACCOUNT
export async function POST(req) {
  try {
    await connectDB();

    const existing = await Account.findOne();

    if (existing) {
      return NextResponse.json(
        { message: "Account already exists." },
        { status: 400 }
      );
    }

    const body = await req.json();

    const account = await Account.create({
      balance: body.balance || 0,
      deposits: body.deposits || 0,
      withdrawals: body.withdrawals || 0,
      profits: body.profits || 0,
      losses: body.losses || 0,
    });

    return NextResponse.json(account, {
      status: 201,
    });
  } catch (error) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}

// UPDATE ACCOUNT
export async function PATCH(req) {
  try {
    await connectDB();

    const body = await req.json();

    const account = await Account.findOne();

    if (!account) {
      return NextResponse.json(
        { message: "Account not found." },
        { status: 404 }
      );
    }

    if (body.deposit) {
      account.deposits += body.deposit;
      account.balance += body.deposit;
    }

    if (body.withdrawal) {
      account.withdrawals += body.withdrawal;
      account.balance -= body.withdrawal;
    }

    if (body.profit) {
      account.profits += body.profit;
      account.balance += body.profit;
    }

    if (body.loss) {
      account.losses += body.loss;
      account.balance -= body.loss;
    }

    await account.save();

    return NextResponse.json(account);
  } catch (error) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}
