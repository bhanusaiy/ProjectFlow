
const mongoose = require("mongoose");

const progressSnapshotSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },

    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
      index: true,
    },

    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    periodType: {
      type: String,
      enum: ["weekly", "monthly"],
      required: true,
    },

    periodStart: {
      type: Date,
      required: true,
    },

    periodEnd: {
      type: Date,
      required: true,
    },

    totalTasks: {
      type: Number,
      required: true,
      min: 0,
    },

    completedTasks: {
      type: Number,
      required: true,
      min: 0,
    },

    progressPercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },

    tasksCompletedDuringPeriod: {
      type: Number,
      default: 0,
      min: 0,
    },

    capturedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate snapshots for the same project and period.
progressSnapshotSchema.index(
  {
    project: 1,
    periodType: 1,
    periodStart: 1,
  },
  {
    unique: true,
  }
);

module.exports =
  mongoose.models.ProgressSnapshot ||
  mongoose.model("ProgressSnapshot", progressSnapshotSchema);
