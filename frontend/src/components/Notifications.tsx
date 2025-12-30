import React from 'react';
import '../styles/Notifications.css';

interface Notification {
  _id: string;
  type: 'reaction' | 'comment';
  message: string;
  timestamp: Date;
  post_id?: string;
  from_user?: string;
  read: boolean;
}

interface NotificationsProps {
  notifications: Notification[];
  isOpen: boolean;
  onToggle: () => void;
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
  unreadCount: number;
}

const Notifications: React.FC<NotificationsProps> = ({ 
  notifications, 
  isOpen, 
  onToggle, 
  onMarkAsRead,
  onClearAll,
  unreadCount 
}) => {
  return (
    <div className="notification-mailbox">
      {/* Mailbox Icon Button */}
      <button 
        className="mailbox-btn" 
        onClick={onToggle}
        aria-label="Notifications"
      >
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
          className="mailbox-icon"
        >
          <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="notifications-dropdown">
          <div className="notifications-header">
            <h3 className="notifications-title">
              📬 Notifications
            </h3>
            {notifications.length > 0 && (
              <button onClick={onClearAll} className="btn-clear-all">
                Clear All
              </button>
            )}
          </div>
          
          {notifications.length === 0 ? (
            <div className="notifications-empty">
              <p>No notifications yet</p>
            </div>
          ) : (
            <ul className="notifications-list">
              {notifications.map((notification) => (
                <li 
                  key={notification._id} 
                  className={`notification-item ${notification.type} ${notification.read ? 'read' : 'unread'}`}
                  onClick={() => onMarkAsRead(notification._id)}
                >
                  <div className="notification-content">
                    <span className="notification-icon">
                      {notification.type === 'reaction' ? '💚' : '💬'}
                    </span>
                    <div className="notification-text">
                      <p className="notification-message">{notification.message}</p>
                      {notification.from_user && (
                        <span className="notification-from">from {notification.from_user}</span>
                      )}
                      <span className="notification-time">
                        {getTimeAgo(notification.timestamp)}
                      </span>
                    </div>
                  </div>
                  {!notification.read && <span className="unread-dot"></span>}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
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