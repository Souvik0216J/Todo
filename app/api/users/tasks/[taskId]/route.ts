// PUT/DELETE - Update/Delete task
import { getDataFromToken } from "@/helpers/getDataFromToken";
import { NextRequest, NextResponse } from "next/server";
import User from "@/models/userModel";
import { connect } from "@/dbConfig/dbConfig";

// UPDATE TASK - PUT METHOD
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ taskId: string }> }
) {
  await connect();

  try {
    const userId = await getDataFromToken(request);
    const { taskId } = await context.params;
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

    // Update task fields
    task.description = description.trim();
    task.status = status || task.status;
    task.priority = priority || task.priority;
    task.dueDate = dueDate !== undefined ? dueDate : task.dueDate;
    task.taskUpdatedAt = now;

    // Save the user document
    await user.save();

    return NextResponse.json({
      message: "Task updated successfully",
      success: true,
      task,
    });
  } catch (error: any) {
    console.error("Update Task Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error", success: false },
      { status: 500 }
    );
  }
}

// DELETE TASK - DELETE METHOD
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ taskId: string }> }
) {
  await connect();

  try {
    const userId = await getDataFromToken(request);
    const { taskId } = await context.params;

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: "User not found", success: false },
        { status: 404 }
      );
    }

    // Find task by ID
    const task = user.tasks.id(taskId);
    if (!task) {
      return NextResponse.json(
        { error: "Task not found", success: false },
        { status: 404 }
      );
    }

    // Remove the task from the array
    user.tasks.pull(taskId);

    // Save the user document
    await user.save();

    return NextResponse.json({
      message: "Task deleted successfully",
      success: true,
    });
  } catch (error: any) {
    console.error("Delete Task Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error", success: false },
      { status: 500 }
    );
  }
}