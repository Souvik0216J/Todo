import { getDataFromToken } from "@/helpers/getDataFromToken";
import { NextRequest, NextResponse } from "next/server";
import User from "@/models/userModel";
import { connect } from "@/dbConfig/dbConfig";

export async function GET(request: NextRequest) {
  await connect();

  try {
    const userId = await getDataFromToken(request);
    const user = await User.findOne({_id: userId}).select("-password").select("-_id").select("-lastLogin");

    if (!user) {
      return NextResponse.json(
        { error: "User not found", success: false },
        { status: 404 }
      );
    }

    // Get tasks array from user
    const tasks = user.tasks || [];
    const now = new Date();
    
    // Calculate statistics
    const totalTasks = tasks.length;
    
    // Handle both "Pending" and "pending" status
    const completedTasks = tasks.filter((t: any) => 
      t.status === "completed"
    ).length;
    
    const pendingTasks = tasks.filter((t: any) => 
      t.status === "Pending" || t.status === "pending"
    ).length;
    
    const inProgressTasks = tasks.filter((t: any) => 
      t.status === "in-progress"
    ).length;
    
    // Calculate overdue tasks (tasks that are not completed and past due date)
    const overdueTasks = tasks.filter((t: any) => {
      if (!t.dueDate || t.status === "completed") return false;
      const dueDate = new Date(t.dueDate);
      return dueDate < now;
    }).length;

    // Calculate completion rate
    const completionRate = totalTasks > 0 
      ? Math.round((completedTasks / totalTasks) * 100) 
      : 0;

    // Get recent tasks 
    const recentTasks = [...tasks]
      .sort((a: any, b: any) => {
        const dateA = new Date(a.taskCreatedAt || a.createdAt || 0);
        const dateB = new Date(b.taskCreatedAt || b.createdAt || 0);
        return dateB.getTime() - dateA.getTime();
      })
      .map((task: any) => ({
        id: task._id.toString(),
        title: task.description.substring(0, 50), // First 50 chars as title
        description: task.description,
        status: task.status === "Pending" ? "pending" : task.status, // Normalize status
        priority: task.priority || "low",
        dueDate: task.dueDate || "",
        createdAt: task.taskCreatedAt || "",
      }));

    const upcomingTasks = [...tasks]
      .filter((t: any) => t.status !== "completed" && t.dueDate)
      .sort((a: any, b: any) => {
        const dateA = new Date(a.dueDate);
        const dateB = new Date(b.dueDate);
        return dateA.getTime() - dateB.getTime();
      })
      .slice(0, 5)
      .map((task: any) => ({
        id: task._id.toString(),
        title: task.description.substring(0, 50),
        description: task.description,
        status: task.status === "Pending" ? "pending" : task.status, // Normalize status
        priority: task.priority || "low",
        dueDate: task.dueDate || "",
        createdAt: task.taskCreatedAt || "",
      }));

    return NextResponse.json({
      success: true,
      stats: {
        totalTasks,
        completedTasks,
        pendingTasks,
        inProgressTasks,
        overdueTasks,
        completionRate,
      },
      recentTasks,
      upcomingTasks,
    });
  } catch (error: any) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error", success: false },
      { status: 500 }
    );
  }
}