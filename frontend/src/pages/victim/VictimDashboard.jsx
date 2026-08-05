import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { disasterService, campService, hazardReportService } from '../../services/api';
import { FiAlertTriangle, FiHome, FiMapPin, FiArrowRight } from 'react-icons/fi';
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

const VictimDashboard = () => {
  const [disasters, setDisasters] = useState([]);
  const [camps, setCamps] = useState([]);
  const [hazards, setHazards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const disastersList = await disasterService.getAll(true);
        const campsList = await campService.getAll();
        setDisasters(disastersList);
        setCamps(campsList);
        try {
          const hazardList = await hazardReportService.getAll();
          setHazards(hazardList);
        } catch (err) {
          console.warn('Could not load hazard markers:', err);
        }
      } catch (error) {
        console.error('Error fetching dashboard datasets:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Critical': return { bg: '#fed7d7', color: '#9b2c2c', dot: '#c53030' };
      case 'High': return { bg: '#feebc8', color: '#9c4221', dot: '#f59e0b' };
      case 'Medium': return { bg: '#ebf8ff', color: '#2b6cb0', dot: '#3b82f6' };
      default: return { bg: '#f0fff4', color: '#22543d', dot: '#10b981' };
    }
  };

  return (
    <Container className="py-4 text-start">

      {/* Page Header Banner */}
      <div 
        className="page-header-banner mb-4 shadow-sm"
        style={{ minHeight: '140px' }}
      >
        <img src="/images/flood_5.jpeg" alt="emergency background" />
        <div className="content w-100 d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <h2 style={{ color: '#ffffff', fontFamily: 'var(--font-heading)' }}>Emergency Victim Control Center</h2>
            <p style={{ color: 'rgba(255,255,255,0.75)', marginBottom: 0, fontSize: '0.88rem' }}>
              Stay informed of disasters, local camp status, and request urgent aid.
            </p>
          </div>
          <Button 
            as={Link} 
            to="/victim/sos" 
            className="btn-sos flex-shrink-0"
            style={{ width: '120px', height: '120px', fontSize: '1.1rem' }}
          >
            TAP SOS
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-3 text-muted small">Loading live data…</p>
        </div>
      ) : (
        <Row className="g-4">
          {/* Map Section */}
          <Col lg={8}>
            <Card className="glass-panel border-0 mb-4">
              <Card.Header className="bg-transparent border-0 d-flex align-items-center gap-2 pb-0 pt-3 px-3">
                <FiMapPin style={{ color: 'var(--accent-indigo)' }} />
                <h6 className="fw-bold mb-0" style={{ color: 'var(--accent-blue)' }}>Live Disaster &amp; Camps Map</h6>
              </Card.Header>
              <Card.Body className="p-2">
                <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: '420px', width: '100%' }}>
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  {disasters.map((d) => (
                    <Marker key={`dis-${d.id}`} position={[d.latitude, d.longitude]}>
                      <Popup>
                        <div>
                          <strong>🚨 {d.title}</strong>
                          <p className="mb-1" style={{ color: '#666', fontSize: '0.85rem' }}>{d.type} · {d.severity}</p>
                          <small style={{ color: '#888' }}>{d.description}</small>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                  {camps.map((c) => (
                    <Marker key={`camp-${c.id}`} position={[c.latitude, c.longitude]}>
                      <Popup>
                        <div>
                          <strong>⛺ {c.name}</strong>
                          <p className="mb-1" style={{ color: '#666', fontSize: '0.85rem' }}>Capacity: {c.currentOccupancy}/{c.capacity}</p>
                          <small style={{ color: '#888' }}>Contact: {c.contactPerson} ({c.contactNumber})</small>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                  {hazards.map((h) => (
                    <Marker key={`hz-${h.id}`} position={[h.latitude, h.longitude]}>
                      <Popup>
                        <div>
                          <strong>⚠️ {h.hazardType}</strong>
                          <p className="mb-1" style={{ color: '#666', fontSize: '0.85rem' }}>{h.description}</p>
                          <small style={{ color: '#888' }}>Reported by {h.reporterName}</small>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </Card.Body>
            </Card>

            {/* Quick Action Cards */}
            <Row className="g-3">
              <Col sm={6}>
                <Card 
                  as={Link} 
                  to="/victim/camps"
                  className="glass-panel glass-panel-hover border-0 p-3 text-decoration-none"
                >
                  <div className="d-flex align-items-center gap-3">
                    <div 
                      className="d-flex align-items-center justify-content-center rounded-3"
                      style={{ width: '48px', height: '48px', backgroundColor: 'rgba(16,185,129,0.1)', color: '#10b981', flexShrink: 0 }}
                    >
                      <FiHome size={22} />
                    </div>
                    <div>
                      <h6 className="fw-bold mb-0" style={{ color: 'var(--accent-blue)' }}>Find Relief Camps</h6>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{camps.length} camps available</span>
                    </div>
                    <FiArrowRight style={{ color: 'var(--text-muted)', marginLeft: 'auto' }} />
                  </div>
                </Card>
              </Col>
              <Col sm={6}>
                <Card 
                  as={Link} 
                  to="/victim/missing-persons"
                  className="glass-panel glass-panel-hover border-0 p-3 text-decoration-none"
                >
                  <div className="d-flex align-items-center gap-3">
                    <div 
                      className="d-flex align-items-center justify-content-center rounded-3"
                      style={{ width: '48px', height: '48px', backgroundColor: 'rgba(139,92,246,0.1)', color: '#8b5cf6', flexShrink: 0 }}
                    >
                      <FiAlertTriangle size={22} />
                    </div>
                    <div>
                      <h6 className="fw-bold mb-0" style={{ color: 'var(--accent-blue)' }}>Missing Persons</h6>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Search or report</span>
                    </div>
                    <FiArrowRight style={{ color: 'var(--text-muted)', marginLeft: 'auto' }} />
                  </div>
                </Card>
              </Col>
              <Col sm={12}>
                <Card 
                  as={Link} 
                  to="/hazard-map"
                  className="glass-panel glass-panel-hover border-0 p-3 text-decoration-none"
                >
                  <div className="d-flex align-items-center gap-3">
                    <div 
                      className="d-flex align-items-center justify-content-center rounded-3"
                      style={{ width: '48px', height: '48px', backgroundColor: 'rgba(197,48,48,0.1)', color: '#c53030', flexShrink: 0 }}
                    >
                      <FiMapPin size={22} />
                    </div>
                    <div>
                      <h6 className="fw-bold mb-0" style={{ color: 'var(--accent-blue)' }}>Report a Blocked Road or Bridge</h6>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{hazards.length} active hazard marker{hazards.length === 1 ? '' : 's'} nearby</span>
                    </div>
                    <FiArrowRight style={{ color: 'var(--text-muted)', marginLeft: 'auto' }} />
                  </div>
                </Card>
              </Col>
            </Row>
          </Col>

          {/* Side Info Cards */}
          <Col lg={4}>
            {/* Active Disasters List */}
            <Card className="glass-panel border-0 mb-3" style={{ maxHeight: '300px', overflowY: 'auto' }}>
              <Card.Header className="bg-transparent border-0 d-flex align-items-center gap-2 pb-0">
                <FiAlertTriangle style={{ color: '#c53030' }} size={16} />
                <h6 className="fw-bold mb-0" style={{ color: 'var(--accent-blue)', fontSize: '0.9rem' }}>
                  Active Advisories 
                  {disasters.length > 0 && <Badge bg="danger" pill className="ms-2" style={{ fontSize: '0.65rem' }}>{disasters.length}</Badge>}
                </h6>
              </Card.Header>
              <Card.Body className="p-3">
                {disasters.length === 0 ? (
                  <div className="text-center py-3">
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 0 }}>No active disasters tracked.</p>
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-2">
                    {disasters.map((d) => {
                      const sc = getSeverityColor(d.severity);
                      return (
                        <div 
                          key={d.id} 
                          className="p-2 rounded-3"
                          style={{ backgroundColor: sc.bg, border: `1px solid ${sc.dot}30` }}
                        >
                          <div className="d-flex align-items-center gap-2 mb-1">
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: sc.dot, flexShrink: 0 }} />
                            <span style={{ color: sc.color, fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>{d.severity}</span>
                          </div>
                          <h6 style={{ color: 'var(--accent-blue)', marginBottom: '2px', fontSize: '0.85rem', fontWeight: 700 }}>{d.title}</h6>
                          <p style={{ color: 'var(--text-muted)', marginBottom: 0, fontSize: '0.78rem' }} className="text-truncate">{d.description}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card.Body>
            </Card>

            {/* Relief Camps */}
            <Card className="glass-panel border-0" style={{ maxHeight: '340px', overflowY: 'auto' }}>
              <Card.Header className="bg-transparent border-0 d-flex align-items-center gap-2 pb-0">
                <FiHome style={{ color: '#3b82f6' }} size={16} />
                <h6 className="fw-bold mb-0" style={{ color: 'var(--accent-blue)', fontSize: '0.9rem' }}>
                  Local Shelter Camps
                  {camps.length > 0 && <Badge bg="primary" pill className="ms-2" style={{ fontSize: '0.65rem' }}>{camps.length}</Badge>}
                </h6>
              </Card.Header>
              <Card.Body className="p-3">
                {camps.length === 0 ? (
                  <div className="text-center py-3">
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 0 }}>No registered relief camps.</p>
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-2">
                    {camps.map((c) => {
                      const pct = Math.min((c.currentOccupancy / c.capacity) * 100, 100);
                      const barColor = pct > 80 ? '#c53030' : pct > 60 ? '#f59e0b' : '#10b981';
                      return (
                        <div key={c.id} className="p-2 rounded-3" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                          <h6 style={{ color: 'var(--accent-blue)', marginBottom: '2px', fontSize: '0.85rem', fontWeight: 700 }}>{c.name}</h6>
                          <p style={{ color: 'var(--text-muted)', marginBottom: '6px', fontSize: '0.78rem' }}>{c.address}</p>
                          <div className="d-flex align-items-center gap-2">
                            <div className="flex-grow-1" style={{ height: '5px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{ width: `${pct}%`, height: '100%', backgroundColor: barColor, borderRadius: '3px', transition: 'width 0.4s ease' }} />
                            </div>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', flexShrink: 0 }}>
                              {c.currentOccupancy}/{c.capacity}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default VictimDashboard;
