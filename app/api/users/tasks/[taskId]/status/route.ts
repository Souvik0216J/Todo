// PATCH - Quick Status Update
import { getDataFromToken } from "@/helpers/getDataFromToken";
import { NextRequest, NextResponse } from "next/server";
import User from "@/models/userModel";
import { connect } from "@/dbConfig/dbConfig";

// QUICK STATUS UPDATE - PATCH METHOD
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ taskId: string }> }
) {
  await connect();

  try {
    const userId = await getDataFromToken(request);
    const { taskId } = await context.params;
    const { status } = await request.json();

    // Validation
    if (!status) {
      return NextResponse.json(
        { error: "Status is required", success: false },
        { status: 400 }
      );
    }

    const validStatuses = ["pending", "Pending", "in-progress", "completed"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        {
          error: "Invalid status. Must be: pending, in-progress, or completed",
          success: false
        },
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

    // Find task by ID in the tasks array
    const task = user.tasks.id(taskId);
    if (!task) {
      return NextResponse.json(
        { error: "Task not found", success: false },
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

    // Update only the status
    task.status = status;
    task.taskUpdatedAt = now;

    // Save the user document
    await user.save();

    return NextResponse.json({
      message: "Task status updated successfully",
      success: true,
      task,
    });
  } catch (error: any) {
    console.error("Update Task Status Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error", success: false },
      { status: 500 }
    );
  }
}