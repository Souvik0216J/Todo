import mongoose from "mongoose";

const userTask = new mongoose.Schema({
    status: {
        type: String,
        default: "Pending" // "pending" | "in-progress" | "completed"
    },

    description: {
        type: String,
        required: [true, "Please provide a task description"],
    },

    priority: {
        type: String,
        default: "low" // "low" | "medium" | "high"
    },

    dueDate: {
        type: String,
        default: ""
    },

    taskCreatedAt: {
        type: String,
        default: ""
    },

    taskUpdatedAt: {
        type: String,
        default: ""
    }
});

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please provide a Full Name"],
    },

    email: {
        type: String,
        required: [true, "Please provide a email"],
        unique: true,
    },

    password: {
        type: String,
        required: [true, "Please provide a password"],
        default: "",
    },

    createdAt: {
        type: String,
        default: ""
    },

    lastLogin: {
        type: String,
        default: ""
    },

    tasks: {
        type: [userTask], // this stores array of tasks objects
        default: [],
    },
});

const User = mongoose.models.todoData || mongoose.model("todoData", userSchema);

export default User;