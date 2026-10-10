
const mongoose = require("mongoose");
const Project = require("../models/project");
const ProgressSnapshot = require("../models/ProgressSnapshot");

const getProgressReports = async (req, res) => {
  try {
    // Reports are exclusively for managers.
    if (req.user.role !== "manager") {
      return res.status(403).json({
        success: false,
        message: "Only project managers can access progress reports",
      });
    }

    const periodType = req.query.period || "weekly";

    if (!["weekly", "monthly"].includes(periodType)) {
      return res.status(400).json({
        success: false,
        message: "period must be weekly or monthly",
      });
    }

    const managerId = req.user._id;

    // Restrict reports to projects owned by the authenticated manager.
  const projects = await Project.find({
  team: req.user.team,
  status: { $ne: "cancelled" },
}).select("_id name status startDate dueDate");

    const projectIds = projects.map((project) => project._id);

    const snapshots = await ProgressSnapshot.find({
      manager: managerId,
      project: { $in: projectIds },
      periodType,
    })
      .sort({ periodStart: 1 })
      .lean();

    const snapshotsByProject = new Map();

    for (const snapshot of snapshots) {
      const key = snapshot.project.toString();

      if (!snapshotsByProject.has(key)) {
        snapshotsByProject.set(key, []);
      }

      snapshotsByProject.get(key).push({
        periodStart: snapshot.periodStart,
        periodEnd: snapshot.periodEnd,
        totalTasks: snapshot.totalTasks,
        completedTasks: snapshot.completedTasks,
        progressPercentage: snapshot.progressPercentage,
        tasksCompletedDuringPeriod:
          snapshot.tasksCompletedDuringPeriod,
        capturedAt: snapshot.capturedAt,
      });
    }

    const reports = projects.map((project) => ({
      projectId: project._id,
      projectName: project.name,
      projectStatus: project.status,
      startDate: project.startDate,
      dueDate: project.dueDate,
      history: snapshotsByProject.get(project._id.toString()) || [],
    }));

    return res.status(200).json({
      success: true,
      period: periodType,
      count: reports.length,
      reports,
    });
  } catch (error) {
    console.error("Get progress reports failed:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve progress reports",
    });
  }
};

module.exports = {
  getProgressReports,
};
