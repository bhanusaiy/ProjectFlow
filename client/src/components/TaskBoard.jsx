import { useEffect, useState } from "react";
import api from "../services/api";

const TaskBoard = ({
  projectId,
  members = [],
  openCreateForm = false,
}) => {
  const [tasks, setTasks] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

const [showCreateForm, setShowCreateForm] =
  useState(openCreateForm);
  const [creating, setCreating] =
    useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assignedTo: "",
    priority: "medium",
    status: "todo",
    startDate: "",
    dueDate: "",
    estimatedHours: 0,
  });


  // ==========================================
  // LOAD TASKS
  // ==========================================

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/tasks/project/${projectId}`
      );

      setTasks(
        response.data.tasks || []
      );
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to load tasks"
      );
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (projectId) {
      loadTasks();
    }
  }, [projectId]);
  useEffect(() => {
  if (openCreateForm) {
    setShowCreateForm(true);
  }
}, [openCreateForm]);


  // ==========================================
  // FORM CHANGE
  // ==========================================

  const handleChange = (event) => {
    const { name, value } =
      event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };


  // ==========================================
  // CREATE TASK
  // ==========================================

  const handleCreateTask = async (
    event
  ) => {
    event.preventDefault();

    setError("");

    if (!formData.title.trim()) {
      setError(
        "Task title is required"
      );

      return;
    }

    if (!formData.assignedTo) {
      setError(
        "Please select an employee"
      );

      return;
    }

    try {
      setCreating(true);

      const response =
        await api.post(
          "/tasks",
          {
            ...formData,

            title:
              formData.title.trim(),

            project: projectId,

            estimatedHours:
              Number(
                formData.estimatedHours
              ) || 0,

            startDate:
              formData.startDate ||
              null,

            dueDate:
              formData.dueDate ||
              null,
          }
        );

      setTasks((previous) => [
        response.data.task,
        ...previous,
      ]);

      setFormData({
        title: "",
        description: "",
        assignedTo: "",
        priority: "medium",
        status: "todo",
        startDate: "",
        dueDate: "",
        estimatedHours: 0,
      });

      setShowCreateForm(false);

    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to create task"
      );
    } finally {
      setCreating(false);
    }
  };


  // ==========================================
  // UPDATE TASK STATUS
  // ==========================================

  const updateTaskStatus = async (
    taskId,
    status
  ) => {
    try {
      const response =
        await api.put(
          `/tasks/${taskId}`,
          {
            status,
          }
        );

      setTasks((previous) =>
        previous.map((task) =>
          task._id === taskId
            ? response.data.task
            : task
        )
      );

    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to update task"
      );
    }
  };


  // ==========================================
  // DELETE TASK
  // ==========================================

  const deleteTask = async (
    taskId
  ) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this task?"
      );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(
        `/tasks/${taskId}`
      );

      setTasks((previous) =>
        previous.filter(
          (task) =>
            task._id !== taskId
        )
      );

    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to delete task"
      );
    }
  };


  // ==========================================
  // STATUS COLUMNS
  // ==========================================

  const columns = [
    {
      id: "todo",
      title: "To Do",
    },
    {
      id: "in-progress",
      title: "In Progress",
    },
    {
      id: "review",
      title: "Review",
    },
    {
      id: "completed",
      title: "Completed",
    },
  ];


  // ==========================================
  // PRIORITY LABEL
  // ==========================================

  const getPriorityLabel = (
    priority
  ) => {
    const labels = {
      low: "Low",
      medium: "Medium",
      high: "High",
      urgent: "Urgent",
    };

    return (
      labels[priority] ||
      priority
    );
  };


  // ==========================================
  // FORMAT DATE
  // ==========================================

  const formatDate = (date) => {
    if (!date) {
      return "";
    }

    return new Date(
      date
    ).toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
      }
    );
  };


  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="task-loading">
        Loading tasks...
      </div>
    );
  }


  return (
    <section className="task-board-section">

      {/* ======================================
          HEADER
      ======================================= */}

      <div className="task-board-header">

        <div>
          <h2>
            Project Tasks
          </h2>

          <p>
            Manage and track work for this
            project.
          </p>
        </div>

        <button
          className="create-task-button"
          onClick={() =>
            setShowCreateForm(
              !showCreateForm
            )
          }
        >
          {showCreateForm
            ? "Cancel"
            : "+ Create Task"}
        </button>

      </div>


      {/* ======================================
          ERROR
      ======================================= */}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}


      {/* ======================================
          CREATE TASK FORM
      ======================================= */}

      {showCreateForm && (
        <form
          className="create-task-form"
          onSubmit={handleCreateTask}
        >

          <h3>
            Create New Task
          </h3>


          <div className="form-grid">

            <div className="form-field full">
              <label>
                Task Title
              </label>

              <input
                name="title"
                type="text"
                placeholder="e.g. Create login page"
                value={formData.title}
                onChange={handleChange}
              />
            </div>


            <div className="form-field full">
              <label>
                Description
              </label>

              <textarea
                name="description"
                placeholder="Describe the task..."
                value={
                  formData.description
                }
                onChange={handleChange}
                rows="4"
              />
            </div>


            <div className="form-field">
              <label>
                Assign Employee
              </label>

              <select
                name="assignedTo"
                value={
                  formData.assignedTo
                }
                onChange={handleChange}
              >
                <option value="">
                  Select employee
                </option>

                {members.map(
                  (member) => (
                    <option
                      key={member._id}
                      value={member._id}
                    >
                      {member.name}
                    </option>
                  )
                )}
              </select>
            </div>


            <div className="form-field">
              <label>
                Priority
              </label>

              <select
                name="priority"
                value={
                  formData.priority
                }
                onChange={handleChange}
              >
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


            <div className="form-field">
              <label>
                Start Date
              </label>

              <input
                name="startDate"
                type="date"
                value={
                  formData.startDate
                }
                onChange={handleChange}
              />
            </div>


            <div className="form-field">
              <label>
                Due Date
              </label>

              <input
                name="dueDate"
                type="date"
                value={
                  formData.dueDate
                }
                onChange={handleChange}
              />
            </div>


            <div className="form-field">
              <label>
                Estimated Hours
              </label>

              <input
                name="estimatedHours"
                type="number"
                min="0"
                value={
                  formData.estimatedHours
                }
                onChange={handleChange}
              />
            </div>

          </div>


          <div className="create-task-actions">

            <button
              type="button"
              onClick={() =>
                setShowCreateForm(
                  false
                )
              }
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={creating}
            >
              {creating
                ? "Creating..."
                : "Create Task"}
            </button>

          </div>

        </form>
      )}


      {/* ======================================
          EMPTY STATE
      ======================================= */}

      {tasks.length === 0 ? (
        <div className="task-empty-state">

          <div className="empty-icon">
            ✓
          </div>

          <h3>
            No tasks yet
          </h3>

          <p>
            Create your first task and
            assign it to a team member.
          </p>

          <button
            onClick={() =>
              setShowCreateForm(
                true
              )
            }
          >
            + Create First Task
          </button>

        </div>
      ) : (

        /* ====================================
           TASK BOARD
        ==================================== */

        <div className="task-board">

          {columns.map(
            (column) => {

              const columnTasks =
                tasks.filter(
                  (task) =>
                    task.status ===
                    column.id
                );

              return (
                <div
                  className="task-column"
                  key={column.id}
                >

                  <div className="task-column-header">

                    <h3>
                      {column.title}
                    </h3>

                    <span>
                      {
                        columnTasks.length
                      }
                    </span>

                  </div>


                  <div className="task-column-content">

                    {columnTasks.length ===
                    0 ? (
                      <div className="empty-column">
                        No tasks
                      </div>
                    ) : (
                      columnTasks.map(
                        (task) => (
                          <div
                            className="task-card"
                            key={task._id}
                          >

                            <div className="task-card-top">

                              <span
                                className={`task-priority ${task.priority}`}
                              >
                                {getPriorityLabel(
                                  task.priority
                                )}
                              </span>

                              <button
                                className="task-delete-button"
                                onClick={() =>
                                  deleteTask(
                                    task._id
                                  )
                                }
                              >
                                ×
                              </button>

                            </div>


                            <h4>
                              {task.title}
                            </h4>


                            {task.description && (
                              <p>
                                {
                                  task.description
                                }
                              </p>
                            )}


                            <div className="task-assignee">

                              <div className="task-avatar">
                                {task.assignedTo?.name
                                  ?.charAt(
                                    0
                                  )
                                  ?.toUpperCase()}
                              </div>

                              <span>
                                {
                                  task.assignedTo
                                    ?.name
                                }
                              </span>

                            </div>


                            <div className="task-card-footer">

                              {task.dueDate && (
                                <span>
                                  📅{" "}
                                  {formatDate(
                                    task.dueDate
                                  )}
                                </span>
                              )}

                              {task.estimatedHours >
                                0 && (
                                <span>
                                  ⏱{" "}
                                  {
                                    task.estimatedHours
                                  }h
                                </span>
                              )}

                            </div>


                            <select
                              value={
                                task.status
                              }
                              onChange={(
                                event
                              ) =>
                                updateTaskStatus(
                                  task._id,
                                  event.target
                                    .value
                                )
                              }
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

                          </div>
                        )
                      )
                    )}

                  </div>

                </div>
              );
            }
          )}

        </div>
      )}

    </section>
  );
};

export default TaskBoard;