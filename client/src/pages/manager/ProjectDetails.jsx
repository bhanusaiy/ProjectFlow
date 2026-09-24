import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
  
} from "react-router-dom";

import api from "../../services/api";
import TaskBoard from "../../components/TaskBoard";
const ProjectDetails = () => {
  const { id } = useParams();

  const navigate = useNavigate();

  

  const [activeTab, setActiveTab] =
    useState("overview");
const [openCreateForm, setOpenCreateForm] =
  useState(false);
  const [showEditForm, setShowEditForm] =
  useState(false);

const [savingProject, setSavingProject] =
  useState(false);

const [editForm, setEditForm] = useState({
  name: "",
  description: "",
  status: "planning",
  priority: "medium",
  startDate: "",
  dueDate: "",
});

const [project, setProject] = useState(null);

const [teamMembers, setTeamMembers] =
  useState([]);

const [showAddMember, setShowAddMember] =
  useState(false);

const [selectedMember, setSelectedMember] =
  useState("");

const [addingMember, setAddingMember] =
  useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProject = async () => {
      try {
        setLoading(true);

        const response = await api.get(
          `/projects/${id}`
        );

        setProject(response.data.project);
      } catch (error) {
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

  const loadTeamMembers = async () => {
  try {
    const response = await api.get(
      "/teams/my-team"
    );

    setTeamMembers(
      response.data.members || []
    );

  } catch (error) {
    console.error(
      "Failed to load team members:",
      error
    );

    alert(
      error.response?.data?.message ||
        "Failed to load team members"
    );
  }
};


const handleAddMember = async () => {
  if (!selectedMember) {
    alert("Please select an employee");
    return;
  }

  try {
    setAddingMember(true);

    const response = await api.post(
      `/projects/${project._id}/members`,
      {
        userId: selectedMember,
      }
    );

    // Update project immediately
    setProject(response.data.project);

    // Clear selected employee
    setSelectedMember("");

    // Close add-member form
    setShowAddMember(false);

    alert("Member added successfully");

  } catch (error) {
    console.error(
      "Add member error:",
      error
    );

    alert(
      error.response?.data?.message ||
        "Failed to add member"
    );

  } finally {
    setAddingMember(false);
  }
};

const openEditProject = () => {
  setEditForm({
    name: project.name || "",
    description: project.description || "",
    status: project.status || "planning",
    priority: project.priority || "medium",
    startDate: project.startDate
      ? project.startDate.slice(0, 10)
      : "",
    dueDate: project.dueDate
      ? project.dueDate.slice(0, 10)
      : "",
  });

  setShowEditForm(true);
};

const handleEditChange = (event) => {
  const { name, value } = event.target;

  setEditForm((previous) => ({
    ...previous,
    [name]: value,
  }));
};

const handleUpdateProject = async (event) => {
  event.preventDefault();

  try {
    setSavingProject(true);
    setError("");

    const response = await api.put(
      `/projects/${id}`,
      {
        name: editForm.name,
        description: editForm.description,
        status: editForm.status,
        priority: editForm.priority,
        startDate: editForm.startDate || null,
        dueDate: editForm.dueDate || null,
      }
    );

    setProject(response.data.project);

    setShowEditForm(false);
  } catch (error) {
    setError(
      error.response?.data?.message ||
        "Unable to update project"
    );
  } finally {
    setSavingProject(false);
  }
};
const handleRemoveMember = async (memberId) => {
  const confirmed = window.confirm(
    "Are you sure you want to remove this employee from the project?"
  );

  if (!confirmed) {
    return;
  }

  try {
    await api.delete(
      `/projects/${project._id}/members/${memberId}`
    );

    setProject((currentProject) => ({
      ...currentProject,
      members: currentProject.members.filter(
        (member) => member._id !== memberId
      ),
    }));
  } catch (error) {
    console.error(
      "Remove project member error:",
      error
    );

    alert(
      error.response?.data?.message ||
        "Unable to remove project member"
    );
  }
};

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

  const getPriorityLabel = (priority) => {
    const labels = {
      low: "Low",
      medium: "Medium",
      high: "High",
      urgent: "Urgent",
    };

    return labels[priority] || priority;
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

  if (loading) {
    return (
      <div className="dashboard-loading">
        <h2>Loading project...</h2>
      </div>
    );
  }

 if (error) {
  return (
    <div className="projects-page">
      <div className="error-message">
        <span>{error}</span>

        <button
          className="small-button"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>

      <button
        onClick={() =>
          navigate("/manager/projects")
        }
      >
        ← Back to Projects
      </button>
    </div>
  );
}

  if (!project) {
    return null;
  }

  return (
    <div className="project-workspace">

      {/* =========================
          HEADER
      ========================== */}

      <header className="workspace-header">

        <div>
          <button
            className="back-button"
            onClick={() =>
              navigate("/manager/projects")
            }
          >
            ← Projects
          </button>

          <h1>{project.name}</h1>

          <p>
            {project.description ||
              "No project description"}
          </p>
        </div>

       <button
  className="workspace-edit-button"
  onClick={openEditProject}
>
  Edit Project
</button>

      </header>


      {/* =========================
          PROJECT SUMMARY
      ========================== */}

      <section className="project-summary">

        <div className="summary-card">

          <span className="summary-label">
            Status
          </span>

          <strong
            className={`project-status ${project.status}`}
          >
            {getStatusLabel(
              project.status
            )}
          </strong>

        </div>


        <div className="summary-card">

          <span className="summary-label">
            Priority
          </span>

          <strong
            className={`project-priority ${project.priority}`}
          >
            {getPriorityLabel(
              project.priority
            )}
          </strong>

        </div>


        <div className="summary-card">

          <span className="summary-label">
            Start Date
          </span>

          <strong>
            {formatDate(
              project.startDate
            )}
          </strong>

        </div>


        <div className="summary-card">

          <span className="summary-label">
            Due Date
          </span>

          <strong>
            {formatDate(
              project.dueDate
            )}
          </strong>

        </div>

      </section>


      {/* =========================
          TABS
      ========================== */}

      <nav className="workspace-tabs">

  <button
    className={
      activeTab === "overview"
        ? "active"
        : ""
    }
    onClick={() =>
      setActiveTab("overview")
    }
  >
    Overview
  </button>


  <button
    className={
      activeTab === "tasks"
        ? "active"
        : ""
    }
    onClick={() =>
      setActiveTab("tasks")
    }
  >
    Tasks
  </button>


  <button
    className={
      activeTab === "members"
        ? "active"
        : ""
    }
    onClick={() =>
      setActiveTab("members")
    }
  >
    Members
  </button>


  <button
    className={
      activeTab === "activity"
        ? "active"
        : ""
    }
    onClick={() =>
      setActiveTab("activity")
    }
  >
    Activity
  </button>

</nav>

      {/* =========================
          OVERVIEW
      ========================== */}

   <main className="workspace-content">
   {showEditForm && (
  <div className="edit-project-overlay">

    <form
      className="edit-project-form"
      onSubmit={handleUpdateProject}
    >

      <div className="edit-project-header">
        <div>
          <h2>Edit Project</h2>
          <p>
            Update your project information.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            setShowEditForm(false)
          }
        >
          ×
        </button>
      </div>

      <div className="form-field">
        <label>
          Project Name
        </label>

        <input
          type="text"
          name="name"
          value={editForm.name}
          onChange={handleEditChange}
          required
        />
      </div>

      <div className="form-field">
        <label>
          Description
        </label>

        <textarea
          name="description"
          value={editForm.description}
          onChange={handleEditChange}
          rows="4"
        />
      </div>

      <div className="edit-project-grid">

        <div className="form-field">
          <label>
            Status
          </label>

          <select
            name="status"
            value={editForm.status}
            onChange={handleEditChange}
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

            <option value="cancelled">
              Cancelled
            </option>
          </select>
        </div>

        <div className="form-field">
          <label>
            Priority
          </label>

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

        <div className="form-field">
          <label>
            Start Date
          </label>

          <input
            type="date"
            name="startDate"
            value={editForm.startDate}
            onChange={handleEditChange}
          />
        </div>

        <div className="form-field">
          <label>
            Due Date
          </label>

          <input
            type="date"
            name="dueDate"
            value={editForm.dueDate}
            onChange={handleEditChange}
          />
        </div>

      </div>

      <div className="edit-project-actions">

        <button
          type="button"
          onClick={() =>
            setShowEditForm(false)
          }
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={savingProject}
        >
          {savingProject
            ? "Saving..."
            : "Save Changes"}
        </button>

      </div>

    </form>

  </div>
)}

  {activeTab === "tasks" ? (

<TaskBoard
  projectId={project._id}
  members={project.members || []}
  openCreateForm={openCreateForm}
/>

  ) : (

    <>
      <section className="overview-section">
          <div className="section-heading">

            <div>
              <h2>
                Project Overview
              </h2>

              <p>
                Basic information about this
                project.
              </p>
            </div>

          </div>


          <div className="overview-grid">

            <div className="overview-card">

              <span>
                Project Name
              </span>

              <strong>
                {project.name}
              </strong>

            </div>


            <div className="overview-card">

              <span>
                Manager
              </span>

              <strong>
                {project.manager?.name ||
                  "Unknown"}
              </strong>

              <small>
                {project.manager?.email}
              </small>

            </div>


            <div className="overview-card">

              <span>
                Team
              </span>

              <strong>
                {project.team?.name ||
                  "Unknown"}
              </strong>

            </div>


            <div className="overview-card">

              <span>
                Team Members
              </span>

              <strong>
                {project.members?.length ||
                  0}
              </strong>

            </div>

          </div>

        </section>


        {/* =========================
            DESCRIPTION
        ========================== */}

        <section className="description-section">

          <div className="section-heading">

            <div>
              <h2>
                Description
              </h2>

              <p>
                What this project is about.
              </p>
            </div>

          </div>

          <div className="description-card">
            {project.description ||
              "No description has been added to this project."}
          </div>

        </section>


        {/* =========================
            MEMBERS
        ========================== */}

      <section
  className="members-section"
  id="project-members"
>

  {showAddMember && (
    <div className="add-member-form">

      <h3>Add Project Member</h3>

      <select
        value={selectedMember}
        onChange={(e) =>
          setSelectedMember(e.target.value)
        }
      >
        <option value="">
          Select an employee
        </option>

        {teamMembers
          .filter((member) => {
            // Only employees
            if (member.role !== "employee") {
              return false;
            }

            // Check if already in project
            const alreadyInProject =
              project.members?.some(
                (projectMember) =>
                  (
                    projectMember._id ||
                    projectMember
                  ).toString() ===
                  member._id.toString()
              );

            // Hide existing members
            return !alreadyInProject;
          })
          .map((member) => (
            <option
              key={member._id}
              value={member._id}
            >
              {member.name} ({member.email})
            </option>
          ))}
      </select>

      <button
        onClick={handleAddMember}
        disabled={addingMember}
      >
        {addingMember
          ? "Adding..."
          : "Add Member"}
      </button>

      <button
        onClick={() => {
          setShowAddMember(false);
          setSelectedMember("");
        }}
        disabled={addingMember}
      >
        Cancel
      </button>

    </div>
  )}

  <div className="section-heading">

            <div>
              <h2>
                Project Members
              </h2>

              <p>
                People assigned to this project.
              </p>
            </div>

            <span className="member-count">
              {project.members?.length || 0}{" "}
              members
            </span>

          </div>


          <div className="workspace-members">

  {project.members?.map(
    (member) => (
      <div
        className="workspace-member"
        key={member._id}
      >

        <div className="member-avatar">
          {member.name
            ?.charAt(0)
            ?.toUpperCase()}
        </div>

        <div className="member-info">

          <strong>
            {member.name}
          </strong>

          <span>
            {member.email}
          </span>

        </div>

        <span className="member-role">
          {member.role}
        </span>

        {member._id !== project.manager?._id && (
          <button
            className="remove-member-button"
            onClick={() =>
              handleRemoveMember(member._id)
            }
          >
            Remove
          </button>
        )}

      </div>
    )
  )}

</div>

        </section>


        {/* =========================
            QUICK ACTIONS
        ========================== */}

        <section className="quick-actions">

          <h2>
            Quick Actions
          </h2>

          <div className="quick-action-grid">
<button
  onClick={() => {
    setOpenCreateForm(true);
    setActiveTab("tasks");
  }}
>
  <strong>
    + Create Task
  </strong>

  <span>
    Add work to this project
  </span>
</button>
     <button
  onClick={() => {
    loadTeamMembers();
    setShowAddMember(true);
  }}
>
  <strong>
    + Add Member
  </strong>

  <span>
    Assign another employee
  </span>
</button>
<button
  onClick={openEditProject}
>
  <strong>
    Edit Project
  </strong>

  <span>
    Change project information
  </span>
</button>

          </div>

        </section>

         </>
  )}

</main>

    </div>
  );
};

export default ProjectDetails;