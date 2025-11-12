import React from 'react';
import '../styles/Notifications.css';

interface Notification {
  _id: string;
  type: 'reaction' | 'comment';
  message: string;
  timestamp: Date;
  post_id?: string;
}

interface NotificationsProps {
  notifications: Notification[];
  onClose: (id: string) => void;
  onClearAll: () => void;
}

const Notifications: React.FC<NotificationsProps> = ({ notifications, onClose, onClearAll }) => {
  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="notifications-container">
      <div className="notifications-header">
        <h3 className="notifications-title">
          🔔 Notifications ({notifications.length})
        </h3>
        {notifications.length > 0 && (
          <button onClick={onClearAll} className="btn-clear-all">
            Clear All
          </button>
        )}
      </div>
      <ul className="notifications-list">
        {notifications.map((notification) => (
          <li key={notification._id} className={`notification-item ${notification.type}`}>
            <div className="notification-content">
              <span className="notification-icon">
                {notification.type === 'reaction' ? '💚' : '💬'}
              </span>
              <div className="notification-text">
                <p className="notification-message">{notification.message}</p>
                <span className="notification-time">
                  {getTimeAgo(notification.timestamp)}
                </span>
              </div>
            </div>
            <button
              onClick={() => onClose(notification._id)}
              className="btn-close-notification"
              aria-label="Close notification"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

// Helper function to format time ago
const getTimeAgo = (timestamp: Date): string => {
  const now = new Date();
  const diff = now.getTime() - new Date(timestamp).getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

export default Notifications;