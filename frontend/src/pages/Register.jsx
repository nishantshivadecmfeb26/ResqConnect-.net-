import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FiUser, FiMail, FiPhone, FiLock, FiSettings, FiActivity, FiEye, FiEyeOff } from 'react-icons/fi';
import { authService } from '../services/api';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    roleId: 1, // Default to Victim
    assignedNgoId: '',
  });
  const [ngos, setNgos] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const namePattern = /^[A-Za-z][A-Za-z\s'.-]{1,98}$/;
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const indianMobilePattern = /^(?:\+91[\s-]?|91[\s-]?|0)?[6-9]\d{9}$/;
  const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

  const normalizeIndianMobile = (value) => value.replace(/[\s-]/g, '').replace(/^(?:\+91|91|0)/, '');

  React.useEffect(() => {
    const loadNgos = async () => {
      try {
        const data = await authService.getNGOsPublic();
        setNgos(data);
      } catch (err) {
        console.error('Failed to load NGOs:', err);
      }
    };
    loadNgos();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'roleId' || name === 'assignedNgoId' ? (value === '' ? '' : parseInt(value)) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password, confirmPassword, phone, roleId, assignedNgoId } = formData;
    const trimmedName = name.trim().replace(/\s+/g, ' ');
    const trimmedEmail = email.trim();
    const normalizedPhone = normalizeIndianMobile(phone);

    if (!trimmedName || !trimmedEmail || !password || !confirmPassword || !phone.trim()) {
      setError('Please fill in all the required fields.');
      return;
    }

    if (!namePattern.test(trimmedName)) {
      setError('Please enter a valid full name using letters and spaces.');
      return;
    }

    if (!emailPattern.test(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!indianMobilePattern.test(phone.trim()) || normalizedPhone.length !== 10) {
      setError('Please enter a valid Indian mobile number starting with 6, 7, 8, or 9.');
      return;
    }

    if (Number(roleId) === 2 && !assignedNgoId) {
      setError('Please select an NGO to work under.');
      return;
    }

    if (!passwordPattern.test(password)) {
      setError('Password must be at least 8 characters and include uppercase, lowercase, number, and special character.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Password and confirm password do not match.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await register({ name: trimmedName, email: trimmedEmail, password, phone: normalizedPhone, roleId, assignedNgoId: Number(roleId) === 2 ? assignedNgoId : null });
      toast.success('Registration successful! Please login.');
      navigate('/login');
    } catch (err) {
      console.error(err);
      const apiErrorMsg = err.response?.data?.message || 'Registration failed. Please check details or try another email.';
      setError(apiErrorMsg);
      toast.error(apiErrorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center py-5" style={{ minHeight: '90vh' }}>
      <Card className="glass-panel w-100 border-0 p-0" style={{ maxWidth: '920px', overflow: 'hidden' }}>
        <Row className="g-0">
          <Col md={5} className="d-none d-md-block position-relative">
            <img 
              src="/images/login_sidebar.png" 
              alt="Security Access" 
              className="w-100 h-100"
              style={{ objectFit: 'cover', minHeight: '520px' }}
            />
            <div className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column justify-content-end p-4 text-start" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}>
              <h5 className="text-white fw-bold mb-1">Unified Incident Dispatch</h5>
              <p className="text-muted small mb-0">Join the ResQConnect network to report emergencies, coordinate logistics, and receive alerts directly.</p>
            </div>
          </Col>
          <Col md={7} className="p-4 d-flex align-items-center">
            <Card.Body className="p-3 text-center">
              <div className="d-flex justify-content-center align-items-center gap-2 mb-4 text-white">
                <FiActivity size={32} className="text-primary animate-pulse" />
                <h3 className="fw-bold mb-0">ResQConnect</h3>
              </div>
              
              <h4 className="text-white mb-2">Create Account</h4>
              <p className="text-muted small mb-4">Join our coordinated disaster relief network</p>
              
              {error && <Alert variant="danger" className="text-start py-2 small">{error}</Alert>}
              
              <Form onSubmit={handleSubmit} className="text-start">
                <Form.Group className="mb-3" controlId="regName">
                  <Form.Label className="text-muted small fw-semibold">Full Name</Form.Label>
                  <div className="position-relative">
                    <FiUser className="position-absolute text-muted" style={{ top: '14px', left: '14px' }} />
                    <Form.Control
                      type="text"
                      name="name"
                      placeholder="Aarav Sharma"
                      value={formData.name}
                      onChange={handleChange}
                      className="form-glass ps-5"
                      minLength={2}
                      autoComplete="name"
                      required
                    />
                  </div>
                </Form.Group>

                <Form.Group className="mb-3" controlId="regEmail">
                  <Form.Label className="text-muted small fw-semibold">Email Address</Form.Label>
                  <div className="position-relative">
                    <FiMail className="position-absolute text-muted" style={{ top: '14px', left: '14px' }} />
                    <Form.Control
                      type="email"
                      name="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="form-glass ps-5"
                      autoComplete="email"
                      required
                    />
                  </div>
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="regPhone">
                      <Form.Label className="text-muted small fw-semibold">Phone Number</Form.Label>
                      <div className="position-relative">
                        <FiPhone className="position-absolute text-muted" style={{ top: '14px', left: '14px' }} />
                        <Form.Control
                          type="tel"
                          name="phone"
                          placeholder="+91 9876543210"
                          value={formData.phone}
                          onChange={handleChange}
                          className="form-glass ps-5"
                          inputMode="tel"
                          autoComplete="tel"
                          required
                        />
                      </div>
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="regRole">
                      <Form.Label className="text-muted small fw-semibold">Platform Role</Form.Label>
                      <div className="position-relative">
                        <FiSettings className="position-absolute text-muted" style={{ top: '14px', left: '14px' }} />
                        <Form.Select
                          name="roleId"
                          value={formData.roleId}
                          onChange={handleChange}
                          className="form-glass ps-5"
                          required
                        >
                          <option value={1} className="bg-dark">Victim / Affected Person</option>
                          <option value={2} className="bg-dark">Volunteer responder</option>
                          <option value={3} className="bg-dark">NGO Officer</option>
                          <option value={4} className="bg-dark">Government Officer</option>
                        </Form.Select>
                      </div>
                    </Form.Group>
                  </Col>
                </Row>

                {Number(formData.roleId) === 2 && (
                  <Form.Group className="mb-3" controlId="regNgo">
                    <Form.Label className="text-muted small fw-semibold">Select NGO to work under</Form.Label>
                    <div className="position-relative">
                      <FiSettings className="position-absolute text-muted" style={{ top: '14px', left: '14px' }} />
                      <Form.Select
                        name="assignedNgoId"
                        value={formData.assignedNgoId}
                        onChange={handleChange}
                        className="form-glass ps-5"
                        required
                      >
                        <option value="" className="bg-dark">Choose an NGO...</option>
                        {ngos.map((ngo) => (
                          <option key={ngo.id} value={ngo.id} className="bg-dark">
                            {ngo.name}
                          </option>
                        ))}
                      </Form.Select>
                    </div>
                  </Form.Group>
                )}

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-4" controlId="regPassword">
                      <Form.Label className="text-muted small fw-semibold">Password</Form.Label>
                      <div className="position-relative">
                        <FiLock className="position-absolute text-muted" style={{ top: '14px', left: '14px' }} />
                        <Form.Control
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          placeholder="Strong password"
                          value={formData.password}
                          onChange={handleChange}
                          className="form-glass ps-5 pe-5"
                          autoComplete="new-password"
                          required
                        />
                        <Button
                          type="button"
                          variant="link"
                          className="position-absolute text-muted p-0 border-0"
                          style={{ top: '10px', right: '14px' }}
                          onClick={() => setShowPassword((prev) => !prev)}
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                        </Button>
                      </div>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-4" controlId="regConfirmPassword">
                      <Form.Label className="text-muted small fw-semibold">Confirm Password</Form.Label>
                      <div className="position-relative">
                        <FiLock className="position-absolute text-muted" style={{ top: '14px', left: '14px' }} />
                        <Form.Control
                          type={showConfirmPassword ? 'text' : 'password'}
                          name="confirmPassword"
                          placeholder="Re-enter password"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          className="form-glass ps-5 pe-5"
                          autoComplete="new-password"
                          required
                        />
                        <Button
                          type="button"
                          variant="link"
                          className="position-absolute text-muted p-0 border-0"
                          style={{ top: '10px', right: '14px' }}
                          onClick={() => setShowConfirmPassword((prev) => !prev)}
                          aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                        >
                          {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                        </Button>
                      </div>
                    </Form.Group>
                  </Col>
                </Row>

                <Button type="submit" className="btn-premium w-100 py-2.5 fw-bold mb-3" disabled={loading}>
                  {loading ? 'Creating Account...' : 'Register'}
                </Button>
              </Form>
              
              <div className="text-muted small mt-4">
                Already have an account? <Link to="/login" className="text-primary text-decoration-none">Sign In</Link>
              </div>
            </Card.Body>
          </Col>
        </Row>
      </Card>
    </Container>
  );
};

export default Register;

