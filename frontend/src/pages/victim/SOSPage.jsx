import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Form, Button, Table, Badge, Alert, Modal, ProgressBar } from 'react-bootstrap';
import { sosService, disasterService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { FiNavigation, FiPlusCircle, FiXCircle, FiClock, FiActivity, FiEye, FiSearch, FiLayers, FiUser, FiPhone, FiInfo, FiCheckCircle } from 'react-icons/fi';

const SOSPage = () => {
  const { user } = useAuth();
  const [sosRequests, setSosRequests] = useState([]);
  const [disasters, setDisasters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    disasterId: '',
    victimName: '',
    contactNumber: '',
    disasterType: '',
    description: '',
    latitude: '',
    longitude: '',
    emergencyLevel: 'Medium',
    category: 'Rescue',
    numberOfPeople: 1,
    imageUrl: '',
  });
  const [locationLoading, setLocationLoading] = useState(false);
  
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Detail Modal state
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const fileInputRef = useRef(null);

  const filteredRequests = sosRequests.filter(r => {
    const matchesSearch = r.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? true;
    const matchesPriority = priorityFilter === 'All' || r.emergencyLevel === priorityFilter || r.priority === priorityFilter;
    const matchesStatus = statusFilter === 'All' || r.currentStatus === statusFilter || r.status === statusFilter;
    const matchesCategory = categoryFilter === 'All' || r.category === categoryFilter;
    return matchesSearch && matchesPriority && matchesStatus && matchesCategory;
  });

  const fetchSOSAndDisasters = async () => {
    try {
      const sosList = await sosService.getAll();
      const disastersList = await disasterService.getAll(true); // active only
      
      setSosRequests(sosList);
      setDisasters(disastersList);

      if (disastersList.length > 0) {
        setFormData((prev) => ({ ...prev, disasterId: disastersList[0].id.toString() }));
      }
    } catch (error) {
      console.error('Error fetching SOS details:', error);
      toast.error('Failed to load active requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSOSAndDisasters();
  }, []);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        victimName: prev.victimName || user.name || '',
        contactNumber: prev.contactNumber || user.phone || '',
      }));
    }
  }, [user]);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6),
        }));
        setLocationLoading(false);
        toast.success('GPS coordinates retrieved successfully!');
      },
      (error) => {
        console.error(error);
        setLocationLoading(false);
        toast.error('Unable to fetch location. Please enter manually.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size must be smaller than 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, imageUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenDetailModal = (req) => {
    setSelectedRequest(req);
    setShowDetailModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { victimName, contactNumber, disasterType, description, latitude, longitude, emergencyLevel, category, numberOfPeople, disasterId } = formData;

    if (!victimName || !contactNumber || !disasterType || !description || !latitude || !longitude) {
      toast.error('Please complete all required fields and capture GPS location.');
      return;
    }

    try {
      const payload = {
        disasterId: disasterId ? parseInt(disasterId) : null,
        victimName,
        contactNumber,
        disasterType,
        description,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        emergencyLevel,
        category,
        numberOfPeople: parseInt(numberOfPeople),
        imageUrl: formData.imageUrl || null,
      };

      await sosService.raise(payload);
      toast.success('SOS Request raised successfully! Responders are notified.');
      
      fetchSOSAndDisasters();

      setFormData((prev) => ({
        ...prev,
        disasterType: '',
        description: '',
        imageUrl: '',
        numberOfPeople: 1,
      }));
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to raise SOS request.');
    }
  };

  const [showCancelConfirmModal, setShowCancelConfirmModal] = useState(false);
  const [cancelTargetId, setCancelTargetId] = useState(null);

  const triggerCancelConfirm = (id) => {
    setCancelTargetId(id);
    setShowCancelConfirmModal(true);
  };

  const handleCancelConfirm = async () => {
    setShowCancelConfirmModal(false);
    if (!cancelTargetId) return;

    try {
      await sosService.cancel(cancelTargetId);
      toast.success('SOS Request cancelled.');
      fetchSOSAndDisasters();
    } catch (error) {
      console.error(error);
      toast.error('Failed to cancel request.');
    } finally {
      setCancelTargetId(null);
    }
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

  // Timeline Progress Calculator
  const getStatusProgress = (status) => {
    switch (status) {
      case 'Pending': return 10;
      case 'Assigned to NGO': return 30;
      case 'Volunteer Assigned': return 45;
      case 'Accepted': return 55;
      case 'On The Way': return 65;
      case 'Reached': return 75;
      case 'Rescue In Progress': return 85;
      case 'Completed': return 90;
      case 'Verified by NGO': return 95;
      case 'Resolved': return 100;
      case 'Rejected': return 0;
      case 'Cancelled': return 0;
      default: return 10;
    }
  };

  const getTimelineSteps = (req) => {
    const steps = [
      { name: 'SOS Raised', active: true, desc: 'Distress signal initialized' },
      { name: 'Gov Accepted', active: ['Assigned to NGO', 'Volunteer Assigned', 'Accepted', 'On The Way', 'Reached', 'Rescue In Progress', 'Completed', 'Verified by NGO', 'Resolved'].includes(req.currentStatus), desc: req.governmentOfficerName ? `Assigned to ${req.assignedNGOName}` : 'Awaiting Review' },
      { name: 'NGO Assigned', active: ['Volunteer Assigned', 'Accepted', 'On The Way', 'Reached', 'Rescue In Progress', 'Completed', 'Verified by NGO', 'Resolved'].includes(req.currentStatus), desc: req.assignedVolunteerName ? `Rescuer: ${req.assignedVolunteerName}` : 'Assigning Rescuer' },
      { name: 'Rescue Mode', active: ['Accepted', 'On The Way', 'Reached', 'Rescue In Progress', 'Completed', 'Verified by NGO', 'Resolved'].includes(req.currentStatus), desc: ['On The Way', 'Reached', 'Rescue In Progress'].includes(req.currentStatus) ? req.currentStatus : (['Completed', 'Verified by NGO', 'Resolved'].includes(req.currentStatus) ? 'Rescue Finished' : 'Pending Rescuer Response') },
      { name: 'Completed', active: ['Completed', 'Verified by NGO', 'Resolved'].includes(req.currentStatus), desc: req.completedDate ? 'Completed & Verified' : 'Awaiting Final Verifications' }
    ];
    return steps;
  };

  return (
    <Container className="py-4 text-start">
      <h2 className="text-white mb-1">Emergency SOS Alerts</h2>
      <p className="text-muted small mb-4">Request immediate help from government disaster control units and track real-time response timeline.</p>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
        </div>
      ) : (
        <Row className="g-4">
          {/* Raise SOS Form */}
          <Col lg={5}>
            <Card className="glass-panel border-0 p-3 bg-dark">
              <Card.Body>
                <h4 className="text-white mb-3 d-flex align-items-center">
                  <FiActivity className="text-danger me-2" /> Raise Distress SOS
                </h4>
                
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3" controlId="sosVictimName">
                    <Form.Label className="text-muted small fw-semibold">Victim Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="victimName"
                      placeholder="Name of the person needing rescue"
                      value={formData.victimName}
                      onChange={handleChange}
                      className="form-glass"
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="sosContactNumber">
                    <Form.Label className="text-muted small fw-semibold">Contact Number</Form.Label>
                    <Form.Control
                      type="text"
                      name="contactNumber"
                      placeholder="Emergency contact details"
                      value={formData.contactNumber}
                      onChange={handleChange}
                      className="form-glass"
                      required
                    />
                  </Form.Group>

                  <Row className="mb-3">
                    <Col xs={7}>
                      <Form.Group controlId="sosDisasterType">
                        <Form.Label className="text-muted small fw-semibold">Disaster Type / Cause</Form.Label>
                        <Form.Control
                          type="text"
                          name="disasterType"
                          placeholder="e.g. Flash Flood, Earthquake"
                          value={formData.disasterType}
                          onChange={handleChange}
                          className="form-glass"
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={5}>
                      <Form.Group controlId="sosPeopleCount">
                        <Form.Label className="text-muted small fw-semibold">No. of People</Form.Label>
                        <Form.Control
                          type="number"
                          min="1"
                          name="numberOfPeople"
                          value={formData.numberOfPeople}
                          onChange={handleChange}
                          className="form-glass"
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  {disasters.length > 0 && (
                    <Form.Group className="mb-3" controlId="sosDisaster">
                      <Form.Label className="text-muted small fw-semibold">Link to Logged Disaster (Optional)</Form.Label>
                      <Form.Select 
                        name="disasterId" 
                        value={formData.disasterId} 
                        onChange={handleChange}
                        className="form-glass"
                      >
                        <option value="" className="bg-dark">-- Not Linked --</option>
                        {disasters.map((d) => (
                          <option key={d.id} value={d.id} className="bg-dark">{d.title}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  )}

                  <Form.Group className="mb-3" controlId="sosDescription">
                    <Form.Label className="text-muted small fw-semibold">Describe Emergency / Assistance Needed</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="description"
                      placeholder="Describe details, injuries, medical needs, clothing, or shelter situation..."
                      value={formData.description}
                      onChange={handleChange}
                      className="form-glass"
                      required
                    />
                  </Form.Group>

                  <Form.Label className="text-muted small fw-semibold">GPS Coordinates</Form.Label>
                  <Row className="mb-3">
                    <Col xs={6}>
                      <Form.Control
                        type="number"
                        step="any"
                        name="latitude"
                        placeholder="Latitude"
                        value={formData.latitude}
                        onChange={handleChange}
                        className="form-glass"
                        required
                      />
                    </Col>
                    <Col xs={6}>
                      <Form.Control
                        type="number"
                        step="any"
                        name="longitude"
                        placeholder="Longitude"
                        value={formData.longitude}
                        onChange={handleChange}
                        className="form-glass"
                        required
                      />
                    </Col>
                  </Row>

                  <div className="d-flex gap-2 mb-3">
                    <Button 
                      type="button" 
                      onClick={handleGetLocation} 
                      className="btn-premium-outline w-100 d-flex align-items-center justify-content-center py-2"
                      disabled={locationLoading}
                    >
                      <FiNavigation className="me-2" />
                      {locationLoading ? 'Fetching GPS...' : 'Autofill GPS location'}
                    </Button>
                  </div>

                  <Row className="mb-3">
                    <Col xs={6}>
                      <Form.Group controlId="sosCategory">
                        <Form.Label className="text-muted small fw-semibold">Help Category</Form.Label>
                        <Form.Select
                          name="category"
                          value={formData.category}
                          onChange={handleChange}
                          className="form-glass"
                          required
                        >
                          <option value="Rescue" className="bg-dark">Rescue</option>
                          <option value="Medical Assistance" className="bg-dark">Medical</option>
                          <option value="Food" className="bg-dark">Food</option>
                          <option value="Water" className="bg-dark">Water</option>
                          <option value="Evacuation" className="bg-dark">Evacuation</option>
                          <option value="Shelter" className="bg-dark">Shelter</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col xs={6}>
                      <Form.Group controlId="sosPriority">
                        <Form.Label className="text-muted small fw-semibold">Emergency Level</Form.Label>
                        <Form.Select
                          name="emergencyLevel"
                          value={formData.emergencyLevel}
                          onChange={handleChange}
                          className="form-glass"
                          required
                        >
                          <option value="Low" className="bg-dark">Low (Non-urgent)</option>
                          <option value="Medium" className="bg-dark">Medium (Standard)</option>
                          <option value="High" className="bg-dark">High (Urgent danger)</option>
                          <option value="Critical" className="bg-dark">Critical (Immediate life risk)</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-4" controlId="sosImage">
                    <Form.Label className="text-muted small fw-semibold">Image Attachment (Optional)</Form.Label>
                    <Form.Control
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      ref={fileInputRef}
                      className="form-glass"
                    />
                    {formData.imageUrl && (
                      <div className="mt-2 text-center">
                        <img src={formData.imageUrl} alt="Preview" className="img-thumbnail rounded" style={{ maxHeight: '100px' }} />
                      </div>
                    )}
                  </Form.Group>

                  <Button type="submit" className="btn-premium w-100 py-2.5 fw-bold d-flex align-items-center justify-content-center">
                    <FiPlusCircle className="me-2" size={18} /> Raise SOS Signal
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>

          {/* SOS History Table */}
          <Col lg={7}>
            <Card className="glass-panel border-0 p-3 bg-dark h-100">
              <Card.Body className="p-0">
                <h4 className="text-white mb-3 d-flex align-items-center">
                  <FiClock className="text-primary me-2" /> Live SOS Trackings
                </h4>

                {/* Filters Row */}
                <Row className="g-2 mb-3">
                  <Col md={12} lg={4}>
                    <div className="input-group">
                      <span className="input-group-text bg-dark border-light border-opacity-10 text-muted py-1 px-2"><FiSearch size={14} /></span>
                      <Form.Control
                        type="text"
                        placeholder="Search description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="form-glass text-light py-1 text-sm"
                        style={{ fontSize: '0.85rem' }}
                      />
                    </div>
                  </Col>
                  <Col xs={4} lg={2.6}>
                    <Form.Select
                      value={priorityFilter}
                      onChange={(e) => setPriorityFilter(e.target.value)}
                      className="form-glass text-light py-1 text-sm"
                      style={{ fontSize: '0.85rem' }}
                    >
                      <option value="All" className="bg-dark">Priorities</option>
                      <option value="Low" className="bg-dark">Low</option>
                      <option value="Medium" className="bg-dark">Medium</option>
                      <option value="High" className="bg-dark">High</option>
                      <option value="Critical" className="bg-dark">Critical</option>
                    </Form.Select>
                  </Col>
                  <Col xs={4} lg={2.6}>
                    <Form.Select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="form-glass text-light py-1 text-sm"
                      style={{ fontSize: '0.85rem' }}
                    >
                      <option value="All" className="bg-dark">Statuses</option>
                      <option value="Pending" className="bg-dark">Pending</option>
                      <option value="Assigned to NGO" className="bg-dark">Assigned NGO</option>
                      <option value="Volunteer Assigned" className="bg-dark">Volunteer Assigned</option>
                      <option value="Accepted" className="bg-dark">Accepted</option>
                      <option value="On The Way" className="bg-dark">On The Way</option>
                      <option value="Reached" className="bg-dark">Reached</option>
                      <option value="Rescue In Progress" className="bg-dark">In Progress</option>
                      <option value="Completed" className="bg-dark">Completed</option>
                      <option value="Verified by NGO" className="bg-dark">Verified NGO</option>
                      <option value="Resolved" className="bg-dark">Resolved</option>
                      <option value="Rejected" className="bg-dark">Rejected</option>
                      <option value="Cancelled" className="bg-dark">Cancelled</option>
                    </Form.Select>
                  </Col>
                  <Col xs={4} lg={2.8}>
                    <Form.Select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="form-glass text-light py-1 text-sm"
                      style={{ fontSize: '0.85rem' }}
                    >
                      <option value="All" className="bg-dark">Categories</option>
                      <option value="Rescue" className="bg-dark">Rescue</option>
                      <option value="Medical Assistance" className="bg-dark">Medical</option>
                      <option value="Food" className="bg-dark">Food</option>
                      <option value="Water" className="bg-dark">Water</option>
                      <option value="Evacuation" className="bg-dark">Evacuation</option>
                      <option value="Shelter" className="bg-dark">Shelter</option>
                    </Form.Select>
                  </Col>
                </Row>
                
                {filteredRequests.length === 0 ? (
                  <Alert variant="info" className="py-3 bg-dark border-light border-opacity-10 text-muted text-center">
                    No active SOS tracking alerts found.
                  </Alert>
                ) : (
                  <div className="table-responsive">
                    <Table hover variant="dark" className="bg-transparent align-middle mb-0">
                      <thead>
                        <tr className="border-light border-opacity-10">
                          <th>Time</th>
                          <th>Victim / Emergency</th>
                          <th>Level</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRequests.map((r) => (
                          <tr key={r.id} className="border-light border-opacity-10">
                            <td className="small text-muted" style={{ fontSize: '0.75rem' }}>
                              {new Date(new Date(r.createdAt).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                              <br/>
                              {new Date(new Date(r.createdAt).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })).toLocaleDateString('en-IN')}
                            </td>
                            <td className="small">
                              <div className="fw-bold">{r.victimName || r.userName}</div>
                              <div className="text-muted small">{r.disasterType} ({r.category})</div>
                            </td>
                            <td>{getPriorityBadge(r.emergencyLevel || r.priority)}</td>
                            <td>{getStatusBadge(r.currentStatus || r.status)}</td>
                            <td>
                              <div className="d-flex gap-1">
                                <Button 
                                  variant="outline-info" 
                                  size="sm"
                                  onClick={() => handleOpenDetailModal(r)}
                                  className="d-flex align-items-center gap-1 py-1 px-2.5"
                                >
                                  <FiEye size={12} /> Track
                                </Button>
                                {['Pending', 'Assigned to NGO'].includes(r.currentStatus || r.status) && (
                                  <Button 
                                    variant="outline-danger" 
                                    size="sm" 
                                    onClick={() => triggerCancelConfirm(r.id)}
                                    className="d-flex align-items-center gap-1 py-1"
                                  >
                                    <FiXCircle size={12} /> Cancel
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Detailed View & Live Status Tracking Modal */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} contentClassName="glass-panel text-light" dialogClassName="modal-lg modal-dark" centered>
        <Modal.Header closeButton closeVariant="white" className="border-light border-opacity-10 bg-dark">
          <Modal.Title className="fw-bold d-flex align-items-center">
            <FiActivity className="text-danger me-2" /> Live SOS Rescue Tracker
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark text-start p-4">
          {selectedRequest && (
            <div>
              {/* Progress Bar */}
              <div className="mb-4">
                <div className="d-flex justify-content-between mb-1 small text-muted fw-bold">
                  <span>Rescue Progress</span>
                  <span>{getStatusProgress(selectedRequest.currentStatus || selectedRequest.status)}%</span>
                </div>
                <ProgressBar 
                  animated 
                  now={getStatusProgress(selectedRequest.currentStatus || selectedRequest.status)} 
                  variant={selectedRequest.currentStatus === 'Resolved' ? 'success' : 'danger'} 
                  style={{ height: '8px', borderRadius: '4px' }} 
                />
              </div>

              {/* Grid Details */}
              <Row className="g-3 mb-4">
                <Col md={6}>
                  <Card className="bg-dark bg-opacity-50 border-secondary border-opacity-20 p-2.5">
                    <h6 className="text-muted small uppercase fw-bold mb-2">Victim Info</h6>
                    <div className="d-flex align-items-center mb-1 text-light">
                      <FiUser className="me-2 text-primary" size={14} />
                      <span className="fw-semibold">{selectedRequest.victimName}</span>
                    </div>
                    <div className="d-flex align-items-center text-muted small">
                      <FiPhone className="me-2 text-success" size={14} />
                      <span>{selectedRequest.contactNumber}</span>
                    </div>
                    <div className="mt-2 text-muted small">
                      People Count: <strong className="text-light">{selectedRequest.numberOfPeople}</strong>
                    </div>
                  </Card>
                </Col>

                <Col md={6}>
                  <Card className="bg-dark bg-opacity-50 border-secondary border-opacity-20 p-2.5">
                    <h6 className="text-muted small uppercase fw-bold mb-2">Crisis Metadata</h6>
                    <div className="small text-muted mb-1">
                      Crisis: <strong className="text-light">{selectedRequest.disasterType}</strong>
                    </div>
                    <div className="small text-muted mb-1">
                      Support Needs: <strong className="text-light">{selectedRequest.category}</strong>
                    </div>
                    <div className="small text-muted">
                      Risk Level: {getPriorityBadge(selectedRequest.emergencyLevel)}
                    </div>
                  </Card>
                </Col>
              </Row>

              {/* Assignment Timeline details */}
              <Row className="g-3 mb-4">
                <Col md={4}>
                  <div className="small text-muted">Assigned NGO</div>
                  <div className="fw-semibold text-light">{selectedRequest.assignedNGOName || 'Awaiting Allocation'}</div>
                </Col>
                <Col md={4}>
                  <div className="small text-muted">Rescue Volunteer</div>
                  <div className="fw-semibold text-light">{selectedRequest.assignedVolunteerName || 'Not Assigned Yet'}</div>
                </Col>
                <Col md={4}>
                  <div className="small text-muted">Last Status Update</div>
                  <div className="fw-semibold text-warning">{selectedRequest.currentStatus || selectedRequest.status}</div>
                </Col>
              </Row>

              {/* Interactive Timeline Map / Flow Chart */}
              <h5 className="text-white mb-3 mt-4 small fw-bold uppercase tracking-wider text-muted">Rescue Milestone Tracking</h5>
              <div className="timeline-flow d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 bg-dark bg-opacity-40 p-3 rounded border border-light border-opacity-10 mb-4 overflow-auto">
                {getTimelineSteps(selectedRequest).map((step, idx) => (
                  <div key={idx} className="timeline-step flex-shrink-0 d-flex flex-row flex-md-column align-items-center gap-2" style={{ minWidth: '130px' }}>
                    <div className={`step-dot rounded-circle d-flex align-items-center justify-content-center ${step.active ? 'bg-premium border-premium text-white' : 'bg-secondary bg-opacity-20 border-secondary text-muted'}`} style={{ width: '28px', height: '28px', fontSize: '0.8rem', border: '2px solid' }}>
                      {step.active ? <FiCheckCircle size={14}/> : idx + 1}
                    </div>
                    <div className="text-start text-md-center">
                      <div className={`small fw-bold ${step.active ? 'text-white' : 'text-muted'}`} style={{ fontSize: '0.8rem' }}>{step.name}</div>
                      <div className="text-muted" style={{ fontSize: '0.7rem' }}>{step.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Proof Attachment */}
              {selectedRequest.proofImageUrl && (
                <div className="mb-4 bg-dark bg-opacity-50 p-3 rounded border border-secondary border-opacity-20">
                  <h6 className="text-white mb-2 d-flex align-items-center small fw-bold text-muted uppercase">Completion Proof Submitted</h6>
                  <Row className="align-items-center">
                    <Col sm={4}>
                      <img 
                        src={selectedRequest.proofImageUrl.startsWith('http') ? selectedRequest.proofImageUrl : `http://localhost:5143${selectedRequest.proofImageUrl}`} 
                        alt="Completion Proof" 
                        className="img-fluid rounded border border-secondary border-opacity-20 shadow-sm"
                        style={{ maxHeight: '110px', objectFit: 'cover' }}
                      />
                    </Col>
                    <Col sm={8}>
                      <div className="small text-muted fw-bold">Volunteer Remarks:</div>
                      <p className="small text-light italic mt-1 bg-dark bg-opacity-80 p-2 rounded mb-0">"{selectedRequest.remarks || 'No remarks provided.'}"</p>
                    </Col>
                  </Row>
                </div>
              )}

              {/* Description & Geolocation Info */}
              <div className="mb-4">
                <h6 className="text-muted small uppercase fw-bold mb-1">Distress Details & Notes</h6>
                <p className="text-light bg-dark bg-opacity-60 p-2.5 rounded border border-secondary border-opacity-10 mb-0">{selectedRequest.description}</p>
                <div className="text-muted small mt-2 d-flex justify-content-between">
                  <span>Coordinates: {selectedRequest.latitude.toFixed(6)}, {selectedRequest.longitude.toFixed(6)}</span>
                  <span>Raised At: {new Date(new Date(selectedRequest.createdAt).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })).toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="d-flex justify-content-end mt-4">
                <Button variant="outline-light" onClick={() => setShowDetailModal(false)}>Close Tracker</Button>
              </div>
            </div>
          )}
        </Modal.Body>
      </Modal>

      {/* Cancel Confirmation Modal */}
      <Modal show={showCancelConfirmModal} onHide={() => setShowCancelConfirmModal(false)} contentClassName="glass-panel text-light" dialogClassName="modal-dark" centered>
        <Modal.Header closeButton closeVariant="white" className="border-light border-opacity-10 bg-dark">
          <Modal.Title className="fw-bold">Confirm Cancel Request</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark text-start">
          <p>Are you sure you want to cancel this emergency SOS distress signal? First responders will be updated.</p>
          <div className="d-flex justify-content-end gap-2 mt-4">
            <Button variant="outline-light" onClick={() => setShowCancelConfirmModal(false)}>No, Keep SOS</Button>
            <Button variant="danger" onClick={handleCancelConfirm}>Yes, Cancel SOS</Button>
          </div>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default SOSPage;
