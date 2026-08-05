import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Badge, Alert, Modal } from 'react-bootstrap';
import { missingPersonService } from '../../services/api';
import { toast } from 'react-toastify';
import { FiUser, FiMapPin, FiActivity, FiSearch, FiCheck } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const VictimMissingPersons = () => {
  const { user } = useAuth();
  const [persons, setPersons] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Male',
    lastSeenLocation: '',
    description: '',
    photoBase64: '',
  });

  const fetchPersons = async () => {
    try {
      const list = await missingPersonService.getAll();
      setPersons(list);
    } catch (error) {
      console.error('Failed to load missing persons list:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPersons();
  }, []);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, photoBase64: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    const { name, age, gender, lastSeenLocation, description, photoBase64 } = formData;

    if (!name || !age || !gender || !lastSeenLocation || !description) {
      toast.error('Please complete all required fields.');
      return;
    }

    try {
      const payload = {
        name,
        age: parseInt(age),
        gender,
        lastSeenLocation,
        description,
        photoBase64,
      };

      const result = await missingPersonService.report(payload);
      toast.success('Missing person reported successfully!');
      setPersons((prev) => [result, ...prev]);
      setShowModal(false);
      
      // Reset form
      setFormData({
        name: '',
        age: '',
        gender: 'Male',
        lastSeenLocation: '',
        description: '',
        photoBase64: '',
      });
    } catch (error) {
      console.error(error);
      toast.error('Failed to register report.');
    }
  };

  const handleMarkAsFound = async (id) => {
    if (window.confirm('Mark this person as found?')) {
      try {
        await missingPersonService.updateStatus(id, 'Found');
        toast.success('Person status updated to Found.');
        setPersons((prev) =>
          prev.map((p) => (p.id === id ? { ...p, status: 'Found' } : p))
        );
      } catch (error) {
        console.error(error);
        toast.error('Failed to update status.');
      }
    }
  };

  const filteredPersons = persons.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.lastSeenLocation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Container className="py-4 text-start">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="text-white mb-1">Missing Persons Registry</h2>
          <p className="text-muted small">File alerts for missing friends and families, and help list updates.</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="btn-premium">
          Report Missing Person
        </Button>
      </div>

      {/* Search Filter */}
      <div className="position-relative mb-4" style={{ maxWidth: '400px' }}>
        <FiSearch className="position-absolute text-muted" style={{ top: '14px', left: '14px' }} />
        <Form.Control
          type="text"
          placeholder="Search by name or last seen location..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="form-glass ps-5"
        />
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
        </div>
      ) : filteredPersons.length === 0 ? (
        <Alert variant="info" className="bg-dark border-light border-opacity-10 text-muted">
          No missing persons logged matching your query.
        </Alert>
      ) : (
        <Row className="g-4">
          {filteredPersons.map((p) => (
            <Col key={p.id} sm={6} md={4} lg={3}>
              <Card className="glass-panel border-0 bg-dark h-100 text-start overflow-hidden">
                <div style={{ height: '200px', width: '100%', background: '#f1f5f9', position: 'relative' }}>
                  {p.photo && p.photo !== '/uploads/default.jpg' ? (
                    <img 
                      src={`http://localhost:5143${p.photo}`} 
                      alt={p.name}
                      style={{ objectFit: 'cover', height: '100%', width: '100%' }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200';
                      }}
                    />
                  ) : (
                    <div className="d-flex justify-content-center align-items-center h-100 text-muted">
                      <FiUser size={64} />
                    </div>
                  )}
                  <div className="position-absolute top-0 end-0 m-2">
                    <Badge bg={p.status === 'Missing' ? 'danger' : 'success'}>
                      {p.status}
                    </Badge>
                  </div>
                </div>
                <Card.Body className="p-3 d-flex flex-column justify-content-between">
                  <div>
                    <h6 className="text-white fw-bold mb-1">{p.name} ({p.age} yrs, {p.gender})</h6>
                    <p className="text-muted small mb-2 d-flex align-items-start gap-1">
                      <FiMapPin size={12} className="mt-1" />
                      <span>Last seen: {p.lastSeenLocation}</span>
                    </p>
                    <p className="text-muted small mb-3 text-truncate" style={{ fontSize: '0.8rem' }}>
                      {p.description}
                    </p>
                  </div>
                  
                  {p.status === 'Missing' && (p.reporterId === user?.id || user?.roleName === 'NGO' || user?.roleName === 'Admin') && (
                    <Button 
                      variant="outline-success" 
                      size="sm" 
                      onClick={() => handleMarkAsFound(p.id)}
                      className="w-100 d-flex align-items-center justify-content-center"
                    >
                      <FiCheck className="me-1" /> Mark as Found
                    </Button>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Report Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} contentClassName="glass-panel text-light" dialogClassName="modal-dark" centered>
        <Modal.Header closeButton closeVariant="white" className="border-light border-opacity-10 bg-dark">
          <Modal.Title className="fw-bold">Report Missing Individual</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark">
          <Form onSubmit={handleSubmitReport}>
            <Form.Group className="mb-3" controlId="reportName">
              <Form.Label className="text-muted small fw-semibold">Full Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="form-glass"
                required
              />
            </Form.Group>

            <Row className="mb-3">
              <Col xs={6}>
                <Form.Group controlId="reportAge">
                  <Form.Label className="text-muted small fw-semibold">Age</Form.Label>
                  <Form.Control
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    className="form-glass"
                    required
                  />
                </Form.Group>
              </Col>
              
              <Col xs={6}>
                <Form.Group controlId="reportGender">
                  <Form.Label className="text-muted small fw-semibold">Gender</Form.Label>
                  <Form.Select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="form-glass"
                    required
                  >
                    <option value="Male" className="bg-dark">Male</option>
                    <option value="Female" className="bg-dark">Female</option>
                    <option value="Other" className="bg-dark">Other</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3" controlId="reportLastSeen">
              <Form.Label className="text-muted small fw-semibold">Last Seen Location</Form.Label>
              <Form.Control
                type="text"
                name="lastSeenLocation"
                placeholder="E.g. Oakridge High School Shelter / Sector 4 Bridge"
                value={formData.lastSeenLocation}
                onChange={handleInputChange}
                className="form-glass"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="reportDescription">
              <Form.Label className="text-muted small fw-semibold">Physical Description / Clothing Details</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="description"
                placeholder="E.g. Wearing a blue hoodie, black cap, approximately 5ft 8in."
                value={formData.description}
                onChange={handleInputChange}
                className="form-glass"
                required
              />
            </Form.Group>

            <Form.Group className="mb-4" controlId="reportPhoto">
              <Form.Label className="text-muted small fw-semibold">Upload Photo</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="form-glass"
              />
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="outline-light" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button type="submit" className="btn-premium">Submit Report</Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default VictimMissingPersons;
