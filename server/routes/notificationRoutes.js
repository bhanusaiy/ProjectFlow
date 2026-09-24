const express = require("express");

const router = express.Router();

const {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} = require("../controllers/notificationController");

const {
  protect,
} = require("../middleware/authMiddleware");


// Get current user's notifications
router.get(
  "/",
  protect,
  getMyNotifications
);


// Mark one notification as read
router.put(
  "/:id/read",
  protect,
  markNotificationAsRead
);


// Mark all notifications as read
router.put(
  "/read-all",
  protect,
  markAllNotificationsAsRead
);


module.exports = router;