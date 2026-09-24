import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";

const EmployeeTaskDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

const [task, setTask] = useState(null);
const [comments, setComments] = useState([]);
const [newComment, setNewComment] = useState("");
const [loading, setLoading] = useState(true);
const [commentsLoading, setCommentsLoading] =
  useState(true);
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

      const response = await api.get(
        `/tasks/${id}`
      );

      setTask(response.data.task);
    } catch (error) {
      console.error(
        "Load task error:",
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
        "Load comments error:",
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
      "Add comment error:",
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

  const formatDate = (date) => {
    if (!date) {
      return "Not set";
    }

    return new Date(date).toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      }
    );
  };

  const getStatusLabel = (status) => {
    const labels = {
      todo: "To Do",
      "in-progress": "In Progress",
      review: "Review",
      completed: "Completed",
    };

    return labels[status] || status;
  };

  const getPriorityLabel = (priority) => {
    const labels = {
      low: "Low",
      medium: "Medium",
      high: "High",
      urgent: "Urgent",
    };

    return labels[priority] || priority;
  };

  if (loading) {
    return (
      <div className="employee-task-details-layout">
        <aside className="employee-sidebar">
          <div className="employee-logo">
            ProjectFlow
          </div>

          <nav className="employee-nav">
            <button
              onClick={() =>
                navigate("/employee/dashboard")
              }
            >
              Dashboard
            </button>

            <button
              className="active"
              onClick={() =>
                navigate("/employee/tasks")
              }
            >
              My Tasks
            </button>

            <button
              onClick={() =>
                navigate("/employee/projects")
              }
            >
              My Projects
            </button>

            <button
              onClick={() =>
                navigate("/employee/settings")
              }
            >
              Settings
            </button>
          </nav>
        </aside>

        <main className="employee-task-details-page">
          <div className="employee-task-loading">
            Loading task...
          </div>
        </main>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="employee-task-details-layout">
        <aside className="employee-sidebar">
          <div className="employee-logo">
            ProjectFlow
          </div>

          <nav className="employee-nav">
            <button
              onClick={() =>
                navigate("/employee/dashboard")
              }
            >
              Dashboard
            </button>

            <button
              className="active"
              onClick={() =>
                navigate("/employee/tasks")
              }
            >
              My Tasks
            </button>

            <button
              onClick={() =>
                navigate("/employee/projects")
              }
            >
              My Projects
            </button>

            <button
              onClick={() =>
                navigate("/employee/settings")
              }
            >
              Settings
            </button>
          </nav>
        </aside>

        <main className="employee-task-details-page">
          <button
            className="employee-task-back-button"
            onClick={() =>
              navigate("/employee/tasks")
            }
          >
            ← Back to My Tasks
          </button>

          <div className="employee-task-error">
            {error || "Task not found"}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="employee-task-details-layout">
      <aside className="employee-sidebar">
        <div className="employee-logo">
          ProjectFlow
        </div>

        <nav className="employee-nav">
          <button
            onClick={() =>
              navigate("/employee/dashboard")
            }
          >
            Dashboard
          </button>

          <button
            className="active"
            onClick={() =>
              navigate("/employee/tasks")
            }
          >
            My Tasks
          </button>

          <button
            onClick={() =>
              navigate("/employee/projects")
            }
          >
            My Projects
          </button>

          <button
            onClick={() =>
              navigate("/employee/settings")
            }
          >
            Settings
          </button>
        </nav>
      </aside>

      <main className="employee-task-details-page">
        <button
          className="employee-task-back-button"
          onClick={() =>
            navigate("/employee/tasks")
          }
        >
          ← Back to My Tasks
        </button>

        <div className="employee-task-details-header">
          <div>
            <div className="employee-task-details-eyebrow">
              Task Details
            </div>

            <h1>{task.title}</h1>

            <p>
              {task.project?.name ||
                "Project not available"}
            </p>
          </div>

          <div className="employee-task-details-badges">
            <span
              className={`employee-task-status-badge status-${task.status}`}
            >
              {getStatusLabel(task.status)}
            </span>

            <span
              className={`employee-task-priority-badge priority-${task.priority}`}
            >
              {getPriorityLabel(task.priority)}
            </span>
          </div>
        </div>

        <div className="employee-task-details-grid">
          <section className="employee-task-main-card">
            <h2>Description</h2>

            <p className="employee-task-description">
              {task.description ||
                "No description has been added for this task."}
            </p>
          </section>

          <section className="employee-task-info-card">
            <h2>Task Information</h2>

            <div className="employee-task-info-list">
              <div>
                <span>Project</span>
                <strong>
                  {task.project?.name ||
                    "Not available"}
                </strong>
              </div>

              <div>
                <span>Assigned To</span>
                <strong>
                  {task.assignedTo?.name ||
                    "Not available"}
                </strong>
              </div>

              <div>
                <span>Created By</span>
                <strong>
                  {task.createdBy?.name ||
                    "Not available"}
                </strong>
              </div>

              <div>
                <span>Start Date</span>
                <strong>
                  {formatDate(task.startDate)}
                </strong>
              </div>

              <div>
                <span>Due Date</span>
                <strong>
                  {formatDate(task.dueDate)}
                </strong>
              </div>

              <div>
                <span>Estimated Hours</span>
                <strong>
                  {task.estimatedHours || 0} hours
                </strong>
              </div>

              <div>
                <span>Created</span>
                <strong>
                  {formatDate(task.createdAt)}
                </strong>
              </div>

              {task.completedAt && (
                <div>
                  <span>Completed</span>
                  <strong>
                    {formatDate(task.completedAt)}
                  </strong>
                </div>
              )}
            </div>
          </section>
        </div>

        <section className="employee-task-project-card">
          <div>
            <h2>Project</h2>

            <p>
              {task.project?.description ||
                "No project description available."}
            </p>
          </div>

          {task.project?._id && (
            <button
              onClick={() =>
                navigate(
                  `/employee/projects/${task.project._id}`
                )
              }
            >
              View Project
            </button>
          )}
        </section>
        <section className="employee-task-comments-card">
  <div className="employee-task-comments-header">
    <div>
      <h2>Comments & Updates</h2>
      <p>
        Communicate with your project manager
        about this task.
      </p>
    </div>

    <span className="employee-task-comment-count">
      {comments.length}
    </span>
  </div>

  <div className="employee-task-comments-list">
   {commentsLoading ? (
  <div className="employee-task-comments-empty">
    Loading comments...
  </div>
) : commentError ? (
  <div className="employee-task-comments-empty">
    {commentError}
  </div>
) : comments.length === 0 ? (
  <div className="employee-task-comments-empty">
    No comments yet. Add the first update below.
  </div>
) : (
  comments.map((comment) => (
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
            {formatDate(comment.createdAt)}
          </span>
        </div>

        <p>{comment.message}</p>
      </div>
    </div>
  ))
)}  </div>

  <form
    className="employee-task-comment-form"
    onSubmit={handleAddComment}
  >
    <textarea
      value={newComment}
      onChange={(event) =>
        setNewComment(event.target.value)
      }
      placeholder="Write an update or comment..."
      maxLength={1000}
      rows={4}
      disabled={submittingComment}
    />

    <div className="employee-task-comment-form-bottom">
      <span>
        {newComment.length}/1000
      </span>

      <button
        type="submit"
        disabled={
          submittingComment ||
          !newComment.trim()
        }
      >
        {submittingComment
          ? "Posting..."
          : "Post Comment"}
      </button>
    </div>

    {commentError && (
      <div className="employee-task-comment-error">
        {commentError}
      </div>
    )}
  </form>
</section>
      </main>
    </div>
  );
};

export default EmployeeTaskDetails;