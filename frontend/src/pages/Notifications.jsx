import React, { useState, useEffect } from 'react';
import { Container, Card, Button, ListGroup, Badge } from 'react-bootstrap';
import { notificationService } from '../services/api';
import { toast } from 'react-toastify';
import { FiBell, FiCheckSquare, FiClock, FiAlertCircle } from 'react-icons/fi';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getAll();
      setNotifications(data);
    } catch (error) {
      console.error('Failed to load notifications:', error);
      toast.error('Unable to fetch notifications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      // Update local state immediately
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      toast.success('Notification marked as read.');
      // Dispatch event for navbar badge to update
      window.dispatchEvent(new Event('notificationsUpdated'));
    } catch (error) {
      console.error('Failed to mark read:', error);
      toast.error('Failed to update status.');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read.');
      window.dispatchEvent(new Event('notificationsUpdated'));
    } catch (error) {
      console.error('Failed to mark all read:', error);
      toast.error('Failed to update notifications.');
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const istDate = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    return istDate.toLocaleDateString('en-IN') + ' · ' + istDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <Container className="py-5 text-start">
      {/* Page Header */}
      <div 
        className="page-header-banner mb-4 shadow-sm"
        style={{ background: "linear-gradient(135deg, rgba(29,58,87,0.94) 0%, rgba(44,82,130,0.88) 100%)" }}
      >
        <img src="/images/flood_3.jpeg" alt="alerts background" />
        <div className="content w-100 d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <FiBell size={20} style={{ color: '#f59e0b' }} />
              <h2 className="mb-0" style={{ color: '#ffffff !important', fontFamily: 'var(--font-heading)' }}>
                Alerts Center
              </h2>
              {unreadCount > 0 && (
                <Badge bg="danger" pill style={{ fontSize: '0.75rem' }}>{unreadCount}</Badge>
              )}
            </div>
            <p style={{ color: 'rgba(255,255,255,0.75)', marginBottom: 0, fontSize: '0.88rem' }}>
              Stay updated on relief operations and emergency broadcast declarations.
            </p>
          </div>

          {unreadCount > 0 && (
            <Button 
              onClick={handleMarkAllAsRead} 
              className="btn-premium d-flex align-items-center gap-2 flex-shrink-0"
            >
              <FiCheckSquare size={16} /> Mark All as Read
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-3 text-muted small">Loading your notifications…</p>
        </div>
      ) : notifications.length === 0 ? (
        <Card className="glass-panel border-0 text-center py-5">
          <Card.Body>
            <div 
              className="d-flex align-items-center justify-content-center rounded-circle mx-auto mb-3"
              style={{ width: '72px', height: '72px', backgroundColor: 'rgba(44,82,130,0.08)' }}
            >
              <FiBell size={32} style={{ color: 'var(--accent-indigo)' }} />
            </div>
            <h5 style={{ color: 'var(--accent-blue)' }}>All Clear!</h5>
            <p style={{ color: 'var(--text-muted)', marginBottom: 0 }}>You have no active notification logs.</p>
          </Card.Body>
        </Card>
      ) : (
        <Card className="glass-panel border-0">
          <ListGroup variant="flush" className="bg-transparent rounded-3 overflow-hidden">
            {notifications.map((n, idx) => (
              <ListGroup.Item 
                key={n.id} 
                className="py-3 px-4 d-flex justify-content-between align-items-start gap-3"
                style={{ 
                  backgroundColor: !n.isRead ? 'rgba(44,82,130,0.04)' : '#ffffff',
                  borderBottom: '1px solid #f0f4f8',
                  borderLeft: !n.isRead ? '3px solid var(--accent-indigo)' : '3px solid transparent',
                  transition: 'all 0.2s ease'
                }}
              >
                {/* Icon */}
                <div 
                  className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0 mt-1"
                  style={{ 
                    width: '38px', height: '38px',
                    backgroundColor: !n.isRead ? 'rgba(44,82,130,0.1)' : '#f0f4f8',
                    color: !n.isRead ? 'var(--accent-indigo)' : 'var(--text-muted)'
                  }}
                >
                  <FiAlertCircle size={18} />
                </div>

                {/* Content */}
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <h6 
                      className="mb-0 fw-bold"
                      style={{ color: !n.isRead ? 'var(--accent-blue)' : 'var(--text-secondary)', fontSize: '0.9rem' }}
                    >
                      {n.title}
                    </h6>
                    {!n.isRead && (
                      <Badge bg="primary" pill style={{ fontSize: '0.6rem', padding: '3px 7px' }}>
                        New
                      </Badge>
                    )}
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '6px' }}>
                    {n.message}
                  </p>
                  <div className="d-flex align-items-center gap-1" style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                    <FiClock size={12} />
                    <span>{formatTime(n.createdAt)}</span>
                  </div>
                </div>

                {/* Action */}
                {!n.isRead && (
                  <Button 
                    size="sm" 
                    variant="link" 
                    onClick={() => handleMarkAsRead(n.id)}
                    className="text-decoration-none p-0 align-self-center fw-semibold flex-shrink-0"
                    style={{ color: 'var(--accent-indigo)', fontSize: '0.82rem', whiteSpace: 'nowrap' }}
                  >
                    Mark read
                  </Button>
                )}
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Card>
      )}
    </Container>
  );
};

export default Notifications;
