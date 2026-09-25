const Task = require("../models/Task");
const Project = require("../models/project");
const User = require("../models/user");
const Notification = require("../models/Notification");
const TaskComment = require("../models/TaskComment");


// ==========================================
// CREATE TASK
// ==========================================

const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      project,
      assignedTo,
      status,
      priority,
      startDate,
      dueDate,
      estimatedHours,
    } = req.body;


    // =========================
    // VALIDATION
    // =========================

    if (!title) {
      return res.status(400).json({
        message: "Task title is required",
      });
    }

    if (!project) {
      return res.status(400).json({
        message: "Project is required",
      });
    }

    if (!assignedTo) {
      return res.status(400).json({
        message:
          "Employee assignment is required",
      });
    }


    // =========================
    // FIND PROJECT
    // =========================

    const projectData =
      await Project.findById(project);

    if (!projectData) {
      return res.status(404).json({
        message: "Project not found",
      });
    }


    // =========================
    // CHECK PROJECT OWNERSHIP
    // =========================

    if (
      projectData.manager.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        message:
          "You are not authorized to create tasks for this project",
      });
    }


    // =========================
    // FIND EMPLOYEE
    // =========================

    const employee =
      await User.findById(assignedTo);

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }


    // =========================
    // CHECK EMPLOYEE IS PROJECT MEMBER
    // =========================

    const isMember =
      projectData.members.some(
        (memberId) =>
          memberId.toString() ===
          assignedTo.toString()
      );

    if (!isMember) {
      return res.status(400).json({
        message:
          "Employee is not a member of this project",
      });
    }


    // =========================
    // CREATE TASK
    // =========================

    const task = await Task.create({
      title,
      description,
      project,
      assignedTo,
      createdBy: req.user._id,

      status:
        status || "todo",

      priority:
        priority || "medium",

      startDate:
        startDate || null,

      dueDate:
        dueDate || null,

      estimatedHours:
        estimatedHours || 0,
    });


    // =========================
// CREATE ASSIGNMENT NOTIFICATION
// =========================

await Notification.create({
  recipient: assignedTo,

  type: "task-assigned",

  title: "New Task Assigned",

  message: `You have been assigned the task "${title}"`,

  task: task._id,

  project: projectData._id,

  isRead: false,
});

    // =========================
    // RETURN TASK
    // =========================

    const populatedTask =
      await Task.findById(task._id)
        .populate(
          "assignedTo",
          "name email role"
        )
        .populate(
          "createdBy",
          "name email"
        )
        .populate(
          "project",
          "name"
        );

    res.status(201).json({
      message:
        "Task created successfully",

      task: populatedTask,
    });

  } catch (error) {
    console.error(
      "Create task error:",
      error
    );

    res.status(500).json({
      message:
        "Unable to create task",
    });
  }
};


// ==========================================
// GET PROJECT TASKS
// ==========================================

const getProjectTasks = async (
  req,
  res
) => {
  try {
    const { projectId } = req.params;

    // Find project
    const project = await Project.findById(
      projectId
    );

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    // Manager can view their own project
    if (req.user.role === "manager") {
      if (
        project.manager.toString() !==
        req.user._id.toString()
      ) {
        return res.status(403).json({
          message:
            "You are not authorized to view this project",
        });
      }
    }

    // Employee can view projects
    // they are a member of
   if (req.user.role === "employee") {
  const isMember = project.members.some(
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

    // Find tasks
const tasks = await Task.find({
  project: projectId,
})
  .populate(
    "assignedTo",
    "name email role"
  )
  .populate(
    "createdBy",
    "name email"
  )
  .populate(
    "project",
    "name"
  )
  .sort({
    createdAt: -1,
  });
    return res.status(200).json({
      tasks,
    });
  } catch (error) {
    console.error(
      "Get project tasks error:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to load project tasks",
    });
  }
};


// ==========================================
// GET SINGLE TASK
// ==========================================

const getTask = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const task =
      await Task.findById(id)
        .populate(
          "assignedTo",
          "name email role"
        )
        .populate(
          "createdBy",
          "name email"
        )
        .populate(
          "project",
          "name description manager members"
        );

    if (!task) {
      return res.status(404).json({
        message:
          "Task not found",
      });
    }

    // =========================
    // AUTHORIZATION
    // =========================

    const userId =
      req.user._id.toString();

    const project =
      task.project;

    const isManager =
      project?.manager?.toString() ===
      userId;

    const isProjectMember =
      project?.members?.some(
        (memberId) =>
          memberId.toString() ===
          userId
      );

    if (
      !isManager &&
      !isProjectMember
    ) {
      return res.status(403).json({
        message:
          "You are not authorized to view this task",
      });
    }

    return res.status(200).json({
      task,
    });

  } catch (error) {
    console.error(
      "Get task error:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to load task",
    });
  }
};


// ==========================================
// UPDATE TASK
// ==========================================

const updateTask = async (
  req,
  res
) => {
  try {
    const { id } =
      req.params;

 const task =
  await Task.findById(id)
    .populate(
      "project",
      "manager"
    );


    if (!task) {
      return res.status(404).json({
        message:
          "Task not found",
      });
    }
    const oldStatus = task.status;


    // =========================
    // MANAGER CHECK
    // =========================

const isManager =
  task.project?.manager?.toString() ===
  req.user._id.toString();

    // =========================
    // EMPLOYEE CHECK
    // =========================

    const isEmployee =
      task.assignedTo.toString() ===
      req.user._id.toString();


    if (
      !isManager &&
      !isEmployee
    ) {
      return res.status(403).json({
        message:
          "You are not authorized to update this task",
      });
    }


    // =========================
    // EMPLOYEE RESTRICTIONS
    // =========================

    if (isEmployee && !isManager) {

      if (
        req.body.title !== undefined ||
        req.body.description !== undefined ||
        req.body.project !== undefined ||
        req.body.assignedTo !== undefined ||
        req.body.priority !== undefined ||
        req.body.startDate !== undefined ||
        req.body.dueDate !== undefined ||
        req.body.estimatedHours !== undefined
      ) {
        return res.status(403).json({
          message:
            "Employees can only update task status",
        });
      }
    }


    // =========================
    // UPDATE FIELDS
    // =========================

    if (req.body.title !== undefined) {
      task.title =
        req.body.title;
    }

    if (
      req.body.description !==
      undefined
    ) {
      task.description =
        req.body.description;
    }

    if (
      req.body.priority !==
      undefined
    ) {
      task.priority =
        req.body.priority;
    }

    if (
      req.body.startDate !==
      undefined
    ) {
      task.startDate =
        req.body.startDate;
    }

    if (
      req.body.dueDate !==
      undefined
    ) {
      task.dueDate =
        req.body.dueDate;
    }

    if (
      req.body.estimatedHours !==
      undefined
    ) {
      task.estimatedHours =
        req.body.estimatedHours;
    }

if (
  req.body.assignedTo !== undefined &&
  isManager
) {
  const project = await Project.findById(
    task.project._id
  );

  if (!project) {
    return res.status(404).json({
      message: "Project not found",
    });
  }

  const isProjectMember =
    project.members.some(
      (memberId) =>
        memberId.toString() ===
        req.body.assignedTo.toString()
    );

  if (!isProjectMember) {
    return res.status(400).json({
      message:
        "Task can only be assigned to a member of the project",
    });
  }

  task.assignedTo =
    req.body.assignedTo;
}

   if (
  req.body.status !== undefined
) {
  task.status = req.body.status;
}


    // =========================
    // SAVE
    // =========================

    await task.save();if (
  req.body.status !== undefined &&
  oldStatus !== task.status
) {
  let notificationRecipient = null;

  if (isManager) {
    notificationRecipient =
      task.assignedTo;
  } else {
    notificationRecipient =
      task.project.manager;
  }

  if (
    notificationRecipient &&
    notificationRecipient.toString() !==
      req.user._id.toString()
  ) {
    if (
      task.status === "completed" &&
      oldStatus !== "completed"
    ) {
      await Notification.create({
        recipient:
          notificationRecipient,
        type: "task-completed",
        title: "Task Completed",
        message: `${req.user.name} completed the task "${task.title}"`,
        task: task._id,
        project: task.project._id,
        isRead: false,
      });
    } else {
      await Notification.create({
        recipient:
          notificationRecipient,
        type: "task-status",
        title: "Task Status Updated",
        message: `${req.user.name} changed "${task.title}" status from "${oldStatus}" to "${task.status}"`,
        task: task._id,
        project: task.project._id,
        isRead: false,
      });
    }
  }
}

    const updatedTask =
      await Task.findById(
        task._id
      )
        .populate(
          "assignedTo",
          "name email role"
        )
        .populate(
          "createdBy",
          "name email"
        )
        .populate(
          "project",
          "name"
        );


    res.status(200).json({
      message:
        "Task updated successfully",

      task: updatedTask,
    });

  } catch (error) {
    console.error(
      "Update task error:",
      error
    );

    res.status(500).json({
      message:
        "Unable to update task",
    });
  }
};


// ==========================================
// GET MY TASKS
// ==========================================

const getMyTasks = async (
  req,
  res
) => {
  try {
    const tasks =
      await Task.find({
        assignedTo: req.user._id,
      })
        .populate(
          "assignedTo",
          "name email role"
        )
        .populate(
          "createdBy",
          "name email"
        )
        .populate(
          "project",
          "name description status"
        )
        .sort({
          createdAt: -1,
        });

    res.status(200).json({
      tasks,
    });

  } catch (error) {
    console.error(
      "Get my tasks error:",
      error
    );

    res.status(500).json({
      message:
        "Unable to load your tasks",
    });
  }
};



// ==========================================
// DELETE TASK
// ==========================================

const deleteTask = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id)
      .populate("project", "manager");

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const projectManagerId =
      task.project?.manager?.toString();

    const currentUserId =
      req.user._id.toString();

    if (
      !projectManagerId ||
      projectManagerId !== currentUserId
    ) {
      return res.status(403).json({
        message:
          "Only the project manager can delete this task",
      });
    }
await Notification.deleteMany({
  task: id,
});
await TaskComment.deleteMany({
  task: task._id,
});
    await Task.findByIdAndDelete(id);

    res.status(200).json({
      message:
        "Task deleted successfully",
    });

  } catch (error) {
    console.error(
      "Delete task error:",
      error
    );

    res.status(500).json({
      message:
        "Unable to delete task",
    });
  }
};


module.exports = {
  createTask,
  getProjectTasks,
  getTask,
  updateTask,
  deleteTask,
  getMyTasks,
};