import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../services/api";



const EmployeeSettings = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [team, setTeam] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
  const loadSettings = async () => {
    try {
      setLoading(true);
      setError("");

      const userResponse = await api.get(
        "/auth/me"
      );

      setUser(userResponse.data.user);

      try {
        const teamResponse = await api.get(
          "/teams/my-team"
        );

        setTeam(teamResponse.data.team);
      } catch (teamError) {
        console.error(
          "Load team error:",
          teamError
        );
      }
    } catch (error) {
      console.error(
        "Load settings error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to load settings"
      );
    } finally {
      setLoading(false);
    }
  };

  loadSettings();
}, []);
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <h2>Loading settings...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="employee-settings-layout">
        <div className="settings-error">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="employee-settings-layout">
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
            className="nav-item"
            onClick={() =>
              navigate("/employee/projects")
            }
          >
            My Projects
          </button>

          <button
            className="nav-item active"
            onClick={() =>
              navigate("/employee/settings")
            }
          >
            Settings
          </button>
        </nav>
      </aside>

      <main className="employee-settings-page">
        <header className="employee-settings-header">
          <div>
            <h1>Settings</h1>

            <p>
              Manage your ProjectFlow account.
            </p>
          </div>
        </header>

        <section className="settings-card">
          <div className="settings-card-header">
            <div>
              <h2>Profile</h2>

              <p>
                Your ProjectFlow account information.
              </p>
            </div>
          </div>

          <div className="settings-info-grid">
            <div className="settings-info-item">
              <span>Name</span>

              <strong>
                {user?.name || "Employee"}
              </strong>
            </div>

            <div className="settings-info-item">
              <span>Email</span>

              <strong>
                {user?.email ||
                  "Email not available"}
              </strong>
            </div>

            <div className="settings-info-item">
              <span>Role</span>

              <strong>
                {user?.role || "Employee"}
              </strong>
            </div>
          </div>
        </section>

        <section className="settings-card">
          <div className="settings-card-header">
            <div>
              <h2>Team</h2>

              <p>
                Information about your current team.
              </p>
            </div>
          </div>

          <div className="settings-info-grid">
            <div className="settings-info-item">
              <span>Team Name</span>

              <strong>
                {team?.name || "No team found"}
              </strong>
            </div>

            <div className="settings-info-item">
              <span>Description</span>

              <strong>
                {team?.description ||
                  "No description"}
              </strong>
            </div>
          </div>
        </section>

        <section className="settings-card danger-card">
          <div className="settings-card-header">
            <div>
              <h2>Account</h2>

              <p>
                Sign out of your ProjectFlow account.
              </p>
            </div>
          </div>

          <button
            className="logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>
          
        </section>
      </main>
    </div>
  );
};

export default EmployeeSettings;