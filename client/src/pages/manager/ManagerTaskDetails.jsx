import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import api from "../../services/api";

function ManagerTaskDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [projectMembers, setProjectMembers] = useState([]);
  const [editing, setEditing] = useState(false);
const [savingTask, setSavingTask] = useState(false);
const [deletingTask, setDeletingTask] = useState(false);

const [editForm, setEditForm] = useState({
  title: "",
  description: "",
  status: "todo",
  priority: "medium",
  startDate: "",
  dueDate: "",
  estimatedHours: 0,
  assignedTo: "",
});

  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(true);

  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] =
    useState(false);

  const [error, setError] = useState("");
  const [commentError, setCommentError] =
    useState("");

  useEffect(() => {
    const loadTask = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/tasks/${id}`);

        setTask(response.data.task);
        const projectId =
  response.data.task.project?._id;

if (projectId) {
  const projectResponse =
    await api.get(
      `/projects/${projectId}`
    );

  setProjectMembers(
    projectResponse.data.project?.members ||
      []
  );
}
      } catch (error) {
        console.error(
          "Load manager task error:",
          error
        );

        setError(
          error.response?.data?.message ||
            "Unable to load task"
        );
      } finally {
        setLoading(false);
      }
    };

    loadTask();
  }, [id]);

  useEffect(() => {
    const loadComments = async () => {
      try {
        setCommentsLoading(true);
        setCommentError("");

        const response = await api.get(
          `/task-comments/task/${id}`
        );

        setComments(
          response.data.comments || []
        );
      } catch (error) {
        console.error(
          "Load task comments error:",
          error
        );

        setCommentError(
          error.response?.data?.message ||
            "Unable to load comments"
        );
      } finally {
        setCommentsLoading(false);
      }
    };

    loadComments();
  }, [id]);
  const handleEditTask = () => {
  setEditForm({
    title: task.title || "",
    description: task.description || "",
    status: task.status || "todo",
    priority: task.priority || "medium",
    startDate: task.startDate
      ? task.startDate.slice(0, 10)
      : "",
    dueDate: task.dueDate
      ? task.dueDate.slice(0, 10)
      : "",
    estimatedHours:
      task.estimatedHours || 0,
    assignedTo:
      task.assignedTo?._id || "",
  });

  setEditing(true);
};

const handleEditChange = (event) => {
  const { name, value } = event.target;

  setEditForm((previous) => ({
    ...previous,
    [name]: value,
  }));
};

const handleUpdateTask = async (event) => {
  event.preventDefault();

  try {
    setSavingTask(true);
    setError("");

    const response = await api.put(
      `/tasks/${id}`,
      {
        title: editForm.title,
        description: editForm.description,
        status: editForm.status,
        priority: editForm.priority,
        startDate:
          editForm.startDate || null,
        dueDate:
          editForm.dueDate || null,
        estimatedHours:
          Number(editForm.estimatedHours) || 0,
        assignedTo:
          editForm.assignedTo,
      }
    );

    setTask(response.data.task);
    setEditing(false);
  } catch (error) {
    console.error(
      "Update task error:",
      error
    );

    setError(
      error.response?.data?.message ||
        "Unable to update task"
    );
  } finally {
    setSavingTask(false);
  }
};
const handleDeleteTask = async () => {
  const confirmed = window.confirm(
    "Are you sure you want to delete this task?"
  );

  if (!confirmed) {
    return;
  }

  try {
    setDeletingTask(true);
    setError("");

    await api.delete(`/tasks/${id}`);

    navigate("/manager/tasks");
  } catch (error) {
    console.error(
      "Delete task error:",
      error
    );

    setError(
      error.response?.data?.message ||
        "Unable to delete task"
    );
  } finally {
    setDeletingTask(false);
  }
};

  const handleAddComment = async (event) => {
    event.preventDefault();

    if (!newComment.trim()) {
      setCommentError(
        "Please enter a comment."
      );
      return;
    }

    try {
      setSubmittingComment(true);
      setCommentError("");

      const response = await api.post(
        `/task-comments/task/${id}`,
        {
          message: newComment.trim(),
        }
      );

      setComments((previousComments) => [
        ...previousComments,
        response.data.comment,
      ]);

      setNewComment("");
    } catch (error) {
      console.error(
        "Add manager comment error:",
        error
      );

      setCommentError(
        error.response?.data?.message ||
          "Unable to add comment"
      );
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="employee-task-loading">
        Loading task...
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="employee-task-error">
        {error || "Task not found"}
      </div>
    );
  }

  const project = task.project;

  return (
    <div className="employee-task-details-layout">
      {/* Sidebar */}
      <aside className="employee-sidebar">
        <div className="employee-logo">
          ProjectFlow
        </div>

        <nav className="employee-nav">
          <button
            onClick={() =>
              navigate("/manager/dashboard")
            }
          >
            Dashboard
          </button>

          <button
            onClick={() =>
              navigate("/manager/projects")
            }
          >
            Projects
          </button>

          <button
            onClick={() =>
              navigate("/manager/tasks")
            }
            className="active"
          >
            Tasks
          </button>

          <button
            onClick={() =>
              navigate("/manager/settings")
            }
          >
            Settings
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="employee-task-details-page">
        <button
          className="employee-task-back-button"
          onClick={() =>
            navigate("/manager/tasks")
          }
        >
          ← Back to Tasks
        </button>

        {/* Header */}
    <div className="employee-task-details-header">
  <div>
    <div className="employee-task-details-eyebrow">
      TASK DETAILS
    </div>

    <h1>{task.title}</h1>

    <div className="employee-task-details-badges">
      <span
        className={`employee-task-status-badge status-${task.status}`}
      >
        {task.status}
      </span>

      <span
        className={`employee-task-priority-badge priority-${task.priority}`}
      >
        {task.priority}
      </span>
    </div>
  </div>

  {/* ADD THE BUTTON HERE */}
 <div className="manager-task-header-actions">
  <button
    className="manager-task-edit-button"
    onClick={handleEditTask}
  >
    Edit Task
  </button>

  <button
    className="manager-task-delete-button"
    onClick={handleDeleteTask}
    disabled={deletingTask}
  >
    {deletingTask
      ? "Deleting..."
      : "Delete Task"}
  </button>
</div>
</div>
{editing && (
  <div className="manager-task-edit-card">
    <div className="manager-task-edit-header">
      <div>
        <div className="employee-task-details-eyebrow">
          EDIT TASK
        </div>

        <h2>Update Task</h2>
      </div>

      <button
        type="button"
        className="manager-task-cancel-button"
        onClick={() => setEditing(false)}
      >
        Cancel
      </button>
    </div>

    <form
      className="manager-task-edit-form"
      onSubmit={handleUpdateTask}
    >
      {/* Title */}
      <div className="manager-task-form-group">
        <label>Task Title</label>

        <input
          type="text"
          name="title"
          value={editForm.title}
          onChange={handleEditChange}
          required
        />
      </div>

      {/* Description */}
      <div className="manager-task-form-group">
        <label>Description</label>

        <textarea
          name="description"
          value={editForm.description}
          onChange={handleEditChange}
          rows="5"
        />
      </div>

      {/* Status + Priority */}
      <div className="manager-task-form-row">
        <div className="manager-task-form-group">
          <label>Status</label>

          <select
            name="status"
            value={editForm.status}
            onChange={handleEditChange}
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

        <div className="manager-task-form-group">
          <label>Priority</label>

          <select
            name="priority"
            value={editForm.priority}
            onChange={handleEditChange}
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
      </div>

      {/* Dates */}
      <div className="manager-task-form-row">
        <div className="manager-task-form-group">
          <label>Start Date</label>

          <input
            type="date"
            name="startDate"
            value={editForm.startDate}
            onChange={handleEditChange}
          />
        </div>

        <div className="manager-task-form-group">
          <label>Due Date</label>

          <input
            type="date"
            name="dueDate"
            value={editForm.dueDate}
            onChange={handleEditChange}
          />
        </div>
      </div>
{/* Assigned Employee */}
<div className="manager-task-form-group">
  <label>Assigned Employee</label>

  <select
    name="assignedTo"
    value={editForm.assignedTo}
    onChange={handleEditChange}
    required
  >
    <option value="">
      Select an employee
    </option>

    {projectMembers.map((member) => (
      <option
        key={member._id}
        value={member._id}
      >
        {member.name} — {member.email}
      </option>
    ))}
  </select>
</div>
      {/* Estimated Hours */}
      <div className="manager-task-form-group">
        <label>Estimated Hours</label>

        <input
          type="number"
          name="estimatedHours"
          min="0"
          value={editForm.estimatedHours}
          onChange={handleEditChange}
        />
      </div>

      {/* Buttons */}
      <div className="manager-task-edit-actions">
        <button
          type="button"
          className="manager-task-cancel-button"
          onClick={() => setEditing(false)}
        >
          Cancel
        </button>

        <button
          type="submit"
          className="manager-task-save-button"
          disabled={savingTask}
        >
          {savingTask
            ? "Saving..."
            : "Save Changes"}
        </button>
      </div>
    </form>
  </div>
)}
        {/* Main Grid */}
        <div className="employee-task-details-grid">
          {/* Left */}
          <section>
            <div className="employee-task-main-card">
              <h2>Description</h2>

              <p>
                {task.description ||
                  "No description provided."}
              </p>
            </div>

            {/* Project */}
            <div className="employee-task-project-card">
              <div>
                <div className="employee-task-details-eyebrow">
                  PROJECT
                </div>

                <h2>
                  {project?.name ||
                    "Unknown Project"}
                </h2>

                <p>
                  {project?.description ||
                    "No project description available."}
                </p>
              </div>

              {project?._id && (
                <button
                  onClick={() =>
                    navigate(
                      `/manager/projects/${project._id}`
                    )
                  }
                >
                  View Project
                </button>
              )}
            </div>

            {/* Comments */}
            <div className="employee-task-comments-card">
              <div className="employee-task-comments-header">
                <div>
                  <h2>Comments</h2>

                  <span className="employee-task-comment-count">
                    {comments.length}
                  </span>
                </div>
              </div>

              {commentsLoading ? (
                <div className="employee-task-comments-empty">
                  Loading comments...
                </div>
              ) : comments.length === 0 ? (
                <div className="employee-task-comments-empty">
                  No comments yet.
                </div>
              ) : (
                <div className="employee-task-comments-list">
                  {comments.map((comment) => (
                    <div
                      className="employee-task-comment"
                      key={comment._id}
                    >
                      <div className="employee-task-comment-avatar">
                        {comment.user?.name
                          ?.charAt(0)
                          ?.toUpperCase() || "U"}
                      </div>

                      <div className="employee-task-comment-content">
                        <div className="employee-task-comment-top">
                          <strong>
                            {comment.user?.name ||
                              "Unknown User"}
                          </strong>

                          <span>
                            {new Date(
                              comment.createdAt
                            ).toLocaleString()}
                          </span>
                        </div>

                        <p>
                          {comment.message}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <form
                className="employee-task-comment-form"
                onSubmit={handleAddComment}
              >
                <textarea
                  value={newComment}
                  onChange={(event) =>
                    setNewComment(
                      event.target.value
                    )
                  }
                  placeholder="Write a comment..."
                  rows="4"
                />

                <div className="employee-task-comment-form-bottom">
                  {commentError && (
                    <span className="employee-task-comment-error">
                      {commentError}
                    </span>
                  )}

                  <button
                    type="submit"
                    disabled={submittingComment}
                  >
                    {submittingComment
                      ? "Posting..."
                      : "Post Comment"}
                  </button>
                </div>
              </form>
            </div>
          </section>

          {/* Right */}
          <aside>
            <div className="employee-task-info-card">
              <h2>Task Information</h2>

              <div>
                <span>Status</span>
                <strong>{task.status}</strong>
              </div>

              <div>
                <span>Priority</span>
                <strong>{task.priority}</strong>
              </div>

              <div>
                <span>Assigned To</span>
                <strong>
                  {task.assignedTo?.name ||
                    "Unassigned"}
                </strong>
              </div>

              <div>
                <span>Created By</span>
                <strong>
                  {task.createdBy?.name ||
                    "Unknown"}
                </strong>
              </div>

              <div>
                <span>Start Date</span>
                <strong>
                  {task.startDate
                    ? new Date(
                        task.startDate
                      ).toLocaleDateString()
                    : "Not set"}
                </strong>
              </div>

              <div>
                <span>Due Date</span>
                <strong>
                  {task.dueDate
                    ? new Date(
                        task.dueDate
                      ).toLocaleDateString()
                    : "Not set"}
                </strong>
              </div>

              <div>
                <span>Estimated Hours</span>
                <strong>
                  {task.estimatedHours || 0} hrs
                </strong>
              </div>

              <div>
                <span>Created</span>
                <strong>
                  {task.createdAt
                    ? new Date(
                        task.createdAt
                      ).toLocaleDateString()
                    : "Unknown"}
                </strong>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default ManagerTaskDetails;