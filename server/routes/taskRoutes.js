const express = require("express");

const {
  createTask,
  getProjectTasks,
  getTask,
  updateTask,
  deleteTask,
  getMyTasks,
} = require("../controllers/taskController");

const {
  protect,
} = require("../middleware/authMiddleware");

const router = express.Router();

// ==========================================
// CREATE TASK
// POST /api/tasks
// ==========================================

router.post(
  "/",
  protect,
  createTask
);

// ==========================================
// GET MY TASKS
// GET /api/tasks/my-tasks
// ==========================================

router.get(
  "/my-tasks",
  protect,
  getMyTasks
);

// ==========================================
// GET PROJECT TASKS
// GET /api/tasks/project/:projectId
// ==========================================

router.get(
  "/project/:projectId",
  protect,
  getProjectTasks
);

// ==========================================
// GET SINGLE TASK
// GET /api/tasks/:id
// ==========================================

router.get(
  "/:id",
  protect,
  getTask
);

// ==========================================
// UPDATE TASK
// PUT /api/tasks/:id
// ==========================================

router.put(
  "/:id",
  protect,
  updateTask
);

// ==========================================
// DELETE TASK
// DELETE /api/tasks/:id
// ==========================================

router.delete(
  "/:id",
  protect,
  deleteTask
);

module.exports = router;