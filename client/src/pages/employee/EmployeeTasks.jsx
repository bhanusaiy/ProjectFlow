import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../services/api";

const EmployeeTasks = () => {
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingTaskId, setUpdatingTaskId] =
  useState(null);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/tasks/my-tasks");

        setTasks(response.data.tasks || []);
      } catch (error) {
        console.error(
          "Load employee tasks error:",
          error
        );

        setError(
          error.response?.data?.message ||
            "Unable to load your tasks"
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
  const handleStatusChange = async (
  taskId,
  newStatus
) => {
  try {
    setUpdatingTaskId(taskId);
    setError("");

    const response = await api.put(
      `/tasks/${taskId}`,
      {
        status: newStatus,
      }
    );

    setTasks((previousTasks) =>
      previousTasks.map((task) =>
        task._id === taskId
          ? response.data.task
          : task
      )
    );
  } catch (error) {
    console.error(
      "Update task status error:",
      error
    );

    setError(
      error.response?.data?.message ||
        "Unable to update task status"
    );
  } finally {
    setUpdatingTaskId(null);
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
    if (!date) return "No due date";

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
            className="nav-item active"
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

      <main className="employee-tasks-page">
        <header className="employee-tasks-header">
          <div>
            <h1>My Tasks</h1>

            <p>
              View the tasks assigned to you.
            </p>
          </div>

          <div className="employee-task-count">
            {tasks.length} Tasks
          </div>
        </header>

        {loading && (
          <div className="employee-tasks-message">
            Loading your tasks...
          </div>
        )}

        {error && (
          <div className="employee-tasks-error">
            {error}
          </div>
        )}

        {!loading &&
          !error &&
          tasks.length === 0 && (
            <div className="employee-empty-tasks">
              <h2>No tasks assigned</h2>

              <p>
                You currently don't have any tasks
                assigned to you.
              </p>
            </div>
          )}

        {!loading &&
          !error &&
          tasks.length > 0 && (
            <section className="employee-task-list">
              {tasks.map((task) => (
                <article
                  className="employee-task-card"
                  key={task._id}
                   onClick={() =>
    navigate(
      `/employee/tasks/${task._id}`
    )
  }
                >
                  <div className="employee-task-main">
                    <h2>{task.title}</h2>

                    <p>
                      {task.description ||
                        "No description provided."}
                    </p>

                    <div className="employee-task-meta">
                      <span>
                        Project:{" "}
                        <strong>
                          {task.project?.name ||
                            "Unknown project"}
                        </strong>
                      </span>

                      <span>
                        Due:{" "}
                        <strong>
                          {formatDate(task.dueDate)}
                        </strong>
                      </span>
                    </div>
                  </div>

                  <div className="employee-task-side">
                  <select
  className={`employee-task-status-select status-${task.status}`}
  value={task.status}
  disabled={updatingTaskId === task._id}
  onClick={(event) =>
    event.stopPropagation()
  }
  onChange={(event) => {
    event.stopPropagation();

    handleStatusChange(
      task._id,
      event.target.value
    );
  }}
>
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
                    <span
                      className={`task-priority-badge priority-${task.priority}`}
                    >
                      {getPriorityLabel(task.priority)}
                    </span>
                  </div>
                </article>
              ))}
            </section>
          )}
      </main>
    </div>
  );
};

export default EmployeeTasks;