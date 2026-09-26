import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import NotificationBell from "../../components/NotificationBell";


const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

const [tasks, setTasks] = useState([]);
const [projects, setProjects] = useState([]);
const [loading, setLoading] = useState(true);

 useEffect(() => {
  const loadDashboard = async () => {
    try {
      setLoading(true);

      const [tasksResponse, projectsResponse] =
        await Promise.all([
          api.get("/tasks/my-tasks"),
          api.get("/projects/my-projects"),
        ]);

      setTasks(
        tasksResponse.data.tasks || []
      );

      setProjects(
        projectsResponse.data.projects || []
      );
    } catch (error) {
      console.error(
        "Load dashboard error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  loadDashboard();
}, []);
  const totalTasks = tasks.length;

  const inProgressTasks = tasks.filter(
    (task) => task.status === "in-progress"
  ).length;

  const completedTasks = tasks.filter(
    (task) => task.status === "completed"
  ).length;
  const todoTasks = tasks.filter(
  (task) => task.status === "todo"
).length;

const totalProjects = projects.length;
if (loading) {
  return (
    <div className="employee-dashboard-layout">
      <aside className="employee-sidebar">
        <div className="sidebar-logo">
          ProjectFlow
        </div>

        <nav className="sidebar-nav">
          <button
            className="nav-item active"
            onClick={() =>
              navigate("/employee/dashboard")
            }
          >
            Dashboard
          </button>

          <button
            className="nav-item"
            onClick={() =>
              navigate("/employee/tasks")
            }
          >
            My Tasks
          </button>

          <button
            className="nav-item"
            onClick={() =>
              navigate("/employee/projects")
            }
          >
            My Projects
          </button>

          <button
            className="nav-item"
            onClick={() =>
              navigate("/employee/settings")
            }
          >
            Settings
          </button>
        </nav>
      </aside>

      <main className="employee-dashboard-page">
        <div className="dashboard-loading">
          <h2>Loading dashboard...</h2>
        </div>
      </main>
    </div>
  );
}
  return (
    <div className="employee-dashboard-layout">
      <aside className="employee-sidebar">
        <div className="sidebar-logo">
          ProjectFlow
        </div>

        <nav className="sidebar-nav">
          <button
            className="nav-item active"
            onClick={() =>
              navigate("/employee/dashboard")
            }
          >
            Dashboard
          </button>

          <button
            className="nav-item"
            onClick={() =>
              navigate("/employee/tasks")
            }
          >
            My Tasks
          </button>

          <button
            className="nav-item"
            onClick={() =>
              navigate("/employee/projects")
            }
          >
            My Projects
          </button>

          <button
            className="nav-item"
            onClick={() =>
              navigate("/employee/settings")
            }
          >
            Settings
          </button>
        </nav>
      </aside>

      <main className="employee-dashboard-page">
  <header className="employee-dashboard-header">

  <div>
    <h1>Employee Dashboard</h1>

    <p>
      Welcome back, {user?.name}
    </p>
  </div>

  <div className="employee-dashboard-header-right">

    <NotificationBell />

    <div className="user-info">

      <div className="user-avatar">
        {user?.name
          ?.charAt(0)
          ?.toUpperCase()}
      </div>

      <div>
        <strong>
          {user?.name}
        </strong>

        <small>
          {user?.email}
        </small>
      </div>

    </div>

  </div>

</header>

        <section className="employee-summary-grid">
          <div className="employee-summary-card">
            <span>My Tasks</span>

            <strong>
              {loading ? "..." : totalTasks}
            </strong>
          </div>

          <div className="employee-summary-card">
            <span>In Progress</span>

            <strong>
              {loading ? "..." : inProgressTasks}
            </strong>
          </div>

          <div className="employee-summary-card">
            <span>Completed</span>

            <strong>
              {loading ? "..." : completedTasks}
            </strong>
          </div>
<div className="employee-summary-card">
  <span>To Do</span>

  <strong>
    {loading ? "..." : todoTasks}
  </strong>
</div>

<div className="employee-summary-card">
  <span>My Projects</span>

  <strong>
    {loading ? "..." : totalProjects}
  </strong>
</div>
        </section>

        <section className="employee-welcome-card">
          <h2>My Work</h2>

          <p>
            View and manage the tasks assigned to
            you.
          </p>

          <button
            onClick={() =>
              navigate("/employee/tasks")
            }
          >
            View My Tasks
          </button>
        </section>
<section className="employee-dashboard-section">
  <div className="employee-dashboard-section-header">
    <div>
      <h2>Recent Tasks</h2>
      <p>Your latest assigned work.</p>
    </div>

    <button
      onClick={() => navigate("/employee/tasks")}
    >
      View All Tasks
    </button>
  </div>

  <div className="employee-recent-task-list">
    {tasks.length === 0 ? (
      <div className="employee-dashboard-empty">
        No tasks assigned yet.
      </div>
    ) : (
      tasks.slice(0, 5).map((task) => (
        <div
          className="employee-recent-task-card"
          key={task._id}
        >
          <div>
            <h3>{task.title}</h3>

            <p>
              {task.project?.name ||
                "No project"}
            </p>
          </div>

          <div className="employee-recent-task-status">
            <span
              className={`task-status-badge status-${task.status}`}
            >
              {task.status === "todo"
                ? "To Do"
                : task.status ===
                  "in-progress"
                ? "In Progress"
                : task.status ===
                  "completed"
                ? "Completed"
                : "Review"}
            </span>
          </div>
        </div>
      ))
    )}
  </div>
</section>

<section className="employee-dashboard-section">
  <div className="employee-dashboard-section-header">
    <div>
      <h2>My Projects</h2>
      <p>Projects you are currently part of.</p>
    </div>

    <button
      onClick={() =>
        navigate("/employee/projects")
      }
    >
      View All Projects
    </button>
  </div>

  <div className="employee-recent-project-list">
    {projects.length === 0 ? (
      <div className="employee-dashboard-empty">
        You are not part of any projects yet.
      </div>
    ) : (
      projects.slice(0, 5).map((project) => (
        <div
          className="employee-recent-project-card"
          key={project._id}
        >
          <div>
            <h3>{project.name}</h3>

            <p>
              {project.description ||
                "No description available."}
            </p>
          </div>

          <div className="employee-recent-project-meta">
            <span
              className={`project-status-badge status-${project.status}`}
            >
              {project.status === "on-hold"
                ? "On Hold"
                : project.status
                    ?.charAt(0)
                    .toUpperCase() +
                  project.status?.slice(1)}
            </span>

            <span
              className={`project-priority-badge priority-${project.priority}`}
            >
              {project.priority
                ?.charAt(0)
                .toUpperCase() +
                project.priority?.slice(1)}
            </span>
          </div>
        </div>
      ))
    )}
  </div>
</section>


      </main>
    </div>
  );
};

export default EmployeeDashboard;