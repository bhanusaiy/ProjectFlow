import { useEffect, useState } from "react";
import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import api from "../../services/api";

const ManagerTasks = () => {
  const navigate = useNavigate();
  const [searchParams] =
  useSearchParams();

const [tasks, setTasks] = useState([]);
const [projects, setProjects] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

const [search, setSearch] = useState("");
const [projectFilter, setProjectFilter] =
  useState("all");
const [statusFilter, setStatusFilter] =
  useState(
    searchParams.get("status") || "all"
  );
const [priorityFilter, setPriorityFilter] =
  useState("all");
const [showNewTaskMenu, setShowNewTaskMenu] =
  useState(false);
  const handleNewTaskForProject = (projectId) => {
  navigate(
    `/manager/projects/${projectId}?createTask=true`
  );

  setShowNewTaskMenu(false);
};
  useEffect(() => {
  const statusFromUrl =
    searchParams.get("status") || "all";

  setStatusFilter(statusFromUrl);
}, [searchParams]);
  const filteredTasks = tasks.filter((task) => {
  const searchText = search.toLowerCase();

  const matchesSearch =
    task.title
      ?.toLowerCase()
      .includes(searchText) ||
    task.description
      ?.toLowerCase()
      .includes(searchText);

  const matchesProject =
    projectFilter === "all" ||
    task.project?._id === projectFilter;

  const matchesStatus =
    statusFilter === "all" ||
    task.status === statusFilter;

  const matchesPriority =
    priorityFilter === "all" ||
    task.priority === priorityFilter;

  return (
    matchesSearch &&
    matchesProject &&
    matchesStatus &&
    matchesPriority
  );
});

  useEffect(() => {
    const loadTasks = async () => {
      try {
        setLoading(true);
        setError("");

        /*
          We will use the manager's projects to load
          the tasks belonging to those projects.
        */

const projectsResponse = await api.get(
  "/projects"
);

const projects =
  projectsResponse.data.projects || [];

setProjects(projects);

        const taskResponses = await Promise.all(
          projects.map((project) =>
            api.get(
              `/tasks/project/${project._id}`
            )
          )
        );

        const allTasks = taskResponses.flatMap(
          (response) =>
            response.data.tasks || []
        );

        setTasks(allTasks);
      } catch (error) {
        console.error(
          "Load manager tasks error:",
          error
        );

        setError(
          error.response?.data?.message ||
            "Unable to load tasks"
        );
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, []);

  const getStatusLabel = (status) => {
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
      return "No due date";
    }

    return new Date(date).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <h2>Loading tasks...</h2>
      </div>
    );
  }

 if (error) {
  return (
    <div className="manager-tasks-page">
      <div className="error-message">
        <span>{error}</span>

        <button
          className="small-button"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    </div>
  );
}

    return (
    <div className="manager-tasks-page">

      <div className="manager-tasks-header">
        <div>
          <button
      className="manager-tasks-back-button"
      onClick={() => navigate("/manager/dashboard")}
    >
      ← Dashboard
    </button>

    <h1>Tasks</h1>
          <p>
            Manage tasks across your projects.
          </p>
        </div>

        <div className="new-task-menu-wrapper">
          <button
            className="new-task-button"
            onClick={() =>
              setShowNewTaskMenu(
                !showNewTaskMenu
              )
            }
          >
            + New Task
          </button>

          {showNewTaskMenu && (
            <div className="new-task-project-menu">
              <h3>Select Project</h3>

             {projects.length === 0 ? (
  <p>
    No projects available.
  </p>
) : (
  projects.map((project) => (
    <button
      key={project._id}
      onClick={() =>
        handleNewTaskForProject(
          project._id
        )
      }
    >
      {project.name}
    </button>
  ))
)}</div>
          )}
        </div>
      </div>

      <div className="manager-tasks-filters">

        <div className="task-search-box">
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />
        </div>

        <div className="task-filter-group">

          <select
            value={projectFilter}
            onChange={(event) =>
              setProjectFilter(
                event.target.value
              )
            }
          >
            <option value="all">
              All Projects
            </option>

            {projects.map((project) => (  <option
                key={project._id}
                value={project._id}
              >
                {project.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value
              )
            }
          >
            <option value="all">
              All Statuses
            </option>
            <option value="todo">
              To Do
            </option>
            <option value="in-progress">
              In Progress
            </option>
            <option value="review">
              Review
            </option>
            <option value="completed">
              Completed
            </option>
          </select>

          <select
            value={priorityFilter}
            onChange={(event) =>
              setPriorityFilter(
                event.target.value
              )
            }
          >
            <option value="all">
              All Priorities
            </option>
            <option value="low">
              Low
            </option>
            <option value="medium">
              Medium
            </option>
            <option value="high">
              High
            </option>
            <option value="urgent">
              Urgent
            </option>
          </select>

        </div>
      </div>

      <div className="manager-tasks-summary">
        <span>
          Showing{" "}
          <strong>
            {filteredTasks.length}
          </strong>{" "}
          task
          {filteredTasks.length !== 1
            ? "s"
            : ""}
        </span>
      </div>

      {filteredTasks.length === 0 ? (

        <div className="empty-state">
          <h3>No tasks found</h3>

          <p>
            Try changing your filters or
            create a new task.
          </p>
        </div>

      ) : (

        <div className="manager-tasks-grid">

          {filteredTasks.map((task) => (

            <div
              key={task._id}
              className="manager-task-card"
              onClick={() =>
                navigate(
                  `/manager/tasks/${task._id}`
                )
              }
            >

              <div className="manager-task-card-top">

                <div>
                  <h3>
                    {task.title}
                  </h3>

                  <p>
                    {task.description ||
                      "No description"}
                  </p>
                </div>

                <span
                  className={`status ${task.status}`}
                >
                  {getStatusLabel(
                    task.status
                  )}
                </span>

              </div>

              <div className="manager-task-card-details">

                <div>
                  <span>
                    Project
                  </span>

                  <strong>
                    {task.project?.name ||
                      "No project"}
                  </strong>
                </div>

                <div>
                  <span>
                    Assigned To
                  </span>

                  <strong>
                    {task.assignedTo?.name ||
                      "Unassigned"}
                  </strong>
                </div>

                <div>
                  <span>
                    Priority
                  </span>

                  <strong
                    className={`priority-${task.priority}`}
                  >
                    {getPriorityLabel(
                      task.priority
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Due Date
                  </span>

                  <strong>
                    {formatDate(
                      task.dueDate
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Estimated Hours
                  </span>

                  <strong>
                    {task.estimatedHours ||
                      0}{" "}
                    hrs
                  </strong>
                </div>

              </div>

            </div>

          ))}

        </div>

      )}

    </div>
  );
};

export default ManagerTasks;