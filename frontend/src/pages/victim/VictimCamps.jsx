import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert, ListGroup, Badge, Button } from 'react-bootstrap';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { campService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { FiHome, FiMapPin, FiPhone, FiUser, FiCheckCircle, FiLogOut } from 'react-icons/fi';
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

const VictimCamps = () => {
  const { user, refreshProfile } = useAuth();
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCamp, setSelectedCamp] = useState(null);
  const [mapCenter, setMapCenter] = useState([37.7749, -122.4194]);
  const [mapZoom, setMapZoom] = useState(4);
  const [submitting, setSubmitting] = useState(false);

  const handleRegister = async (campId) => {
    setSubmitting(true);
    try {
      const res = await campService.register(campId);
      toast.success(res.message || 'Successfully registered in this camp.');
      await refreshProfile();
      
      // Update camps list to show updated occupancy
      const data = await campService.getAll();
      setCamps(data);
      const updatedCamp = data.find(c => c.id === campId);
      if (updatedCamp) {
        setSelectedCamp(updatedCamp);
      }
    } catch (error) {
      console.error(error);
      const errMsg = error.response?.data?.message || 'Failed to register in camp.';
      toast.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLeave = async () => {
    setSubmitting(true);
    try {
      const res = await campService.leave();
      toast.success(res.message || 'Successfully left the camp.');
      await refreshProfile();
      
      // Update camps list to show updated occupancy
      const data = await campService.getAll();
      setCamps(data);
      if (selectedCamp) {
        const updatedCamp = data.find(c => c.id === selectedCamp.id);
        if (updatedCamp) {
          setSelectedCamp(updatedCamp);
        }
      }
    } catch (error) {
      console.error(error);
      const errMsg = error.response?.data?.message || 'Failed to leave camp.';
      toast.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchCamps = async () => {
      try {
        const data = await campService.getAll();
        setCamps(data);
        if (data.length > 0) {
          setSelectedCamp(data[0]);
          setMapCenter([data[0].latitude, data[0].longitude]);
          setMapZoom(12);
        }
      } catch (error) {
        console.error('Failed to load camps:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCamps();
  }, []);

  const handleSelectCamp = (camp) => {
    setSelectedCamp(camp);
    setMapCenter([camp.latitude, camp.longitude]);
    setMapZoom(14);
  };

  const getOccupancyColor = (current, max) => {
    const ratio = current / max;
    if (ratio >= 0.9) return 'danger';
    if (ratio >= 0.7) return 'warning';
    return 'success';
  };

  return (
    <Container className="py-4 text-start">
      <h2 className="text-white mb-1">Relief Camps Directory</h2>
      <p className="text-muted small mb-4">View active shelters, occupancy metrics, and find paths on the map.</p>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
        </div>
      ) : camps.length === 0 ? (
        <Alert variant="info" className="bg-dark border-light border-opacity-10 text-muted">
          No registered relief camps are currently running.
        </Alert>
      ) : (
        <Row className="g-4">
          {/* Camps List */}
          <Col lg={5}>
            <Card className="glass-panel border-0 bg-dark p-3 h-100" style={{ maxHeight: '600px', overflowY: 'auto' }}>
              <Card.Body className="p-0">
                <h5 className="text-white mb-3 d-flex align-items-center">
                  <FiHome className="text-primary me-2" /> Camps List ({camps.length})
                </h5>
                <ListGroup variant="flush" className="bg-transparent rounded border border-light border-opacity-10 overflow-hidden">
                  {camps.map((c) => (
                    <ListGroup.Item
                      key={c.id}
                      action
                      onClick={() => handleSelectCamp(c)}
                      className={`border-light border-opacity-10 py-3 px-3 text-light bg-transparent ${
                        selectedCamp?.id === c.id ? 'bg-primary bg-opacity-10 border-start border-primary border-3' : ''
                      }`}
                    >
                      <div className="d-flex justify-content-between align-items-start mb-1">
                        <h6 className="mb-0 text-white fw-bold small">
                          {c.name}
                          {user?.campId === c.id && (
                            <Badge bg="success" className="ms-2" style={{ fontSize: '0.65rem' }}>Registered</Badge>
                          )}
                        </h6>
                        <Badge bg={getOccupancyColor(c.currentOccupancy, c.capacity)}>
                          {c.currentOccupancy} / {c.capacity} occupied
                        </Badge>
                      </div>
                      <p className="text-muted small mb-2 d-flex align-items-center gap-1">
                        <FiMapPin size={12} /> {c.address}
                      </p>
                      <div className="d-flex gap-3 text-muted" style={{ fontSize: '0.75rem' }}>
                        <span className="d-flex align-items-center gap-1">
                          <FiUser size={12} /> {c.contactPerson}
                        </span>
                        <span className="d-flex align-items-center gap-1">
                          <FiPhone size={12} /> {c.contactNumber}
                        </span>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Card.Body>
            </Card>
          </Col>

          {/* Map & Detail View */}
          <Col lg={7}>
            <Card className="glass-panel border-0 bg-dark p-2 mb-4">
              <Card.Body className="p-0">
                <MapContainer center={mapCenter} zoom={mapZoom} style={{ height: '400px', width: '100%' }} key={`${mapCenter[0]}-${mapCenter[1]}`}>
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  {camps.map((c) => (
                    <Marker key={c.id} position={[c.latitude, c.longitude]}>
                      <Popup>
                        <div className="text-dark">
                          <strong>{c.name}</strong>
                          <p className="mb-0 text-muted">{c.address}</p>
                          <small className="d-block mt-1">Occupancy: {c.currentOccupancy}/{c.capacity}</small>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </Card.Body>
            </Card>

            {selectedCamp && (
              <Card className="glass-panel border-0 bg-dark p-3">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h5 className="text-white mb-0">{selectedCamp.name}</h5>
                    {user?.campId === selectedCamp.id ? (
                      <Button 
                        variant="outline-danger" 
                        size="sm" 
                        disabled={submitting}
                        onClick={handleLeave}
                        className="d-flex align-items-center gap-1"
                      >
                        <FiLogOut size={14} /> Leave Camp
                      </Button>
                    ) : (
                      <Button 
                        variant="success" 
                        size="sm" 
                        disabled={submitting || selectedCamp.currentOccupancy >= selectedCamp.capacity}
                        onClick={() => handleRegister(selectedCamp.id)}
                        className="d-flex align-items-center gap-1"
                      >
                        <FiCheckCircle size={14} /> 
                        {user?.campId ? 'Transfer to Camp' : 'Register in Camp'}
                      </Button>
                    )}
                  </div>
                  <p className="text-muted small mb-3">{selectedCamp.address}</p>
                  <Row className="gy-3 text-muted small">
                    <Col xs={6} md={3}>
                      <span className="text-white fw-bold d-block">Capacity limit</span>
                      {selectedCamp.capacity} persons
                    </Col>
                    <Col xs={6} md={3}>
                      <span className="text-white fw-bold d-block">Current occupancy</span>
                      {selectedCamp.currentOccupancy} persons
                    </Col>
                    <Col xs={6} md={3}>
                      <span className="text-white fw-bold d-block">Contact point</span>
                      {selectedCamp.contactPerson}
                    </Col>
                    <Col xs={6} md={3}>
                      <span className="text-white fw-bold d-block">Helpline phone</span>
                      {selectedCamp.contactNumber}
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            )}
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default VictimCamps;
