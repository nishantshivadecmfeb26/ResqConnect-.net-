import React, { useState } from 'react';
import { Container, Card, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { notificationService } from '../../services/api';
import { toast } from 'react-toastify';
import { FiVolume2, FiSend } from 'react-icons/fi';

const GovAnnouncements = () => {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    audience: 'all', // all, victim, volunteer, ngo
  });
  const [sending, setSending] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { title, message, audience } = formData;

    if (!title || !message) {
      toast.error('Please fill in both title and advisory details.');
      return;
    }

    setSending(true);

    try {
      let roleId = null;
      if (audience === 'victim') roleId = 1;
      else if (audience === 'volunteer') roleId = 2;
      else if (audience === 'ngo') roleId = 3;

      const payload = {
        title,
        message,
        userId: 0 // Backend will ignore this since it's a broadcast
      };

      await notificationService.broadcast(payload, roleId);
      toast.success('Advisory announcement published successfully!');
      
      setFormData({
        title: '',
        message: '',
        audience: 'all',
      });
    } catch (error) {
      console.error(error);
      toast.error('Failed to publish announcement.');
    } finally {
      setSending(false);
    }
  };

  return (
    <Container className="py-4 text-start">
      <h2 className="text-white mb-1">Publish Safety Advisories</h2>
      <p className="text-muted small mb-4">Compose evacuation plans, general weather advisories, or safety guides for regional coordinates.</p>

      <Row>
        <Col lg={8} className="mx-auto">
          <Card className="glass-panel border-0 bg-dark p-4">
            <Card.Body>
              <h4 className="text-white mb-3 d-flex align-items-center">
                <FiVolume2 className="text-primary me-2" /> Advisory Composer
              </h4>
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="announceAudience">
                  <Form.Label className="text-muted small fw-semibold">Target Audience</Form.Label>
                  <Form.Select
                    name="audience"
                    value={formData.audience}
                    onChange={handleInputChange}
                    className="form-glass"
                    required
                  >
                    <option value="all" className="bg-dark">Broadcast to All Users</option>
                    <option value="victim" className="bg-dark">Victims Only (Evacuation / Shelters)</option>
                    <option value="volunteer" className="bg-dark">Volunteers Only (Mobilization requests)</option>
                    <option value="ngo" className="bg-dark">NGO Coordinators Only (Inventory / Logistics)</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3" controlId="announceTitle">
                  <Form.Label className="text-muted small fw-semibold">Advisory Title</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    placeholder="E.g. MANDATORY EVACUATION: Sector 4 River Banks"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="form-glass"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-4" controlId="announceMessage">
                  <Form.Label className="text-muted small fw-semibold">Advisory Details / Instructions</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={6}
                    name="message"
                    placeholder="Provide step-by-step instructions, evacuation routes, and safe camp designations..."
                    value={formData.message}
                    onChange={handleInputChange}
                    className="form-glass"
                    required
                  />
                </Form.Group>

                <div className="d-flex justify-content-end">
                  <Button type="submit" className="btn-premium d-flex align-items-center" disabled={sending}>
                    <FiSend className="me-2" />
                    {sending ? 'Broadcasting...' : 'Publish Advisory'}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default GovAnnouncements;
