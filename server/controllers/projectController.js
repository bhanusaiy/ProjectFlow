const Project = require("../models/project");
const Team = require("../models/Team");
const User = require("../models/User");


// =====================================
// CREATE PROJECT
// =====================================

const createProject = async (req, res) => {
  try {
    const {
      name,
      description,
      members,
      status,
      priority,
      startDate,
      dueDate,
    } = req.body;

    // Only managers can create projects
    if (req.user.role !== "manager") {
      return res.status(403).json({
        success: false,
        message: "Only managers can create projects",
      });
    }

    // Manager must have a team
    if (!req.user.team) {
      return res.status(400).json({
        success: false,
        message:
          "You must create a team before creating a project",
      });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Project name is required",
      });
    }

    const team = await Team.findById(req.user.team);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found",
      });
    }

    // Make sure manager owns this team
    if (
      team.owner.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You do not own this team",
      });
    }

    // Validate project members
    let projectMembers = [];

    if (Array.isArray(members)) {
      const validMembers = await User.find({
        _id: { $in: members },
        team: team._id,
      }).select("_id");

      projectMembers = validMembers.map(
        (member) => member._id
      );
    }

    // Manager automatically becomes a project member
    const managerAlreadyIncluded =
      projectMembers.some(
        (memberId) =>
          memberId.toString() ===
          req.user._id.toString()
      );

    if (!managerAlreadyIncluded) {
      projectMembers.push(req.user._id);
    }

    // Validate dates
    if (
      startDate &&
      dueDate &&
      new Date(dueDate) <
        new Date(startDate)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Due date cannot be before start date",
      });
    }

    const project = await Project.create({
      name: name.trim(),
      description: description || "",
      team: team._id,
      manager: req.user._id,
      members: projectMembers,
      status: status || "planning",
      priority: priority || "medium",
      startDate: startDate || null,
      dueDate: dueDate || null,
    });

    const populatedProject =
      await Project.findById(project._id)
        .populate(
          "manager",
          "name email role"
        )
        .populate(
          "members",
          "name email role"
        )
        .populate(
          "team",
          "name description"
        );

    return res.status(201).json({
      success: true,
      message:
        "Project created successfully",
      project: populatedProject,
    });
  } catch (error) {
    console.error(
      "Create project error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while creating project",
    });
  }
};


// =====================================
// GET ALL PROJECTS FOR CURRENT USER
// =====================================

const getProjects = async (req, res) => {
  try {
    if (!req.user.team) {
      return res.status(200).json({
        success: true,
        projects: [],
      });
    }

    let projects;

    if (req.user.role === "manager") {
      // Manager sees all projects in their team
      projects = await Project.find({
        team: req.user.team,
      })
        .populate(
          "manager",
          "name email role"
        )
        .populate(
          "members",
          "name email role"
        )
        .populate(
          "team",
          "name"
        )
        .sort({
          createdAt: -1,
        });
    } else {
      // Employee sees only projects assigned to them
      projects = await Project.find({
        team: req.user.team,
        members: req.user._id,
      })
        .populate(
          "manager",
          "name email role"
        )
        .populate(
          "members",
          "name email role"
        )
        .populate(
          "team",
          "name"
        )
        .sort({
          createdAt: -1,
        });
    }

    return res.status(200).json({
      success: true,
      projects,
    });
  } catch (error) {
    console.error(
      "Get projects error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while fetching projects",
    });
  }
};


// =====================================
// GET SINGLE PROJECT
// =====================================

const getProjectById = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const project = await Project.findById(id)
      .populate(
        "manager",
        "name email role"
      )
      .populate(
        "members",
        "name email role"
      )
      .populate(
        "team",
        "name description"
      );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Manager must belong to project team
    if (req.user.role === "manager") {
      if (
        project.team._id.toString() !==
        req.user.team.toString()
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You do not have access to this project",
        });
      }
    }

    // Employee must be assigned to project
    if (req.user.role === "employee") {
      const isMember =
        project.members.some(
          (member) =>
            member._id.toString() ===
            req.user._id.toString()
        );

      if (!isMember) {
        return res.status(403).json({
          success: false,
          message:
            "You are not assigned to this project",
        });
      }
    }

    return res.status(200).json({
      success: true,
      project,
    });
  } catch (error) {
    console.error(
      "Get project error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while fetching project",
    });
  }
};


// =====================================
// UPDATE PROJECT
// =====================================

const updateProject = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const {
      name,
      description,
      members,
      status,
      priority,
      startDate,
      dueDate,
    } = req.body;

    if (req.user.role !== "manager") {
      return res.status(403).json({
        success: false,
        message:
          "Only managers can update projects",
      });
    }

    const project =
      await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Project must belong to manager's team
    if (
      project.team.toString() !==
      req.user.team.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You do not have access to this project",
      });
    }

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({
          success: false,
          message:
            "Project name cannot be empty",
        });
      }

      project.name = name.trim();
    }

    if (description !== undefined) {
      project.description =
        description;
    }

    if (status !== undefined) {
      project.status = status;
    }

    if (priority !== undefined) {
      project.priority = priority;
    }

    if (startDate !== undefined) {
      project.startDate =
        startDate || null;
    }

    if (dueDate !== undefined) {
      project.dueDate =
        dueDate || null;
    }

    if (
      project.startDate &&
      project.dueDate &&
      project.dueDate <
        project.startDate
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Due date cannot be before start date",
      });
    }

    // Update project members
    if (Array.isArray(members)) {
      const validMembers =
        await User.find({
          _id: { $in: members },
          team: project.team,
        }).select("_id");

      const memberIds =
        validMembers.map(
          (member) => member._id
        );

      // Manager must always remain a member
      const managerIncluded =
        memberIds.some(
          (memberId) =>
            memberId.toString() ===
            project.manager.toString()
        );

      if (!managerIncluded) {
        memberIds.push(
          project.manager
        );
      }

      project.members = memberIds;
    }

    await project.save();

    const updatedProject =
      await Project.findById(id)
        .populate(
          "manager",
          "name email role"
        )
        .populate(
          "members",
          "name email role"
        )
        .populate(
          "team",
          "name description"
        );

    return res.status(200).json({
      success: true,
      message:
        "Project updated successfully",
      project: updatedProject,
    });
  } catch (error) {
    console.error(
      "Update project error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while updating project",
    });
  }
};


// =====================================
// ADD MEMBER TO PROJECT
// =====================================

const addProjectMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    // Only managers can add members
    if (req.user.role !== "manager") {
      return res.status(403).json({
        success: false,
        message: "Only managers can add project members",
      });
    }

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Make sure project belongs to manager's team
    if (
      project.team.toString() !==
      req.user.team.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You do not have access to this project",
      });
    }

    // Find employee
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // User must belong to same team
    if (
      !user.team ||
      user.team.toString() !==
        project.team.toString()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "User does not belong to this team",
      });
    }

    // Don't add duplicate member
    const alreadyMember = project.members.some(
      (memberId) =>
        memberId.toString() === userId.toString()
    );

    if (alreadyMember) {
      return res.status(400).json({
        success: false,
        message: "User is already a project member",
      });
    }

    project.members.push(user._id);

    await project.save();

    const updatedProject =
      await Project.findById(id)
        .populate(
          "manager",
          "name email role"
        )
        .populate(
          "members",
          "name email role"
        )
        .populate(
          "team",
          "name description"
        );

    return res.status(200).json({
      success: true,
      message: "Member added successfully",
      project: updatedProject,
    });
  } catch (error) {
    console.error(
      "Add project member error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while adding project member",
    });
  }
};

// =====================================
// DELETE PROJECT
// =====================================

const deleteProject = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (req.user.role !== "manager") {
      return res.status(403).json({
        success: false,
        message:
          "Only managers can delete projects",
      });
    }

    const project =
      await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    if (
      project.team.toString() !==
      req.user.team.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You do not have access to this project",
      });
    }

    await Project.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message:
        "Project deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete project error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while deleting project",
    });
  }
};
// ==========================================
// GET MY PROJECTS
// ==========================================

const getMyProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      members: req.user._id,
    })
      .populate("manager", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      projects,
    });
  } catch (error) {
    console.error(
      "Get my projects error:",
      error
    );

    res.status(500).json({
      message: "Unable to load your projects",
    });
  }
};

const getManagerDashboardStats = async (req, res) => {
  if (req.user.role !== "manager") {
  return res.status(403).json({
    message: "Only managers can access dashboard statistics",
  });
}
  try {
    const managerId = req.user._id;

    const projects = await Project.find({
      manager: managerId,
    });

    const projectIds = projects.map(
      (project) => project._id
    );

    const Task = require("../models/Task");

    const tasks = await Task.find({
      project: { $in: projectIds },
    });

    const totalProjects =
      projects.length;

    const activeProjects =
      projects.filter(
        (project) =>
          project.status === "active"
      ).length;

    const completedProjects =
      projects.filter(
        (project) =>
          project.status === "completed"
      ).length;

    const totalTasks =
      tasks.length;

    const todoTasks =
      tasks.filter(
        (task) =>
          task.status === "todo"
      ).length;

    const inProgressTasks =
      tasks.filter(
        (task) =>
          task.status === "in-progress"
      ).length;

    const reviewTasks =
      tasks.filter(
        (task) =>
          task.status === "review"
      ).length;

    const completedTasks =
      tasks.filter(
        (task) =>
          task.status === "completed"
      ).length;

    return res.status(200).json({
      stats: {
        totalProjects,
        activeProjects,
        completedProjects,
        totalTasks,
        todoTasks,
        inProgressTasks,
        reviewTasks,
        completedTasks,
      },
    });
  } catch (error) {
    console.error(
      "Get manager dashboard stats error:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to load dashboard statistics",
    });
  }
};
const removeProjectMember = async (req, res) => {
  try {
    const { id, memberId } = req.params;

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    // Only the project manager can remove members
    if (
      project.manager.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        message:
          "Only the project manager can remove members",
      });
    }

    // Prevent removing the project manager
    if (
      project.manager.toString() === memberId
    ) {
      return res.status(400).json({
        message:
          "The project manager cannot be removed from the project",
      });
    }

    const isMember = project.members.some(
      (memberIdFromProject) =>
        memberIdFromProject.toString() === memberId
    );

    if (!isMember) {
      return res.status(404).json({
        message: "Employee is not a member of this project",
      });
    }

    project.members = project.members.filter(
      (memberIdFromProject) =>
        memberIdFromProject.toString() !== memberId
    );

    await project.save();

    const updatedProject = await Project.findById(id)
      .populate("manager", "name email")
      .populate("members", "name email role");

    return res.status(200).json({
      message: "Project member removed successfully",
      project: updatedProject,
    });
  } catch (error) {
    console.error(
      "Remove project member error:",
      error
    );

    return res.status(500).json({
      message: "Unable to remove project member",
    });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  addProjectMember,
  deleteProject,
  getMyProjects,
  getManagerDashboardStats,
  removeProjectMember,
};