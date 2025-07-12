"use client";
import { useState, useEffect, useRef } from 'react';
import { Box, Typography, IconButton, Badge, Menu, MenuItem, Divider } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';

interface Notification {
  _id: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
  question?: { title: string };
  answer?: { content: string };
}

export default function NotificationDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.notifications?.filter((n: Notification) => !n.read).length || 0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const markAsRead = async () => {
    if (unreadCount === 0) return;
    
    try {
      setLoading(true);
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (response.ok) {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNotificationText = (notification: Notification) => {
    switch (notification.type) {
      case 'new_answer':
        return `New answer on "${notification.question?.title || 'your question'}"`;
      case 'upvote':
        return `Your answer received an upvote`;
      case 'admin_action':
        return notification.message;
      default:
        return notification.message;
    }
  };

  return (
    <>
      <IconButton
        onClick={handleClick}
        style={{ color: '#fff', position: 'relative' }}
        disabled={loading}
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          style: {
            background: '#23242b',
            color: '#e0e0e0',
            maxHeight: 400,
            width: 320,
          }
        }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid #333' }}>
          <Typography variant="h6" sx={{ color: '#fff' }}>
            Notifications
          </Typography>
          {unreadCount > 0 && (
            <Typography 
              variant="body2" 
              sx={{ color: '#2d7be5', cursor: 'pointer', mt: 1 }}
              onClick={markAsRead}
            >
              Mark all as read
            </Typography>
          )}
        </Box>
        
        <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
          {notifications.length === 0 ? (
            <MenuItem disabled>
              <Typography sx={{ color: '#b3b3b3' }}>
                No notifications
              </Typography>
            </MenuItem>
          ) : (
            notifications.map((notification) => (
              <MenuItem 
                key={notification._id}
                sx={{ 
                  background: notification.read ? 'transparent' : '#2d7be5',
                  opacity: notification.read ? 0.7 : 1,
                  '&:hover': { background: '#181920' }
                }}
              >
                <Box sx={{ width: '100%' }}>
                  <Typography variant="body2" sx={{ color: '#fff', mb: 0.5 }}>
                    {getNotificationText(notification)}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#b3b3b3' }}>
                    {new Date(notification.createdAt).toLocaleString()}
                  </Typography>
                </Box>
              </MenuItem>
            ))
          )}
        </Box>
      </Menu>
    </>
  );
} 