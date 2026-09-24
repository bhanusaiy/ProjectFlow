import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../services/api";

const Team = () => {
  const navigate = useNavigate();

  const [team, setTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadTeam = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          "/teams/my-team"
        );

        setTeam(response.data.team);
setMembers(response.data.members || []);

      } catch (error) {
        setError(
          error.response?.data?.message ||
            "Unable to load team"
        );
      } finally {
        setLoading(false);
      }
    };

    loadTeam();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <h2>Loading team...</h2>
      </div>
    );
  }

if (error) {
  return (
    <div className="team-page">
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

  if (!team) {
    return (
      <div className="team-page">
        <div className="empty-team">
          <h2>No team found</h2>

          <p>
            You haven't created a team yet.
          </p>

          <button
            onClick={() =>
              navigate("/manager/dashboard")
            }
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="team-page">

      {/* =========================
          HEADER
      ========================== */}

      <header className="team-page-header">

        <div>
          <button
            className="back-button"
            onClick={() =>
              navigate("/manager/dashboard")
            }
          >
            ← Dashboard
          </button>

          <h1>My Team</h1>

          <p>
            Manage and view your team members.
          </p>
        </div>

      </header>


      {/* =========================
          TEAM INFORMATION
      ========================== */}

      <section className="team-info-card">

        <div>
          <h2>
            {team.name}
          </h2>

          <p>
            {team.description ||
              "No team description"}
          </p>
        </div>

        <span className="team-member-count">
          {members.length} members
        </span>

      </section>


      {/* =========================
          TEAM MEMBERS
      ========================== */}

      <section className="team-members-section">

        <div className="section-heading">

          <div>
            <h2>
              Team Members
            </h2>

            <p>
              People who belong to your team.
            </p>
          </div>

        </div>


        <div className="team-members-grid">

          {members.map(
  (member) => (
              <div
                className="team-member-card"
                key={member._id}
              >

                <div className="team-member-avatar">
                  {member.name
                    ?.charAt(0)
                    ?.toUpperCase()}
                </div>

                <div className="team-member-details">

                  <h3>
                    {member.name}
                  </h3>

                  <p>
                    {member.email}
                  </p>

                  <span>
                    {member.role}
                  </span>

                </div>

              </div>
            )
          )}

        </div>

      </section>

    </div>
  );
};

export default Team;