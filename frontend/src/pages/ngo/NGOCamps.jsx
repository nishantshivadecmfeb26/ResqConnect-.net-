import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Button, Badge, Modal, Form, Row, Col, Alert } from 'react-bootstrap';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { campService, disasterService, sosService } from '../../services/api';
import { toast } from 'react-toastify';
import { FiHome, FiPlus, FiEdit2, FiTrash2, FiMapPin, FiAlertTriangle } from 'react-icons/fi';
import L from 'leaflet';

import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Helper component to handle map clicks for coordinate picking
const MapPicker = ({ lat, lng, onChange }) => {
  const map = useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
    },
  });

  useEffect(() => {
    if (lat && lng) {
      const center = map.getCenter();
      const distance = Math.sqrt(Math.pow(center.lat - lat, 2) + Math.pow(center.lng - lng, 2));
      if (distance > 0.01) {
        map.setView([lat, lng]);
      }
    }
  }, [lat, lng, map]);

  return lat && lng ? (
    <Marker position={[lat, lng]} />
  ) : null;
};

const NGOCamps = () => {
  const [camps, setCamps] = useState([]);
  const [disasters, setDisasters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentCampId, setCurrentCampId] = useState(null);
  const [assignedSosRequests, setAssignedSosRequests] = useState([]);
  const [selectedTargetValue, setSelectedTargetValue] = useState('');

  // Enable camp management if NGO has active SOS requests OR if there are active disaster alerts from Govt Officer
  const hasActiveSos = assignedSosRequests.length > 0 || disasters.length > 0;

  const [formData, setFormData] = useState({
    disasterId: '',
    name: '',
    address: '',
    latitude: '',
    longitude: '',
    capacity: '',
    currentOccupancy: '0',
    contactPerson: '',
    contactNumber: '',
  });

  const fetchData = async () => {
    try {
      const campsList = await campService.getAll();
      const disastersList = await disasterService.getAll(true); // active only

      let activeSos = [];
      try {
        const sosList = await sosService.getNgoSos();
        activeSos = sosList.filter(s => 
          ['Assigned to NGO', 'Volunteer Assigned', 'Accepted', 'On The Way', 'Reached', 'Rescue In Progress'].includes(s.currentStatus || s.status)
        );
      } catch (err) {
        console.error('Failed to verify active SOS assignments:', err);
      }

      setCamps(campsList);
      setDisasters(disastersList);
      setAssignedSosRequests(activeSos);

      if (disastersList.length > 0) {
        setSelectedTargetValue(`disaster_${disastersList[0].id}`);
        setFormData((prev) => ({ ...prev, disasterId: disastersList[0].id.toString() }));
      } else if (activeSos.length > 0) {
        setSelectedTargetValue(`sos_${activeSos[0].id}`);
        const dId = activeSos[0].disasterId || '';
        setFormData((prev) => ({ ...prev, disasterId: dId.toString() }));
      }
    } catch (error) {
      console.error('Failed to load camp datasets:', error);
      toast.error('Unable to retrieve relief camps.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDropdownChange = (e) => {
    const val = e.target.value;
    setSelectedTargetValue(val);
    
    if (val.startsWith('disaster_')) {
      const id = parseInt(val.split('_')[1]);
      setFormData((prev) => ({ ...prev, disasterId: id.toString() }));
    } else if (val.startsWith('sos_')) {
      const sosId = parseInt(val.split('_')[1]);
      const selectedSos = assignedSosRequests.find(s => s.id === sosId);
      if (selectedSos) {
        const dId = selectedSos.disasterId || (disasters.length > 0 ? disasters[0].id : '');
        setFormData((prev) => ({ ...prev, disasterId: dId.toString() }));
      }
    }
  };

  const handleOpenCreate = () => {
    if (assignedSosRequests.length === 0) {
      toast.error('You cannot register a relief camp without an active SOS assignment.');
      return;
    }
    
    let initialTarget = '';
    let initialDisasterId = '';
    
    if (disasters.length > 0) {
      initialTarget = `disaster_${disasters[0].id}`;
      initialDisasterId = disasters[0].id.toString();
    } else if (assignedSosRequests.length > 0) {
      initialTarget = `sos_${assignedSosRequests[0].id}`;
      initialDisasterId = (assignedSosRequests[0].disasterId || '').toString();
    }

    setSelectedTargetValue(initialTarget);

    setEditMode(false);
    setCurrentCampId(null);
    setFormData({
      disasterId: initialDisasterId,
      name: '',
      address: '',
      latitude: '',
      longitude: '',
      capacity: '',
      currentOccupancy: '0',
      contactPerson: '',
      contactNumber: '',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (camp) => {
    setEditMode(true);
    setCurrentCampId(camp.id);
    setSelectedTargetValue(camp.disasterId ? `disaster_${camp.disasterId}` : '');
    setFormData({
      disasterId: camp.disasterId ? camp.disasterId.toString() : '',
      name: camp.name,
      address: camp.address,
      latitude: camp.latitude.toString(),
      longitude: camp.longitude.toString(),
      capacity: camp.capacity.toString(),
      currentOccupancy: camp.currentOccupancy.toString(),
      contactPerson: camp.contactPerson,
      contactNumber: camp.contactNumber,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { disasterId, name, address, latitude, longitude, capacity, currentOccupancy, contactPerson, contactNumber } = formData;

    if (!name || !address || !latitude || !longitude || !capacity || !contactPerson || !contactNumber) {
      toast.error('Please complete all form fields.');
      return;
    }

    const payload = {
      disasterId: disasterId ? parseInt(disasterId) : null,
      name,
      address,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      capacity: parseInt(capacity),
      currentOccupancy: parseInt(currentOccupancy),
      contactPerson,
      contactNumber,
    };

    try {
      if (editMode) {
        const updated = await campService.update(currentCampId, payload);
        toast.success('Relief camp updated successfully.');
        setCamps((prev) => prev.map((c) => (c.id === currentCampId ? updated : c)));
      } else {
        const created = await campService.create(payload);
        toast.success('New relief camp registered!');
        setCamps((prev) => [...prev, created]);
      }
      setShowModal(false);
    } catch (error) {
      console.error(error);
      toast.error('Failed to save relief camp details.');
    }
  };

  const handleCloseCamp = async (id) => {
    if (window.confirm('Are you sure you want to delete and close this relief camp? All resource logs inside will be deleted.')) {
      try {
        await campService.close(id);
        toast.success('Relief camp closed.');
        setCamps((prev) => prev.filter((c) => c.id !== id));
      } catch (error) {
        console.error(error);
        toast.error('Failed to close camp.');
      }
    }
  };

  return (
    <Container className="py-4 text-start">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="text-white mb-1">Camps Configuration Panel</h2>
          <p className="text-muted small">Establish relief shelters, configure occupancy capacity, and assign contact agents.</p>
        </div>
        <Button 
          onClick={handleOpenCreate} 
          className="btn-premium d-flex align-items-center" 
          disabled={!hasActiveSos}
        >
          <FiPlus className="me-2" /> Register Relief Camp
        </Button>
      </div>

      {!hasActiveSos && !loading && (
        <Alert variant="info" className="mb-4 bg-dark border-info border-opacity-25 text-info">
          <FiAlertTriangle className="me-2" /> <strong>Registration Disabled:</strong> Camp registration is only available when a Government Officer has created an active Disaster Alert / Warning Alert, or when an active SOS request has been assigned to your NGO.
        </Alert>
      )}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
        </div>
      ) : camps.length === 0 ? (
        <Alert variant="info" className="bg-dark border-light border-opacity-10 text-muted">
          No relief camps registered. Click the button above to register your first camp shelter.
        </Alert>
      ) : (
        <Card className="glass-panel border-0 bg-dark p-3">
          <Card.Body className="p-0">
            <div className="table-responsive">
              <Table hover variant="dark" className="align-middle bg-transparent mb-0">
                <thead>
                  <tr className="border-light border-opacity-10">
                    <th>Camp Name</th>
                    <th>Address</th>
                    <th>Disaster Reference</th>
                    <th>Occupancy</th>
                    <th>Contact Person</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {camps.map((c) => (
                    <tr key={c.id} className="border-light border-opacity-10">
                      <td className="fw-semibold small">{c.name}</td>
                      <td className="small">{c.address}</td>
                      <td className="small text-muted">{c.disasterTitle || 'General Disaster'}</td>
                      <td>
                        <Badge bg={c.currentOccupancy >= c.capacity ? 'danger' : 'success'}>
                          {c.currentOccupancy} / {c.capacity} occupied
                        </Badge>
                      </td>
                      <td className="small">
                        {c.contactPerson} <span className="text-muted d-block" style={{ fontSize: '0.75rem' }}>{c.contactNumber}</span>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <Button 
                            variant="outline-primary" 
                            size="sm"
                            onClick={() => handleOpenEdit(c)}
                            className="d-flex align-items-center gap-1 py-1"
                          >
                            <FiEdit2 size={12} /> Edit
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => handleCloseCamp(c.id)}
                            className="d-flex align-items-center gap-1 py-1"
                          >
                            <FiTrash2 size={12} /> Close
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Create/Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} contentClassName="glass-panel text-light" dialogClassName="modal-dark" centered>
        <Modal.Header closeButton closeVariant="white" className="border-light border-opacity-10 bg-dark">
          <Modal.Title className="fw-bold">{editMode ? 'Edit Relief Camp' : 'Register Relief Camp'}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark text-start">
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="campDisaster">
              <Form.Label className="text-muted small fw-semibold">Target Disaster / Reference</Form.Label>
              <Form.Select
                value={selectedTargetValue}
                onChange={handleDropdownChange}
                className="form-glass"
                required
              >
                {disasters.length > 0 && (
                  <optgroup label="Active Disasters" className="bg-dark text-white">
                    {disasters.map((d) => (
                      <option key={`disaster_${d.id}`} value={`disaster_${d.id}`} className="bg-dark">
                        {d.title}
                      </option>
                    ))}
                  </optgroup>
                )}
                {assignedSosRequests.length > 0 && (
                  <optgroup label="Assigned Victim SOS Requests" className="bg-dark text-white">
                    {assignedSosRequests.map((s) => (
                      <option key={`sos_${s.id}`} value={`sos_${s.id}`} className="bg-dark">
                        SOS: {s.victimName} ({s.disasterType} - {s.contactNumber})
                      </option>
                    ))}
                  </optgroup>
                )}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3" controlId="campName">
              <Form.Label className="text-muted small fw-semibold">Camp Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="form-glass"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="campAddress">
              <Form.Label className="text-muted small fw-semibold">Street Address</Form.Label>
              <Form.Control
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="form-glass"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="text-muted small fw-semibold">Select Location on Map (Click to pin location)</Form.Label>
              <div style={{ height: '220px', width: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                <MapContainer 
                  center={formData.latitude && formData.longitude ? [parseFloat(formData.latitude), parseFloat(formData.longitude)] : [20.5937, 78.9629]} 
                  zoom={formData.latitude && formData.longitude ? 12 : 5} 
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <MapPicker 
                    lat={formData.latitude ? parseFloat(formData.latitude) : null} 
                    lng={formData.longitude ? parseFloat(formData.longitude) : null} 
                    onChange={(lat, lng) => {
                      setFormData((prev) => ({
                        ...prev,
                        latitude: lat.toFixed(6),
                        longitude: lng.toFixed(6)
                      }));
                    }}
                  />
                </MapContainer>
              </div>
            </Form.Group>

            <Row className="mb-3">
              <Col xs={6}>
                <Form.Group controlId="campLat">
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
                <Form.Group controlId="campLong">
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

            <Row className="mb-3">
              <Col xs={6}>
                <Form.Group controlId="campCapacity">
                  <Form.Label className="text-muted small fw-semibold">Total Capacity</Form.Label>
                  <Form.Control
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    className="form-glass"
                    required
                  />
                </Form.Group>
              </Col>
              
              <Col xs={6}>
                <Form.Group controlId="campOccupancy">
                  <Form.Label className="text-muted small fw-semibold">Current Occupants</Form.Label>
                  <Form.Control
                    type="number"
                    name="currentOccupancy"
                    value={formData.currentOccupancy}
                    onChange={handleInputChange}
                    className="form-glass"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-4">
              <Col md={6}>
                <Form.Group controlId="campContact">
                  <Form.Label className="text-muted small fw-semibold">Contact Person</Form.Label>
                  <Form.Control
                    type="text"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleInputChange}
                    className="form-glass"
                    required
                  />
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group controlId="campNumber">
                  <Form.Label className="text-muted small fw-semibold">Contact Number</Form.Label>
                  <Form.Control
                    type="tel"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleInputChange}
                    className="form-glass"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="outline-light" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button type="submit" className="btn-premium">
                {editMode ? 'Save Changes' : 'Register Camp'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default NGOCamps;
