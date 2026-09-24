const crypto = require("crypto");

const Invitation = require("../models/Invitation");
const Team = require("../models/Team");
const User = require("../models/user");


// =============================
// CREATE INVITATION
// =============================

const createInvitation = async (req, res) => {
  try {
    const { email } = req.body;

    if (req.user.role !== "manager") {
      return res.status(403).json({
        success: false,
        message: "Only managers can invite employees",
      });
    }

    if (!req.user.team) {
      return res.status(400).json({
        success: false,
        message: "Create a team before inviting employees",
      });
    }

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Employee email is required",
      });
    }

    const normalizedEmail = email
      .trim()
      .toLowerCase();

    const team = await Team.findById(
      req.user.team
    );

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found",
      });
    }

    // Make sure logged-in manager owns the team
    if (
      team.owner.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You do not own this team",
      });
    }

    // Check whether employee already belongs to this team
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (
      existingUser &&
      existingUser.team &&
      existingUser.team.toString() ===
        team._id.toString()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "This employee is already part of your team",
      });
    }

    // If user belongs to another team
    if (
      existingUser &&
      existingUser.team &&
      existingUser.team.toString() !==
        team._id.toString()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "This user already belongs to another team",
      });
    }

    // Remove old pending invitations for this email/team
    await Invitation.deleteMany({
      email: normalizedEmail,
      team: team._id,
      status: "pending",
    });

    // Generate secure invitation token
    const token = crypto
      .randomBytes(32)
      .toString("hex");

    const expiresAt = new Date(
      Date.now() +
        7 * 24 * 60 * 60 * 1000
    );

    const invitation =
      await Invitation.create({
        email: normalizedEmail,
        token,
        team: team._id,
        invitedBy: req.user._id,
        expiresAt,
      });

    const invitationLink =
      `${process.env.CLIENT_URL}/join-team/${token}`;

    return res.status(201).json({
      success: true,
      message:
        "Invitation created successfully",
      invitation: {
        id: invitation._id,
        email: invitation.email,
        status: invitation.status,
        expiresAt: invitation.expiresAt,
        invitationLink,
      },
    });
  } catch (error) {
    console.error(
      "Create invitation error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while creating invitation",
    });
  }
};


// =============================
// GET INVITATION BY TOKEN
// =============================

const getInvitation = async (req, res) => {
  try {
    const { token } = req.params;

    const invitation =
      await Invitation.findOne({
        token,
      })
        .populate(
          "team",
          "name description"
        )
        .populate(
          "invitedBy",
          "name email"
        );

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: "Invitation not found",
      });
    }

    if (
      invitation.status === "accepted"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "This invitation has already been accepted",
      });
    }

    if (
      invitation.expiresAt <
      new Date()
    ) {
      invitation.status = "expired";

      await invitation.save();

      return res.status(400).json({
        success: false,
        message:
          "This invitation has expired",
      });
    }

    return res.status(200).json({
      success: true,
      invitation: {
        email: invitation.email,
        status: invitation.status,
        expiresAt:
          invitation.expiresAt,
        team: invitation.team,
        invitedBy:
          invitation.invitedBy,
      },
    });
  } catch (error) {
    console.error(
      "Get invitation error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while fetching invitation",
    });
  }
};


// =============================
// ACCEPT INVITATION
// =============================

const acceptInvitation = async (
  req,
  res
) => {
  try {
    const { token } = req.params;

    const invitation =
      await Invitation.findOne({
        token,
      });

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: "Invitation not found",
      });
    }

    if (
      invitation.status === "accepted"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invitation already accepted",
      });
    }

    if (
      invitation.expiresAt <
      new Date()
    ) {
      invitation.status = "expired";

      await invitation.save();

      return res.status(400).json({
        success: false,
        message:
          "Invitation has expired",
      });
    }

    // Ensure correct employee accepts invitation
    if (
      req.user.email.toLowerCase() !==
      invitation.email.toLowerCase()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "This invitation belongs to a different email address",
      });
    }

    if (
      req.user.role !== "employee"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Only employee accounts can accept team invitations",
      });
    }

    if (req.user.team) {
      return res.status(400).json({
        success: false,
        message:
          "You already belong to a team",
      });
    }

    const team = await Team.findById(
      invitation.team
    );

    if (!team) {
      return res.status(404).json({
        success: false,
        message:
          "The invited team no longer exists",
      });
    }

    // Join team
    await User.findByIdAndUpdate(
      req.user._id,
      {
        team: team._id,
      }
    );

    invitation.status = "accepted";
    invitation.acceptedAt =
      new Date();

    await invitation.save();

    return res.status(200).json({
      success: true,
      message:
        "You successfully joined the team",
      team: {
        id: team._id,
        name: team.name,
      },
    });
  } catch (error) {
    console.error(
      "Accept invitation error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while accepting invitation",
    });
  }
};


// =============================
// GET MANAGER INVITATIONS
// =============================

const getMyInvitations = async (
  req,
  res
) => {
  try {
    if (
      req.user.role !== "manager"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Only managers can view invitations",
      });
    }

    if (!req.user.team) {
      return res.status(200).json({
        success: true,
        invitations: [],
      });
    }

    const invitations =
      await Invitation.find({
        team: req.user.team,
      })
        .sort({
          createdAt: -1,
        })
        .select(
          "email status expiresAt createdAt token"
        );

    const formattedInvitations =
      invitations.map((invitation) => ({
        id: invitation._id,
        email: invitation.email,
        status: invitation.status,
        expiresAt:
          invitation.expiresAt,
        createdAt:
          invitation.createdAt,

        invitationLink:
          `${process.env.CLIENT_URL}/join-team/${invitation.token}`,
      }));

    return res.status(200).json({
      success: true,
      invitations:
        formattedInvitations,
    });
  } catch (error) {
    console.error(
      "Get invitations error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while fetching invitations",
    });
  }
};


module.exports = {
  createInvitation,
  getInvitation,
  acceptInvitation,
  getMyInvitations,
};