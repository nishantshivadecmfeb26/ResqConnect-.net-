import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert, ListGroup, Button, Badge } from 'react-bootstrap';
import { volunteerService, taskService, sosService } from '../../services/api';
import { toast } from 'react-toastify';
import { FiCheckCircle, FiClock, FiGrid, FiUser, FiSettings } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const VolunteerDashboard = () => {
  const [volunteer, setVolunteer] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const volProfile = await volunteerService.getMe();
      setVolunteer(volProfile);

      const tasksList = await taskService.getAll();
      const sosList = await sosService.getVolunteerTasks();
      
      const combined = [...tasksList, ...sosList].sort((a, b) => {
        const dateA = new Date(a.assignedDate || a.createdAt);
        const dateB = new Date(b.assignedDate || b.createdAt);
        return dateB - dateA;
      });
      
      setTasks(combined);
    } catch (error) {
      console.error('Error fetching volunteer data:', error);
      toast.error('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleToggleAvailability = async () => {
    if (!volunteer) return;
    const nextStatus = volunteer.availabilityStatus === 'Available' ? 'Busy' : 'Available';
    try {
      const updated = await volunteerService.updateProfile({
        skills: volunteer.skills,
        availabilityStatus: nextStatus,
        currentLocation: volunteer.currentLocation,
      });
      setVolunteer(updated);
      toast.success(`Availability status updated to ${nextStatus}!`);
    } catch (error) {
      console.error(error);
      toast.error('Failed to toggle status.');
    }
  };

  const getVerificationBadge = (status) => {
    switch (status) {
      case 'Pending': return <Badge bg="warning" text="dark">Verification Pending</Badge>;
      case 'Verified': return <Badge bg="success">Account Verified</Badge>;
      case 'Rejected': return <Badge bg="danger">Profile Rejected</Badge>;
      default: return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const getTaskStatusBadge = (status) => {
    switch (status) {
      case 'Assigned': return <Badge bg="warning" text="dark">Assigned</Badge>;
      case 'InProgress': return <Badge bg="primary">In Progress</Badge>;
      case 'Completed': return <Badge bg="success">Completed</Badge>;
      case 'Cancelled': return <Badge bg="secondary">Cancelled</Badge>;
      // SOS statuses
      case 'Pending': return <Badge bg="warning" text="dark">Pending</Badge>;
      case 'Assigned to NGO': return <Badge bg="info" text="dark">Assigned to NGO</Badge>;
      case 'Volunteer Assigned': return <Badge bg="primary">Volunteer Assigned</Badge>;
      case 'Accepted': return <Badge bg="" style={{ backgroundColor: '#6366f1', color: 'white' }}>Accepted</Badge>;
      case 'On The Way': return <Badge bg="info">On The Way</Badge>;
      case 'Reached': return <Badge bg="" style={{ backgroundColor: '#0d9488', color: 'white' }}>Reached</Badge>;
      case 'Rescue In Progress': return <Badge bg="warning" text="dark">Rescue In Progress</Badge>;
      case 'Victim Rescued': return <Badge bg="" style={{ backgroundColor: '#3b82f6', color: 'white' }}>Victim Rescued</Badge>;
      case 'Verified by NGO': return <Badge bg="success">Verified by NGO</Badge>;
      case 'Resolved': return <Badge bg="success">Resolved</Badge>;
      case 'Rejected': return <Badge bg="danger">Rejected</Badge>;
      default: return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const pendingTasks = tasks.filter((t) => 
    !['Completed', 'Cancelled', 'Resolved', 'Rejected', 'Verified by NGO'].includes(t.status || t.currentStatus)
  );
  const completedTasks = tasks.filter((t) => 
    ['Completed', 'Resolved', 'Verified by NGO'].includes(t.status || t.currentStatus)
  );

  return (
    <Container className="py-4 text-start">
      {/* Page Header Banner */}
      <div 
        className="page-header-banner mb-4 shadow-sm"
        style={{ minHeight: '140px' }}
      >
        <img src="/images/home_page_hint.jpeg" alt="volunteer background" />
        <div className="content w-100 d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <h2 style={{ color: '#ffffff', fontFamily: 'var(--font-heading)' }}>Volunteer Operations Panel</h2>
            <p style={{ color: 'rgba(255,255,255,0.75)', marginBottom: 0, fontSize: '0.88rem' }}>Update availability, review skills, and track tasks assigned by camp organizers.</p>
          </div>
          <Button as={Link} to="/volunteer/profile" className="btn-premium flex-shrink-0">
            <FiSettings className="me-2" /> Edit Profile
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
        </div>
      ) : !volunteer ? (
        <Alert variant="warning">
          No volunteer profile registered. If you registered as a Volunteer, please contact support.
        </Alert>
      ) : (
        <Row className="g-4">
          {/* Volunteer Status Card */}
          <Col lg={4}>
            <Card className="glass-panel border-0 p-3 mb-4">
              <Card.Body>
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div className="p-3 rounded-3 flex-shrink-0" style={{ backgroundColor: 'rgba(99,102,241,0.1)', color: '#6366f1' }}>
                    <FiUser size={24} />
                  </div>
                  <div>
                    <h5 className="mb-1" style={{ color: 'var(--accent-blue)' }}>{volunteer.userName}</h5>
                    {getVerificationBadge(volunteer.verificationStatus)}
                  </div>
                </div>

                <hr className="my-3" style={{ borderColor: 'var(--border-glass)' }} />

                <div className="d-flex flex-column gap-2 small mb-4">
                  <div>
                    <span className="fw-bold d-block" style={{ color: 'var(--accent-blue)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Skills</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{volunteer.skills}</span>
                  </div>
                  <div>
                    <span className="fw-bold d-block" style={{ color: 'var(--accent-blue)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Operating Region</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{volunteer.currentLocation}</span>
                  </div>
                </div>

                <div className="p-3 text-center rounded-3" style={{ backgroundColor: '#f8fafc', border: '1px solid var(--border-glass)' }}>
                  <span style={{ color: 'var(--text-muted)' }} className="d-block small mb-2">Availability State</span>
                  <Badge 
                    bg={volunteer.availabilityStatus === 'Available' ? 'success' : 'danger'} 
                    className="fs-6 px-3 py-2 mb-3"
                  >
                    {volunteer.availabilityStatus}
                  </Badge>
                  <Button 
                    onClick={handleToggleAvailability} 
                    className="w-100 btn-premium-outline"
                    disabled={volunteer.verificationStatus !== 'Verified'}
                  >
                    Toggle Status
                  </Button>
                  {volunteer.verificationStatus !== 'Verified' && (
                    <small className="text-warning d-block mt-2">Requires verification to start assignments</small>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Task Metrics & List */}
          <Col lg={8}>
            <Row className="g-3 mb-4">
              <Col xs={6}>
                <Card className="glass-panel stat-card border-0 p-3 text-center">
                  <Card.Body>
                    <FiClock style={{ color: '#f59e0b' }} className="mb-2" size={26} />
                    <h5 className="text-muted small fw-bold mb-1" style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>Active Tasks</h5>
                    <h3 className="fw-bold mb-0" style={{ color: 'var(--accent-blue)' }}>{pendingTasks.length}</h3>
                  </Card.Body>
                </Card>
              </Col>
              <Col xs={6}>
                <Card className="glass-panel stat-card border-0 p-3 text-center">
                  <Card.Body>
                    <FiCheckCircle style={{ color: '#10b981' }} className="mb-2" size={26} />
                    <h5 className="text-muted small fw-bold mb-1" style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>Tasks Completed</h5>
                    <h3 className="fw-bold mb-0" style={{ color: 'var(--accent-blue)' }}>{completedTasks.length}</h3>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <Card className="glass-panel border-0 p-3">
              <Card.Body>
                <h5 className="mb-3 d-flex align-items-center" style={{ color: 'var(--accent-blue)' }}>
                  <FiGrid style={{ color: 'var(--accent-indigo)', marginRight: '8px' }} /> Recent Task Requests
                </h5>
                
                {tasks.length === 0 ? (
                  <Alert variant="info" className="py-3 text-center mb-0">
                    No active tasks assigned to you.
                  </Alert>
                ) : (
                  <ListGroup variant="flush" className="bg-transparent rounded overflow-hidden" style={{ border: '1px solid var(--border-glass)' }}>
                    {tasks.slice(0, 5).map((t) => (
                      <ListGroup.Item 
                        key={t.id} 
                        className="bg-transparent border-0 py-3 px-3 d-flex justify-content-between align-items-center"
                        style={{ borderBottom: '1px solid #f0f4f8' }}
                      >
                        <div>
                          <h6 className="mb-1 fw-bold small" style={{ color: 'var(--accent-blue)' }}>{t.description}</h6>
                          <small style={{ color: 'var(--text-muted)' }}>
                            {t.campName ? `Camp: ${t.campName}` : `Rescue: ${t.disasterType || 'Emergency'} (${t.category || 'SOS'})`} · Assigned: {new Date(t.assignedDate || t.createdAt).toLocaleDateString()}
                          </small>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          {getTaskStatusBadge(t.status || t.currentStatus)}
                          <Button 
                            as={Link} 
                            to="/volunteer/tasks" 
                            size="sm" 
                            variant="link" 
                            className="text-decoration-none p-0 small fw-semibold"
                            style={{ color: 'var(--accent-indigo)' }}
                          >
                            Update
                          </Button>
                        </div>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default VolunteerDashboard;
