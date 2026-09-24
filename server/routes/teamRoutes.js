const express = require("express");

const router = express.Router();

const {
  createTeam,
  getMyTeam,
} = require("../controllers/teamController");

const {protect} = require("../middleware/authMiddleware");


// Create team
router.post(
  "/",
  protect,
  createTeam
);


// Get current user's team
router.get(
  "/my-team",
  protect,
  getMyTeam
);


module.exports = router;