import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FiUser, FiPhone, FiLock, FiCheck } from 'react-icons/fi';

const EditProfile = () => {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        newPassword: '',
        confirmPassword: '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, phone, newPassword, confirmPassword } = formData;

    if (!name) {
      setError('Name is required.');
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    if (newPassword && newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await updateProfile({
        name,
        phone,
        newPassword: newPassword || null,
      });
      toast.success('Profile updated successfully!');
      setFormData((prev) => ({ ...prev, newPassword: '', confirmPassword: '' }));
    } catch (err) {
      console.error(err);
      const apiErrorMsg = err.response?.data?.message || 'Failed to update profile. Please try again.';
      setError(apiErrorMsg);
      toast.error(apiErrorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5 text-start">
      <h2 className="text-white mb-4">Account Settings</h2>
      
      <Row>
        <Col lg={8} className="mx-auto">
          <Card className="glass-panel border-0 p-4">
            <Card.Body>
              <h4 className="text-white mb-3">Update Personal Details</h4>
              <p className="text-muted small mb-4">Manage details shared across camp listings and SOS dispatches.</p>
              
              {error && <Alert variant="danger" className="py-2 small">{error}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="profileName">
                      <Form.Label className="text-muted small fw-semibold">Full Name</Form.Label>
                      <div className="position-relative">
                        <FiUser className="position-absolute text-muted" style={{ top: '14px', left: '14px' }} />
                        <Form.Control
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="form-glass ps-5"
                          required
                        />
                      </div>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="profilePhone">
                      <Form.Label className="text-muted small fw-semibold">Phone Number</Form.Label>
                      <div className="position-relative">
                        <FiPhone className="position-absolute text-muted" style={{ top: '14px', left: '14px' }} />
                        <Form.Control
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="form-glass ps-5"
                          required
                        />
                      </div>
                    </Form.Group>
                  </Col>
                </Row>

                <hr className="my-4 border-light border-opacity-10" />
                
                <h4 className="text-white mb-3">Change Password</h4>
                <p className="text-muted small mb-4">Leave fields blank if you do not wish to modify your password.</p>

                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="profileNewPassword">
                      <Form.Label className="text-muted small fw-semibold">New Password</Form.Label>
                      <div className="position-relative">
                        <FiLock className="position-absolute text-muted" style={{ top: '14px', left: '14px' }} />
                        <Form.Control
                          type="password"
                          name="newPassword"
                          placeholder="••••••••"
                          value={formData.newPassword}
                          onChange={handleChange}
                          className="form-glass ps-5"
                        />
                      </div>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="profileConfirmPassword">
                      <Form.Label className="text-muted small fw-semibold">Confirm Password</Form.Label>
                      <div className="position-relative">
                        <FiLock className="position-absolute text-muted" style={{ top: '14px', left: '14px' }} />
                        <Form.Control
                          type="password"
                          name="confirmPassword"
                          placeholder="••••••••"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          className="form-glass ps-5"
                        />
                      </div>
                    </Form.Group>
                  </Col>
                </Row>

                <div className="mt-4 d-flex justify-content-end">
                  <Button type="submit" className="btn-premium d-flex align-items-center" disabled={loading}>
                    <FiCheck className="me-2" />
                    {loading ? 'Saving Changes...' : 'Save Changes'}
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

export default EditProfile;
