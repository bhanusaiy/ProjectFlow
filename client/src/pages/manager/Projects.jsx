import { useEffect, useMemo, useState } from "react";
import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import api from "../../services/api";

const Projects = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
  useState(
    searchParams.get("status") || "all"
  );

  const [showCreateModal, setShowCreateModal] =
    useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
    status: "planning",
    priority: "medium",
    startDate: "",
    dueDate: "",
    members: [],
  });


  // =========================
  // LOAD PROJECTS
  // =========================

  const loadProjects = async () => {
    try {
      const response = await api.get(
        "/projects"
      );

      setProjects(
        response.data.projects
      );
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to load projects"
      );
    }
  };


  // =========================
  // LOAD TEAM MEMBERS
  // =========================

  const loadMembers = async () => {
    try {
      const response = await api.get(
        "/teams/my-team"
      );

      setMembers(
        response.data.members
      );
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to load team members"
      );
    }
  };


  // =========================
  // INITIAL LOAD
  // =========================

useEffect(() => {
  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      await Promise.all([
        loadProjects(),
        loadMembers(),
      ]);
    } catch (error) {
      console.error(
        "Load projects page error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to load projects"
      );
    } finally {
      setLoading(false);
    }
  };

  loadData();
}, []);


  // =========================
  // FORM CHANGE
  // =========================

  const handleChange = (event) => {
    const { name, value } =
      event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };


  // =========================
  // MEMBER SELECTION
  // =========================

  const toggleMember = (memberId) => {
    setForm((previous) => {
      const alreadySelected =
        previous.members.includes(
          memberId
        );

      return {
        ...previous,
        members: alreadySelected
          ? previous.members.filter(
              (id) => id !== memberId
            )
          : [
              ...previous.members,
              memberId,
            ],
      };
    });
  };


  // =========================
  // CREATE PROJECT
  // =========================

  const handleCreateProject = async (
    event
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.name.trim()) {
      setError(
        "Project name is required"
      );

      return;
    }

    if (
      form.startDate &&
      form.dueDate &&
      form.dueDate < form.startDate
    ) {
      setError(
        "Due date cannot be before start date"
      );

      return;
    }

    setCreating(true);

    try {
      const response =
        await api.post(
          "/projects",
          form
        );

      setProjects((previous) => [
        response.data.project,
        ...previous,
      ]);

      setSuccess(
        "Project created successfully"
      );

      setForm({
        name: "",
        description: "",
        status: "planning",
        priority: "medium",
        startDate: "",
        dueDate: "",
        members: [],
      });

      setShowCreateModal(false);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to create project"
      );
    } finally {
      setCreating(false);
    }
  };


  // =========================
  // DELETE PROJECT
  // =========================

  const handleDelete = async (
    projectId
  ) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this project?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(
        `/projects/${projectId}`
      );

      setProjects((previous) =>
        previous.filter(
          (project) =>
            project._id !== projectId
        )
      );

      setSuccess(
        "Project deleted successfully"
      );
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to delete project"
      );
    }
  };


  // =========================
  // FILTER PROJECTS
  // =========================

  const filteredProjects = useMemo(() => {
    return projects.filter(
      (project) => {
        const matchesSearch =
          project.name
            .toLowerCase()
            .includes(
              search.toLowerCase()
            );

        const matchesStatus =
          statusFilter === "all" ||
          project.status ===
            statusFilter;

        return (
          matchesSearch &&
          matchesStatus
        );
      }
    );
  }, [
    projects,
    search,
    statusFilter,
  ]);


  // =========================
  // STATUS LABEL
  // =========================

  const getStatusLabel = (status) => {
    const labels = {
      planning: "Planning",
      active: "Active",
      "on-hold": "On Hold",
      completed: "Completed",
      cancelled: "Cancelled",
    };

    return labels[status] || status;
  };


  // =========================
  // PRIORITY LABEL
  // =========================

  const getPriorityLabel = (
    priority
  ) => {
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
      <div className="dashboard-loading">
        <h2>Loading projects...</h2>
      </div>
    );
  }


  return (
    <div className="projects-page">

      {/* =========================
          HEADER
      ========================== */}

      <header className="projects-header">

        <div>
          <button
            className="back-button"
            onClick={() =>
              navigate(
                "/manager/dashboard"
              )
            }
          >
            ← Dashboard
          </button>

          <h1>Projects</h1>

          <p>
            Manage all projects for your team.
          </p>
        </div>

        <button
          className="create-project-button"
          onClick={() =>
            setShowCreateModal(true)
          }
        >
          + New Project
        </button>

      </header>


      {/* =========================
          MESSAGES
      ========================== */}

   {error && (
  <div className="error-message">
    <span>{error}</span>

    <button
      className="small-button"
      onClick={() => window.location.reload()}
    >
      Retry
    </button>
  </div>
)}

      {success && (
        <div className="success-message">
          {success}
        </div>
      )}


      {/* =========================
          FILTERS
      ========================== */}

      <section className="project-filters">

        <input
          type="text"
          placeholder="Search projects..."
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
        />

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

          <option value="planning">
            Planning
          </option>

          <option value="active">
            Active
          </option>

          <option value="on-hold">
            On Hold
          </option>

          <option value="completed">
            Completed
          </option>

          <option value="cancelled">
            Cancelled
          </option>
        </select>

      </section>


      {/* =========================
          PROJECT LIST
      ========================== */}

      {filteredProjects.length === 0 ? (
        <div className="empty-projects">

          <h2>
            No projects found
          </h2>

          <p>
            Create your first project
            to get started.
          </p>

          <button
            onClick={() =>
              setShowCreateModal(true)
            }
          >
            + Create Project
          </button>

        </div>
      ) : (
        <section className="projects-grid">

          {filteredProjects.map(
            (project) => (
              <article
                className="project-card"
                key={project._id}
                onClick={() =>
                  navigate(
                    `/manager/projects/${project._id}`
                  )
                }
              >

                <div className="project-card-top">

                  <span
                    className={`project-status ${project.status}`}
                  >
                    {getStatusLabel(
                      project.status
                    )}
                  </span>

                  <span
                    className={`project-priority ${project.priority}`}
                  >
                    {getPriorityLabel(
                      project.priority
                    )}
                  </span>

                </div>


                <h2>
                  {project.name}
                </h2>


                <p className="project-description">
                  {project.description ||
                    "No description"}
                </p>


                <div className="project-card-footer">

                  <div className="project-members">

                    {project.members
                      ?.slice(0, 4)
                      .map((member) => (
                        <div
                          className="mini-avatar"
                          key={
                            member._id
                          }
                          title={
                            member.name
                          }
                        >
                          {member.name
                            ?.charAt(0)
                            ?.toUpperCase()}
                        </div>
                      ))}

                    {project.members
                      ?.length > 4 && (
                      <div className="mini-avatar">
                        +
                        {project.members
                          .length - 4}
                      </div>
                    )}

                  </div>


                  <button
                    className="delete-project-button"
                    onClick={(event) => {
                      event.stopPropagation();

                      handleDelete(
                        project._id
                      );
                    }}
                  >
                    Delete
                  </button>

                </div>


                <div className="project-dates">

                  <span>
                    Start:{" "}
                    {project.startDate
                      ? new Date(
                          project.startDate
                        ).toLocaleDateString()
                      : "Not set"}
                  </span>

                  <span>
                    Due:{" "}
                    {project.dueDate
                      ? new Date(
                          project.dueDate
                        ).toLocaleDateString()
                      : "Not set"}
                  </span>

                </div>

              </article>
            )
          )}

        </section>
      )}


      {/* =========================
          CREATE PROJECT MODAL
      ========================== */}

      {showCreateModal && (
        <div className="modal-overlay">

          <div className="project-modal">

            <div className="modal-header">

              <div>
                <h2>
                  Create New Project
                </h2>

                <p>
                  Add a new project to
                  your team.
                </p>
              </div>

              <button
                className="modal-close"
                onClick={() =>
                  setShowCreateModal(false)
                }
              >
                ×
              </button>

            </div>


            <form
              onSubmit={
                handleCreateProject
              }
            >

              {/* Project name */}

              <div className="form-group">

                <label>
                  Project Name
                </label>

                <input
                  type="text"
                  name="name"
                  placeholder="e.g. Company Website"
                  value={form.name}
                  onChange={handleChange}
                />

              </div>


              {/* Description */}

              <div className="form-group">

                <label>
                  Description
                </label>

                <textarea
                  name="description"
                  placeholder="Describe the project..."
                  value={
                    form.description
                  }
                  onChange={handleChange}
                  rows="4"
                />

              </div>


              {/* Status + priority */}

              <div className="form-row">

                <div className="form-group">

                  <label>
                    Status
                  </label>

                  <select
                    name="status"
                    value={form.status}
                    onChange={
                      handleChange
                    }
                  >
                    <option value="planning">
                      Planning
                    </option>

                    <option value="active">
                      Active
                    </option>

                    <option value="on-hold">
                      On Hold
                    </option>

                    <option value="completed">
                      Completed
                    </option>

                  </select>

                </div>


                <div className="form-group">

                  <label>
                    Priority
                  </label>

                  <select
                    name="priority"
                    value={
                      form.priority
                    }
                    onChange={
                      handleChange
                    }
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

              <div className="form-row">

                <div className="form-group">

                  <label>
                    Start Date
                  </label>

                  <input
                    type="date"
                    name="startDate"
                    value={
                      form.startDate
                    }
                    onChange={
                      handleChange
                    }
                  />

                </div>


                <div className="form-group">

                  <label>
                    Due Date
                  </label>

                  <input
                    type="date"
                    name="dueDate"
                    value={
                      form.dueDate
                    }
                    onChange={
                      handleChange
                    }
                  />

                </div>

              </div>


              {/* Members */}

              <div className="form-group">

                <label>
                  Assign Team Members
                </label>

                <div className="member-selector">

                  {members.map(
                    (member) => (
                      <label
                        className={`member-option ${
                          form.members.includes(
                            member._id
                          )
                            ? "selected"
                            : ""
                        }`}
                        key={
                          member._id
                        }
                      >

                        <input
                          type="checkbox"
                          checked={form.members.includes(
                            member._id
                          )}
                          onChange={() =>
                            toggleMember(
                              member._id
                            )
                          }
                        />

                        <span>
                          {
                            member.name
                          }
                        </span>

                        <small>
                          {
                            member.email
                          }
                        </small>

                      </label>
                    )
                  )}

                </div>

              </div>


              {/* Buttons */}

              <div className="modal-actions">

                <button
                  type="button"
                  className="cancel-button"
                  onClick={() =>
                    setShowCreateModal(false)
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="submit-button"
                  disabled={creating}
                >
                  {creating
                    ? "Creating..."
                    : "Create Project"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
};

export default Projects;