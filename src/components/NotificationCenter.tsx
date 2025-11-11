import { useState, useEffect } from 'react';
import { Bell, X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { notificationsApi } from '../services/api';

interface Notification {
  id: number;
  type: string;
  message: string;
  created_at: string;
  read: boolean;
  metadata_json?: string;
}

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const userId = parseInt(localStorage.getItem('userId') || '1');

  // Fetch notifications from backend
  const fetchNotifications = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const response = await notificationsApi.getAll(userId, { limit: 50 });
      const fetchedNotifications = response.data.map((n: any) => ({
        ...n,
        created_at: n.created_at || new Date().toISOString(),
      }));
      setNotifications(fetchedNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    
    // Listen for manual refresh events
    const handleRefresh = () => {
      fetchNotifications();
    };
    window.addEventListener('refresh-notifications', handleRefresh);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('refresh-notifications', handleRefresh);
    };
  }, [userId]);

  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.read).length);
  }, [notifications]);

  useEffect(() => {
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Listen for custom notification events (for real-time notifications)
    const handleNotification = async (event: CustomEvent) => {
      // Create notification in backend
      try {
        await notificationsApi.create({
          user_id: userId,
          type: event.detail.type || 'info',
          message: event.detail.message,
        });
        // Refresh notifications
        fetchNotifications();
      } catch (error) {
        console.error('Error creating notification:', error);
      }

      // Show browser notification if permission granted
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Applytomation', {
          body: event.detail.message,
          icon: '/favicon.ico',
        });
      }
    };

    window.addEventListener('app-notification' as any, handleNotification as EventListener);

    return () => {
      window.removeEventListener('app-notification' as any, handleNotification as EventListener);
    };
  }, [userId]);

  const markAsRead = async (id: number) => {
    try {
      await notificationsApi.update(id, { read: true });
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationsApi.markAllRead(userId);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const removeNotification = async (id: number) => {
    try {
      await notificationsApi.delete(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getIcon = (type: string) => {
    const iconClass = "w-5 h-5";
    switch (type) {
      case 'success':
        return <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center border border-green-200"><CheckCircle className={`${iconClass} text-green-700`} /></div>;
      case 'error':
        return <div className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center border border-red-200"><AlertCircle className={`${iconClass} text-red-700`} /></div>;
      case 'warning':
        return <div className="w-9 h-9 bg-yellow-100 rounded-lg flex items-center justify-center border border-yellow-200"><AlertCircle className={`${iconClass} text-yellow-700`} /></div>;
      case 'job_match':
        return <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center border border-blue-200"><Info className={`${iconClass} text-blue-700`} /></div>;
      case 'application':
        return <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center border border-green-200"><CheckCircle className={`${iconClass} text-green-700`} /></div>;
      default:
        return <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center border border-blue-200"><Info className={`${iconClass} text-blue-700`} /></div>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-md border-2 border-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-[420px] bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 max-h-[600px] overflow-hidden flex flex-col">
            <div className="p-5 border-b border-gray-200 bg-blue-50/50 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center border border-blue-200">
                  <Bell className="w-5 h-5 text-blue-700" />
                </div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-gray-900 text-lg">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="px-2.5 py-1 bg-blue-500 text-white text-xs font-bold rounded-full shadow-sm">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-blue-600 hover:text-blue-700 font-semibold px-3 py-1.5 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-500 hover:text-gray-700 p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto flex-1">
              {loading ? (
                <div className="p-12 text-center">
                  <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-sm text-gray-600 font-medium">Loading notifications...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bell className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 font-medium mb-1">No notifications</p>
                  <p className="text-xs text-gray-500">You're all caught up!</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-blue-50/50 cursor-pointer transition-all duration-200 border-l-4 ${
                        !notification.read 
                          ? 'bg-blue-50/30 border-l-blue-500' 
                          : 'bg-white border-l-transparent hover:border-l-gray-200'
                      }`}
                      onClick={() => !notification.read && markAsRead(notification.id)}
                    >
                      <div className="flex gap-3">
                        <div className="flex-shrink-0">
                          {getIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm leading-relaxed ${!notification.read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <p className="text-xs text-gray-500">
                              {formatDate(notification.created_at)}
                            </p>
                            {!notification.read && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeNotification(notification.id);
                          }}
                          className="flex-shrink-0 text-gray-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove notification"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Helper function to dispatch notifications
export const showNotification = (type: 'success' | 'error' | 'info' | 'warning', message: string) => {
  const event = new CustomEvent('app-notification', {
    detail: { type, message },
  });
  window.dispatchEvent(event);
};
