import React, { useState, useEffect } from 'react';
import { Container, Card, Row, Col, ListGroup, Button, Badge, Alert, ProgressBar, Form, Modal } from 'react-bootstrap';
import { forecastService } from '../../services/api';
import { toast } from 'react-toastify';
import { FiTrendingUp, FiAlertTriangle, FiCheckSquare, FiPlusCircle, FiActivity } from 'react-icons/fi';

const disasterTypeOptions = [
  { value: 'Flood', label: 'Flood', primaryLabel: 'Rainfall Intensity (mm)', primaryPlaceholder: 'e.g. 150', secondaryLabel: 'River Level % of FDL', secondaryPlaceholder: 'e.g. 85', primaryDetail: '24-hour cumulative', secondaryDetail: 'Gauging station warning mark' },
  { value: 'Earthquake', label: 'Earthquake', primaryLabel: 'Magnitude / Seismic Intensity', primaryPlaceholder: 'e.g. 6.5', secondaryLabel: 'Aftershock Probability (%)', secondaryPlaceholder: 'e.g. 70', primaryDetail: 'Observed or predicted magnitude', secondaryDetail: 'Short-term aftershock likelihood' },
  { value: 'Fire', label: 'Fire', primaryLabel: 'Fire Spread Intensity', primaryPlaceholder: 'e.g. 80', secondaryLabel: 'Wind / Exposure Risk (%)', secondaryPlaceholder: 'e.g. 65', primaryDetail: 'Spread severity indicator', secondaryDetail: 'Wind and nearby exposure risk' },
  { value: 'Landslide', label: 'Landslide', primaryLabel: 'Slope Saturation / Rainfall Index', primaryPlaceholder: 'e.g. 120', secondaryLabel: 'Slope Instability Risk (%)', secondaryPlaceholder: 'e.g. 88', primaryDetail: 'Soil and rainfall hazard indicator', secondaryDetail: 'Terrain instability estimate' },
  { value: 'Cyclone', label: 'Cyclone', primaryLabel: 'Wind Speed / Storm Intensity', primaryPlaceholder: 'e.g. 140', secondaryLabel: 'Storm Surge Risk (%)', secondaryPlaceholder: 'e.g. 75', primaryDetail: 'Peak sustained wind or storm index', secondaryDetail: 'Coastal surge exposure' },
  { value: 'Cloudburst', label: 'Cloudburst', primaryLabel: 'Rainfall Burst Intensity (mm)', primaryPlaceholder: 'e.g. 190', secondaryLabel: 'Flash Flood Risk (%)', secondaryPlaceholder: 'e.g. 90', primaryDetail: 'Short-duration rainfall intensity', secondaryDetail: 'Rapid runoff and drainage risk' },
  { value: 'Heatwave', label: 'Heatwave', primaryLabel: 'Temperature Severity Index', primaryPlaceholder: 'e.g. 46', secondaryLabel: 'Health Exposure Risk (%)', secondaryPlaceholder: 'e.g. 72', primaryDetail: 'Temperature and duration indicator', secondaryDetail: 'Population exposure estimate' },
  { value: 'Other', label: 'Other', primaryLabel: 'Primary Hazard Indicator', primaryPlaceholder: 'e.g. 75', secondaryLabel: 'Secondary Exposure Indicator (%)', secondaryPlaceholder: 'e.g. 60', primaryDetail: 'Main hazard severity value', secondaryDetail: 'Exposure or escalation value' },
];

const getDisasterConfig = (type) => disasterTypeOptions.find((option) => option.value === type) || disasterTypeOptions[0];

const GovForecast = () => {
  const [forecasts, setForecasts] = useState([]);
  const [selectedForecast, setSelectedForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);

  // Create Warning Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newForecast, setNewForecast] = useState({
    districtName: '',
    stateName: '',
    disasterType: 'Flood',
    rainfallIntensity: '',
    riverLevelPercentage: '',
    historicalFrequency: '',
    vulnerabilityIndex: '',
    estimatedPopulationImpact: '',
  });

  const fetchForecasts = async () => {
    try {
      const data = await forecastService.getAll();
      setForecasts(data);
      if (data.length > 0 && !selectedForecast) {
        setSelectedForecast(data[0]);
      } else if (data.length > 0) {
        // Refresh selected forecast
        const updated = data.find(f => f.id === selectedForecast.id);
        setSelectedForecast(updated || data[0]);
      } else {
        setSelectedForecast(null);
      }
    } catch (error) {
      console.error('Failed to load disaster forecasts:', error);
      toast.error('Unable to fetch early warning risk data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForecasts();
  }, []);

  const handleTriggerDisasterClick = () => {
    setShowConfirmModal(true);
  };

  const confirmTriggerDisaster = async () => {
    if (!selectedForecast) return;

    setTriggering(true);
    try {
      await forecastService.triggerDisaster(selectedForecast.id);
      toast.success('Disaster declared and emergency alerts broadcasted!');
      setShowConfirmModal(false);
      await fetchForecasts();
    } catch (error) {
      console.error(error);
      toast.error('Failed to declare disaster.');
    } finally {
      setTriggering(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewForecast((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitForecast = async (e) => {
    e.preventDefault();
    const { districtName, stateName, disasterType, rainfallIntensity, riverLevelPercentage, historicalFrequency, vulnerabilityIndex, estimatedPopulationImpact } = newForecast;

    if (!districtName || !stateName || !disasterType || !rainfallIntensity || !riverLevelPercentage || !historicalFrequency || !vulnerabilityIndex || !estimatedPopulationImpact) {
      toast.error('Please complete all form fields.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        districtName,
        stateName,
        disasterType,
        rainfallIntensity: parseFloat(rainfallIntensity),
        riverLevelPercentage: parseFloat(riverLevelPercentage),
        historicalFrequency: parseInt(historicalFrequency),
        vulnerabilityIndex: parseFloat(vulnerabilityIndex),
        estimatedPopulationImpact: parseInt(estimatedPopulationImpact),
      };

      await forecastService.create(payload);
      toast.success('Warning forecast successfully created!');
      setShowCreateModal(false);
      setNewForecast({
        districtName: '',
        stateName: '',
        disasterType: 'Flood',
        rainfallIntensity: '',
        riverLevelPercentage: '',
        historicalFrequency: '',
        vulnerabilityIndex: '',
        estimatedPopulationImpact: '',
      });
      await fetchForecasts();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to create warning forecast.');
    } finally {
      setSubmitting(false);
    }
  };

  const getRiskBadgeColor = (category) => {
    switch (category) {
      case 'Critical': return 'danger';
      case 'High': return 'warning';
      case 'Medium': return 'info';
      default: return 'success';
    }
  };

  const getChecklist = (forecast) => {
    if (!forecast) return [];
    const disasterType = forecast.disasterType || 'Disaster';
    
    const checklist = [
      { text: `Mobilize response volunteers for ${disasterType.toLowerCase()} risk in ${forecast.districtName}`, checked: forecast.riskScore > 50 },
      { text: `Pre-position critical supplies and emergency kits near ${forecast.districtName}`, checked: forecast.riskScore > 60 },
      { text: `Broadcast early warning notification to citizens in the district`, checked: forecast.riskScore > 40 },
      { text: `Deploy specialist assessment teams for ${disasterType.toLowerCase()}-prone zones`, checked: forecast.riskScore > 70 },
      { text: `Route NDRF / SDRF teams to high-risk areas`, checked: forecast.riskScore > 80 },
    ];

    return checklist;
  };

  return (
    <Container className="py-4 text-start">
      {/* Page Header Banner */}
      <div 
        className="page-header-banner mb-4 shadow-sm"
        style={{ minHeight: '140px' }}
      >
        <img src="/images/prediction_header.png" alt="forecast background" />
        <div className="content w-100 d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <h2 style={{ color: '#ffffff', fontFamily: 'var(--font-heading)' }}>Disaster Prediction &amp; Early Warning</h2>
            <p style={{ color: 'rgba(255,255,255,0.75)', marginBottom: 0, fontSize: '0.88rem' }}>Create early warnings for floods, earthquakes, fires, landslides, cyclones, and other district-level hazards.</p>
          </div>
          <Button 
            className="btn-premium d-flex align-items-center gap-2 py-2 px-3 flex-shrink-0"
            onClick={() => setShowCreateModal(true)}
          >
            <FiPlusCircle /> Create Warning Forecast
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
        </div>
      ) : forecasts.length === 0 ? (
        <Alert variant="info">
          All monitored districts are currently operating under safe meteorological and hydrological levels. No active alerts.
        </Alert>
      ) : (
        <Row className="g-4">
          {/* Left panel: List of forecasts */}
          <Col lg={5}>
            <h5 className="mb-3 d-flex align-items-center" style={{ color: 'var(--accent-blue)' }}>
              <FiActivity style={{ color: 'var(--accent-indigo)', marginRight: '8px' }} /> Monitored Districts at Risk
            </h5>
            
            <div className="d-flex flex-column gap-3">
              {forecasts.map((f) => (
                <Card 
                  key={f.id} 
                  onClick={() => setSelectedForecast(f)}
                  className={`glass-panel glass-panel-hover border-0 ${selectedForecast?.id === f.id ? 'border-start border-4 border-primary' : ''}`}
                  style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                >
                  <Card.Body className="p-3">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <h6 className="mb-0 fw-bold" style={{ color: 'var(--accent-blue)' }}>{f.districtName}</h6>
                        <small style={{ color: 'var(--text-muted)' }}>{f.stateName}, India - {f.disasterType || 'Disaster'}</small>
                      </div>
                      <Badge bg={getRiskBadgeColor(f.riskCategory)} className="py-1 px-2">
                        {f.riskCategory} Risk
                      </Badge>
                    </div>

                    <div className="mt-3">
                      <div className="d-flex justify-content-between small mb-1">
                        <span style={{ color: 'var(--text-muted)' }}>Computed Risk Score</span>
                        <span className="fw-semibold" style={{ color: 'var(--accent-blue)' }}>{f.riskScore.toFixed(1)}%</span>
                      </div>
                      <ProgressBar 
                        variant={getRiskBadgeColor(f.riskCategory)} 
                        now={f.riskScore} 
                        style={{ height: '6px' }}
                        className="bg-secondary bg-opacity-20"
                      />
                    </div>
                  </Card.Body>
                </Card>
              ))}
            </div>
          </Col>

          {/* Right panel: Details & Checklist */}
          <Col lg={7}>
            {selectedForecast ? (
              <Card className="glass-panel border-0 p-0 overflow-hidden">
                <img 
                  src="/images/prediction_header.png" 
                  alt="Risk Prediction Telemetry" 
                  className="w-100" 
                  style={{ height: '140px', objectFit: 'cover', borderBottom: '1px solid var(--border-glass)' }}
                />
                <div className="p-4">
                  <Card.Body className="p-0">
                    {(() => {
                      const selectedConfig = getDisasterConfig(selectedForecast.disasterType);
                      return (
                        <>
                    <div className="d-flex justify-content-between align-items-start border-bottom pb-3 mb-4" style={{ borderColor: 'var(--border-glass)' }}>
                      <div>
                        <h4 className="fw-bold mb-1" style={{ color: 'var(--accent-blue)' }}>{selectedForecast.districtName}</h4>
                        <p className="text-muted small mb-0">{selectedForecast.stateName} State - {selectedForecast.disasterType || 'Disaster'} Warning - Forecast Refreshed Recently</p>
                      </div>
                      <div className="text-end">
                        <h2 className="fw-bold text-primary mb-0">{selectedForecast.riskScore.toFixed(1)}%</h2>
                        <small className="text-muted">Total Risk Index</small>
                      </div>
                    </div>

                    <Row className="g-3 mb-4">
                      <Col md={6}>
                        <div className="p-3 rounded-3" style={{ backgroundColor: '#f0f4f8' }}>
                          <span className="text-muted small d-block">{selectedConfig.primaryLabel}</span>
                          <h5 className="fw-bold mb-0" style={{ color: 'var(--accent-blue)' }}>{selectedForecast.rainfallIntensity}</h5>
                          <small className="text-muted">{selectedConfig.primaryDetail}</small>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="p-3 rounded-3" style={{ backgroundColor: '#f0f4f8' }}>
                          <span className="text-muted small d-block">{selectedConfig.secondaryLabel}</span>
                          <h5 className="fw-bold mb-0" style={{ color: 'var(--accent-blue)' }}>{selectedForecast.riverLevelPercentage}%</h5>
                          <small className="text-muted">{selectedConfig.secondaryDetail}</small>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="p-3 rounded-3" style={{ backgroundColor: '#f0f4f8' }}>
                          <span className="text-muted small d-block">Vulnerability Index</span>
                          <h5 className="fw-bold mb-0" style={{ color: 'var(--accent-blue)' }}>{selectedForecast.vulnerabilityIndex}</h5>
                          <small className="text-muted">Socio-economic &amp; topography factors</small>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="p-3 rounded-3" style={{ backgroundColor: '#f0f4f8' }}>
                          <span className="text-muted small d-block">Est. Population Impact</span>
                          <h5 className="fw-bold mb-0" style={{ color: 'var(--accent-blue)' }}>{selectedForecast.estimatedPopulationImpact.toLocaleString()}</h5>
                          <small className="text-muted">Residents in low-elevation zones</small>
                        </div>
                      </Col>
                    </Row>
                        </>
                      );
                    })()}

                    <h5 className="mb-3 d-flex align-items-center" style={{ color: 'var(--accent-blue)' }}>
                      <FiCheckSquare style={{ color: 'var(--accent-indigo)', marginRight: '8px' }} /> Preparedness Checklist
                    </h5>
                    <ListGroup className="bg-transparent border-0 mb-4 text-start">
                      {getChecklist(selectedForecast).map((item, index) => (
                        <ListGroup.Item key={index} className="bg-transparent border-0 px-0 py-2 d-flex align-items-start gap-3">
                          <Form.Check 
                            type="checkbox" 
                            id={`checklist-${index}`}
                            checked={item.checked}
                            disabled
                            className="mt-1"
                          />
                          <div>
                            <span className={item.checked ? 'fw-semibold' : 'text-muted'} style={{ color: item.checked ? 'var(--accent-blue)' : undefined }}>
                              {item.text}
                            </span>
                            <span className="text-muted d-block small" style={{ fontSize: '0.75rem' }}>
                              {item.checked ? 'Recommended immediate action.' : 'Advisory: Optional action.'}
                            </span>
                          </div>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>

                    <div className="border-top pt-4 mt-2 d-flex justify-content-between align-items-center" style={{ borderColor: 'var(--border-glass)' }}>
                      <div className="text-start">
                        <p className="mb-0 text-muted small"><FiAlertTriangle className="text-warning me-1" /> Escalation Warning</p>
                        <span className="small text-muted" style={{ fontSize: '0.75rem' }}>This initiates a warning incident in the command center.</span>
                      </div>
                      
                      <Button 
                        onClick={handleTriggerDisasterClick}
                        disabled={triggering}
                        className="btn-premium d-flex align-items-center gap-2 py-2 px-3"
                      >
                        <FiPlusCircle /> {triggering ? 'Declaring Incident...' : 'Trigger Disaster Alert'}
                      </Button>
                    </div>
                  </Card.Body>
                </div>
              </Card>
            ) : (
              <div className="text-center py-5">
                <p className="text-muted">Select a district to view early warning checklist logs.</p>
              </div>
            )}
          </Col>
        </Row>
      )}

      {/* Create Warning Modal */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold" style={{ color: 'var(--accent-blue)' }}>Create Warning Forecast</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-start">
          <Form onSubmit={handleSubmitForecast}>
            <Form.Group className="mb-3" controlId="forecastDisasterType">
              <Form.Label className="text-muted small fw-semibold">Disaster Type</Form.Label>
              <Form.Select
                name="disasterType"
                value={newForecast.disasterType}
                onChange={handleInputChange}
                className="form-glass"
                required
              >
                {disasterTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </Form.Select>
            </Form.Group>

            <Row className="g-3">
              <Col md={6}>
                <Form.Group className="mb-3" controlId="forecastDistrict">
                  <Form.Label className="text-muted small fw-semibold">District Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="districtName"
                    placeholder="e.g. Wayanad"
                    value={newForecast.districtName}
                    onChange={handleInputChange}
                    className="form-glass"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="forecastState">
                  <Form.Label className="text-muted small fw-semibold">State Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="stateName"
                    placeholder="e.g. Kerala"
                    value={newForecast.stateName}
                    onChange={handleInputChange}
                    className="form-glass"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="g-3">
              {(() => {
                const formConfig = getDisasterConfig(newForecast.disasterType);
                return (
                  <>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="forecastRainfall">
                  <Form.Label className="text-muted small fw-semibold">{formConfig.primaryLabel}</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.1"
                    name="rainfallIntensity"
                    placeholder={formConfig.primaryPlaceholder}
                    value={newForecast.rainfallIntensity}
                    onChange={handleInputChange}
                    className="form-glass"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="forecastRiver">
                  <Form.Label className="text-muted small fw-semibold">{formConfig.secondaryLabel}</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.1"
                    name="riverLevelPercentage"
                    placeholder={formConfig.secondaryPlaceholder}
                    value={newForecast.riverLevelPercentage}
                    onChange={handleInputChange}
                    className="form-glass"
                    required
                  />
                </Form.Group>
              </Col>
                  </>
                );
              })()}
            </Row>

            <Row className="g-3">
              <Col md={6}>
                <Form.Group className="mb-3" controlId="forecastHistory">
                  <Form.Label className="text-muted small fw-semibold">Historical Frequency (1-10)</Form.Label>
                  <Form.Control
                    type="number"
                    name="historicalFrequency"
                    placeholder="e.g. 4"
                    value={newForecast.historicalFrequency}
                    onChange={handleInputChange}
                    className="form-glass"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="forecastVulnerability">
                  <Form.Label className="text-muted small fw-semibold">Vulnerability Index (0.0 - 1.0)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    name="vulnerabilityIndex"
                    placeholder="e.g. 0.85"
                    value={newForecast.vulnerabilityIndex}
                    onChange={handleInputChange}
                    className="form-glass"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-4" controlId="forecastImpact">
              <Form.Label className="text-muted small fw-semibold">Estimated Population Impact</Form.Label>
              <Form.Control
                type="number"
                name="estimatedPopulationImpact"
                placeholder="e.g. 45000"
                value={newForecast.estimatedPopulationImpact}
                onChange={handleInputChange}
                className="form-glass"
                required
              />
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="outline-secondary" onClick={() => setShowCreateModal(false)}>Cancel</Button>
              <Button type="submit" className="btn-premium" disabled={submitting}>
                {submitting ? 'Creating...' : 'Create Forecast'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Confirm Escalation Modal */}
      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold text-danger d-flex align-items-center gap-2">
            <FiAlertTriangle /> Confirm Escalation
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-start">
          <p>
            Are you sure you want to escalate this warning and declare an active disaster incident for <strong>{selectedForecast?.districtName}</strong>?
          </p>
          <p className="text-muted small">
            This action is irreversible. It will notify all registered NGOs and volunteers, route rescue teams, and create an active disaster incident entry in the system.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowConfirmModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={confirmTriggerDisaster}
            disabled={triggering}
          >
            {triggering ? 'Escalating...' : 'Confirm Escalation'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default GovForecast;
