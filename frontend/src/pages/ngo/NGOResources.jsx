import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Button, Badge, Modal, Form, Row, Col, Alert } from 'react-bootstrap';
import { campService, resourceService } from '../../services/api';
import { toast } from 'react-toastify';
import { FiArchive, FiPlus, FiEdit, FiTrash2, FiAlertOctagon } from 'react-icons/fi';

const NGOResources = () => {
  const [camps, setCamps] = useState([]);
  const [selectedCampId, setSelectedCampId] = useState('');
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingResources, setLoadingResources] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [quantityModal, setQuantityModal] = useState(false);
  const [activeResource, setActiveResource] = useState(null);
  const [newQuantity, setNewQuantity] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    unit: 'Units',
    thresholdQuantity: '',
  });

  useEffect(() => {
    const fetchCamps = async () => {
      try {
        const data = await campService.getAll();
        setCamps(data);
        if (data.length > 0) {
          setSelectedCampId(data[0].id.toString());
        }
      } catch (error) {
        console.error('Failed to load relief camps:', error);
        toast.error('Unable to fetch camps.');
      } finally {
        setLoading(false);
      }
    };

    fetchCamps();
  }, []);

  const fetchResources = async (campId) => {
    if (!campId) return;
    setLoadingResources(true);
    try {
      const data = await resourceService.getByCamp(parseInt(campId));
      setResources(data);
    } catch (error) {
      console.error('Failed to fetch resource stock logs:', error);
    } finally {
      setLoadingResources(false);
    }
  };

  useEffect(() => {
    if (selectedCampId) {
      fetchResources(selectedCampId);
    }
  }, [selectedCampId]);

  const handleCampChange = (e) => {
    setSelectedCampId(e.target.value);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      quantity: '',
      unit: 'Units',
      thresholdQuantity: '',
    });
    setShowModal(true);
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    const { name, quantity, unit, thresholdQuantity } = formData;

    if (!name || !quantity || !unit || !thresholdQuantity) {
      toast.error('Please complete all form fields.');
      return;
    }

    try {
      const payload = {
        campId: parseInt(selectedCampId),
        name,
        quantity: parseInt(quantity),
        unit,
        thresholdQuantity: parseInt(thresholdQuantity),
      };

      const result = await resourceService.add(payload);
      toast.success('Supply item added successfully!');
      setResources((prev) => [...prev, result]);
      setShowModal(false);
    } catch (error) {
      console.error(error);
      toast.error('Failed to add resource log.');
    }
  };

  const handleOpenQuantityUpdate = (resource) => {
    setActiveResource(resource);
    setNewQuantity(resource.quantity.toString());
    setQuantityModal(true);
  };

  const handleSubmitQuantityUpdate = async (e) => {
    e.preventDefault();
    if (!newQuantity || parseInt(newQuantity) < 0) {
      toast.error('Please enter a valid positive quantity.');
      return;
    }

    try {
      const updated = await resourceService.updateQuantity(activeResource.id, parseInt(newQuantity));
      toast.success('Resource stock level updated!');
      setResources((prev) => prev.map((r) => (r.id === activeResource.id ? updated : r)));
      setQuantityModal(false);
    } catch (error) {
      console.error(error);
      toast.error('Failed to update stock quantity.');
    }
  };

  const handleDeleteResource = async (id) => {
    if (window.confirm('Delete this resource log permanently?')) {
      try {
        await resourceService.delete(id);
        toast.success('Supply item deleted from records.');
        setResources((prev) => prev.filter((r) => r.id !== id));
      } catch (error) {
        console.error(error);
        toast.error('Failed to delete resource.');
      }
    }
  };

  return (
    <Container className="py-4 text-start">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="text-white mb-1">Resource Inventory</h2>
          <p className="text-muted small">Select a relief camp to adjust supply logs, update distribution levels, and monitor stock warnings.</p>
        </div>
        {selectedCampId && (
          <Button onClick={handleOpenAdd} className="btn-premium d-flex align-items-center">
            <FiPlus className="me-2" /> Add Supply Item
          </Button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
        </div>
      ) : camps.length === 0 ? (
        <Alert variant="warning">
          Please register at least one camp before managing resources.
        </Alert>
      ) : (
        <>
          {/* Camp Selection Dropdown */}
          <div className="mb-4" style={{ maxWidth: '350px' }}>
            <Form.Label className="text-muted small fw-semibold">Select Camp Shelter</Form.Label>
            <Form.Select 
              value={selectedCampId} 
              onChange={handleCampChange} 
              className="form-glass"
            >
              {camps.map((c) => (
                <option key={c.id} value={c.id} className="bg-dark">{c.name}</option>
              ))}
            </Form.Select>
          </div>

          {loadingResources ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status" />
            </div>
          ) : resources.length === 0 ? (
            <Alert variant="info" className="bg-dark border-light border-opacity-10 text-muted">
              No registered supplies mapped to this camp site. Click Add Supply Item to log resources.
            </Alert>
          ) : (
            <Card className="glass-panel border-0 bg-dark p-3">
              <Card.Body className="p-0">
                <div className="table-responsive">
                  <Table hover variant="dark" className="align-middle bg-transparent mb-0">
                    <thead>
                      <tr className="border-light border-opacity-10">
                        <th>Resource Name</th>
                        <th>Current Stock</th>
                        <th>Unit</th>
                        <th>Safety Threshold</th>
                        <th>Status</th>
                        <th>Last Updated</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resources.map((r) => (
                        <tr key={r.id} className="border-light border-opacity-10">
                          <td className="fw-semibold small">{r.name}</td>
                          <td className="fw-bold">{r.quantity}</td>
                          <td className="small text-muted">{r.unit}</td>
                          <td className="small text-muted">{r.thresholdQuantity}</td>
                          <td>
                            {r.isLowStock ? (
                              <Badge bg="danger" className="d-inline-flex align-items-center gap-1">
                                <FiAlertOctagon size={12} /> Low Stock
                              </Badge>
                            ) : (
                              <Badge bg="success">Adequate</Badge>
                            )}
                          </td>
                          <td className="small text-muted" style={{ fontSize: '0.75rem' }}>
                            {new Date(r.updatedAt).toLocaleDateString()}
                          </td>
                          <td>
                            <div className="d-flex gap-2">
                              <Button 
                                variant="outline-primary" 
                                size="sm"
                                onClick={() => handleOpenQuantityUpdate(r)}
                                className="d-flex align-items-center gap-1 py-1"
                              >
                                <FiEdit size={12} /> Adjust Stock
                              </Button>
                              <Button 
                                variant="outline-danger" 
                                size="sm"
                                onClick={() => handleDeleteResource(r.id)}
                                className="d-flex align-items-center gap-1 py-1"
                              >
                                <FiTrash2 size={12} /> Delete
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
        </>
      )}

      {/* Add Resource Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} contentClassName="glass-panel text-light" dialogClassName="modal-dark" centered>
        <Modal.Header closeButton closeVariant="white" className="border-light border-opacity-10 bg-dark">
          <Modal.Title className="fw-bold">Add Supply Log</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark text-start">
          <Form onSubmit={handleSubmitAdd}>
            <Form.Group className="mb-3" controlId="resName">
              <Form.Label className="text-muted small fw-semibold">Resource / Item Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                placeholder="E.g. Bottled Water, First-aid kits, Rice bags"
                value={formData.name}
                onChange={handleInputChange}
                className="form-glass"
                required
              />
            </Form.Group>

            <Row className="mb-3">
              <Col xs={6}>
                <Form.Group controlId="resQty">
                  <Form.Label className="text-muted small fw-semibold">Initial Quantity</Form.Label>
                  <Form.Control
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    className="form-glass"
                    required
                  />
                </Form.Group>
              </Col>
              
              <Col xs={6}>
                <Form.Group controlId="resUnit">
                  <Form.Label className="text-muted small fw-semibold">Unit Type</Form.Label>
                  <Form.Select
                    name="unit"
                    value={formData.unit}
                    onChange={handleInputChange}
                    className="form-glass"
                    required
                  >
                    <option value="Units" className="bg-dark">Units</option>
                    <option value="Liters" className="bg-dark">Liters</option>
                    <option value="kg" className="bg-dark">kg</option>
                    <option value="Boxes" className="bg-dark">Boxes</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-4" controlId="resThreshold">
              <Form.Label className="text-muted small fw-semibold">Minimum Safety Threshold</Form.Label>
              <Form.Control
                type="number"
                name="thresholdQuantity"
                placeholder="Triggers shortage notification below this level"
                value={formData.thresholdQuantity}
                onChange={handleInputChange}
                className="form-glass"
                required
              />
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="outline-light" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button type="submit" className="btn-premium">Add Supply Item</Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Adjust Quantity Modal */}
      <Modal show={quantityModal} onHide={() => setQuantityModal(false)} contentClassName="glass-panel text-light" dialogClassName="modal-dark" centered>
        <Modal.Header closeButton closeVariant="white" className="border-light border-opacity-10 bg-dark">
          <Modal.Title className="fw-bold">Adjust Stock Levels</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark text-start">
          {activeResource && (
            <Form onSubmit={handleSubmitQuantityUpdate}>
              <p className="small text-muted mb-3">
                Adjusting stock count for item <strong>{activeResource.name}</strong>.
              </p>
              
              <Form.Group className="mb-4" controlId="adjustQty">
                <Form.Label className="text-muted small fw-semibold">New Quantity ({activeResource.unit})</Form.Label>
                <Form.Control
                  type="number"
                  value={newQuantity}
                  onChange={(e) => setNewQuantity(e.target.value)}
                  className="form-glass"
                  required
                />
              </Form.Group>

              <div className="d-flex justify-content-end gap-2">
                <Button variant="outline-light" onClick={() => setQuantityModal(false)}>Cancel</Button>
                <Button type="submit" className="btn-premium">Confirm Adjustments</Button>
              </div>
            </Form>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default NGOResources;
