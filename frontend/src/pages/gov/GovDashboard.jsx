import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert, Badge, Table, Tab, Tabs, Button, Modal, Form } from 'react-bootstrap';
import { disasterService, campService, sosService, userService } from '../../services/api';
import { toast } from 'react-toastify';
import { FiAlertTriangle, FiHome, FiHelpCircle, FiCheckCircle, FiXCircle, FiUser, FiMapPin, FiActivity, FiEye, FiNavigation } from 'react-icons/fi';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const GovDashboard = () => {
  const [disasters, setDisasters] = useState([]);
  const [camps, setCamps] = useState([]);
  const [sosRequests, setSosRequests] = useState([]);
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Assignment Modal State
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedSOS, setSelectedSOS] = useState(null);
  const [selectedNGOId, setSelectedNGOId] = useState('');

  // Review Modal State
  const [showReviewModal, setShowReviewModal] = useState(false);

  const fetchData = async () => {
    try {
      const disastersList = await disasterService.getAll();
      const campsList = await campService.getAll();
      const sosList = await sosService.getGovSos();
      const ngoList = await userService.getNGOs();
      
      setDisasters(disastersList);
      setCamps(campsList);
      setSosRequests(sosList);
      setNgos(ngoList);
    } catch (error) {
      console.error('Failed to load Government dashboard data:', error);
      toast.error('Failed to load live tracking logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const activeDisasters = disasters.filter((d) => d.status === 'Active');
  const criticalSOS = sosRequests.filter((s) => (s.emergencyLevel === 'Critical' || s.priority === 'Critical') && s.currentStatus !== 'Resolved');

  // Categories of SOS requests
  const pendingRequests = sosRequests.filter(s => s.currentStatus === 'Pending' || s.status === 'Pending');
  
  const assignedRequests = sosRequests.filter(s => 
    ['Assigned to NGO', 'Volunteer Assigned', 'Accepted', 'On The Way', 'Reached', 'Rescue In Progress', 'Completed', 'Verified by NGO'].includes(s.currentStatus || s.status)
  );

  const resolvedRequests = sosRequests.filter(s => 
    ['Resolved', 'Rejected', 'Cancelled'].includes(s.currentStatus || s.status)
  );

  // Chart Data: Disaster Severity
  const severityData = {
    labels: ['Low', 'Medium', 'High', 'Critical'],
    datasets: [
      {
        data: [
          disasters.filter((d) => d.severity === 'Low').length,
          disasters.filter((d) => d.severity === 'Medium').length,
          disasters.filter((d) => d.severity === 'High').length,
          disasters.filter((d) => d.severity === 'Critical').length,
        ],
        backgroundColor: [
          'rgba(107, 114, 128, 0.6)',
          'rgba(59, 130, 246, 0.6)',
          'rgba(245, 158, 11, 0.6)',
          'rgba(244, 63, 94, 0.6)',
        ],
        borderColor: ['#6b7280', '#3b82f6', '#f59e0b', '#f43f5e'],
        borderWidth: 1,
      },
    ],
  };

  // Chart Data: Camp Occupancy
  const occupancyData = {
    labels: camps.map((c) => c.name),
    datasets: [
      {
        label: 'Current Occupancy',
        data: camps.map((c) => c.currentOccupancy),
        backgroundColor: 'rgba(16, 185, 129, 0.6)',
        borderColor: '#10b981',
        borderWidth: 1,
      },
      {
        label: 'Total Capacity',
        data: camps.map((c) => c.capacity),
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom', labels: { color: '#4a5568', font: { family: 'Plus Jakarta Sans' } } },
    },
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
    setSelectedNGOId(ngoList => ngos.length > 0 ? ngos[0].id.toString() : '');
    setShowAssignModal(true);
  };

  const handleAssignNGO = async (e) => {
    e.preventDefault();
    if (!selectedNGOId) {
      toast.warn("Please select an NGO.");
      return;
    }

    try {
      await sosService.assignNgo(selectedSOS.id, parseInt(selectedNGOId));
      toast.success("SOS successfully assigned to NGO! NGO has been notified.");
      setShowAssignModal(false);
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error("Failed to assign NGO.");
    }
  };

  const handleRejectSOS = async (id) => {
    if (!window.confirm("Are you sure you want to reject this SOS request?")) return;
    try {
      await sosService.rejectSos(id);
      toast.success("SOS request marked as Rejected.");
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error("Failed to reject SOS request.");
    }
  };

  const openReviewModal = (sos) => {
    setSelectedSOS(sos);
    setShowReviewModal(true);
  };

  const handleResolveSOS = async (id) => {
    try {
      await sosService.resolveSos(id);
      toast.success("Rescue mission has been verified & resolved successfully!");
      setShowReviewModal(false);
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error("Failed to resolve SOS request.");
    }
  };

  return (
    <Container className="py-4 text-start">
      {/* Page Header Banner */}
      <div 
        className="page-header-banner mb-4 shadow-sm"
        style={{ minHeight: '140px' }}
      >
        <img src="/images/earthquake_4.jpeg" alt="gov background" />
        <div className="content">
          <h2 style={{ color: '#ffffff', fontFamily: 'var(--font-heading)' }}>Government Operations Command</h2>
          <p style={{ color: 'rgba(255,255,255,0.75)', marginBottom: 0, fontSize: '0.88rem' }}>Oversee active disasters state parameters, manage regional safety protocols, and audit resource deployment.</p>
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
            <Col md={4}>
              <Card className="glass-panel stat-card border-0 p-3">
                <Card.Body>
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <FiAlertTriangle size={28} style={{ color: '#ef4444' }} />
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Active Disasters</span>
                  </div>
                  <h2 className="fw-bold mb-0" style={{ color: 'var(--accent-blue)' }}>{activeDisasters.length}</h2>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4}>
              <Card className="glass-panel stat-card border-0 p-3">
                <Card.Body>
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <FiHome size={28} style={{ color: '#3b82f6' }} />
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Relief Camps Open</span>
                  </div>
                  <h2 className="fw-bold mb-0" style={{ color: 'var(--accent-blue)' }}>{camps.length}</h2>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4}>
              <Card className="glass-panel stat-card border-0 p-3">
                <Card.Body>
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <FiHelpCircle size={28} style={{ color: '#f43f5e' }} />
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Critical SOS Alerts</span>
                  </div>
                  <h2 className="fw-bold mb-0" style={{ color: 'var(--accent-blue)' }}>{criticalSOS.length}</h2>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* SOS Workflow Panel */}
          <Card className="glass-panel border-0 p-4 mb-4">
            <h4 className="mb-3 d-flex align-items-center" style={{ color: 'var(--accent-blue)' }}>
              <FiActivity style={{ color: '#ef4444', marginRight: '8px' }} /> SOS Emergency Rescue Flow
            </h4>
            
            <Tabs defaultActiveKey="pending" id="sos-workflow-tabs" className="mb-3">
              {/* Pending Tab */}
              <Tab eventKey="pending" title={`Pending SOS (${pendingRequests.length})`}>
                {pendingRequests.length === 0 ? (
                  <Alert variant="info" className="mb-0 py-3 text-center">
                    No pending SOS requests. All signals are currently under NGO rescue review.
                  </Alert>
                ) : (
                  <div className="table-responsive">
                    <Table hover variant="dark" className="align-middle bg-transparent mb-0">
                      <thead>
                        <tr className="border-light border-opacity-10">
                          <th>Raised Time</th>
                          <th>Victim / Emergency</th>
                          <th>No. People</th>
                          <th>Level</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingRequests.map((s) => (
                          <tr key={s.id} className="border-light border-opacity-10">
                            <td className="small text-muted" style={{ fontSize: '0.75rem' }}>
                              {new Date(new Date(s.createdAt).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                              <br/>
                              {new Date(new Date(s.createdAt).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })).toLocaleDateString('en-IN')}
                            </td>
                            <td>
                              <div className="fw-bold">{s.victimName}</div>
                              <div className="text-muted small">Type: {s.disasterType} | {s.category}</div>
                              <div className="small font-monospace text-muted">{s.latitude.toFixed(4)}, {s.longitude.toFixed(4)}</div>
                            </td>
                            <td>{s.numberOfPeople}</td>
                            <td>{getPriorityBadge(s.emergencyLevel || s.priority)}</td>
                            <td>
                              <div className="d-flex gap-2">
                                <Button 
                                  variant="premium" 
                                  size="sm" 
                                  onClick={() => openAssignModal(s)}
                                >
                                  Assign NGO
                                </Button>
                                <Button 
                                  variant="outline-danger" 
                                  size="sm"
                                  onClick={() => handleRejectSOS(s.id)}
                                >
                                  Reject
                                </Button>
                                <a 
                                  href={`https://www.google.com/maps/search/?api=1&query=${s.latitude},${s.longitude}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="btn btn-outline-light btn-sm d-flex align-items-center justify-content-center"
                                >
                                  <FiNavigation size={12} className="me-1"/> Map
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

              {/* Assigned Tab */}
              <Tab eventKey="assigned" title={`Assigned & Rescuing (${assignedRequests.length})`}>
                {assignedRequests.length === 0 ? (
                  <Alert variant="info" className="mb-0 py-3 text-center">
                    No active rescue operations are ongoing.
                  </Alert>
                ) : (
                  <div className="table-responsive">
                    <Table hover variant="dark" className="align-middle bg-transparent mb-0">
                      <thead>
                        <tr className="border-light border-opacity-10">
                          <th>Victim / Crisis</th>
                          <th>Assigned NGO</th>
                          <th>Assigned Volunteer</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {assignedRequests.map((s) => (
                          <tr key={s.id} className="border-light border-opacity-10">
                            <td>
                              <div className="fw-bold">{s.victimName}</div>
                              <div className="text-muted small">Crisis: {s.disasterType} ({s.category})</div>
                            </td>
                            <td>{s.assignedNGOName || 'NGO Pending'}</td>
                            <td>{s.assignedVolunteerName || 'Volunteer Pending'}</td>
                            <td>{getStatusBadge(s.currentStatus || s.status)}</td>
                            <td>
                              <div className="d-flex gap-2">
                                {(s.currentStatus === 'Verified by NGO' || s.status === 'Verified by NGO') ? (
                                  <Button 
                                    variant="success" 
                                    size="sm" 
                                    onClick={() => openReviewModal(s)}
                                    className="d-flex align-items-center gap-1"
                                  >
                                    <FiCheckCircle size={14} /> Review & Close
                                  </Button>
                                ) : (
                                  <Button 
                                    variant="outline-info" 
                                    size="sm"
                                    onClick={() => openReviewModal(s)}
                                    className="d-flex align-items-center gap-1"
                                  >
                                    <FiEye size={12} /> View Details
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

              {/* Resolved Tab */}
              <Tab eventKey="resolved" title={`Archive / Closed (${resolvedRequests.length})`}>
                {resolvedRequests.length === 0 ? (
                  <Alert variant="info" className="mb-0 py-3 text-center">
                    Archive logs empty.
                  </Alert>
                ) : (
                  <div className="table-responsive">
                    <Table hover variant="dark" className="align-middle bg-transparent mb-0">
                      <thead>
                        <tr className="border-light border-opacity-10">
                          <th>Closed Date</th>
                          <th>Victim / Emergency</th>
                          <th>Assigned NGO</th>
                          <th>Rescuer</th>
                          <th>End Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {resolvedRequests.map((s) => (
                          <tr key={s.id} className="border-light border-opacity-10">
                            <td className="small text-muted" style={{ fontSize: '0.75rem' }}>
                              {s.completedDate ? new Date(s.completedDate).toLocaleString() : 'N/A'}
                            </td>
                            <td>
                              <div className="fw-bold">{s.victimName}</div>
                              <div className="text-muted small">{s.disasterType} ({s.category})</div>
                            </td>
                            <td>{s.assignedNGOName || 'N/A'}</td>
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
              <Card className="glass-panel border-0 p-3 h-100">
                <Card.Header className="bg-transparent border-0 fw-bold pb-2" style={{ color: 'var(--accent-blue)' }}>
                  Disaster Severity Levels
                </Card.Header>
                <Card.Body className="d-flex justify-content-center align-items-center">
                  {disasters.length === 0 ? (
                    <div className="text-center py-5 text-muted small">No disasters logged.</div>
                  ) : (
                    <div style={{ width: '80%', maxHeight: '250px' }}>
                      <Doughnut data={severityData} options={doughnutOptions} />
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>

            <Col lg={8}>
              <Card className="glass-panel border-0 p-3">
                <Card.Header className="bg-transparent border-0 fw-bold pb-2" style={{ color: 'var(--accent-blue)' }}>
                  Shelter Occupancy Analysis
                </Card.Header>
                <Card.Body>
                  {camps.length === 0 ? (
                    <div className="text-center py-5 text-muted small">No camps open.</div>
                  ) : (
                    <Bar data={occupancyData} options={barOptions} height={120} />
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Incident Warnings */}
          <Card className="glass-panel border-0 p-3">
            <Card.Header className="bg-transparent border-0 fw-bold pb-2" style={{ color: 'var(--accent-blue)' }}>
              Active Regional Incidents
            </Card.Header>
            <Card.Body className="p-0">
              {activeDisasters.length === 0 ? (
                <Alert variant="success" className="mb-0 py-3 text-center">
                  No active disasters flagged. Region is stable.
                </Alert>
              ) : (
                <div className="table-responsive">
                  <Table hover className="align-middle bg-transparent mb-0">
                    <thead>
                      <tr className="border-light border-opacity-10">
                        <th>Declared Date</th>
                        <th>Incident Title</th>
                        <th>Hazard Type</th>
                        <th>Severity</th>
                        <th>Coordinates</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeDisasters.map((d) => (
                        <tr key={d.id} className="border-light border-opacity-10">
                          <td className="small text-muted" style={{ fontSize: '0.75rem' }}>
                            {new Date(d.startDate).toLocaleDateString()}
                          </td>
                          <td className="fw-semibold small">{d.title}</td>
                          <td className="small">{d.type}</td>
                          <td>
                            <Badge bg={d.severity === 'Critical' || d.severity === 'High' ? 'danger' : 'primary'}>
                              {d.severity}
                            </Badge>
                          </td>
                          <td className="small text-muted">{d.latitude}, {d.longitude}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Assign NGO Modal */}
          <Modal show={showAssignModal} onHide={() => setShowAssignModal(false)} centered>
            <Form onSubmit={handleAssignNGO}>
              <Modal.Header closeButton>
                <Modal.Title className="fw-bold" style={{ color: 'var(--accent-blue)' }}>Assign SOS to NGO</Modal.Title>
              </Modal.Header>
              <Modal.Body className="text-start">
                {selectedSOS && (
                  <div>
                    <div className="mb-3">
                      <strong>Victim:</strong> {selectedSOS.victimName} <br />
                      <strong>Emergency:</strong> {selectedSOS.disasterType} ({selectedSOS.category}) <br />
                      <strong>Details:</strong> {selectedSOS.description}
                    </div>
                    <Form.Group className="mb-3" controlId="assignNgoSelect">
                      <Form.Label className="text-muted small fw-semibold">Choose NGO Group</Form.Label>
                      <Form.Select
                        value={selectedNGOId}
                        onChange={(e) => setSelectedNGOId(e.target.value)}
                        className="form-glass"
                        required
                      >
                        {ngos.length === 0 ? (
                          <option value="">No NGOs registered</option>
                        ) : (
                          ngos.map((ngo) => (
                            <option key={ngo.id} value={ngo.id} className="bg-dark">{ngo.name}</option>
                          ))
                        )}
                      </Form.Select>
                    </Form.Group>
                  </div>
                )}
              </Modal.Body>
              <Modal.Footer>
                <Button variant="outline-secondary" onClick={() => setShowAssignModal(false)}>Close</Button>
                <Button type="submit" className="btn-premium" disabled={ngos.length === 0}>Confirm Assignment</Button>
              </Modal.Footer>
            </Form>
          </Modal>

          {/* Review Details & Proof Modal */}
          <Modal show={showReviewModal} onHide={() => setShowReviewModal(false)} size="lg" centered>
            <Modal.Header closeButton>
              <Modal.Title className="fw-bold" style={{ color: 'var(--accent-blue)' }}>SOS Rescue Details & Review</Modal.Title>
            </Modal.Header>
            <Modal.Body className="text-start p-4">
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
                      <div className="text-muted small">Assigned NGO:</div>
                      <div className="fw-semibold text-light">{selectedSOS.assignedNGOName || 'Not Assigned'}</div>
                    </Col>
                    <Col sm={6}>
                      <div className="text-muted small">Rescue Volunteer:</div>
                      <div className="fw-semibold text-light">{selectedSOS.assignedVolunteerName || 'Not Assigned'}</div>
                    </Col>
                  </Row>

                  <div className="mb-4">
                    <div className="text-muted small">SOS Details / Situation Notes:</div>
                    <p className="bg-dark bg-opacity-65 p-2 rounded text-light border border-secondary border-opacity-10 mb-0">{selectedSOS.description}</p>
                  </div>

                  {/* Proof Attachment */}
                  {selectedSOS.proofImageUrl ? (
                    <Card className="glass-panel p-3 mb-4" style={{ backgroundColor: '#f8fafc !important' }}>
                      <h6 className="mb-2 d-flex align-items-center small fw-bold" style={{ color: 'var(--accent-blue)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Verification Proof Submitted</h6>
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
                    <Button variant="outline-secondary" onClick={() => setShowReviewModal(false)}>Close</Button>
                    {(selectedSOS.currentStatus === 'Verified by NGO' || selectedSOS.status === 'Verified by NGO') && (
                      <Button 
                        variant="success" 
                        onClick={() => handleResolveSOS(selectedSOS.id)}
                      >
                        Verify & Close SOS
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

export default GovDashboard;
