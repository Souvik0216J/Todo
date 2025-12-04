// POST - Create task
import { getDataFromToken } from "@/helpers/getDataFromToken";
import { NextRequest, NextResponse } from "next/server";
import User from "@/models/userModel";
import { connect } from "@/dbConfig/dbConfig";

export async function POST(request: NextRequest) {
  await connect();

  try {
    const userId = await getDataFromToken(request);
    const { description, status, priority, dueDate } = await request.json();

    // Validation
    if (!description || description.trim() === "") {
      return NextResponse.json(
        { error: "Task description is required", success: false },
        { status: 400 }
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: "User not found", success: false },
        { status: 404 }
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
    }

    const now = date.toLocaleString('en-IN', options);

    // Create new task
    const newTask = {
      description: description.trim(),
      status: status || "pending",
      priority: priority || "low",
      dueDate: dueDate || "",
      taskCreatedAt: now,
      taskUpdatedAt: now,
    };

    // Add task to user's tasks array
    user.tasks.push(newTask);
    await user.save();

    return NextResponse.json({
      message: "Task created successfully",
      success: true,
      task: newTask,
    });
  } catch (error: any) {
    console.error("Create Task Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error", success: false },
      { status: 500 }
    );
  }
}