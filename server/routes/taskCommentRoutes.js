const express = require("express");

const router = express.Router();

const {
  createTaskComment,
  getTaskComments,
} = require("../controllers/TaskCommentController");

const {
  protect,
} = require("../middleware/authMiddleware");

router.post(
  "/task/:taskId",
  protect,
  createTaskComment
);

router.get(
  "/task/:taskId",
  protect,
  getTaskComments
);

module.exports = router;