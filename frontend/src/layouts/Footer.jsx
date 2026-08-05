import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FiActivity } from 'react-icons/fi';

const FooterLink = ({ to, children }) => {
  return (
    <li>
      <Link 
        to={to} 
        className="text-secondary text-decoration-none d-inline-block"
        style={{
          transition: 'all 0.25s ease-in-out',
          color: 'var(--text-secondary)'
        }}
        onMouseEnter={(e) => {
          e.target.style.color = 'var(--accent-amber)';
          e.target.style.transform = 'translateX(4px)';
        }}
        onMouseLeave={(e) => {
          e.target.style.color = 'var(--text-secondary)';
          e.target.style.transform = 'translateX(0)';
        }}
      >
        {children}
      </Link>
    </li>
  );
};

const Footer = () => {
  return (
    <footer className="mt-auto py-5" style={{ background: '#eef2ff', borderTop: '1px solid #d6d9ff' }}>
      <Container>
        <Row className="gy-4 justify-content-between text-start">
          {/* Logo and info */}
          <Col xs={12} lg={5}>
            <div className="d-flex align-items-center mb-3 gap-2">
              <FiActivity size={24} style={{ color: 'var(--accent-amber)' }} />
              <h5 className="fw-bold mb-0 text-dark" style={{ fontFamily: 'var(--font-heading)' }}>
                ResQ<span style={{ color: 'var(--accent-amber)' }}>Connect</span>
              </h5>
            </div>
            <p className="text-secondary small mb-0" style={{ lineHeight: '1.6', maxWidth: '380px' }}>
              Connecting communities with volunteers, NGOs, and relief services during emergencies to orchestrate disaster response, SOS distress signals, and supply tracking.
            </p>
          </Col>

          {/* Quick Links Column */}
          <Col xs={6} sm={4} lg={2} className="offset-lg-1">
            <h6 className="text-dark fw-bold mb-3 small text-uppercase tracking-wider" style={{ fontFamily: 'var(--font-heading)' }}>
              Navigation
            </h6>
            <ul className="list-unstyled d-flex flex-column gap-2 mb-0">
              <FooterLink to="/">Home</FooterLink>
              <FooterLink to="/about">About Us</FooterLink>
            </ul>
          </Col>

          {/* Account Column */}
          <Col xs={6} sm={4} lg={2}>
            <h6 className="text-dark fw-bold mb-3 small text-uppercase tracking-wider" style={{ fontFamily: 'var(--font-heading)' }}>
              Portal
            </h6>
            <ul className="list-unstyled d-flex flex-column gap-2 mb-0">
              <FooterLink to="/login">Login</FooterLink>
              <FooterLink to="/register">Register</FooterLink>
            </ul>
          </Col>
        </Row>

        <hr className="my-4" style={{ borderColor: '#d6d9ff', opacity: 0.6 }} />

        <Row className="align-items-center text-start">
          <Col xs={12} md={6} className="text-center text-md-start">
            <p className="text-secondary small mb-0">
              &copy; {new Date().getFullYear()} ResQConnect. All rights reserved.
            </p>
          </Col>
          <Col xs={12} md={6} className="text-center text-md-end mt-2 mt-md-0">
            <span className="text-secondary small" style={{ fontStyle: 'italic' }}>
              Together, we build a safer tomorrow.
            </span>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;

