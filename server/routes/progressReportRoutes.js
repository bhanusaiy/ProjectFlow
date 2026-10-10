
const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  getProgressReports,
} = require("../controllers/progressReportController");

const router = express.Router();

// GET /api/reports/progress?period=weekly
// GET /api/reports/progress?period=monthly
router.get("/progress", protect, getProgressReports);

module.exports = router;
