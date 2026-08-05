import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FiMail, FiLock, FiActivity, FiEye, FiEyeOff } from 'react-icons/fi';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Read post-auth redirection target from location state
  const from = location.state?.from?.pathname || '/';
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password) {
      setError('Please provide both email and password.');
      return;
    }

    if (!emailPattern.test(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const loggedUser = await login({ email: trimmedEmail, password });
      toast.success(`Welcome back, ${loggedUser.name}!`);
      
      // Determine redirection target based on role if logged in from landing
      if (from === '/') {
        switch (loggedUser.roleName) {
          case 'Victim': navigate('/victim/dashboard'); break;
          case 'Volunteer': navigate('/volunteer/dashboard'); break;
          case 'NGO': navigate('/ngo/dashboard'); break;
          case 'Government Officer': navigate('/gov/dashboard'); break;
          case 'Admin': navigate('/admin/dashboard'); break;
          default: navigate('/'); break;
        }
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      console.error(err);
      const apiErrorMsg = err.response?.data?.message || 'Login failed. Please verify your credentials.';
      setError(apiErrorMsg);
      toast.error(apiErrorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center py-5" style={{ minHeight: '80vh' }}>
      <Card className="glass-panel w-100 border-0 p-0" style={{ maxWidth: '850px', overflow: 'hidden' }}>
        <Row className="g-0">
          <Col md={6} className="d-none d-md-block position-relative">
            <img 
              src="/images/login_sidebar.png" 
              alt="Security Access" 
              className="w-100 h-100"
              style={{ objectFit: 'cover', minHeight: '480px' }}
            />
            <div className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column justify-content-end p-4 text-start" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}>
              <h5 className="fw-bold mb-1" style={{ color: '#ffffff' }}>Secure Relief Logistics</h5>
              <p className="small mb-0" style={{ color: 'rgba(255,255,255,0.7)' }}>Identity verified via DigiLocker. Accessing high-tier coordination actions requires active supervisor verification.</p>
            </div>
          </Col>
          <Col md={6} className="p-4 d-flex align-items-center">
            <Card.Body className="p-3 text-center">
              <div className="d-flex justify-content-center align-items-center gap-2 mb-4">
                <FiActivity size={32} style={{ color: 'var(--accent-indigo)' }} />
                <h3 className="fw-bold mb-0" style={{ color: 'var(--accent-blue)' }}>ResQConnect</h3>
              </div>
              
              <h4 className="mb-2" style={{ color: 'var(--accent-blue)' }}>Sign In</h4>
              <p className="text-muted small mb-4">Access your relief response portal</p>
              
              {error && <Alert variant="danger" className="text-start py-2 small">{error}</Alert>}
              
              <Form onSubmit={handleSubmit} className="text-start">
                <Form.Group className="mb-3" controlId="loginEmail">
                  <Form.Label className="text-muted small fw-semibold">Email Address</Form.Label>
                  <div className="position-relative">
                    <FiMail className="position-absolute text-muted" style={{ top: '14px', left: '14px' }} />
                    <Form.Control
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="form-glass ps-5"
                      autoComplete="email"
                      required
                    />
                  </div>
                </Form.Group>
                
                <Form.Group className="mb-4" controlId="loginPassword">
                  <Form.Label className="text-muted small fw-semibold">Password</Form.Label>
                  <div className="position-relative">
                    <FiLock className="position-absolute text-muted" style={{ top: '14px', left: '14px' }} />
                    <Form.Control
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="form-glass ps-5 pe-5"
                      autoComplete="current-password"
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
                
                <Button type="submit" className="btn-premium w-100 py-2.5 fw-bold mb-3" disabled={loading}>
                  {loading ? 'Authenticating...' : 'Login'}
                </Button>
              </Form>
              
              <div className="text-muted small mt-4">
                Don't have an account? <Link to="/register" className="text-primary text-decoration-none">Create an Account</Link>
              </div>
            </Card.Body>
          </Col>
        </Row>
      </Card>
    </Container>
  );
};

export default Login;

