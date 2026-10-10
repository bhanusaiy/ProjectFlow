import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import NotificationBell from "../../components/NotificationBell";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";


const ManagerDashboard = () => {
  const navigate = useNavigate();

  const { user, logout } = useAuth();

  const [team, setTeam] = useState(null);
  const [reportPeriod, setReportPeriod] = useState("weekly");
const [progressReports, setProgressReports] = useState([]);
const [reportsLoading, setReportsLoading] = useState(false);
const [reportsError, setReportsError] = useState("");
  const [members, setMembers] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);

  const [loading, setLoading] = useState(true);
  const [inviteLoading, setInviteLoading] = useState(false);

  const [email, setEmail] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [invitationLink, setInvitationLink] = useState("");

  const [dashboardStats, setDashboardStats] =
  useState({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalTasks: 0,
    todoTasks: 0,
    inProgressTasks: 0,
    reviewTasks: 0,
    completedTasks: 0,
  });





  // =========================
// LOAD PROGRESS REPORTS
// =========================

const loadProgressReports = async (period = reportPeriod) => {
  setReportsLoading(true);
  setReportsError("");

  try {
    const response = await api.get(
      `/reports/progress?period=${period}`
    );

    setProgressReports(response.data.reports || []);
  } catch (error) {
    console.error("Load progress reports error:", error);

    setReportsError(
      error.response?.data?.message ||
        "Unable to load progress reports."
    );

    setProgressReports([]);
  } finally {
    setReportsLoading(false);
  }
};

  // =========================
  // LOAD TEAM
  // =========================

  const loadTeam = async () => {
    try {
      const response = await api.get(
        "/teams/my-team"
      );

      setTeam(response.data.team);
      setMembers(response.data.members);
    } catch (error) {
      if (
        error.response?.status === 404
      ) {
        setTeam(null);
        setMembers([]);
      } else {
        setError(
          error.response?.data?.message ||
            "Unable to load team"
        );
      }
    }
  };


  // =========================
  // LOAD INVITATIONS
  // =========================

  const loadInvitations = async () => {
    try {
      const response =
        await api.get(
          "/invitations/my-invitations"
        );

      setInvitations(
        response.data.invitations
      );
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to load invitations"
      );
    }
  };



// =========================
// LOAD PROJECTS
// =========================

const loadProjects = async () => {
  try {
    const response = await api.get("/projects");

    const projectList = response.data.projects || [];

    setProjects(projectList);

    // Load tasks from all projects
    const taskResponses = await Promise.all(
      projectList.map((project) =>
        api.get(`/tasks/project/${project._id}`)
      )
    );

    const allTasks = taskResponses.flatMap(
      (response) => response.data.tasks || []
    );

    setTasks(allTasks);

  } catch (error) {
    console.error("Load projects/tasks error:", error);

    setError(
      error.response?.data?.message ||
        "Unable to load projects and tasks"
    );
  }
};



// =========================
// LOAD DASHBOARD STATS
// =========================

const loadDashboardStats = async () => {
  try {
    const response = await api.get(
      "/projects/dashboard/stats"
    );

    setDashboardStats(
      response.data.stats
    );
  } catch (error) {
    console.error(
      "Load dashboard stats error:",
      error
    );

    setError(
      error.response?.data?.message ||
        "Unable to load dashboard statistics"
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
      await loadTeam();
      await loadInvitations();
      await loadProjects();
      await loadDashboardStats();
    } catch (error) {
      console.error(
        "Load manager dashboard error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to load dashboard"
      );
    } finally {
      setLoading(false);
    }
  };
  

  loadData();
}, []);


  useEffect(() => {
    loadProgressReports(reportPeriod);
  }, [reportPeriod]);

  // =========================
  // INVITE EMPLOYEE
  // =========================

  const handleInvite = async (
    event
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");
    setInvitationLink("");

    if (!email.trim()) {
      setError(
        "Please enter an employee email"
      );

      return;
    }

    setInviteLoading(true);

    try {
      const response =
        await api.post(
          "/invitations",
          {
            email:
              email.trim().toLowerCase(),
          }
        );

      const link =
        response.data.invitation
          .invitationLink;

      setInvitationLink(link);

      setSuccess(
        "Invitation created successfully"
      );

      setEmail("");

      await loadInvitations();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to create invitation"
      );
    } finally {
      setInviteLoading(false);
    }
  };


  // =========================
  // COPY INVITATION LINK
  // =========================

  const copyInvitationLink = async () => {
    try {
      await navigator.clipboard.writeText(
        invitationLink
      );

      setSuccess(
        "Invitation link copied!"
      );
    } catch (error) {
      setError(
        "Unable to copy invitation link"
      );
    }
  };


  // =========================
  // LOGOUT
  // =========================

  const handleLogout = async () => {
    await logout();

    navigate("/login");
  };


  if (loading) {
    return (
      <div className="dashboard-loading">
        <h2>Loading dashboard...</h2>
      </div>
    );
  }

const chartData = progressReports
  .map((report) => {
    const snapshots = (report.history || [])
      .filter((snapshot) => snapshot.periodType === reportPeriod)
      .sort(
        (a, b) =>
          new Date(b.periodStart).getTime() -
          new Date(a.periodStart).getTime()
      );

    const latestSnapshot = snapshots[0];

    if (!latestSnapshot) return null;

    const percentage = Math.max(
      0,
      Math.min(100, Number(latestSnapshot.progressPercentage) || 0)
    );

    return {
      project: report.projectName || report.name || "Unnamed project",
      progress: percentage,
    };
  })
  .filter(Boolean);
  return (
    <div className="manager-dashboard">

      {/* =========================
          SIDEBAR
      ========================== */}

      <aside className="sidebar">

        <div className="sidebar-logo">
          ProjectFlow
        </div>

        <nav className="sidebar-nav">

          <button className="nav-item active">
            Dashboard
          </button>

          <button
            className="nav-item"
            onClick={() =>
              navigate(
                "/manager/projects"
              )
            }
          >
            Projects
          </button>

         <button
          className="nav-item"
  onClick={() =>
    navigate("/manager/team")
  }
>
  My Team
</button>

      <button
  className="nav-item"
  onClick={() => navigate("/manager/tasks")}
>
  Tasks
</button>

        <button
  className="nav-item"
  onClick={() =>
    navigate("/manager/settings")
  }
>
  Settings
</button>

        </nav>

        <button
          className="logout-button"
          onClick={handleLogout}
        >
          Logout
        </button>

      </aside>


      {/* =========================
          MAIN CONTENT
      ========================== */}

      <main className="dashboard-main">

        {/* Header */}

        <header className="dashboard-header">

          <div>
            <h1>
              Manager Dashboard
            </h1>

            <p>
              Welcome back, {user?.name}
            </p>
          </div>

        <div className="dashboard-header-right">

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


        {/* Messages */}

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
            STATISTICS
        ========================== */}

      <section className="stats-grid">

 <button
  className="stat-card stat-card-button"
  onClick={() =>
    navigate("/manager/team")
  }
>
  <span>
    Team Members
  </span>

  <strong>
    {members.length}
  </strong>
</button>
  <div className="stat-card">
    <span>
      Pending Invitations
    </span>

    <strong>
      {
        invitations.filter(
          (item) =>
            item.status ===
            "pending"
        ).length
      }
    </strong>
  </div>

  <button
  className="stat-card stat-card-button"
  onClick={() =>
    navigate("/manager/projects")
  }
>
  <span>
    Projects
  </span>

  <strong>
    {dashboardStats.totalProjects}
  </strong>
</button>

  <button
  className="stat-card stat-card-button"
  onClick={() =>
    navigate("/manager/tasks")
  }
>
  <span>
    Tasks
  </span>

  <strong>
    {dashboardStats.totalTasks}
  </strong>
</button>

</section>
{/* =========================
    TASK PROGRESS
========================== */}

<section className="dashboard-section">

  <div className="section-header">
    <div>
      <h2>Task Progress</h2>

      <p>
        Current status of your project tasks
      </p>
    </div>
  </div>

  <div className="task-progress-grid">

    <button
      className="task-progress-card status-todo"
      onClick={() =>
        navigate("/manager/tasks?status=todo")
      }
    >
      <span>To Do</span>

      <strong>
        {dashboardStats.todoTasks}
      </strong>
    </button>

    <button
      className="task-progress-card status-in-progress"
      onClick={() =>
        navigate("/manager/tasks?status=in-progress")
      }
    >
      <span>In Progress</span>

      <strong>
        {dashboardStats.inProgressTasks}
      </strong>
    </button>

    <button
      className="task-progress-card status-review"
      onClick={() =>
        navigate("/manager/tasks?status=review")
      }
    >
      <span>Review</span>

      <strong>
        {dashboardStats.reviewTasks}
      </strong>
    </button>

    <button
      className="task-progress-card status-completed"
      onClick={() =>
        navigate("/manager/tasks?status=completed")
      }
    >
      <span>Completed</span>

      <strong>
        {dashboardStats.completedTasks}
      </strong>
    </button>

  </div>

</section>
{/* =========================
    WEEKLY / MONTHLY REPORTS
========================== */}


<section className="dashboard-section">
  <div className="section-header">
    <div>
      <h2>Project Progress Reports</h2>
      <p>Track project completion over time</p>
    </div>

    <div className="report-period-buttons">
      <button
        type="button"
        className={
          reportPeriod === "weekly"
            ? "small-button active"
            : "small-button"
        }
        onClick={() => setReportPeriod("weekly")}
      >
        Weekly
      </button>

      <button
        type="button"
        className={
          reportPeriod === "monthly"
            ? "small-button active"
            : "small-button"
        }
        onClick={() => setReportPeriod("monthly")}
      >
        Monthly
      </button>
    </div>
  </div>

  {reportsLoading && <p>Loading progress reports...</p>}

  {!reportsLoading && reportsError && (
    <div className="error-message" role="alert">
      {reportsError}
      <button
        type="button"
        className="small-button"
        onClick={() => loadProgressReports(reportPeriod)}
      >
        Retry
      </button>
    </div>
  )}

  {!reportsLoading && !reportsError && (
    <>
      <div className="progress-chart-container">
        <h3>
          {reportPeriod === "weekly" ? "Weekly" : "Monthly"} Progress (%)
        </h3>

        {chartData.length === 0 ? (
          <p>No progress snapshots available for this period yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              data={chartData}
              margin={{ top: 25, right: 20, left: 5, bottom: 15 }}
            >
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis
                dataKey="project"
                interval={0}
                angle={-15}
                textAnchor="end"
                height={70}
              />

              <YAxis
                domain={[0, 100]}
                ticks={[0, 20, 40, 60, 80, 100]}
                tickFormatter={(value) => `${value}%`}
              />

              <Tooltip
                formatter={(value) => [`${value}%`, "Progress"]}
              />

              <Bar
                dataKey="progress"
                name="Progress"
                fill="#2563eb"
                radius={[6, 6, 0, 0]}
              >
                <LabelList
                  dataKey="progress"
                  position="top"
                  formatter={(value) => `${value}%`}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {progressReports.length === 0 ? (
        <div className="empty-state">
          <h3>No progress reports available</h3>
          <p>
            Reports will appear when the backend returns projects and
            progress snapshots for this period.
          </p>
        </div>
      ) : (
        <div className="project-overview-grid">
          {progressReports.map((report) => {
            const snapshots = (report.history || [])
              .filter((snapshot) =>
                snapshot.periodType
                  ? snapshot.periodType === reportPeriod
                  : true
              )
              .sort(
                (a, b) =>
                  new Date(b.periodStart).getTime() -
                  new Date(a.periodStart).getTime()
              );

            const latestSnapshot = snapshots[0];

            return (
              <article
                className="project-overview-card"
                key={report.projectId}
              >
                <h3>{report.projectName}</h3>

                {latestSnapshot ? (
                  <>
                    <p>
                      Progress: {latestSnapshot.progressPercentage}%
                    </p>

                    <div
                      role="progressbar"
                      aria-label={`${report.projectName} progress`}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={latestSnapshot.progressPercentage}
                      style={{
                        height: "8px",
                        background: "#e5e7eb",
                        borderRadius: "8px",
                        overflow: "hidden",
                        margin: "10px 0",
                      }}
                    >
                      <div
                        style={{
                          width: `${Math.max(
                            0,
                            Math.min(
                              100,
                              Number(latestSnapshot.progressPercentage) || 0
                            )
                          )}%`,
                          height: "100%",
                          background: "#2563eb",
                        }}
                      />
                    </div>

                    <p>
                      Completed tasks: {latestSnapshot.completedTasks} /{" "}
                      {latestSnapshot.totalTasks}
                    </p>

                    <p>
                      Completed during this{" "}
                      {reportPeriod === "weekly" ? "week" : "month"}:{" "}
                      {latestSnapshot.tasksCompletedDuringPeriod}
                    </p>

                    <small>
                      Period starting{" "}
                      {new Date(
                        latestSnapshot.periodStart
                      ).toLocaleDateString()}
                    </small>
                  </>
                ) : (
                  <p>
                    No {reportPeriod} snapshot recorded for this project yet.
                  </p>
                )}
              </article>
            );
          })}
        </div>
      )}
    </>
  )}
</section>


{/* =========================
    PROJECT OVERVIEW
========================== */}

<section className="dashboard-section">

  <div className="section-header">
    <div>
      <h2>Project Overview</h2>

      <p>
        Current status of your projects
      </p>
    </div>
  </div>

  <div className="project-overview-grid">

    <button
      className="project-overview-card project-overview-button"
      onClick={() =>
        navigate("/manager/projects")
      }
    >
      <span>Total Projects</span>

      <strong>
        {dashboardStats.totalProjects}
      </strong>
    </button>

    <button
      className="project-overview-card project-overview-button"
      onClick={() =>
        navigate("/manager/projects?status=active")
      }
    >
      <span>Active Projects</span>

      <strong>
        {dashboardStats.activeProjects}
      </strong>
    </button>

    <button
      className="project-overview-card project-overview-button"
      onClick={() =>
        navigate("/manager/projects?status=completed")
      }
    >
      <span>Completed Projects</span>

      <strong>
        {dashboardStats.completedProjects}
      </strong>
    </button>

  </div>

</section>
{/* =========================
    RECENT TASKS
========================== */}

<section className="dashboard-section">

  <div className="section-header">

    <div>
      <h2>Recent Tasks</h2>

      <p>
        Latest tasks across your projects
      </p>
    </div>

    <button
      className="small-button"
      onClick={() =>
        navigate("/manager/tasks")
      }
    >
      View All
    </button>

  </div>

  {tasks.length === 0 ? (
  <div className="empty-state">
    <h3>No tasks yet</h3>

    <p>
      Create a task from one of your projects
      to start tracking work.
    </p>

    <button
      className="small-button"
      onClick={() =>
        navigate("/manager/tasks")
      }
    >
      Go to Tasks
    </button>
  </div>
) : (  <div className="recent-tasks-list">

      {[...tasks]
        .sort(
          (a, b) =>
            new Date(b.createdAt) -
            new Date(a.createdAt)
        )
        .slice(0, 5)
        .map((task) => (
          <button
            key={task._id}
            className="recent-task-row"
            onClick={() =>
              navigate(
                `/manager/tasks/${task._id}`
              )
            }
          >

<div className="recent-task-info">

  <strong>
    {task.title}
  </strong>

  <span>
    {task.project?.name ||
      "No project"}
  </span>

  <small>
    Assigned to:{" "}
    {task.assignedTo?.name ||
      "Unassigned"}
  </small>

</div>            <div className="recent-task-meta">

              <span
                className={`status ${task.status}`}
              >
                {task.status ===
                "in-progress"
                  ? "In Progress"
                  : task.status ===
                    "todo"
                  ? "To Do"
                  : task.status ===
                    "review"
                  ? "Review"
                  : "Completed"}
              </span>

              <span
                className={`status ${task.priority}`}
              >
                {task.priority}
              </span>

            </div>

          </button>
        ))}

    </div>
  )}

</section>
        {/* =========================
            TEAM
        ========================== */}

    <section className="dashboard-section">

  <div className="section-header">

    <div>
      <h2>My Team</h2>

      <p>
        Manage your team members
      </p>
    </div>

    <button
      className="small-button"
      onClick={() =>
        navigate("/manager/team")
      }
    >
      View Team
    </button>

  </div>

  {team ? (
    <div className="team-card">

      <h3>
        {team.name}
      </h3>

      <p>
        {team.description ||
          "No team description"}
      </p>

      <div className="members-list">

        {members.length === 0 ? (
          <div className="empty-state">
            <p>
              No team members yet.
            </p>
          </div>
        ) : (
          members.map((member) => (
            <div
              className="member-row"
              key={member._id}
            >

              <div className="member-avatar">
                {member.name
                  ?.charAt(0)
                  ?.toUpperCase()}
              </div>

              <div className="member-details">

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

            </div>
          ))
        )}

      </div>

    </div>
  ) : (
    <div className="empty-state">

      <h3>
        No team yet
      </h3>

      <p>
        Create a team before
        inviting employees.
      </p>

    </div>
  )}

</section>


        {/* =========================
            INVITE EMPLOYEE
        ========================== */}

        {team && (
          <section className="dashboard-section">

            <div className="section-header">

              <div>
                <h2>
                  Invite Employee
                </h2>

                <p>
                  Send an invitation to
                  join your team
                </p>
              </div>

            </div>


            <form
              className="invite-form"
              onSubmit={handleInvite}
            >

              <input
                type="email"
                placeholder="employee@example.com"
                value={email}
                onChange={(event) =>
                  setEmail(
                    event.target.value
                  )
                }
              />

              <button
                type="submit"
                disabled={inviteLoading}
              >
                {inviteLoading
                  ? "Creating..."
                  : "Create Invitation"}
              </button>

            </form>


            {/* Invitation link */}

            {invitationLink && (
              <div className="invitation-link-box">

                <input
                  type="text"
                  value={invitationLink}
                  readOnly
                />

                <button
                  onClick={
                    copyInvitationLink
                  }
                >
                  Copy Link
                </button>

              </div>
            )}

          </section>
        )}


        {/* =========================
            INVITATIONS
        ========================== */}
<section className="dashboard-section">

  <div className="section-header">
    <div>
      <h2>Project Overview</h2>

      <p>
        Current status of your projects
      </p>
    </div>
  </div>

  {dashboardStats.totalProjects === 0 ? (
    <div className="empty-state">
      <h3>No projects yet</h3>

      <p>
        Create your first project to get started.
      </p>

      <button
        className="small-button"
        onClick={() =>
          navigate("/manager/projects")
        }
      >
        Go to Projects
      </button>
    </div>
  ) : (
    <div className="project-overview-grid">

      <button
        className="project-overview-card project-overview-button"
        onClick={() =>
          navigate("/manager/projects")
        }
      >
        <span>Total Projects</span>

        <strong>
          {dashboardStats.totalProjects}
        </strong>
      </button>

      <button
        className="project-overview-card project-overview-button"
        onClick={() =>
          navigate(
            "/manager/projects?status=active"
          )
        }
      >
        <span>Active Projects</span>

        <strong>
          {dashboardStats.activeProjects}
        </strong>
      </button>

      <button
        className="project-overview-card project-overview-button"
        onClick={() =>
          navigate(
            "/manager/projects?status=completed"
          )
        }
      >
        <span>Completed Projects</span>

        <strong>
          {dashboardStats.completedProjects}
        </strong>
      </button>

    </div>
  )}

</section>

      </main>

    </div>
  );
};

export default ManagerDashboard;