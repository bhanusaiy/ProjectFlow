const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/authRoutes");
const teamRoutes = require("./routes/teamRoutes");
const invitationRoutes = require(
  "./routes/invitationRoutes"
);
const projectRoutes = require(
  "./routes/projectRoutes"
);
const taskRoutes =
  require("./routes/taskRoutes");
  const taskCommentRoutes = require("./routes/taskCommentRoutes");
  const notificationRoutes = require("./routes/notificationRoutes");
const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/teams", teamRoutes);
app.use(
  "/api/invitations",
  invitationRoutes
);

app.use(
  "/api/projects",
  projectRoutes
);
app.use(
  "/api/tasks",
  taskRoutes
);
app.use(
  "/api/task-comments",
  taskCommentRoutes
);
app.use(
  "/api/notifications",
  notificationRoutes
);

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "ProjectFlow API is running",
  });
});

module.exports = app;