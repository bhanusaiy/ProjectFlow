const TaskComment = require("../models/TaskComment");
const Task = require("../models/Task");
const Project = require("../models/project");
const Notification = require("../models/Notification");

const createTaskComment = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        message: "Comment message is required",
      });
    }

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const project = await Project.findById(
      task.project
    );

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    /*
      Managers can comment only on projects they manage.
      Employees can comment only on projects they belong to.
    */

    if (req.user.role === "manager") {
      if (
        project.manager.toString() !==
        req.user._id.toString()
      ) {
        return res.status(403).json({
          message:
            "You are not authorized to comment on this task",
        });
      }
    }

    if (req.user.role === "employee") {
      const isMember =
        project.members.some(
          (memberId) =>
            memberId.toString() ===
            req.user._id.toString()
        );

      if (!isMember) {
        return res.status(403).json({
          message:
            "You are not assigned to this project",
        });
      }
    }

    const comment =
      await TaskComment.create({
        task: taskId,
        user: req.user._id,
        message: message.trim(),
      });

    /*
      Create notification for the other person involved
      in the task conversation.

      Manager comments
      -> assigned employee gets notification.

      Employee comments
      -> project manager gets notification.
    */

    let notificationRecipient = null;

    if (
      req.user._id.toString() ===
      project.manager.toString()
    ) {
      notificationRecipient =
        task.assignedTo;
    } else {
      notificationRecipient =
        project.manager;
    }

    if (
      notificationRecipient &&
      notificationRecipient.toString() !==
        req.user._id.toString()
    ) {
      await Notification.create({
        recipient: notificationRecipient,
        type: "task-comment",
        title: "New Task Comment",
        message: `${req.user.name} commented on the task "${task.title}"`,
        task: task._id,
        project: project._id,
        isRead: false,
      });
    }

    await comment.populate(
      "user",
      "name email role"
    );

    return res.status(201).json({
      message: "Comment added successfully",
      comment,
    });
  } catch (error) {
    console.error(
      "Create task comment error:",
      error
    );

    return res.status(500).json({
      message: "Unable to add comment",
    });
  }
};


const getTaskComments = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const project = await Project.findById(task.project);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    /*
      Managers can view comments on projects they manage.
      Employees can view comments on tasks assigned to them.
    */

    if (req.user.role === "manager") {
      if (
        project.manager.toString() !==
        req.user._id.toString()
      ) {
        return res.status(403).json({
          message:
            "You are not authorized to view these comments",
        });
      }
    }

    if (req.user.role === "employee") {
      if (
        task.assignedTo.toString() !==
        req.user._id.toString()
      ) {
        return res.status(403).json({
          message:
            "You are not authorized to view these comments",
        });
      }
    }

    const comments = await TaskComment.find({
      task: taskId,
    })
      .populate(
        "user",
        "name email role"
      )
      .sort({
        createdAt: 1,
      });

    return res.status(200).json({
      comments,
    });
  } catch (error) {
    console.error(
      "Get task comments error:",
      error
    );

    return res.status(500).json({
      message: "Unable to load comments",
    });
  }
};


module.exports = {
  createTaskComment,
  getTaskComments,
};