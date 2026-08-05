import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { FiBell, FiCheckCircle, FiHeart, FiHome, FiMapPin, FiShield, FiTruck, FiUsers } from 'react-icons/fi';

const About = () => {
  return (
    <Container className="py-5 text-start">
      
      {/* Page Header with image */}
      <div 
        className="page-header-banner mb-5 shadow-sm"
        style={{ minHeight: '200px' }}
      >
        <img src="/images/rescue_workers_banner.png" alt="about background" />
        <div className="content">
          <span style={{ color: '#f59e0b', fontWeight: '800', fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            About ResQConnect
          </span>
          <h1 className="display-6 fw-bold mt-1 mb-2 text-light-blue" style={{ fontFamily: 'var(--font-heading)' }}>
            Connecting Help When Every Minute Matters
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.78)', maxWidth: '600px', marginBottom: 0, lineHeight: '1.6' }}>
            ResQConnect brings victims, volunteers, NGOs, and government teams onto one coordinated platform during floods, fires, earthquakes, landslides, and other emergencies.
          </p>
        </div>
      </div>

      {/* Platform Promise Cards */}
      <Row className="g-4 mb-5">
        {[
          {
            icon: <FiBell size={24} />,
            color: '#3b82f6',
            bg: 'rgba(59,130,246,0.1)',
            title: 'Fast SOS Support',
            body: 'Victims can raise an SOS with their location and emergency details, helping response teams understand where help is needed and how urgent the situation is.'
          },
          {
            icon: <FiUsers size={24} />,
            color: '#6366f1',
            bg: 'rgba(99,102,241,0.1)',
            title: 'One Shared Response Network',
            body: 'The platform connects citizens, volunteers, NGOs, and government officers so that rescue work, relief efforts, and field updates stay aligned.'
          },
          {
            icon: <FiShield size={24} />,
            color: '#10b981',
            bg: 'rgba(16,185,129,0.1)',
            title: 'Trusted Access',
            body: 'Each person sees the tools meant for their role, from victims tracking their requests to NGOs managing relief operations and admins overseeing platform activity.'
          },
          {
            icon: <FiTruck size={24} />,
            color: '#ef4444',
            bg: 'rgba(239,68,68,0.1)',
            title: 'Relief Made Visible',
            body: 'Relief camps, resources, missing person reports, volunteer tasks, and disaster updates can be managed in one place, reducing confusion during critical hours.'
          }
        ].map((card, i) => (
          <Col md={6} key={i}>
            <Card className="glass-panel glass-panel-hover h-100 border-0 p-3">
              <Card.Body>
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div className="p-3 rounded-3 flex-shrink-0" style={{ backgroundColor: card.bg, color: card.color }}>
                    {card.icon}
                  </div>
                  <h4 className="mb-0" style={{ color: 'var(--accent-blue)' }}>{card.title}</h4>
                </div>
                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.65', marginBottom: 0 }}>
                  {card.body}
                </p>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Mission Section */}
      <Row className="align-items-center g-4 mb-5">
        <Col lg={6}>
          <div className="glass-panel p-4 p-md-5 h-100">
            <div className="d-flex align-items-center gap-2 mb-3">
              <FiHeart size={22} style={{ color: 'var(--accent-rose)' }} />
              <h4 className="mb-0" style={{ color: 'var(--accent-blue)' }}>Our Purpose</h4>
            </div>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7' }}>
              ResQConnect is built to make disaster response more organized, transparent, and reachable. In an emergency, people should not have to search through scattered contacts, repeated phone calls, or uncertain updates. Our platform gives every stakeholder a clearer way to ask for help, offer support, and coordinate action.
            </p>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: 0 }}>
              From the first SOS alert to relief camp support and volunteer task completion, ResQConnect keeps the focus on practical response: who needs help, who can respond, what resources are available, and what action has already been taken.
            </p>
          </div>
        </Col>
        <Col lg={6}>
          <div className="glass-panel p-4 p-md-5 h-100">
            <div className="d-flex align-items-center gap-2 mb-3">
              <FiMapPin size={22} style={{ color: 'var(--accent-indigo)' }} />
              <h4 className="mb-0" style={{ color: 'var(--accent-blue)' }}>Who It Helps</h4>
            </div>
            <Row className="gy-3">
              {[
                'Victims can raise SOS requests, find camps, and report missing persons.',
                'Volunteers can receive tasks and share completion updates.',
                'NGOs can manage camps, resources, volunteers, and assigned SOS cases.',
                'Government officers can monitor disasters, issue updates, and coordinate response.'
              ].map((item, i) => (
                <Col sm={6} key={i}>
                  <div className="d-flex gap-2">
                    <FiCheckCircle className="mt-1 flex-shrink-0" style={{ color: 'var(--accent-emerald)' }} />
                    <span style={{ color: 'var(--text-secondary)', lineHeight: '1.55' }}>{item}</span>
                  </div>
                </Col>
              ))}
            </Row>
          </div>
        </Col>
      </Row>

      {/* Disaster Images Row */}
      <Row className="g-3 mb-5">
        {[
          { img: '/images/flood_4.jpeg', label: 'Flood Response' },
          { img: '/images/earthquake_3.jpeg', label: 'Earthquake Relief' },
          { img: '/images/fire_2.jpeg', label: 'Fire Emergency' },
          { img: '/images/landslide_3.jpeg', label: 'Landslide Aid' },
        ].map((item, i) => (
          <Col xs={6} md={3} key={i}>
            <div className="disaster-img-card">
              <img src={item.img} alt={item.label} />
              <div className="overlay">
                <span>{item.label}</span>
              </div>
            </div>
          </Col>
        ))}
      </Row>

      {/* Platform Capabilities */}
      <div className="glass-panel p-4 p-md-5">
        <div className="d-flex align-items-center gap-2 mb-4">
          <FiHome size={22} style={{ color: 'var(--accent-indigo)' }} />
          <h4 className="mb-0" style={{ color: 'var(--accent-blue)' }}>What ResQConnect Brings Together</h4>
        </div>
        <Row className="gy-4 small">
          {[
            { icon: <FiBell size={18} />, color: '#3b82f6', label: 'Emergency Alerts', value: 'SOS requests with priority, location, and status tracking.' },
            { icon: <FiHome size={18} />, color: '#6366f1', label: 'Relief Camps', value: 'Camp details, capacity, resources, and contact information.' },
            { icon: <FiUsers size={18} />, color: '#10b981', label: 'Volunteer Work', value: 'Task assignment, progress updates, verification, and proof upload.' },
            { icon: <FiShield size={18} />, color: '#ef4444', label: 'Coordinated Oversight', value: 'Role-based dashboards for NGOs, officers, admins, and citizens.' },
          ].map((spec, i) => (
            <Col sm={6} md={3} key={i}>
              <div className="d-flex align-items-start gap-2">
                <div 
                  className="d-flex align-items-center justify-content-center rounded-2 flex-shrink-0 mt-1"
                  style={{ width: '32px', height: '32px', backgroundColor: `${spec.color}15`, color: spec.color }}
                >
                  {spec.icon}
                </div>
                <div>
                  <span className="fw-bold d-block" style={{ color: 'var(--accent-blue)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{spec.label}</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{spec.value}</span>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </div>
    </Container>
  );
};

export default About;

