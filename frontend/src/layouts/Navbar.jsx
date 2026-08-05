import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, Badge, Dropdown, NavDropdown, Button, Modal, Form } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { notificationService, sosService, disasterService, contactService } from '../services/api';
import { toast } from 'react-toastify';
import { FiBell, FiUser, FiLogOut, FiActivity, FiMapPin, FiCheckSquare, FiArchive, FiShield, FiMail } from 'react-icons/fi';

const NavigationBar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactData, setContactData] = useState({ name: '', email: '', subject: '', message: '' });
  const [contactError, setContactError] = useState('');

  const contactEmail = 'resqconnect26@gmail.com';

  const handleContactChange = (event) => {
    const { name, value } = event.target;
    setContactData((prev) => ({ ...prev, [name]: value }));
  };

  const handleContactSubmit = async (event) => {
    event.preventDefault();
    const { name, email, subject, message } = contactData;

    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      setContactError('Please complete all fields before sending your message.');
      return;
    }

    try {
      toast.info('Sending your message...');
      
      const response = await fetch('https://formsubmit.co/ajax/resqconnect26@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: name,
          email: email,
          _subject: subject,
          message: message
        })
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const result = await response.json();
      
      toast.success(`Thank you, ${name}! Your message has been sent successfully.`);
      setShowContactModal(false);
      setContactData({ name: '', email: '', subject: '', message: '' });
      setContactError('');
    } catch (err) {
      console.error('FormSubmit Error:', err);
      toast.error('Failed to send contact message.');
    }
  };

  const openContactModal = () => {
    setShowContactModal(true);
  };

  const closeContactModal = () => {
    setShowContactModal(false);
    setContactError('');
  };

  const [hasActiveSos, setHasActiveSos] = useState(false);

  const checkNgoCampAccess = async () => {
    if (isAuthenticated && user && user.roleName === 'NGO') {
      try {
        // Check 1: Active SOS requests assigned to this NGO
        const sosList = await sosService.getNgoSos();
        const activeSos = sosList.filter(s =>
          ['Assigned to NGO', 'Volunteer Assigned', 'Accepted', 'On The Way', 'Reached', 'Rescue In Progress'].includes(s.currentStatus || s.status)
        );

        // Check 2: Any active Disaster Alerts / Warning Alerts from Government Officers
        let hasActiveDisaster = false;
        try {
          const disasters = await disasterService.getAll({ activeOnly: true });
          const disasterList = Array.isArray(disasters) ? disasters : (disasters?.items || []);
          hasActiveDisaster = disasterList.length > 0;
        } catch (err) {
          console.warn('Could not fetch active disasters:', err);
        }

        // Enable Manage Camps if either condition is met
        setHasActiveSos(activeSos.length > 0 || hasActiveDisaster);
      } catch (error) {
        console.error('Error checking NGO camp access:', error);
      }
    }
  };

  const fetchUnreadCount = async () => {
    if (isAuthenticated && user) {
      try {
        const list = await notificationService.getAll();
        const unread = list.filter((n) => !n.isRead).length;
        setUnreadCount(unread);
      } catch (error) {
        console.error('Error fetching unread notification count:', error);
      }
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    checkNgoCampAccess();
    window.addEventListener('notificationsUpdated', fetchUnreadCount);
    // Poll for notifications every 30 seconds for a dynamic live feel
    const interval = setInterval(() => {
      fetchUnreadCount();
      checkNgoCampAccess();
    }, 30000);
    return () => {
      window.removeEventListener('notificationsUpdated', fetchUnreadCount);
      clearInterval(interval);
    };
  }, [isAuthenticated, user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Render navigation links based on user role
  const renderRoleLinks = () => {
    if (!user) return null;

    switch (user.roleName) {
      case 'Victim':
        return (
          <>
            <Nav.Link as={Link} to="/victim/dashboard">Dashboard</Nav.Link>
            <Nav.Link as={Link} to="/victim/sos" className="text-danger fw-bold">SOS Help</Nav.Link>
            <Nav.Link as={Link} to="/victim/camps">Relief Camps</Nav.Link>
            <Nav.Link as={Link} to="/victim/missing-persons">Missing Persons</Nav.Link>
            <Nav.Link as={Link} to="/hazard-map" className="text-warning">Hazard &amp; Camp</Nav.Link>
          </>
        );
      case 'Volunteer':
        return (
          <>
            <Nav.Link as={Link} to="/volunteer/dashboard">Dashboard</Nav.Link>
            <Nav.Link as={Link} to="/volunteer/tasks">Tasks Board</Nav.Link>
            <Nav.Link as={Link} to="/volunteer/profile">Skills Profile</Nav.Link>
            <Nav.Link as={Link} to="/hazard-map" className="text-warning">Hazard &amp; Camp</Nav.Link>
          </>
        );
      case 'NGO':
        return (
          <>
            <Nav.Link as={Link} to="/ngo/dashboard">Dashboard</Nav.Link>
            <Nav.Link 
              as={Link} 
              to={hasActiveSos ? "/ngo/camps" : "#"} 
              onClick={(e) => {
                if (!hasActiveSos) {
                  e.preventDefault();
                  toast.warning("Manage Camps is currently disabled. It will be enabled once a Government Officer creates an active Disaster Alert or Warning, or when an SOS request has been assigned to your NGO.");
                }
              }}
              style={{ 
                opacity: hasActiveSos ? 1 : 0.5, 
                cursor: hasActiveSos ? 'pointer' : 'not-allowed' 
              }}
            >
              Manage Camps
            </Nav.Link>
            <Nav.Link as={Link} to="/ngo/resources">Resource Inventory</Nav.Link>
            <Nav.Link as={Link} to="/ngo/volunteers">Verify Volunteers</Nav.Link>
            <Nav.Link as={Link} to="/hazard-map" className="text-warning">Hazard &amp; Camp</Nav.Link>
          </>
        );
      case 'Government Officer':
        return (
          <>
            <Nav.Link as={Link} to="/gov/dashboard">Dashboard</Nav.Link>
            <Nav.Link as={Link} to="/gov/disasters">Manage Disasters</Nav.Link>
            <NavDropdown title="Advisory & Warning" id="gov-advisory-warning-dropdown" className="custom-nav-dropdown text-white">
              <NavDropdown.Item as={Link} to="/gov/announcements" className="text-dark">Advisories</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/gov/forecast" className="text-dark">Early Warning</NavDropdown.Item>
            </NavDropdown>
            <Nav.Link as={Link} to="/gov/reports">System Reports</Nav.Link>
            <Nav.Link as={Link} to="/hazard-map" className="text-warning">Hazard &amp; Camp</Nav.Link>
          </>
        );
      case 'Admin':
        return (
          <>
            <Nav.Link as={Link} to="/admin/dashboard">Dashboard</Nav.Link>
            <Nav.Link as={Link} to="/admin/users">User Operations</Nav.Link>
            <Nav.Link as={Link} to="/admin/audit-logs">Audit Logs</Nav.Link>
            <Nav.Link as={Link} to="/hazard-map" className="text-warning">Hazard &amp; Camp</Nav.Link>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <style>{`
        .navbar-custom .nav-link {
          font-size: 0.85rem !important;
          font-weight: 500 !important;
          white-space: nowrap !important;
          padding-left: 0.4rem !important;
          padding-right: 0.4rem !important;
          transition: all 0.2s ease-in-out !important;
        }
        .navbar-custom .nav-link:hover {
          color: var(--accent-amber) !important;
        }
        @media (min-width: 1200px) {
          .navbar-custom .nav-link {
            font-size: 0.92rem !important;
            padding-left: 0.75rem !important;
            padding-right: 0.75rem !important;
          }
        }
        .custom-nav-dropdown .dropdown-menu {
          background-color: #ffffff !important;
          border: 1px solid rgba(0,0,0,0.1) !important;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15) !important;
          margin-top: 0.5rem !important;
        }
        .custom-nav-dropdown .dropdown-item {
          font-size: 0.85rem !important;
          font-weight: 500 !important;
          color: #212529 !important;
          padding: 0.5rem 1rem !important;
          transition: all 0.15s ease-in-out !important;
        }
        .custom-nav-dropdown .dropdown-item:hover {
          background-color: #f8f9fa !important;
          color: #b7791f !important;
        }
      `}</style>
      <Navbar collapseOnSelect expand="lg" variant="dark" className="py-3 shadow-sm navbar-custom" style={{ background: '#0b192c' }}>
        <Container fluid className="justify-content-between align-items-center">
          <Navbar.Brand as={Link} to="/" className="d-flex align-items-center fw-bold fs-5 text-white">
          <FiActivity className="me-2" size={22} style={{ color: '#b7791f' }} />
          ResQ<span style={{ color: '#b7791f' }}>Connect</span>
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        
        <Navbar.Collapse id="responsive-navbar-nav" className="justify-content-between align-items-center">
          <Nav className="me-auto mt-2 mt-lg-0 text-white d-flex align-items-center">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            <Nav.Link as={Link} to="/about">About Us</Nav.Link>
            {isAuthenticated && renderRoleLinks()}
          </Nav>
          
          <Nav className="align-items-center mt-2 mt-lg-0 d-flex gap-2">
            <Nav.Link onClick={openContactModal} className="text-white py-2 px-3 border border-secondary border-opacity-20 rounded d-flex align-items-center" style={{ background: 'rgba(255,255,255,0.05)', cursor: 'pointer' }}>
              <FiMail size={18} className="me-1 text-white" />
              Contact Us
            </Nav.Link>
            {isAuthenticated ? (
              <>
                <Nav.Link as={Link} to="/notifications" className="position-relative py-2 px-3 border border-secondary border-opacity-20 rounded text-white d-flex align-items-center" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <FiBell size={18} className="text-white" />
                  {unreadCount > 0 && (
                    <Badge pill bg="danger" className="position-absolute top-0 start-100 translate-middle" style={{ fontSize: '0.65rem' }}>
                      {unreadCount}
                    </Badge>
                  )}
                </Nav.Link>
                
                <Dropdown align="end">
                  <Dropdown.Toggle as={Button} variant="link" className="text-white text-decoration-none d-flex align-items-center py-2 px-3 border border-secondary border-opacity-20 rounded" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <FiUser className="me-2 text-white" />
                    <span>{user?.name}</span>
                    <Badge bg="warning" text="dark" className="ms-2 px-2 py-1" style={{ fontSize: '0.7rem' }}>
                      {user?.roleName}
                    </Badge>
                  </Dropdown.Toggle>
 
                  <Dropdown.Menu className="border shadow-lg mt-2 bg-white">
                    <Dropdown.Item as={Link} to="/profile" className="text-dark">Edit Profile</Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item as="button" onClick={handleLogout} className="text-danger">
                      <FiLogOut className="me-2" /> Logout
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </>
            ) : (
              <div className="d-flex gap-2">
                <Button as={Link} to="/login" className="px-3 py-1 bg-transparent fw-semibold" style={{ borderColor: '#ffffff', color: '#ffffff', border: '1px solid #ffffff', borderRadius: '6px' }}>
                  Login
                </Button>
                <Button as={Link} to="/register" className="px-3 py-1 text-white border-0 fw-semibold" style={{ backgroundColor: '#b7791f', borderRadius: '6px' }}>
                  Register
                </Button>
              </div>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>

      <Modal show={showContactModal} onHide={closeContactModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Contact ResQConnect</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="small text-muted">Send us a message and our support team will get in touch with you shortly.</p>
          <Form onSubmit={handleContactSubmit}>
            <Form.Group className="mb-3" controlId="contactName">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={contactData.name}
                onChange={handleContactChange}
                placeholder="Your full name"
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="contactEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={contactData.email}
                onChange={handleContactChange}
                placeholder="you@example.com"
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="contactSubject">
              <Form.Label>Subject</Form.Label>
              <Form.Control
                type="text"
                name="subject"
                value={contactData.subject}
                onChange={handleContactChange}
                placeholder="Subject of your message"
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="contactMessage">
              <Form.Label>Message</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="message"
                value={contactData.message}
                onChange={handleContactChange}
                placeholder="Describe your request or issue here"
              />
            </Form.Group>
            {contactError && <div className="text-danger small mb-3">{contactError}</div>}
            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={closeContactModal}>Cancel</Button>
              <Button type="submit" variant="primary">Send Message</Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Navbar>
  </>
  );
};

export default NavigationBar;

