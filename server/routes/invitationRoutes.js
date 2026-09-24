const express = require("express");

const router = express.Router();

const {
  createInvitation,
  getInvitation,
  acceptInvitation,
  getMyInvitations,
} = require(
  "../controllers/invitationController"
);

const {protect} = require(
  "../middleware/authMiddleware"
);


// Manager creates invitation
router.post(
  "/",
  protect,
  createInvitation
);


// Manager gets invitations
router.get(
  "/my-invitations",
  protect,
  getMyInvitations
);


// Public invitation details
router.get(
  "/:token",
  getInvitation
);


// Employee accepts invitation
router.post(
  "/:token/accept",
  protect,
  acceptInvitation
);


module.exports = router;