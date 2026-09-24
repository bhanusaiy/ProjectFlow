import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import api from "../../services/api";

import { useAuth } from "../../context/authContext";


const JoinTeam = () => {
  const { token } = useParams();

  const navigate = useNavigate();

  const {
    user,
    loading: authLoading,
    fetchCurrentUser,
  } = useAuth();

  const [invitation, setInvitation] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [accepting, setAccepting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");


  useEffect(() => {
    const fetchInvitation =
      async () => {
        try {
          const response =
            await api.get(
              `/invitations/${token}`
            );

          setInvitation(
            response.data.invitation
          );
        } catch (error) {
          setError(
            error.response?.data?.message ||
              "Unable to load invitation"
          );
        } finally {
          setLoading(false);
        }
      };

    fetchInvitation();
  }, [token]);


  const handleAccept = async () => {
    if (!user) {
      navigate(
        `/login?redirect=/join-team/${token}`
      );

      return;
    }

    setError("");
    setAccepting(true);

    try {
      const response =
        await api.post(
          `/invitations/${token}/accept`
        );

      setSuccess(
        response.data.message
      );

      await fetchCurrentUser();

      setTimeout(() => {
        navigate(
          "/employee/dashboard"
        );
      }, 1000);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to accept invitation"
      );
    } finally {
      setAccepting(false);
    }
  };


  if (
    loading ||
    authLoading
  ) {
    return (
      <div className="join-team-page">
        <div className="join-team-card">
          <h2>
            Loading invitation...
          </h2>
        </div>
      </div>
    );
  }


  if (error && !invitation) {
    return (
      <div className="join-team-page">
        <div className="join-team-card">

          <h1>ProjectFlow</h1>

          <h2>
            Invitation unavailable
          </h2>

          <div className="error-message">
            {error}
          </div>

        </div>
      </div>
    );
  }


  return (
    <div className="join-team-page">

      <div className="join-team-card">

        <h1>ProjectFlow</h1>

        <h2>
          Team Invitation
        </h2>

        <p>
          You have been invited to
          join
        </p>

        <div className="team-invite-info">

          <h3>
            {invitation?.team?.name}
          </h3>

          <p>
            {
              invitation?.team
                ?.description
            }
          </p>

          <p>
            Invited by{" "}
            <strong>
              {
                invitation
                  ?.invitedBy?.name
              }
            </strong>
          </p>

          <p>
            Invitation email:
          </p>

          <strong>
            {invitation?.email}
          </strong>

        </div>


        {error && (
          <div className="error-message">
            {error}
          </div>
        )}


        {success && (
          <div className="success-message">
            {success}
          </div>
        )}


        {!success && (
          <button
            onClick={handleAccept}
            disabled={accepting}
          >
            {!user
              ? "Login to Accept"
              : accepting
                ? "Joining..."
                : "Join Team"}
          </button>
        )}

      </div>

    </div>
  );
};


export default JoinTeam;