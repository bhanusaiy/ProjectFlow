const express = require("express");

const router = express.Router();

const {
  createProject,
  getProjects,
  getMyProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addProjectMember,
  removeProjectMember,
  getManagerDashboardStats,
} = require(
  "../controllers/projectController"
);


const {protect} = require(
  "../middleware/authMiddleware"
);



// Create project
router.post(
  "/",
  protect,
  createProject
);


// Get current user's projects
router.get(
  "/",
  protect,
  getProjects
);


// Add member to project

router.post(
  "/:id/members",
  protect,
  addProjectMember
);

router.delete(
  "/:id/members/:memberId",
  protect,
  removeProjectMember
);

router.get(
  "/my-projects",
  protect,
  getMyProjects
);
router.get(
  "/dashboard/stats",
  protect,
  getManagerDashboardStats
);
// Get single project
router.get(
  "/:id",
  protect,
  getProjectById
);


// Update project
router.put(
  "/:id",
  protect,
  updateProject
);


// Delete project
router.delete(
  "/:id",
  protect,
  deleteProject
);


module.exports = router;