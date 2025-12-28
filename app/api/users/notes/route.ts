import { getDataFromToken } from "@/helpers/getDataFromToken";
import { NextRequest, NextResponse } from "next/server";
import User from "@/models/userModel";
import { connect } from "@/dbConfig/dbConfig";

// GET - Fetch user notes
export async function GET(request: NextRequest) {
  await connect();

  try {
    const userId = await getDataFromToken(request);
    const user = await User.findOne({ _id: userId }).select("notes");

    if (!user) {
      return NextResponse.json(
        { error: "User not found", success: false },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      notes: user.notes || "",
      lastUpdated: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Notes GET API Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error", success: false },
      { status: 500 }
    );
  }
}

// PUT - Update user notes
export async function PUT(request: NextRequest) {
  await connect();

  try {
    const userId = await getDataFromToken(request);
    const { notes } = await request.json();

    if (notes === undefined) {
      return NextResponse.json(
        { error: "Notes content is required", success: false },
        { status: 400 }
      );
    }

    const date = new Date();

    const options: Intl.DateTimeFormatOptions = {
      timeZone: 'Asia/Kolkata',
      hour12: false,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric'
    };

    const updateTime = date.toLocaleString('en-IN', options);

    const user = await User.findByIdAndUpdate(
      userId,
      {
        notes: {
          content: notes,
          lastUpdate: updateTime,
        },
      },
      { new: true }
    ).select("notes");

    if (!user) {
      return NextResponse.json(
        { error: "User not found", success: false },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Notes saved successfully",
      notes: user.notes,
    });
  } catch (error: any) {
    console.error("Notes PUT API Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error", success: false },
      { status: 500 }
    );
  }
}