const Team = require("../models/Team");
const User = require("../models/User");


// Create Team
const createTeam = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Team name is required",
      });
    }

    // Only managers can create teams
    if (req.user.role !== "manager") {
      return res.status(403).json({
        success: false,
        message: "Only managers can create teams",
      });
    }

    // Prevent manager from creating multiple teams
    if (req.user.team) {
      return res.status(400).json({
        success: false,
        message: "You already belong to a team",
      });
    }

    const team = await Team.create({
      name,
      description,
      owner: req.user._id,
    });

    // Connect manager to team
    await User.findByIdAndUpdate(
      req.user._id,
      {
        team: team._id,
      }
    );

    return res.status(201).json({
      success: true,
      message: "Team created successfully",
      team,
    });
  } catch (error) {
    console.error("Create team error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while creating team",
    });
  }
};


// Get My Team
const getMyTeam = async (req, res) => {
  try {
    if (!req.user.team) {
      return res.status(404).json({
        success: false,
        message: "You are not part of a team",
      });
    }

    const team = await Team.findById(
      req.user.team
    ).populate(
      "owner",
      "name email role"
    );

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found",
      });
    }

    const members = await User.find({
      team: team._id,
    }).select(
      "name email role isActive createdAt"
    );

    return res.status(200).json({
      success: true,
      team,
      members,
    });
  } catch (error) {
    console.error("Get team error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching team",
    });
  }
};


module.exports = {
  createTeam,
  getMyTeam,
};