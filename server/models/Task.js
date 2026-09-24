const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    // =========================
    // BASIC INFORMATION
    // =========================

    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      maxlength: 200,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },


    // =========================
    // PROJECT
    // =========================

    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "Project is required"],
    },


    // =========================
    // ASSIGNED EMPLOYEE
    // =========================

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Task must be assigned to an employee"],
    },


    // =========================
    // TASK CREATOR
    // =========================

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },


    // =========================
    // STATUS
    // =========================

    status: {
      type: String,

      enum: [
        "todo",
        "in-progress",
        "review",
        "completed",
      ],

      default: "todo",
    },


    // =========================
    // PRIORITY
    // =========================

    priority: {
      type: String,

      enum: [
        "low",
        "medium",
        "high",
        "urgent",
      ],

      default: "medium",
    },


    // =========================
    // DATES
    // =========================

    startDate: {
      type: Date,
      default: null,
    },

    dueDate: {
      type: Date,
      default: null,
    },


    // =========================
    // ESTIMATED HOURS
    // =========================

    estimatedHours: {
      type: Number,
      min: 0,
      default: 0,
    },


    // =========================
    // COMPLETION
    // =========================

    completedAt: {
      type: Date,
      default: null,
    },
  },

  {
    timestamps: true,
  }
);


// =========================
// AUTOMATIC COMPLETION DATE
// =========================

taskSchema.pre("save", function () {
  if (this.status === "completed" && !this.completedAt) {
    this.completedAt = new Date();
  }

  if (this.status !== "completed") {
    this.completedAt = null;
  }
});


module.exports = mongoose.model(
  "Task",
  taskSchema
);