import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert, Table, Badge, Button, Modal, Form, Tabs, Tab } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { disasterService, campService, sosService, volunteerService } from '../../services/api';
import { toast } from 'react-toastify';
import { FiHome, FiAlertTriangle, FiUsers, FiCheckCircle, FiActivity, FiEye, FiUser, FiNavigation } from 'react-icons/fi';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const NGODashboard = () => {
  const [disasters, setDisasters] = useState([]);
  const [camps, setCamps] = useState([]);
  const [sosRequests, setSosRequests] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Volunteer Assignment Modal State
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedSOS, setSelectedSOS] = useState(null);
  const [selectedVolunteerId, setSelectedVolunteerId] = useState('');

  // Proof Review Modal State
  const [showReviewModal, setShowReviewModal] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const disastersList = await disasterService.getAll(true);
      const campsList = await campService.getAll();
      const sosList = await sosService.getNgoSos();
      const volunteersList = await volunteerService.getAll();

      setDisasters(disastersList);
      setCamps(campsList);
      setSosRequests(sosList);
      // Filter verified & available volunteers
      setVolunteers(volunteersList.filter(v => v.verificationStatus === 'Verified'));
    } catch (error) {
      console.error('Failed to load NGO dashboard datasets:', error);
      toast.error('Failed to fetch assigned logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Filter lists based on new workflow statuses
  const assignedSOS = sosRequests.filter(s => 
    ['Assigned to NGO', 'Volunteer Assigned', 'Accepted', 'On The Way', 'Reached', 'Rescue In Progress'].includes(s.currentStatus || s.status)
  );

  const pendingVerification = sosRequests.filter(s => 
    s.currentStatus === 'Completed' || s.status === 'Completed'
  );

  const verifiedSOS = sosRequests.filter(s => 
    ['Verified by NGO', 'Resolved', 'Rejected', 'Cancelled'].includes(s.currentStatus || s.status)
  );

  // Available Volunteers list
  const availableVolunteers = volunteers.filter(v => v.availabilityStatus === 'Available');

  // Chart Data: Camp Occupancy
  const campOccupancyData = {
    labels: camps.map((c) => c.name),
    datasets: [
      {
        label: 'Occupied places',
        data: camps.map((c) => c.currentOccupancy),
        backgroundColor: 'rgba(99, 102, 241, 0.6)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 1,
      },
      {
        label: 'Total Capacity',
        data: camps.map((c) => c.capacity),
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
      },
    ],
  };

  // Chart Data: SOS Status Breakdown
  const sosStatusData = {
    labels: ['Assigned NGO', 'Volunteer Assigned', 'Rescuing', 'Awaiting Verification', 'Verified/Resolved'],
    datasets: [
      {
        data: [
          sosRequests.filter((s) => s.currentStatus === 'Assigned to NGO').length,
          sosRequests.filter((s) => s.currentStatus === 'Volunteer Assigned' || s.currentStatus === 'Accepted').length,
          sosRequests.filter((s) => ['On The Way', 'Reached', 'Rescue In Progress'].includes(s.currentStatus)).length,
          sosRequests.filter((s) => s.currentStatus === 'Completed').length,
          sosRequests.filter((s) => s.currentStatus === 'Verified by NGO' || s.currentStatus === 'Resolved').length,
        ],
        backgroundColor: [
          'rgba(59, 130, 246, 0.6)', // blue
          'rgba(99, 102, 241, 0.6)', // indigo
          'rgba(245, 158, 11, 0.6)', // warning
          'rgba(236, 72, 153, 0.6)', // pink
          'rgba(16, 185, 129, 0.6)', // emerald
        ],
        borderColor: [
          '#3b82f6',
          '#6366f1',
          '#f59e0b',
          '#ec4899',
          '#10b981',
        ],
        borderWidth: 1,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        ticks: { color: '#4a5568', font: { family: 'Plus Jakarta Sans' } },
      },
      x: {
        grid: { display: false },
        ticks: { color: '#4a5568', font: { family: 'Plus Jakarta Sans' } },
      },
    },
    plugins: {
      legend: { labels: { color: '#4a5568', font: { family: 'Plus Jakarta Sans' } } },
    },
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom', labels: { color: '#4a5568', font: { family: 'Plus Jakarta Sans' } } },
    },
  };

  const getPriorityBadge = (prio) => {
    switch (prio) {
      case 'Low': return <Badge bg="secondary">Low</Badge>;
      case 'Medium': return <Badge bg="primary">Medium</Badge>;
      case 'High': return <Badge bg="warning" text="dark">High</Badge>;
      case 'Critical': return <Badge bg="danger">Critical</Badge>;
      default: return <Badge bg="secondary">{prio}</Badge>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending': return <Badge bg="warning" text="dark">Pending</Badge>;
      case 'Assigned to NGO': return <Badge bg="info" text="dark">Assigned to NGO</Badge>;
      case 'Volunteer Assigned': return <Badge bg="primary">Volunteer Assigned</Badge>;
      case 'Accepted': return <Badge bg="" style={{ backgroundColor: '#6366f1', color: 'white' }}>Accepted</Badge>;
      case 'On The Way': return <Badge bg="info">On The Way</Badge>;
      case 'Reached': return <Badge bg="" style={{ backgroundColor: '#0d9488', color: 'white' }}>Reached</Badge>;
      case 'Rescue In Progress': return <Badge bg="warning" text="dark">Rescue In Progress</Badge>;
      case 'Victim Rescued': return <Badge bg="" style={{ backgroundColor: '#3b82f6', color: 'white' }}>Victim Rescued</Badge>;
      case 'Completed': return <Badge bg="success">Completed</Badge>;
      case 'Verified by NGO': return <Badge bg="success">Verified by NGO</Badge>;
      case 'Resolved': return <Badge bg="success">Resolved</Badge>;
      case 'Rejected': return <Badge bg="danger">Rejected</Badge>;
      case 'Cancelled': return <Badge bg="secondary">Cancelled</Badge>;
      default: return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const openAssignModal = (sos) => {
    setSelectedSOS(sos);
    setSelectedVolunteerId(availableVolunteers.length > 0 ? availableVolunteers[0].userId.toString() : '');
    setShowAssignModal(true);
  };

  const handleAssignVolunteer = async (e) => {
    e.preventDefault();
    if (!selectedVolunteerId) {
      toast.warn("Please select a volunteer.");
      return;
    }

    try {
      await sosService.assignVolunteer(selectedSOS.id, parseInt(selectedVolunteerId));
      toast.success("Volunteer successfully assigned! Notifications sent.");
      setShowAssignModal(false);
      fetchDashboardData();
    } catch (error) {
      console.error(error);
      toast.error("Failed to assign volunteer.");
    }
  };

  const openReviewModal = (sos) => {
    setSelectedSOS(sos);
    setShowReviewModal(true);
  };

  const handleVerifySOS = async (id) => {
    try {
      await sosService.verifySosCompletion(id);
      toast.success("SOS Completion verified and sent to Government Officer for final closure.");
      setShowReviewModal(false);
      fetchDashboardData();
    } catch (error) {
      console.error(error);
      toast.error("Failed to verify SOS completion.");
    }
  };

  return (
    <Container className="py-4 text-start">
      {/* Page Header Banner */}
      <div 
        className="page-header-banner mb-4 shadow-sm"
        style={{ minHeight: '140px' }}
      >
        <img src="/images/flood_6.jpeg" alt="ngo background" />
        <div className="content">
          <h2 style={{ color: '#ffffff', fontFamily: 'var(--font-heading)' }}>NGO Coordination Dashboard</h2>
          <p style={{ color: 'rgba(255,255,255,0.75)', marginBottom: 0, fontSize: '0.88rem' }}>Coordinate assigned emergency distress signals, dispatch rescue volunteers, and manage resource tracking lists.</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
        </div>
      ) : (
        <>
          {/* Quick Stats */}
          <Row className="g-4 mb-4">
            <Col md={3}>
              <Card className="glass-panel stat-card border-0 p-3">
                <Card.Body>
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <FiAlertTriangle size={28} style={{ color: '#ef4444' }} />
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Assigned SOS</span>
                  </div>
                  <h2 className="fw-bold mb-0" style={{ color: 'var(--accent-blue)' }}>{assignedSOS.length}</h2>
                </Card.Body>
              </Card>
            </Col>

            <Col md={3}>
              <Card className="glass-panel stat-card border-0 p-3">
                <Card.Body>
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <FiUsers size={28} style={{ color: '#3b82f6' }} />
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Available Volunteers</span>
                  </div>
                  <h2 className="fw-bold mb-0" style={{ color: 'var(--accent-blue)' }}>{availableVolunteers.length}</h2>
                </Card.Body>
              </Card>
            </Col>

            <Col md={3}>
              <Card className="glass-panel stat-card border-0 p-3">
                <Card.Body>
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <FiCheckCircle size={28} style={{ color: '#10b981' }} />
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Awaiting Review</span>
                  </div>
                  <h2 className="fw-bold mb-0" style={{ color: 'var(--accent-blue)' }}>{pendingVerification.length}</h2>
                </Card.Body>
              </Card>
            </Col>

            <Col md={3}>
              <Card className="glass-panel stat-card border-0 p-3">
                <Card.Body>
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <FiHome size={28} style={{ color: '#6366f1' }} />
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Relief Camps</span>
                  </div>
                  <h2 className="fw-bold mb-0" style={{ color: 'var(--accent-blue)' }}>{camps.length}</h2>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Workflow Board */}
          <Card className="glass-panel border-0 p-4 mb-4">
            <h4 className="mb-3 d-flex align-items-center" style={{ color: 'var(--accent-blue)' }}>
              <FiActivity style={{ color: '#ef4444', marginRight: '8px' }} /> Rescue Coordination Board
            </h4>

            <Tabs defaultActiveKey="assigned" id="ngo-workflow-tabs" className="mb-3">
              {/* Assigned Requests */}
              <Tab eventKey="assigned" title={`Assigned Ongoing (${assignedSOS.length})`}>
                {assignedSOS.length === 0 ? (
                  <Alert variant="info" className="mb-0 py-3 text-center">
                    No SOS requests currently assigned. Government disaster units dispatch tasks here.
                  </Alert>
                ) : (
                  <div className="table-responsive">
                    <Table hover variant="dark" className="align-middle bg-transparent mb-0">
                      <thead>
                        <tr className="border-light border-opacity-10">
                          <th>Victim / Location</th>
                          <th>Crisis Type</th>
                          <th>Level</th>
                          <th>Rescuer</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {assignedSOS.map((s) => (
                          <tr key={s.id} className="border-light border-opacity-10">
                            <td>
                              <div className="fw-bold">{s.victimName}</div>
                              <div className="small text-muted">{s.contactNumber}</div>
                              <div className="small font-monospace text-muted">{s.latitude.toFixed(4)}, {s.longitude.toFixed(4)}</div>
                            </td>
                            <td>
                              <div>{s.disasterType}</div>
                              <small className="text-muted">{s.category}</small>
                            </td>
                            <td>{getPriorityBadge(s.emergencyLevel || s.priority)}</td>
                            <td>{s.assignedVolunteerName || <span className="text-warning small fw-bold">Unassigned</span>}</td>
                            <td>{getStatusBadge(s.currentStatus || s.status)}</td>
                            <td>
                              <div className="d-flex gap-2">
                                {s.currentStatus === 'Assigned to NGO' ? (
                                  <Button 
                                    variant="premium" 
                                    size="sm" 
                                    onClick={() => openAssignModal(s)}
                                  >
                                    Assign Rescuer
                                  </Button>
                                ) : (
                                  <Button 
                                    variant="outline-info" 
                                    size="sm"
                                    onClick={() => openReviewModal(s)}
                                    className="d-flex align-items-center gap-1"
                                  >
                                    <FiEye size={12} /> View Tracker
                                  </Button>
                                )}
                                <a 
                                  href={`https://www.google.com/maps/search/?api=1&query=${s.latitude},${s.longitude}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="btn btn-outline-light btn-sm d-flex align-items-center justify-content-center"
                                >
                                  <FiNavigation size={12}/>
                                </a>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}
              </Tab>

              {/* Pending Verification */}
              <Tab eventKey="verification" title={`Pending Review (${pendingVerification.length})`}>
                {pendingVerification.length === 0 ? (
                  <Alert variant="info" className="bg-dark border-light border-opacity-10 text-muted mb-0 py-3 text-center">
                    No completed tasks awaiting review.
                  </Alert>
                ) : (
                  <div className="table-responsive">
                    <Table hover variant="dark" className="align-middle bg-transparent mb-0">
                      <thead>
                        <tr className="border-light border-opacity-10">
                          <th>Victim / Emergency</th>
                          <th>Rescuer</th>
                          <th>Location</th>
                          <th>Review Completion</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingVerification.map((s) => (
                          <tr key={s.id} className="border-light border-opacity-10">
                            <td>
                              <div className="fw-bold">{s.victimName}</div>
                              <small className="text-muted">{s.disasterType} ({s.category})</small>
                            </td>
                            <td>{s.assignedVolunteerName}</td>
                            <td className="small text-muted">{s.latitude.toFixed(4)}, {s.longitude.toFixed(4)}</td>
                            <td>
                              <Button 
                                variant="success" 
                                size="sm" 
                                onClick={() => openReviewModal(s)}
                                className="d-flex align-items-center gap-1"
                              >
                                <FiCheckCircle size={14} /> Review Proof & Verify
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}
              </Tab>

              {/* Verified & Resolved History */}
              <Tab eventKey="history" title={`Resolved History (${verifiedSOS.length})`}>
                {verifiedSOS.length === 0 ? (
                  <Alert variant="info" className="bg-dark border-light border-opacity-10 text-muted mb-0 py-3 text-center">
                    No history records found.
                  </Alert>
                ) : (
                  <div className="table-responsive">
                    <Table hover variant="dark" className="align-middle bg-transparent mb-0">
                      <thead>
                        <tr className="border-light border-opacity-10">
                          <th>Victim</th>
                          <th>Emergency</th>
                          <th>Rescuer</th>
                          <th>End Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {verifiedSOS.map((s) => (
                          <tr key={s.id} className="border-light border-opacity-10">
                            <td className="fw-semibold">{s.victimName}</td>
                            <td>{s.disasterType} ({s.category})</td>
                            <td>{s.assignedVolunteerName || 'N/A'}</td>
                            <td>{getStatusBadge(s.currentStatus || s.status)}</td>
                            <td>
                              <Button 
                                variant="outline-info" 
                                size="sm"
                                onClick={() => openReviewModal(s)}
                                className="d-flex align-items-center gap-1"
                              >
                                <FiEye size={12} /> View Proof
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}
              </Tab>
            </Tabs>
          </Card>

          {/* Charts Row */}
          <Row className="g-4 mb-4">
            <Col lg={4}>
              <Card className="glass-panel border-0 bg-dark p-3 h-100">
                <Card.Header className="bg-transparent border-0 text-white fw-bold pb-2">
                  Rescue Status Breakdown
                </Card.Header>
                <Card.Body className="d-flex justify-content-center align-items-center">
                  {sosRequests.length === 0 ? (
                    <div className="text-center py-5 text-muted small">No active SOS logs.</div>
                  ) : (
                    <div style={{ width: '80%', maxHeight: '250px' }}>
                      <Doughnut data={sosStatusData} options={doughnutOptions} />
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>

            <Col lg={8}>
              <Card className="glass-panel border-0 bg-dark p-3">
                <Card.Header className="bg-transparent border-0 text-white fw-bold pb-2">
                  Shelter Occupancies
                </Card.Header>
                <Card.Body>
                  {camps.length === 0 ? (
                    <div className="text-center py-5 text-muted small">No camps active.</div>
                  ) : (
                    <Bar data={campOccupancyData} options={barOptions} height={120} />
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Assign Volunteer Modal */}
          <Modal show={showAssignModal} onHide={() => setShowAssignModal(false)} contentClassName="glass-panel text-light" dialogClassName="modal-dark" centered>
            <Form onSubmit={handleAssignVolunteer}>
              <Modal.Header closeButton closeVariant="white" className="border-light border-opacity-10 bg-dark">
                <Modal.Title className="fw-bold">Assign Rescuer Volunteer</Modal.Title>
              </Modal.Header>
              <Modal.Body className="bg-dark text-start">
                {selectedSOS && (
                  <div>
                    <div className="mb-3">
                      <strong>Victim Name:</strong> {selectedSOS.victimName} <br />
                      <strong>Contact Number:</strong> {selectedSOS.contactNumber} <br />
                      <strong>Emergency:</strong> {selectedSOS.disasterType} ({selectedSOS.category})
                    </div>
                    <Form.Group className="mb-3" controlId="assignVolunteerSelect">
                      <Form.Label className="text-muted small fw-semibold">Choose Verified Volunteer</Form.Label>
                      <Form.Select
                        value={selectedVolunteerId}
                        onChange={(e) => setSelectedVolunteerId(e.target.value)}
                        className="form-glass"
                        required
                      >
                        {availableVolunteers.length === 0 ? (
                          <option value="">No available volunteers active</option>
                        ) : (
                          availableVolunteers.map((vol) => (
                            <option key={vol.id} value={vol.userId} className="bg-dark">{vol.userName} (Tier: {vol.skillTier})</option>
                          ))
                        )}
                      </Form.Select>
                    </Form.Group>
                  </div>
                )}
              </Modal.Body>
              <Modal.Footer className="bg-dark border-light border-opacity-10">
                <Button variant="outline-light" onClick={() => setShowAssignModal(false)}>Cancel</Button>
                <Button type="submit" variant="premium" disabled={availableVolunteers.length === 0}>Dispatch Volunteer</Button>
              </Modal.Footer>
            </Form>
          </Modal>

          {/* Review Details & Proof Modal */}
          <Modal show={showReviewModal} onHide={() => setShowReviewModal(false)} contentClassName="glass-panel text-light" dialogClassName="modal-lg modal-dark" centered>
            <Modal.Header closeButton closeVariant="white" className="border-light border-opacity-10 bg-dark">
              <Modal.Title className="fw-bold">SOS Rescue Details & Review</Modal.Title>
            </Modal.Header>
            <Modal.Body className="bg-dark text-start p-4">
              {selectedSOS && (
                <div>
                  <Row className="g-3 mb-3">
                    <Col sm={6}>
                      <div className="text-muted small">Victim Name:</div>
                      <div className="fw-semibold text-light">{selectedSOS.victimName}</div>
                    </Col>
                    <Col sm={6}>
                      <div className="text-muted small">Contact Number:</div>
                      <div className="fw-semibold text-light">{selectedSOS.contactNumber}</div>
                    </Col>
                    <Col sm={6}>
                      <div className="text-muted small">Disaster Type:</div>
                      <div className="fw-semibold text-light">{selectedSOS.disasterType}</div>
                    </Col>
                    <Col sm={6}>
                      <div className="text-muted small">Emergency Category:</div>
                      <div className="fw-semibold text-light">{selectedSOS.category}</div>
                    </Col>
                    <Col sm={6}>
                      <div className="text-muted small">Rescue Volunteer:</div>
                      <div className="fw-semibold text-light">{selectedSOS.assignedVolunteerName || 'Not Assigned'}</div>
                    </Col>
                    <Col sm={6}>
                      <div className="text-muted small">Last Status Update:</div>
                      <div className="fw-semibold text-warning">{selectedSOS.currentStatus || selectedSOS.status}</div>
                    </Col>
                  </Row>

                  <div className="mb-4">
                    <div className="text-muted small">SOS Details / Situation Notes:</div>
                    <p className="bg-dark bg-opacity-65 p-2 rounded text-light border border-secondary border-opacity-10 mb-0">{selectedSOS.description}</p>
                  </div>

                  {/* Proof Attachment */}
                  {selectedSOS.proofImageUrl ? (
                    <Card className="bg-dark border-secondary border-opacity-35 p-3 mb-4">
                      <h6 className="text-white mb-2 d-flex align-items-center small fw-bold text-muted uppercase">Verification Proof Submitted</h6>
                      <Row className="align-items-center">
                        <Col sm={4}>
                          <img 
                            src={selectedSOS.proofImageUrl.startsWith('http') ? selectedSOS.proofImageUrl : `http://localhost:5143${selectedSOS.proofImageUrl}`} 
                            alt="Rescue Completion Proof" 
                            className="img-fluid rounded border border-secondary border-opacity-30 shadow-sm"
                            style={{ maxHeight: '150px', objectFit: 'cover' }}
                          />
                        </Col>
                        <Col sm={8}>
                          <div className="small text-muted fw-bold">Volunteer Remarks:</div>
                          <p className="small text-light bg-dark bg-opacity-80 p-2.5 rounded italic">"{selectedSOS.remarks || 'No remarks provided.'}"</p>
                        </Col>
                      </Row>
                    </Card>
                  ) : (
                    <Alert variant="warning" className="small">
                      Rescue completion proof is pending submission by the assigned volunteer.
                    </Alert>
                  )}

                  <div className="d-flex justify-content-end gap-2 mt-4">
                    <Button variant="outline-light" onClick={() => setShowReviewModal(false)}>Close</Button>
                    {(selectedSOS.currentStatus === 'Completed' || selectedSOS.status === 'Completed') && (
                      <Button 
                        variant="success" 
                        onClick={() => handleVerifySOS(selectedSOS.id)}
                      >
                        Verify & Approve Completion
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </Modal.Body>
          </Modal>
        </>
      )}
    </Container>
  );
};

export default NGODashboard;
