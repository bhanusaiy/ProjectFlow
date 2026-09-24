import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import api from "../../services/api";

const EmployeeProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProject = async () => {
      try {
        setLoading(true);
        setError("");

        const [projectResponse, tasksResponse] =
          await Promise.all([
            api.get(`/projects/${id}`),
            api.get(`/tasks/project/${id}`),
          ]);

        setProject(
          projectResponse.data.project
        );

        setTasks(
          tasksResponse.data.tasks || []
        );
      } catch (error) {
        console.error(
          "Load employee project error:",
          error
        );

        setError(
          error.response?.data?.message ||
            "Unable to load project"
        );
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [id]);
  const totalTasks = tasks.length;

const todoTasks = tasks.filter(
  (task) => task.status === "todo"
).length;

const inProgressTasks = tasks.filter(
  (task) => task.status === "in-progress"
).length;

const completedTasks = tasks.filter(
  (task) => task.status === "completed"
).length;
const projectProgress =
  totalTasks === 0
    ? 0
    : Math.round(
        (completedTasks / totalTasks) * 100
      );

  const getStatusLabel = (status) => {
    switch (status) {
      case "planning":
        return "Planning";
      case "active":
        return "Active";
      case "on-hold":
        return "On Hold";
      case "completed":
        return "Completed";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  const getTaskStatusLabel = (status) => {
    switch (status) {
      case "todo":
        return "To Do";
      case "in-progress":
        return "In Progress";
      case "review":
        return "Review";
      case "completed":
        return "Completed";
      default:
        return status;
    }
  };

  const getPriorityLabel = (priority) => {
    if (!priority) {
      return "Medium";
    }

    return (
      priority.charAt(0).toUpperCase() +
      priority.slice(1)
    );
  };

  const formatDate = (date) => {
    if (!date) {
      return "Not set";
    }

    return new Date(date).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <h2>Loading project...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="employee-project-details-layout">
        <aside className="employee-sidebar">
          <div className="sidebar-logo">
            ProjectFlow
          </div>

          <nav className="sidebar-nav">
            <button
              className="nav-item"
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
              className="nav-item active"
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

        <main className="employee-project-details-page">
          <div className="employee-project-details-error">
            {error}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="employee-project-details-layout">
      <aside className="employee-sidebar">
        <div className="sidebar-logo">
          ProjectFlow
        </div>

        <nav className="sidebar-nav">
          <button
            className="nav-item"
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
            className="nav-item active"
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

      <main className="employee-project-details-page">
        <button
          className="employee-project-back-button"
          onClick={() =>
            navigate("/employee/projects")
          }
        >
          ← Back to Projects
        </button>

        <header className="employee-project-details-header">
          <div>
            <h1>{project?.name}</h1>

            <p>
              {project?.description ||
                "No project description available."}
            </p>
          </div>

          <div className="employee-project-details-badges">
            <span
              className={`project-status-badge status-${project?.status}`}
            >
              {getStatusLabel(project?.status)}
            </span>

            <span
              className={`project-priority-badge priority-${project?.priority}`}
            >
              {getPriorityLabel(
                project?.priority
              )}
            </span>
          </div>
        </header>

        <section className="employee-project-info-card">
          <h2>Project Information</h2>

          <div className="employee-project-info-grid">
            <div>
              <span>Manager</span>
              <strong>
                {project?.manager?.name ||
                  "Not available"}
              </strong>
            </div>

            <div>
              <span>Start Date</span>
              <strong>
                {formatDate(
                  project?.startDate
                )}
              </strong>
            </div>

            <div>
              <span>Due Date</span>
              <strong>
                {formatDate(
                  project?.dueDate
                )}
              </strong>
            </div>

            <div>
              <span>Total Tasks</span>
              <strong>{tasks.length}</strong>
            </div>
          </div>
          <div className="employee-project-task-summary">
  <div>
    <span>Total Tasks</span>
    <strong>{totalTasks}</strong>
  </div>

  <div>
    <span>To Do</span>
    <strong>{todoTasks}</strong>
  </div>

  <div>
    <span>In Progress</span>
    <strong>{inProgressTasks}</strong>
  </div>

  <div>
    <span>Completed</span>
    <strong>{completedTasks}</strong>
  </div>
</div>
<div className="employee-project-progress">
  <div className="employee-project-progress-header">
    <span>Project Progress</span>
    <strong>{projectProgress}%</strong>
  </div>

  <div className="employee-project-progress-track">
    <div
      className="employee-project-progress-fill"
      style={{
        width: `${projectProgress}%`,
      }}
    />
  </div>

  <p>
    {completedTasks} of {totalTasks} tasks
    completed
  </p>
</div>
        </section>
        <section className="employee-project-members-card">
  <div className="employee-project-section-header">
    <div>
      <h2>Project Members</h2>

      <p>
        People assigned to this project.
      </p>
    </div>
  </div>

  {project?.members?.length === 0 ? (
    <div className="employee-project-empty">
      No members assigned to this project.
    </div>
  ) : (
    <div className="employee-project-member-list">
      {project?.members?.map((member) => (
        <div
          className="employee-project-member-card"
          key={member._id}
        >
          <div className="employee-project-member-avatar">
            {member.name
              ?.charAt(0)
              .toUpperCase()}
          </div>

          <div>
            <h3>{member.name}</h3>

            <p>{member.email}</p>
          </div>

          <span className="employee-project-member-role">
            {member.role}
          </span>
        </div>
      ))}
    </div>
  )}
</section>

        <section className="employee-project-tasks-card">
          <div className="employee-project-section-header">
            <div>
              <h2>Project Tasks</h2>

              <p>
                Tasks associated with this project.
              </p>
            </div>
          </div>

          {tasks.length === 0 ? (
            <div className="employee-project-empty">
              No tasks have been added to this
              project yet.
            </div>
          ) : (
            <div className="employee-project-task-list">
              {tasks.map((task) => (
                <div
                  className="employee-project-task-card"
                  key={task._id}
                >
                  <div>
                    <h3>{task.title}</h3>

                    <p>
                      {task.description ||
                        "No description"}
                    </p>
                  </div>

                  <div className="employee-project-task-meta">
                    <span
                      className={`task-status-badge status-${task.status}`}
                    >
                      {getTaskStatusLabel(
                        task.status
                      )}
                    </span>

                    <span
                      className={`task-priority-badge priority-${task.priority}`}
                    >
                      {getPriorityLabel(
                        task.priority
                      )}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default EmployeeProjectDetails;