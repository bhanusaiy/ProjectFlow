import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import api from "../services/api";

const NotificationBell = () => {
  const navigate = useNavigate();

  const [notifications, setNotifications] =
    useState([]);

  const [unreadCount, setUnreadCount] =
    useState(0);

  const [open, setOpen] =
    useState(false);

  const [loading, setLoading] =
    useState(false);


  const loadNotifications =
    async () => {
      try {
        setLoading(true);

        const response =
          await api.get(
            "/notifications"
          );

        setNotifications(
          response.data.notifications || []
        );

        setUnreadCount(
          response.data.unreadCount || 0
        );
      } catch (error) {
        console.error(
          "Load notifications error:",
          error
        );
      } finally {
        setLoading(false);
      }
    };


  useEffect(() => {
    loadNotifications();
  }, []);


  const handleNotificationClick =
    async (notification) => {
      try {
        if (!notification.isRead) {
          await api.put(
            `/notifications/${notification._id}/read`
          );

          setNotifications(
            (previous) =>
              previous.map((item) =>
                item._id ===
                notification._id
                  ? {
                      ...item,
                      isRead: true,
                    }
                  : item
              )
          );

          setUnreadCount(
            (previous) =>
              Math.max(
                0,
                previous - 1
              )
          );
        }

        if (notification.task?._id) {
          const currentPath =
            window.location.pathname;

          if (
            currentPath.startsWith(
              "/manager"
            )
          ) {
            navigate(
              `/manager/tasks/${notification.task._id}`
            );
          } else {
            navigate(
              `/employee/tasks/${notification.task._id}`
            );
          }

          setOpen(false);
        }
      } catch (error) {
        console.error(
          "Notification click error:",
          error
        );
      }
    };


  const handleMarkAllRead =
    async () => {
      try {
        await api.put(
          "/notifications/read-all"
        );

        setNotifications(
          (previous) =>
            previous.map(
              (notification) => ({
                ...notification,
                isRead: true,
              })
            )
        );

        setUnreadCount(0);
      } catch (error) {
        console.error(
          "Mark all notifications error:",
          error
        );
      }
    };


  const formatTime = (
    date
  ) => {
    if (!date) return "";

    return new Date(
      date
    ).toLocaleString();
  };


  return (
    <div className="notification-wrapper">

      <button
        className="notification-button"
        onClick={() =>
          setOpen(
            (previous) =>
              !previous
          )
        }
        aria-label="Notifications"
      >
        <span className="notification-icon">
          🔔
        </span>

        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 99
              ? "99+"
              : unreadCount}
          </span>
        )}
      </button>


      {open && (
        <div className="notification-dropdown">

          <div className="notification-header">

            <div>
              <h3>
                Notifications
              </h3>

              <span>
                {unreadCount} unread
              </span>
            </div>

            {unreadCount > 0 && (
              <button
                className="notification-read-all"
                onClick={
                  handleMarkAllRead
                }
              >
                Mark all read
              </button>
            )}

          </div>


          <div className="notification-list">

            {loading ? (
              <div className="notification-empty">
                Loading...
              </div>
            ) : notifications.length ===
              0 ? (
              <div className="notification-empty">
                No notifications yet.
              </div>
            ) : (
              notifications.map(
                (notification) => (
                  <button
                    key={
                      notification._id
                    }
                    className={`notification-item ${
                      notification.isRead
                        ? ""
                        : "unread"
                    }`}
                    onClick={() =>
                      handleNotificationClick(
                        notification
                      )
                    }
                  >
                    <div className="notification-item-icon">
                      🔔
                    </div>

                    <div className="notification-item-content">

                      <strong>
                        {
                          notification.title
                        }
                      </strong>

                      <p>
                        {
                          notification.message
                        }
                      </p>

                      {notification.project?.name && (
                        <small>
                          {
                            notification
                              .project
                              .name
                          }
                        </small>
                      )}

                      <span>
                        {formatTime(
                          notification.createdAt
                        )}
                      </span>

                    </div>

                  </button>
                )
              )
            )}

          </div>

        </div>
      )}

    </div>
  );
};

export default NotificationBell;