import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../services/api";

const EmployeeProjects = () => {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          "/projects/my-projects"
        );

        setProjects(
          response.data.projects || []
        );
      } catch (error) {
        console.error(
          "Load employee projects error:",
          error
        );

        setError(
          error.response?.data?.message ||
            "Unable to load your projects"
        );
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

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
        return status || "Unknown";
    }
  };

  const getPriorityLabel = (priority) => {
    if (!priority) return "Medium";

    return (
      priority.charAt(0).toUpperCase() +
      priority.slice(1)
    );
  };

  const formatDate = (date) => {
    if (!date) return "Not set";

    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="employee-dashboard-layout">
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

      <main className="employee-projects-page">
        <header className="employee-projects-header">
          <div>
            <h1>My Projects</h1>

            <p>
              Projects you are currently assigned to.
            </p>
          </div>

          <div className="employee-project-count">
            {projects.length} Projects
          </div>
        </header>

        {loading && (
          <div className="employee-projects-message">
            Loading your projects...
          </div>
        )}

        {error && (
          <div className="employee-projects-error">
            {error}
          </div>
        )}

        {!loading &&
          !error &&
          projects.length === 0 && (
            <div className="employee-empty-projects">
              <h2>No projects assigned</h2>

              <p>
                You currently aren't a member of any
                projects.
              </p>
            </div>
          )}

        {!loading &&
          !error &&
          projects.length > 0 && (
            <section className="employee-project-grid">
              {projects.map((project) => (
                <article
                  className="employee-project-card"
                  key={project._id}
                  onClick={()=>navigate(`/employee/projects/${project._id}`)}
                >
                  <div className="employee-project-card-top">
                    <div>
                      <h2>{project.name}</h2>

                      <p>
                        {project.description ||
                          "No description provided."}
                      </p>
                    </div>
                  </div>

                  <div className="employee-project-badges">
                    <span
                      className={`project-status-badge status-${project.status}`}
                    >
                      {getStatusLabel(
                        project.status
                      )}
                    </span>

                    <span
                      className={`project-priority-badge priority-${project.priority}`}
                    >
                      {getPriorityLabel(
                        project.priority
                      )}
                    </span>
                  </div>

                  <div className="employee-project-info">
                    <div>
                      <span>Manager</span>

                      <strong>
                        {project.manager?.name ||
                          "Unknown"}
                      </strong>
                    </div>

                    <div>
                      <span>Start Date</span>

                      <strong>
                        {formatDate(
                          project.startDate
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>Due Date</span>

                      <strong>
                        {formatDate(
                          project.dueDate
                        )}
                      </strong>
                    </div>
                  </div>
                </article>
              ))}
            </section>
          )}
      </main>
    </div>
  );
};

export default EmployeeProjects;