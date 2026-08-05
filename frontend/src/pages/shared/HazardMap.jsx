import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Badge, Modal, Form, Alert, ButtonGroup } from 'react-bootstrap';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { hazardReportService, campService, disasterService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { FiAlertTriangle, FiHome, FiMapPin, FiTrash2, FiClock, FiPlusCircle, FiX } from 'react-icons/fi';
import L from 'leaflet';

import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Distinct red warning-triangle icon for hazard markers so they read differently from camps
const HazardIcon = L.divIcon({
  html: `<div style="
      background:#c53030;
      width:30px;height:30px;border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);
      display:flex;align-items:center;justify-content:center;
      box-shadow:0 2px 6px rgba(0,0,0,0.4);
      border:2px solid #fff;">
      <span style="transform:rotate(45deg);font-size:14px;">⚠️</span>
    </div>`,
  className: '',
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30],
});

const CampIcon = L.divIcon({
  html: `<div style="
      background:#10b981;
      width:30px;height:30px;border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);
      display:flex;align-items:center;justify-content:center;
      box-shadow:0 2px 6px rgba(0,0,0,0.4);
      border:2px solid #fff;">
      <span style="transform:rotate(45deg);font-size:14px;">⛺</span>
    </div>`,
  className: '',
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30],
});

const HAZARD_TYPES = ['Road Blocked', 'Bridge Collapsed', 'Landslide', 'Flooded Road', 'Debris / Obstruction', 'Other'];

const CAMP_MANAGER_ROLES = ['Government Officer', 'Admin'];

// Renders a temporary pin at the clicked point and reports the click coordinates up.
const ClickCatcher = ({ active, onPick }) => {
  useMapEvents({
    click(e) {
      if (active) {
        onPick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
};

const timeAgo = (dateString) => {
  // Get current time in IST (UTC+5:30)
  const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const then = new Date(new Date(dateString).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  
  // If parsing failed, return empty
  if (isNaN(then.getTime())) return '';
  
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? '' : 's'} ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hour${diffHr === 1 ? '' : 's'} ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 30) return `${diffDay} day${diffDay === 1 ? '' : 's'} ago`;
  const diffMonth = Math.floor(diffDay / 30);
  return `${diffMonth} month${diffMonth === 1 ? '' : 's'} ago`;
};

const HazardMap = () => {
  const { user } = useAuth();
  const canManageCamps = user && CAMP_MANAGER_ROLES.includes(user.roleName);
  const canRemoveAnyHazard = user && (user.roleName === 'Admin' || user.roleName === 'Government Officer');

  const [hazards, setHazards] = useState([]);
  const [camps, setCamps] = useState([]);
  const [disasters, setDisasters] = useState([]);
  const [loading, setLoading] = useState(true);

  const [mode, setMode] = useState(null); // null | 'hazard' | 'camp'
  const [pendingPoint, setPendingPoint] = useState(null);

  const [showHazardModal, setShowHazardModal] = useState(false);
  const [hazardForm, setHazardForm] = useState({ hazardType: HAZARD_TYPES[0], description: '' });

  const [showCampModal, setShowCampModal] = useState(false);
  const [campForm, setCampForm] = useState({
    disasterId: '', name: '', address: '', capacity: '', currentOccupancy: '0', contactPerson: '', contactNumber: '',
  });

  const [, forceTick] = useState(0);

  const fetchData = useCallback(async () => {
    try {
      const [hazardList, campList] = await Promise.all([
        hazardReportService.getAll(),
        campService.getAll(),
      ]);
      setHazards(hazardList);
      setCamps(campList);

      if (CAMP_MANAGER_ROLES.includes(user?.roleName)) {
        try {
          const disasterList = await disasterService.getAll(true);
          setDisasters(disasterList);
        } catch (err) {
          console.warn('Could not load active disasters:', err);
        }
      }
    } catch (error) {
      console.error('Failed to load map data:', error);
      toast.error('Unable to load live map data.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Refresh "time ago" labels every minute without re-fetching
  useEffect(() => {
    const interval = setInterval(() => forceTick((t) => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  const handlePick = (lat, lng) => {
    setPendingPoint({ lat, lng });
    if (mode === 'hazard') {
      setHazardForm({ hazardType: HAZARD_TYPES[0], description: '' });
      setShowHazardModal(true);
    } else if (mode === 'camp') {
      setCampForm({
        disasterId: disasters.length > 0 ? disasters[0].id.toString() : '',
        name: '', address: '', capacity: '', currentOccupancy: '0', contactPerson: '', contactNumber: '',
      });
      setShowCampModal(true);
    }
  };

  const closeHazardModal = () => {
    setShowHazardModal(false);
    setMode(null);
    setPendingPoint(null);
  };

  const closeCampModal = () => {
    setShowCampModal(false);
    setMode(null);
    setPendingPoint(null);
  };

  const handleSubmitHazard = async (e) => {
    e.preventDefault();
    if (!pendingPoint) return;
    if (!hazardForm.description.trim()) {
      toast.error('Please describe why this location is marked.');
      return;
    }
    try {
      const created = await hazardReportService.create({
        hazardType: hazardForm.hazardType,
        description: hazardForm.description.trim(),
        latitude: pendingPoint.lat,
        longitude: pendingPoint.lng,
      });
      setHazards((prev) => [created, ...prev]);
      toast.success('Hazard marker added to the map.');
      closeHazardModal();
    } catch (error) {
      console.error(error);
      toast.error('Failed to add hazard marker.');
    }
  };

  const handleSubmitCamp = async (e) => {
    e.preventDefault();
    if (!pendingPoint) return;
    const { disasterId, name, address, capacity, currentOccupancy, contactPerson, contactNumber } = campForm;
    if (!name || !address || !capacity || !contactPerson || !contactNumber) {
      toast.error('Please complete all fields.');
      return;
    }
    try {
      const created = await campService.create({
        disasterId: disasterId ? parseInt(disasterId) : null,
        name,
        address,
        latitude: pendingPoint.lat,
        longitude: pendingPoint.lng,
        capacity: parseInt(capacity),
        currentOccupancy: parseInt(currentOccupancy || '0'),
        contactPerson,
        contactNumber,
      });
      setCamps((prev) => [...prev, created]);
      toast.success('Relief camp added to the map.');
      closeCampModal();
    } catch (error) {
      console.error(error);
      toast.error('Failed to add relief camp. Make sure there is an active disaster to link it to.');
    }
  };

  const handleDeleteHazard = async (id) => {
    if (!window.confirm('Remove this marker from the map?')) return;
    try {
      await hazardReportService.delete(id);
      setHazards((prev) => prev.filter((h) => h.id !== id));
      toast.success('Marker removed.');
    } catch (error) {
      console.error(error);
      toast.error('Failed to remove marker. You can only remove your own reports.');
    }
  };

  const handleCloseCamp = async (id) => {
    if (!window.confirm('Close and remove this relief camp?')) return;
    try {
      await campService.close(id);
      setCamps((prev) => prev.filter((c) => c.id !== id));
      toast.success('Relief camp closed.');
    } catch (error) {
      console.error(error);
      toast.error('Failed to close relief camp.');
    }
  };

  const toggleMode = (next) => {
    setPendingPoint(null);
    setMode((prev) => (prev === next ? null : next));
  };

  return (
    <Container className="py-4 text-start">
      <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-3">
        <div>
          <h2 className="text-white mb-1">Live Hazard &amp; Relief Map</h2>
          <p className="text-muted small mb-0">
            Mark blocked or collapsed roads and bridges so responders can reroute around them.
            {canManageCamps && ' You can also drop pins for new relief camps.'}
          </p>
        </div>
        <ButtonGroup>
          <Button
            variant={mode === 'hazard' ? 'danger' : 'outline-danger'}
            onClick={() => toggleMode('hazard')}
            className="d-flex align-items-center gap-2"
          >
            <FiAlertTriangle /> {mode === 'hazard' ? 'Click the map…' : 'Report Hazard'}
          </Button>
          {canManageCamps && (
            <Button
              variant={mode === 'camp' ? 'success' : 'outline-success'}
              onClick={() => toggleMode('camp')}
              className="d-flex align-items-center gap-2"
            >
              <FiHome /> {mode === 'camp' ? 'Click the map…' : 'Add Relief Camp'}
            </Button>
          )}
          {mode && (
            <Button variant="outline-light" onClick={() => setMode(null)} title="Cancel">
              <FiX />
            </Button>
          )}
        </ButtonGroup>
      </div>

      {mode === 'camp' && disasters.length === 0 && (
        <Alert variant="warning" className="bg-dark border-warning border-opacity-25 text-warning">
          <FiAlertTriangle className="me-2" /> No active disaster is currently open. Create or activate a disaster
          alert first, then relief camps can be linked to it.
        </Alert>
      )}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
        </div>
      ) : (
        <Row className="g-4">
          <Col lg={8}>
            <Card className="glass-panel border-0 bg-dark p-2">
              <Card.Body className="p-0">
                <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: '560px', width: '100%', cursor: mode ? 'crosshair' : '' }}>
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <ClickCatcher active={!!mode} onPick={handlePick} />

                  {camps.map((c) => (
                    <Marker key={`camp-${c.id}`} position={[c.latitude, c.longitude]} icon={CampIcon}>
                      <Popup>
                        <div className="text-dark">
                          <strong>⛺ {c.name}</strong>
                          <p className="mb-1" style={{ fontSize: '0.85rem' }}>{c.address}</p>
                          <small className="d-block mb-1">Occupancy: {c.currentOccupancy}/{c.capacity}</small>
                          <small className="d-block mb-2">Contact: {c.contactPerson} ({c.contactNumber})</small>
                          {canManageCamps && (
                            <Button size="sm" variant="outline-danger" onClick={() => handleCloseCamp(c.id)}>
                              <FiTrash2 size={12} className="me-1" /> Close Camp
                            </Button>
                          )}
                        </div>
                      </Popup>
                    </Marker>
                  ))}

                  {hazards.map((h) => {
                    const isOwner = user && h.reporterId === user.id;
                    const canRemove = isOwner || canRemoveAnyHazard;
                    return (
                      <Marker key={`hz-${h.id}`} position={[h.latitude, h.longitude]} icon={HazardIcon}>
                        <Popup>
                          <div className="text-dark" style={{ minWidth: '180px' }}>
                            <strong>⚠️ {h.hazardType}</strong>
                            <p className="mb-1 mt-1" style={{ fontSize: '0.85rem' }}>{h.description}</p>
                            <small className="d-block text-muted">Reported by {h.reporterName}</small>
                            <small className="d-flex align-items-center gap-1 text-muted mb-2">
                              <FiClock size={11} /> {timeAgo(h.createdAt)}
                            </small>
                            {canRemove && (
                              <Button size="sm" variant="outline-danger" onClick={(e) => { e.stopPropagation(); handleDeleteHazard(h.id); }}>
                                <FiTrash2 size={12} className="me-1" /> Remove Marker
                              </Button>
                            )}
                          </div>
                        </Popup>
                      </Marker>
                    );
                  })}

                  {pendingPoint && mode && (
                    <Marker position={[pendingPoint.lat, pendingPoint.lng]} />
                  )}
                </MapContainer>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4}>
            <Card className="glass-panel border-0 bg-dark mb-3" style={{ maxHeight: '560px', overflowY: 'auto' }}>
              <Card.Header className="bg-transparent border-0 d-flex align-items-center gap-2 pt-3">
                <FiAlertTriangle className="text-danger" />
                <h6 className="fw-bold mb-0 text-white">
                  Active Hazard Markers
                  {hazards.length > 0 && <Badge bg="danger" pill className="ms-2">{hazards.length}</Badge>}
                </h6>
              </Card.Header>
              <Card.Body className="p-3">
                {hazards.length === 0 ? (
                  <p className="text-muted small mb-0">No hazards reported yet. Use "Report Hazard" and click the map to add one.</p>
                ) : (
                  <div className="d-flex flex-column gap-2">
                    {hazards.map((h) => {
                      const isOwner = user && h.reporterId === user.id;
                      const canRemove = isOwner || canRemoveAnyHazard;
                      return (
                        <div key={h.id} className="p-2 rounded-3" style={{ backgroundColor: 'rgba(197,48,48,0.12)', border: '1px solid rgba(197,48,48,0.3)' }}>
                          <div className="d-flex justify-content-between align-items-start">
                            <h6 className="mb-1 text-white small fw-bold">{h.hazardType}</h6>
                            {canRemove && (
                              <Button size="sm" variant="link" className="text-danger p-0" onClick={(e) => { e.stopPropagation(); handleDeleteHazard(h.id); }} title="Remove">
                                <FiTrash2 size={14} />
                              </Button>
                            )}
                          </div>
                          <p className="text-muted small mb-1">{h.description}</p>
                          <div className="d-flex justify-content-between text-muted" style={{ fontSize: '0.72rem' }}>
                            <span>{h.reporterName}</span>
                            <span className="d-flex align-items-center gap-1"><FiClock size={10} /> {timeAgo(h.createdAt)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card.Body>
            </Card>

            <Alert variant="secondary" className="bg-dark border-light border-opacity-10 text-muted small mb-0">
              <FiMapPin className="me-2" />
              Tip: click <strong>Report Hazard</strong>{canManageCamps ? ' or ' : ''}{canManageCamps && <strong>Add Relief Camp</strong>}, then click anywhere on the map to drop a pin at that location.
            </Alert>
          </Col>
        </Row>
      )}

      {/* Hazard Report Modal */}
      <Modal show={showHazardModal} onHide={closeHazardModal} contentClassName="glass-panel text-light" dialogClassName="modal-dark" centered>
        <Modal.Header closeButton closeVariant="white" className="border-light border-opacity-10 bg-dark">
          <Modal.Title className="fw-bold d-flex align-items-center gap-2"><FiAlertTriangle /> Report a Hazard</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark text-start">
          <Form onSubmit={handleSubmitHazard}>
            <Form.Group className="mb-3" controlId="hazardType">
              <Form.Label className="text-muted small fw-semibold">What kind of hazard is this?</Form.Label>
              <Form.Select
                className="form-glass"
                value={hazardForm.hazardType}
                onChange={(e) => setHazardForm((prev) => ({ ...prev, hazardType: e.target.value }))}
              >
                {HAZARD_TYPES.map((t) => (
                  <option key={t} value={t} className="bg-dark">{t}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3" controlId="hazardDescription">
              <Form.Label className="text-muted small fw-semibold">Why are you marking this location?</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                className="form-glass"
                placeholder="e.g. Bridge deck has collapsed, unsafe to cross on foot or vehicle."
                value={hazardForm.description}
                onChange={(e) => setHazardForm((prev) => ({ ...prev, description: e.target.value }))}
                required
              />
            </Form.Group>
            {pendingPoint && (
              <p className="text-muted small mb-3">
                <FiMapPin className="me-1" /> Pinned at {pendingPoint.lat.toFixed(5)}, {pendingPoint.lng.toFixed(5)}
              </p>
            )}
            <div className="d-flex justify-content-end gap-2">
              <Button variant="outline-light" onClick={closeHazardModal}>Cancel</Button>
              <Button type="submit" variant="danger" className="d-flex align-items-center gap-2">
                <FiPlusCircle /> Add Marker
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Camp Creation Modal (Govt Officer / Admin only) */}
      <Modal show={showCampModal} onHide={closeCampModal} contentClassName="glass-panel text-light" dialogClassName="modal-dark" centered>
        <Modal.Header closeButton closeVariant="white" className="border-light border-opacity-10 bg-dark">
          <Modal.Title className="fw-bold d-flex align-items-center gap-2"><FiHome /> Add Relief Camp</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark text-start">
          <Form onSubmit={handleSubmitCamp}>
            <Form.Group className="mb-3" controlId="campDisasterId">
              <Form.Label className="text-muted small fw-semibold">Linked Disaster</Form.Label>
              <Form.Select
                className="form-glass"
                value={campForm.disasterId}
                onChange={(e) => setCampForm((prev) => ({ ...prev, disasterId: e.target.value }))}
                required
              >
                <option value="" className="bg-dark">Select a disaster…</option>
                {disasters.map((d) => (
                  <option key={d.id} value={d.id} className="bg-dark">{d.title}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3" controlId="campName">
              <Form.Label className="text-muted small fw-semibold">Camp Name</Form.Label>
              <Form.Control className="form-glass" value={campForm.name} onChange={(e) => setCampForm((prev) => ({ ...prev, name: e.target.value }))} required />
            </Form.Group>
            <Form.Group className="mb-3" controlId="campAddress">
              <Form.Label className="text-muted small fw-semibold">Address</Form.Label>
              <Form.Control className="form-glass" value={campForm.address} onChange={(e) => setCampForm((prev) => ({ ...prev, address: e.target.value }))} required />
            </Form.Group>
            <Row className="mb-3">
              <Col xs={6}>
                <Form.Group controlId="campCapacity">
                  <Form.Label className="text-muted small fw-semibold">Capacity</Form.Label>
                  <Form.Control type="number" className="form-glass" value={campForm.capacity} onChange={(e) => setCampForm((prev) => ({ ...prev, capacity: e.target.value }))} required />
                </Form.Group>
              </Col>
              <Col xs={6}>
                <Form.Group controlId="campOccupancy">
                  <Form.Label className="text-muted small fw-semibold">Current Occupants</Form.Label>
                  <Form.Control type="number" className="form-glass" value={campForm.currentOccupancy} onChange={(e) => setCampForm((prev) => ({ ...prev, currentOccupancy: e.target.value }))} />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col xs={6}>
                <Form.Group controlId="campContactPerson">
                  <Form.Label className="text-muted small fw-semibold">Contact Person</Form.Label>
                  <Form.Control className="form-glass" value={campForm.contactPerson} onChange={(e) => setCampForm((prev) => ({ ...prev, contactPerson: e.target.value }))} required />
                </Form.Group>
              </Col>
              <Col xs={6}>
                <Form.Group controlId="campContactNumber">
                  <Form.Label className="text-muted small fw-semibold">Contact Number</Form.Label>
                  <Form.Control type="tel" className="form-glass" value={campForm.contactNumber} onChange={(e) => setCampForm((prev) => ({ ...prev, contactNumber: e.target.value }))} required />
                </Form.Group>
              </Col>
            </Row>
            {pendingPoint && (
              <p className="text-muted small mb-3">
                <FiMapPin className="me-1" /> Pinned at {pendingPoint.lat.toFixed(5)}, {pendingPoint.lng.toFixed(5)}
              </p>
            )}
            <div className="d-flex justify-content-end gap-2">
              <Button variant="outline-light" onClick={closeCampModal}>Cancel</Button>
              <Button type="submit" variant="success" className="d-flex align-items-center gap-2">
                <FiPlusCircle /> Add Camp
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default HazardMap;
