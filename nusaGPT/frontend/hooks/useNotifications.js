import { useState, useCallback, useEffect } from 'react';
import { useApi } from './useApi';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { db } from '../utils/firebase';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';

export function useNotifications() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false);

  // API hooks
  const { execute: markAsRead } = useApi(api.notifications.markAsRead);
  const { execute: deleteNotification } = useApi(api.notifications.delete);
  const { execute: updatePreferences } = useApi(api.notifications.updatePreferences);

  // Notification types and their configurations
  const NOTIFICATION_TYPES = {
    SYSTEM: {
      icon: 'fas fa-cog',
      color: 'blue',
      sound: '/sounds/system.mp3'
    },
    TOKEN: {
      icon: 'fas fa-coins',
      color: 'yellow',
      sound: '/sounds/token.mp3'
    },
    CHAT: {
      icon: 'fas fa-comment',
      color: 'green',
      sound: '/sounds/chat.mp3'
    },
    SUBSCRIPTION: {
      icon: 'fas fa-star',
      color: 'purple',
      sound: '/sounds/subscription.mp3'
    },
    ERROR: {
      icon: 'fas fa-exclamation-circle',
      color: 'red',
      sound: '/sounds/error.mp3'
    }
  };

  // Subscribe to real-time notifications
  useEffect(() => {
    if (!user) return;

    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newNotifications = [];
      snapshot.forEach((doc) => {
        newNotifications.push({
          id: doc.id,
          ...doc.data()
        });
      });

      setNotifications(newNotifications);
      setUnreadCount(newNotifications.filter(n => !n.read).length);

      // Show toast for new notifications
      const latestNotification = newNotifications[0];
      if (latestNotification && !latestNotification.read) {
        addToast(latestNotification.message, latestNotification.type.toLowerCase());
        playNotificationSound(latestNotification.type);
      }
    });

    setIsSubscribed(true);
    return () => {
      unsubscribe();
      setIsSubscribed(false);
    };
  }, [user, addToast]);

  // Play notification sound
  const playNotificationSound = useCallback((type) => {
    const config = NOTIFICATION_TYPES[type];
    if (config?.sound) {
      const audio = new Audio(config.sound);
      audio.play().catch(error => {
        console.error('Failed to play notification sound:', error);
      });
    }
  }, []);

  // Mark notification as read
  const markNotificationAsRead = useCallback(async (notificationId) => {
    try {
      await markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, [markAsRead]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      await Promise.all(
        notifications
          .filter(n => !n.read)
          .map(n => markAsRead(n.id))
      );
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  }, [notifications, markAsRead]);

  // Delete notification
  const removeNotification = useCallback(async (notificationId) => {
    try {
      await deleteNotification(notificationId);
      setNotifications(prev =>
        prev.filter(notification => notification.id !== notificationId)
      );
      if (!notifications.find(n => n.id === notificationId)?.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  }, [deleteNotification, notifications]);

  // Update notification preferences
  const updateNotificationPreferences = useCallback(async (preferences) => {
    try {
      await updatePreferences(preferences);
    } catch (error) {
      console.error('Failed to update notification preferences:', error);
      throw error;
    }
  }, [updatePreferences]);

  // Filter notifications
  const filterNotifications = useCallback((type) => {
    return notifications.filter(notification => notification.type === type);
  }, [notifications]);

  // Get notification statistics
  const getNotificationStats = useCallback(() => {
    return {
      total: notifications.length,
      unread: unreadCount,
      byType: Object.keys(NOTIFICATION_TYPES).reduce((acc, type) => {
        acc[type] = notifications.filter(n => n.type === type).length;
        return acc;
      }, {})
    };
  }, [notifications, unreadCount]);

  return {
    notifications,
    unreadCount,
    isSubscribed,
    NOTIFICATION_TYPES,
    markNotificationAsRead,
    markAllAsRead,
    removeNotification,
    updateNotificationPreferences,
    filterNotifications,
    getNotificationStats
  };
}

export default useNotifications;