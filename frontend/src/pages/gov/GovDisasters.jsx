import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Button, Badge, Modal, Form, Row, Col, Alert } from 'react-bootstrap';
import { disasterService, sosService } from '../../services/api';
import { toast } from 'react-toastify';
import { FiAlertTriangle, FiPlus, FiEdit2, FiTrash2, FiActivity } from 'react-icons/fi';

const GovDisasters = () => {
  const [allEvents, setAllEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentDisasterId, setCurrentDisasterId] = useState(null);

  const [selectedSos, setSelectedSos] = useState(null);
  const [showSosModal, setShowSosModal] = useState(false);

  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('startDate');
  const [sortDescending, setSortDescending] = useState(true);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'Flood',
    severity: 'Medium',
    status: 'Active',
    latitude: '',
    longitude: '',
    startDate: '',
    endDate: '',
  });

  const fetchDisasters = async () => {
    setLoading(true);
    try {
      // Fetch disasters (fetch up to 10000 records to load all for local client-side operations)
      const disastersResponse = await disasterService.getAll({
        pageNumber: 1,
        pageSize: 10000,
        sortBy: 'createdAt',
        sortDescending: true
      });
      const rawDisasters = disastersResponse.items || [];

      // Fetch SOS requests
      let rawSos = [];
      try {
        rawSos = await sosService.getGovSos();
      } catch (err) {
        console.error('Failed to load SOS requests:', err);
      }

      // Map SOS requests to disaster format
      const mappedSos = rawSos.map(s => ({
        id: `sos-${s.id}`,
        isSos: true,
        startDate: s.createdAt,
        title: `SOS Alert: ${s.victimName} (${s.category})`,
        description: s.description,
        type: s.disasterType || 'Flood',
        severity: s.emergencyLevel || s.priority || 'Medium',
        status: ['Resolved', 'Rejected', 'Cancelled'].includes(s.currentStatus || s.status) ? 'Closed' : 'Active',
        latitude: s.latitude,
        longitude: s.longitude,
        originalSos: s
      }));

      // Combine
      const combined = [...rawDisasters, ...mappedSos];
      setAllEvents(combined);
    } catch (error) {
      console.error('Failed to load disasters:', error);
      toast.error('Unable to fetch disasters.');
      setAllEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisasters();
  }, []);

  useEffect(() => {
    // 1. Filter
    let result = [...allEvents];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(e => 
        e.title.toLowerCase().includes(term) || 
        e.description.toLowerCase().includes(term)
      );
    }

    if (typeFilter) {
      result = result.filter(e => e.type.toLowerCase() === typeFilter.toLowerCase());
    }

    if (severityFilter) {
      result = result.filter(e => e.severity.toLowerCase() === severityFilter.toLowerCase());
    }

    if (statusFilter) {
      result = result.filter(e => e.status.toLowerCase() === statusFilter.toLowerCase());
    }

    // 2. Sort
    result.sort((a, b) => {
      let valA, valB;
      if (sortBy === 'startDate') {
        valA = new Date(a.startDate);
        valB = new Date(b.startDate);
      } else if (sortBy === 'title') {
        valA = a.title.toLowerCase();
        valB = b.title.toLowerCase();
      } else if (sortBy === 'type') {
        valA = a.type.toLowerCase();
        valB = b.type.toLowerCase();
      } else if (sortBy === 'severity') {
        const severityMap = { low: 1, medium: 2, high: 3, critical: 4 };
        valA = severityMap[a.severity.toLowerCase()] || 0;
        valB = severityMap[b.severity.toLowerCase()] || 0;
      } else if (sortBy === 'status') {
        valA = a.status.toLowerCase();
        valB = b.status.toLowerCase();
      } else {
        valA = new Date(a.startDate || a.createdAt);
        valB = new Date(b.startDate || b.createdAt);
      }

      if (valA < valB) return sortDescending ? 1 : -1;
      if (valA > valB) return sortDescending ? -1 : 1;
      return 0;
    });

    // 3. Paginate
    const total = Math.ceil(result.length / pageSize);
    setTotalPages(total || 1);

    const currentPage = Math.min(pageNumber, total || 1);
    if (currentPage !== pageNumber && currentPage > 0) {
      setPageNumber(currentPage);
    }

    const startIndex = (currentPage - 1) * pageSize;
    const paginated = result.slice(startIndex, startIndex + pageSize);
    setFilteredEvents(paginated);
  }, [allEvents, searchTerm, typeFilter, severityFilter, statusFilter, sortBy, sortDescending, pageNumber, pageSize]);

  const handleOpenSosDetails = (sos) => {
    setSelectedSos(sos);
    setShowSosModal(true);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchTerm(searchInput);
    setPageNumber(1);
  };

  const handleResetFilters = () => {
    setSearchInput('');
    setSearchTerm('');
    setTypeFilter('');
    setSeverityFilter('');
    setStatusFilter('');
    setSortBy('createdAt');
    setSortDescending(true);
    setPageNumber(1);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDescending(!sortDescending);
    } else {
      setSortBy(field);
      setSortDescending(false);
    }
    setPageNumber(1);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOpenCreate = () => {
    setEditMode(false);
    setCurrentDisasterId(null);
    setFormData({
      title: '',
      description: '',
      type: 'Flood',
      severity: 'Medium',
      status: 'Active',
      latitude: '',
      longitude: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (disaster) => {
    setEditMode(true);
    setCurrentDisasterId(disaster.id);
    setFormData({
      title: disaster.title,
      description: disaster.description,
      type: disaster.type,
      severity: disaster.severity,
      status: disaster.status,
      latitude: disaster.latitude.toString(),
      longitude: disaster.longitude.toString(),
      startDate: new Date(disaster.startDate).toISOString().split('T')[0],
      endDate: disaster.endDate ? new Date(disaster.endDate).toISOString().split('T')[0] : '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { title, description, type, severity, status, latitude, longitude, startDate, endDate } = formData;

    if (!title || !description || !type || !severity || !status || !latitude || !longitude || !startDate) {
      toast.error('Please fill in all required fields.');
      return;
    }

    const payload = {
      title,
      description,
      type,
      severity,
      status,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      startDate: new Date(startDate).toISOString(),
      endDate: endDate ? new Date(endDate).toISOString() : null,
    };

    try {
      if (editMode) {
        await disasterService.update(currentDisasterId, payload);
        toast.success('Disaster event details modified!');
      } else {
        await disasterService.create(payload);
        toast.success('New disaster logged and broadcasted!');
      }
      setShowModal(false);
      fetchDisasters();
    } catch (error) {
      console.error(error);
      toast.error('Failed to save disaster details.');
    }
  };

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // 'close' or 'delete'
  const [confirmTargetId, setConfirmTargetId] = useState(null);

  const triggerCloseConfirm = (id) => {
    setConfirmAction('close');
    setConfirmTargetId(id);
    setShowConfirmModal(true);
  };

  const triggerDeleteConfirm = (id) => {
    setConfirmAction('delete');
    setConfirmTargetId(id);
    setShowConfirmModal(true);
  };

  const handleConfirmAction = async () => {
    setShowConfirmModal(false);
    if (!confirmTargetId) return;

    try {
      if (confirmAction === 'close') {
        await disasterService.close(confirmTargetId);
        toast.success('Disaster marked as Closed.');
      } else if (confirmAction === 'delete') {
        if (typeof confirmTargetId === 'string' && confirmTargetId.startsWith('sos-')) {
          const sosId = parseInt(confirmTargetId.replace('sos-', ''));
          await sosService.delete(sosId);
          toast.success('SOS request log deleted.');
        } else {
          await disasterService.delete(confirmTargetId);
          toast.success('Disaster log deleted.');
        }
      }
      fetchDisasters();
    } catch (error) {
      console.error(error);
      toast.error(`Failed to ${confirmAction} event.`);
    } finally {
      setConfirmTargetId(null);
      setConfirmAction(null);
    }
  };

  const getSeverityColor = (sev) => {
    switch (sev) {
      case 'Low': return 'secondary';
      case 'Medium': return 'primary';
      case 'High': return 'warning';
      case 'Critical': return 'danger';
      default: return 'secondary';
    }
  };

  return (
    <Container className="py-4 text-start">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="text-white mb-1">Disaster Logging Registry</h2>
          <p className="text-muted small">Declare disaster emergencies, adjust severity status, and manage active incident alerts.</p>
        </div>
        <Button onClick={handleOpenCreate} className="btn-premium d-flex align-items-center">
          <FiPlus className="me-2" /> Declare Disaster
        </Button>
      </div>

      {/* Search and Filters Section */}
      <Card className="glass-panel border-0 bg-dark p-3 mb-4">
        <Form onSubmit={handleSearchSubmit}>
          <Row className="g-3">
            <Col lg={4} md={6}>
              <Form.Group controlId="search">
                <Form.Control
                  type="text"
                  placeholder="Search by title or description..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="form-glass"
                />
              </Form.Group>
            </Col>
            <Col lg={2} md={3} xs={6}>
              <Form.Select
                value={typeFilter}
                onChange={(e) => { setTypeFilter(e.target.value); setPageNumber(1); }}
                className="form-glass"
              >
                <option value="">All Types</option>
                <option value="Flood">Flood</option>
                <option value="Earthquake">Earthquake</option>
                <option value="Wildfire">Wildfire</option>
                <option value="Hurricane">Hurricane</option>
                <option value="Tornado">Tornado</option>
                <option value="Tsunami">Tsunami</option>
              </Form.Select>
            </Col>
            <Col lg={2} md={3} xs={6}>
              <Form.Select
                value={severityFilter}
                onChange={(e) => { setSeverityFilter(e.target.value); setPageNumber(1); }}
                className="form-glass"
              >
                <option value="">All Severities</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </Form.Select>
            </Col>
            <Col lg={2} md={3} xs={6}>
              <Form.Select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPageNumber(1); }}
                className="form-glass"
              >
                <option value="">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Closed">Closed</option>
              </Form.Select>
            </Col>
            <Col lg={2} md={3} xs={6} className="d-flex gap-2">
              <Button type="submit" className="btn-premium w-100">
                Search
              </Button>
              <Button variant="outline-light" onClick={handleResetFilters} className="w-100">
                Reset
              </Button>
            </Col>
          </Row>
        </Form>
      </Card>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
        </div>
      ) : filteredEvents.length === 0 ? (
        <Alert variant="info" className="bg-dark border-light border-opacity-10 text-muted">
          No disaster events or SOS alerts logged in system matching criteria.
        </Alert>
      ) : (
        <Card className="glass-panel border-0 bg-dark p-3">
          <Card.Body className="p-0">
            <div className="table-responsive">
              <Table hover variant="dark" className="align-middle bg-transparent mb-0">
                <thead>
                  <tr className="border-light border-opacity-10">
                    <th onClick={() => handleSort('startDate')} style={{ cursor: 'pointer' }}>
                      Declared Date {sortBy === 'startDate' && (sortDescending ? '▼' : '▲')}
                    </th>
                    <th onClick={() => handleSort('title')} style={{ cursor: 'pointer' }}>
                      Disaster Title {sortBy === 'title' && (sortDescending ? '▼' : '▲')}
                    </th>
                    <th onClick={() => handleSort('type')} style={{ cursor: 'pointer' }}>
                      Type {sortBy === 'type' && (sortDescending ? '▼' : '▲')}
                    </th>
                    <th onClick={() => handleSort('severity')} style={{ cursor: 'pointer' }}>
                      Severity {sortBy === 'severity' && (sortDescending ? '▼' : '▲')}
                    </th>
                    <th onClick={() => handleSort('status')} style={{ cursor: 'pointer' }}>
                      Status {sortBy === 'status' && (sortDescending ? '▼' : '▲')}
                    </th>
                    <th>Coordinates</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEvents.map((d) => (
                    <tr key={d.id} className="border-light border-opacity-10">
                      <td className="small text-muted" style={{ fontSize: '0.75rem' }}>
                        {new Date(d.startDate).toLocaleDateString()}
                      </td>
                      <td className="fw-semibold small">
                        {d.isSos && <Badge bg="danger" className="me-2">SOS Call</Badge>}
                        {d.title}
                      </td>
                      <td className="small">{d.type}</td>
                      <td>
                        <Badge bg={getSeverityColor(d.severity)}>{d.severity}</Badge>
                      </td>
                      <td>
                        <Badge bg={d.status === 'Active' ? 'danger' : 'success'}>{d.status}</Badge>
                      </td>
                      <td className="small text-muted">{d.latitude.toFixed(4)}, {d.longitude.toFixed(4)}</td>
                      <td>
                        {d.isSos ? (
                          <div className="d-flex gap-2">
                            <Button 
                              variant="outline-info" 
                              size="sm"
                              onClick={() => handleOpenSosDetails(d.originalSos)}
                              className="d-flex align-items-center gap-1 py-1"
                            >
                              <FiActivity size={12} /> View SOS Details
                            </Button>
                            {d.status === 'Closed' && (
                              <Button 
                                variant="outline-danger" 
                                size="sm"
                                onClick={() => triggerDeleteConfirm(d.id)}
                                className="d-flex align-items-center gap-1 py-1"
                              >
                                <FiTrash2 size={12} /> Delete
                              </Button>
                            )}
                          </div>
                        ) : (
                          <div className="d-flex gap-2">
                            <Button 
                              variant="outline-primary" 
                              size="sm"
                              onClick={() => handleOpenEdit(d)}
                              className="d-flex align-items-center gap-1 py-1"
                            >
                              <FiEdit2 size={12} /> Edit
                            </Button>
                            {d.status === 'Active' && (
                              <Button 
                                variant="outline-success" 
                                size="sm"
                                onClick={() => triggerCloseConfirm(d.id)}
                                className="d-flex align-items-center gap-1 py-1"
                              >
                                <FiActivity size={12} /> Close
                              </Button>
                            )}
                            <Button 
                              variant="outline-danger" 
                              size="sm"
                              onClick={() => triggerDeleteConfirm(d.id)}
                              className="d-flex align-items-center gap-1 py-1"
                            >
                              <FiTrash2 size={12} /> Delete
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top border-light border-opacity-10">
                <span className="small text-muted">
                  Page {pageNumber} of {totalPages}
                </span>
                <div className="d-flex gap-2">
                  <Button
                    variant="outline-light"
                    size="sm"
                    disabled={pageNumber === 1}
                    onClick={() => setPageNumber((prev) => Math.max(prev - 1, 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline-light"
                    size="sm"
                    disabled={pageNumber === totalPages}
                    onClick={() => setPageNumber((prev) => Math.min(prev + 1, totalPages))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </Card.Body>
        </Card>
      )}

      {/* Declare/Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} contentClassName="glass-panel text-light" dialogClassName="modal-dark" centered>
        <Modal.Header closeButton closeVariant="white" className="border-light border-opacity-10 bg-dark">
          <Modal.Title className="fw-bold">{editMode ? 'Edit Disaster Log' : 'Declare Disaster Incident'}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark text-start">
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="disTitle">
              <Form.Label className="text-muted small fw-semibold">Disaster Title</Form.Label>
              <Form.Control
                type="text"
                name="title"
                placeholder="E.g. Hurricane Katrina Storm Surge"
                value={formData.title}
                onChange={handleInputChange}
                className="form-glass"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="disDescription">
              <Form.Label className="text-muted small fw-semibold">Detailed Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                placeholder="Describe current severity indicators, evacuation zones, and rescue coordinates..."
                value={formData.description}
                onChange={handleInputChange}
                className="form-glass"
                required
              />
            </Form.Group>

            <Row className="mb-3">
              <Col xs={6}>
                <Form.Group controlId="disType">
                  <Form.Label className="text-muted small fw-semibold">Disaster Type</Form.Label>
                  <Form.Select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="form-glass"
                    required
                  >
                    <option value="Flood" className="bg-dark">Flood</option>
                    <option value="Earthquake" className="bg-dark">Earthquake</option>
                    <option value="Wildfire" className="bg-dark">Wildfire</option>
                    <option value="Hurricane" className="bg-dark">Hurricane</option>
                    <option value="Tornado" className="bg-dark">Tornado</option>
                    <option value="Tsunami" className="bg-dark">Tsunami</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              
              <Col xs={6}>
                <Form.Group controlId="disSeverity">
                  <Form.Label className="text-muted small fw-semibold">Severity level</Form.Label>
                  <Form.Select
                    name="severity"
                    value={formData.severity}
                    onChange={handleInputChange}
                    className="form-glass"
                    required
                  >
                    <option value="Low" className="bg-dark">Low</option>
                    <option value="Medium" className="bg-dark">Medium</option>
                    <option value="High" className="bg-dark">High</option>
                    <option value="Critical" className="bg-dark">Critical</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col xs={6}>
                <Form.Group controlId="disLat">
                  <Form.Label className="text-muted small fw-semibold">Latitude</Form.Label>
                  <Form.Control
                    type="number"
                    step="any"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleInputChange}
                    className="form-glass"
                    required
                  />
                </Form.Group>
              </Col>
              
              <Col xs={6}>
                <Form.Group controlId="disLong">
                  <Form.Label className="text-muted small fw-semibold">Longitude</Form.Label>
                  <Form.Control
                    type="number"
                    step="any"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleInputChange}
                    className="form-glass"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-4">
              <Col md={6}>
                <Form.Group controlId="disStart">
                  <Form.Label className="text-muted small fw-semibold">Start Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="form-glass"
                    required
                  />
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group controlId="disEnd">
                  <Form.Label className="text-muted small fw-semibold">End Date (Optional)</Form.Label>
                  <Form.Control
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="form-glass"
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="outline-light" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button type="submit" className="btn-premium">
                {editMode ? 'Save Changes' : 'Declare Disaster'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Confirmation Modal */}
      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} contentClassName="glass-panel text-light" dialogClassName="modal-dark" centered>
        <Modal.Header closeButton closeVariant="white" className="border-light border-opacity-10 bg-dark">
          <Modal.Title className="fw-bold">Confirm Action</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark text-start">
          <p>
            {confirmAction === 'close'
              ? 'Are you sure you want to mark this disaster event as Closed? Responders and victims will be updated.'
              : (typeof confirmTargetId === 'string' && confirmTargetId.startsWith('sos-'))
                ? 'Are you sure you want to delete this SOS request permanently?'
                : 'Are you sure you want to delete this disaster log permanently? All linked camps and SOS calls will be lost.'}
          </p>
          <div className="d-flex justify-content-end gap-2 mt-4">
            <Button variant="outline-light" onClick={() => setShowConfirmModal(false)}>Cancel</Button>
            <Button 
              variant={confirmAction === 'close' ? 'success' : 'danger'} 
              onClick={handleConfirmAction}
            >
              Confirm
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      {/* SOS Details Modal */}
      <Modal show={showSosModal} onHide={() => setShowSosModal(false)} contentClassName="glass-panel text-light" dialogClassName="modal-dark" centered>
        <Modal.Header closeButton closeVariant="white" className="border-light border-opacity-10 bg-dark">
          <Modal.Title className="fw-bold text-danger">Emergency SOS Details</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark text-start">
          {selectedSos && (
            <div>
              <div className="mb-3">
                <span className="text-muted small fw-semibold d-block">Victim Name</span>
                <span className="fw-bold">{selectedSos.victimName}</span>
              </div>
              <div className="row mb-3">
                <div className="col-6">
                  <span className="text-muted small fw-semibold d-block">Contact Number</span>
                  <span>{selectedSos.contactNumber || 'N/A'}</span>
                </div>
                <div className="col-6">
                  <span className="text-muted small fw-semibold d-block">Number of People</span>
                  <span>{selectedSos.numberOfPeople}</span>
                </div>
              </div>
              <div className="row mb-3">
                <div className="col-6">
                  <span className="text-muted small fw-semibold d-block">Disaster Type</span>
                  <Badge bg="danger" className="text-white">{selectedSos.disasterType}</Badge>
                </div>
                <div className="col-6">
                  <span className="text-muted small fw-semibold d-block">Emergency Level</span>
                  <Badge bg={getSeverityColor(selectedSos.emergencyLevel || selectedSos.priority)}>{selectedSos.emergencyLevel || selectedSos.priority}</Badge>
                </div>
              </div>
              <div className="mb-3">
                <span className="text-muted small fw-semibold d-block">Category</span>
                <span>{selectedSos.category}</span>
              </div>
              <div className="mb-3">
                <span className="text-muted small fw-semibold d-block">Description</span>
                <p className="bg-dark p-2 border border-secondary border-opacity-25 rounded small">{selectedSos.description}</p>
              </div>
              <div className="row mb-3">
                <div className="col-6">
                  <span className="text-muted small fw-semibold d-block">Coordinates</span>
                  <span className="font-monospace small">{selectedSos.latitude.toFixed(4)}, {selectedSos.longitude.toFixed(4)}</span>
                </div>
                <div className="col-6">
                  <span className="text-muted small fw-semibold d-block">Status</span>
                  <Badge bg={['Resolved', 'Rejected', 'Cancelled'].includes(selectedSos.currentStatus || selectedSos.status) ? 'success' : 'danger'}>
                    {selectedSos.currentStatus || selectedSos.status}
                  </Badge>
                </div>
              </div>
              
              {selectedSos.imageUrl && (
                <div className="mb-3">
                  <span className="text-muted small fw-semibold d-block mb-1">Attached Image</span>
                  <img src={`http://localhost:5143${selectedSos.imageUrl}`} alt="SOS Attachment" className="img-fluid rounded border border-light border-opacity-10" style={{ maxHeight: '200px', width: '100%', objectFit: 'cover' }} />
                </div>
              )}

              <div className="d-flex justify-content-between align-items-center mt-4">
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${selectedSos.latitude},${selectedSos.longitude}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-outline-light btn-sm d-flex align-items-center gap-1"
                >
                  <FiActivity size={14} /> Open in Google Maps
                </a>
                <Button variant="secondary" size="sm" onClick={() => setShowSosModal(false)}>Close</Button>
              </div>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default GovDisasters;
