
const Project = require("../models/project");
const Task = require("../models/Task");
const ProgressSnapshot = require("../models/ProgressSnapshot");

// Period boundaries use UTC, with the end date exclusive.
function getPeriodBounds(periodType, referenceDate = new Date()) {
  const date = new Date(referenceDate);
  date.setUTCHours(0, 0, 0, 0);

  if (periodType === "weekly") {
    const daysSinceMonday = (date.getUTCDay() + 6) % 7;
    date.setUTCDate(date.getUTCDate() - daysSinceMonday);

    const periodStart = new Date(date);
    const periodEnd = new Date(date);
    periodEnd.setUTCDate(periodEnd.getUTCDate() + 7);

    return { periodStart, periodEnd };
  }

  if (periodType === "monthly") {
    const periodStart = new Date(
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1)
    );

    const periodEnd = new Date(
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1)
    );

    return { periodStart, periodEnd };
  }

  throw new Error("periodType must be weekly or monthly");
}

async function captureProjectSnapshot(
  project,
  periodType,
  periodStart,
  periodEnd
) {
  const [totalTasks, completedTasks, tasksCompletedDuringPeriod] =
    await Promise.all([
      Task.countDocuments({ project: project._id }),

      Task.countDocuments({
        project: project._id,
        status: "completed",
      }),

      Task.countDocuments({
        project: project._id,
        status: "completed",
        completedAt: {
          $gte: periodStart,
          $lt: periodEnd,
        },
      }),
    ]);

  const progressPercentage =
    totalTasks === 0
      ? 0
      : Math.round((completedTasks / totalTasks) * 100);

  return ProgressSnapshot.findOneAndUpdate(
    {
      project: project._id,
      periodType,
      periodStart,
    },
    {
      $set: {
        project: project._id,
        team: project.team,
        manager: project.manager,
        periodType,
        periodStart,
        periodEnd,
        totalTasks,
        completedTasks,
        progressPercentage,
        tasksCompletedDuringPeriod,
        capturedAt: new Date(),
      },
    },
    {
      upsert: true,
      new: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    }
  );
}

async function captureProgressSnapshots(
  periodType,
  referenceDate = new Date()
) {
  const { periodStart, periodEnd } = getPeriodBounds(
    periodType,
    referenceDate
  );

  const projects = await Project.find({
    status: { $nin: ["cancelled"] },
  }).select("_id team manager");

  const snapshots = [];

  for (const project of projects) {
    const snapshot = await captureProjectSnapshot(
      project,
      periodType,
      periodStart,
      periodEnd
    );

    snapshots.push(snapshot);
  }

  return {
    periodType,
    periodStart,
    periodEnd,
    projectsProcessed: snapshots.length,
    snapshots,
  };
}

module.exports = {
  getPeriodBounds,
  captureProgressSnapshots,
};
