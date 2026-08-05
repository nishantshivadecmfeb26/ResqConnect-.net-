import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { disasterService, campService, sosService } from '../services/api';
import {
  FiAlertTriangle,
  FiHome,
  FiHelpCircle,
  FiArrowRight,
  FiUserCheck,
  FiUsers,
  FiTarget,
  FiEye,
  FiAward,
  FiShield,
  FiCheck,
  FiBriefcase,
  FiHeart,
  FiActivity,
  FiMapPin,
  FiZap
} from 'react-icons/fi';

const Home = () => {
  const { isAuthenticated, user } = useAuth();
  const [stats, setStats] = useState({
    activeDisasters: 0,
    reliefCamps: 0,
    sosRequests: 0,
    volunteers: 124,
  });

  useEffect(() => {
    const fetchPublicStats = async () => {
      try {
        const disastersList = await disasterService.getAll(true);
        const campsList = await campService.getAll();

        let sosCount = 0;
        if (isAuthenticated && user && user.roleName !== 'Victim') {
          const sosList = await sosService.getAll();
          sosCount = sosList.filter(s => s.status === 'Pending').length;
        }

        setStats({
          activeDisasters: disastersList.length,
          reliefCamps: campsList.length,
          sosRequests: sosCount || 4,
          volunteers: 124,
        });
      } catch (error) {
        console.error('Error fetching statistics:', error);
      }
    };
    fetchPublicStats();
  }, [isAuthenticated, user]);

  const getDashboardLink = () => {
    if (!user) return '/login';
    switch (user.roleName) {
      case 'Victim': return '/victim/dashboard';
      case 'Volunteer': return '/volunteer/dashboard';
      case 'NGO': return '/ngo/dashboard';
      case 'Government Officer': return '/gov/dashboard';
      case 'Admin': return '/admin/dashboard';
      default: return '/';
    }
  };

  const disasterCategories = [
    { label: 'Flood', img: '/images/flood.jpeg' },
    { label: 'Earthquake', img: '/images/earthquake.jpeg' },
    { label: 'Fire', img: '/images/fire.jpeg' },
    { label: 'Landslide', img: '/images/landslide.jpeg' },
  ];

  return (
    <div className="py-4 px-3 px-md-4 text-start">

      {/* ── HERO BANNER ─────────────────────────────────────────── */}
      <div
        className="fade-in-up mb-4 shadow-lg hero-banner"
        style={{
          minHeight: '500px',
          background: "linear-gradient(90deg, rgba(11,25,44,0.97) 0%, rgba(11,25,44,0.92) 38%, rgba(11,25,44,0.65) 60%, rgba(11,25,44,0) 80%), url('/images/rescue_workers_banner.png') right center / cover no-repeat",
          border: '1px solid #1e3a5f'
        }}
      >
        <Row className="align-items-center g-0" style={{ minHeight: '500px' }}>
          <Col lg={6} xl={5} className="p-5 d-flex flex-column justify-content-center text-start">
            <span style={{ color: '#f59e0b', fontWeight: '800', fontSize: '0.82rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              🛡️ India's Disaster Response Platform
            </span>
            <h1 className="display-4 fw-bold mb-3 mt-2" style={{ fontFamily: 'var(--font-heading)', color: '#ffffff', lineHeight: '1.12' }}>
              <span className="text-light-blue">We Are Here,</span><br />
              <span style={{ color: '#f59e0b' }}>To Help You</span>
            </h1>
            <p className="mb-4 fs-6" style={{ lineHeight: '1.7', maxWidth: '480px', color: 'rgba(255,255,255,0.85)' }}>
              ResQConnect is a centralized disaster management system bridging the gap between people in need and available resources during emergencies. Real-time information, faster response, better coordination.
            </p>

            <div className="d-flex gap-3 flex-wrap">
              {isAuthenticated ? (
                <Button
                  as={Link}
                  to={getDashboardLink()}
                  className="d-flex align-items-center gap-2 px-4 py-2 fw-bold text-white border-0"
                  style={{ backgroundColor: '#f59e0b', borderRadius: '8px', transition: 'var(--transition-smooth)' }}
                >
                  Go to Your Dashboard <FiArrowRight size={18} />
                </Button>
              ) : (
                <>
                  <Button
                    as={Link}
                    to="/register"
                    className="px-4 py-2 text-white border-0 fw-bold"
                    style={{ backgroundColor: '#f59e0b', borderRadius: '8px', transition: 'var(--transition-smooth)' }}
                  >
                    Register Now
                  </Button>
                  <Button
                    as={Link}
                    to="/login"
                    className="px-4 py-2 fw-bold"
                    style={{ borderColor: 'rgba(255,255,255,0.6)', color: '#ffffff', backgroundColor: 'transparent', border: '1.5px solid rgba(255,255,255,0.5)', borderRadius: '8px' }}
                  >
                    Sign In
                  </Button>
                </>
              )}
            </div>

            {/* Quick stats inside hero */}
            <div className="d-flex gap-4 mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.15)' }}>
              <div>
                <span className="fw-bold fs-5" style={{ color: '#fff' }}>{stats.activeDisasters}</span>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', fontWeight: 600 }}>Active Events</div>
              </div>
              <div>
                <span className="fw-bold fs-5" style={{ color: '#fff' }}>{stats.reliefCamps}</span>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', fontWeight: 600 }}>Relief Camps</div>
              </div>
              <div>
                <span className="fw-bold fs-5" style={{ color: '#fff' }}>24/7</span>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', fontWeight: 600 }}>Support Active</div>
              </div>
            </div>
          </Col>
        </Row>
      </div>

      {/* ── DISASTER CATEGORIES GALLERY ─────────────────────────── */}
      <Row className="g-3 mb-5 fade-in-up delay-1">
        {disasterCategories.map((cat, i) => (
          <Col xs={6} md={3} key={i}>
            <div className="disaster-img-card">
              <img src={cat.img} alt={cat.label} />
              <div className="overlay">
                <span><FiAlertTriangle size={13} className="me-1" />{cat.label}</span>
              </div>
            </div>
          </Col>
        ))}
      </Row>

      {/* ── CORE OBJECTIVES ─────────────────────────────────────── */}
      <Row className="g-3 mb-5 fade-in-up delay-2">
        {[
          { icon: <FiTarget size={22} />, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', title: 'Our Mission', text: 'To reduce response time, improve coordination, and save lives with a reliable platform for disaster management.' },
          { icon: <FiEye size={22} />, color: '#10b981', bg: 'rgba(16,185,129,0.1)', title: 'Our Vision', text: 'Build a disaster-resilient society where technology empowers communities for a safer tomorrow.' },
          { icon: <FiAward size={22} />, color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', title: 'Our Values', text: 'Compassion, Collaboration, Integrity, and Innovation drive everything we do in emergency response.' },
          { icon: <FiShield size={22} />, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', title: 'Our Commitment', text: 'We serve communities 24/7 with accurate information and timely relief support for all.' },
        ].map((obj, i) => (
          <Col md={6} lg={3} key={i}>
            <Card className="glass-panel glass-panel-hover border-0 h-100 p-3">
              <Card.Body className="p-2">
                <div
                  className="d-flex align-items-center justify-content-center mb-3 rounded-3"
                  style={{ width: '48px', height: '48px', backgroundColor: obj.bg, color: obj.color }}
                >
                  {obj.icon}
                </div>
                <h5 className="fw-bold mb-2" style={{ color: 'var(--accent-blue)' }}>{obj.title}</h5>
                <p className="small mb-0" style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>{obj.text}</p>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* ── STATISTICS BAR ──────────────────────────────────────── */}
      <div
        className="d-flex flex-wrap justify-content-around align-items-center py-4 px-3 rounded-4 mb-5 shadow fade-in-up delay-2"
        style={{
          background: 'linear-gradient(135deg, #0b192c 0%, #1d3a57 60%, #2c5282 100%)',
          border: '1px solid rgba(255,255,255,0.08)'
        }}
      >
        {[
          { icon: <FiAlertTriangle size={20} />, color: '#f59e0b', value: stats.activeDisasters, label: 'Active Disasters' },
          { icon: <FiUsers size={20} />, color: '#3b82f6', value: `${stats.volunteers}+`, label: 'Volunteers' },
          { icon: <FiHome size={20} />, color: '#10b981', value: stats.reliefCamps, label: 'Relief Camps' },
          { icon: <FiHelpCircle size={20} />, color: '#8b5cf6', value: stats.sosRequests, label: 'Pending SOS' },
          { icon: <FiUserCheck size={20} />, color: '#ef4444', value: '24/7', label: 'Active Support' },
        ].map((stat, i) => (
          <div key={i} className="d-flex align-items-center gap-3 my-2 px-3">
            <div
              className="d-flex align-items-center justify-content-center rounded-3"
              style={{ width: '44px', height: '44px', backgroundColor: stat.color, color: '#ffffff' }}
            >
              {stat.icon}
            </div>
            <div>
              <h4 className="fw-bold mb-0 text-light-blue" style={{ fontFamily: 'var(--font-heading)' }}>
                {stat.value}
              </h4>
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── TEAM & WHY CHOOSE US ─────────────────────────────────── */}
      <Row className="g-5 mb-5 align-items-stretch fade-in-up delay-3">
        <Col lg={6}>
          {/* Image Banner + Team */}
          <div
            className="rounded-4 overflow-hidden mb-4 shadow-sm"
            style={{ height: '220px', background: "linear-gradient(90deg, rgba(11,25,44,0.9) 40%, rgba(11,25,44,0.5) 80%), url('/images/flood_5.jpeg') center / cover no-repeat" }}
          >
            <div className="p-4 d-flex flex-column justify-content-end h-100">
              <h3 className="fw-bold mb-1 text-light-blue" style={{ fontFamily: 'var(--font-heading)' }}>Our Team</h3>
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.88rem', marginBottom: 0 }}>
                Passionate developers and disaster management experts working to create real impact through technology.
              </p>
            </div>
          </div>

          <Row className="g-3">
            {[
              { icon: <FiBriefcase size={20} />, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', title: 'Professionals', sub: 'Experienced Team' },
              { icon: <FiHeart size={20} />, color: '#10b981', bg: 'rgba(16,185,129,0.1)', title: 'Social Impact', sub: 'Community-Driven' },
              { icon: <FiZap size={20} />, color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', title: 'Innovation', sub: 'Technology-First' },
            ].map((item, i) => (
              <Col xs={4} key={i}>
                <Card className="glass-panel border-0 text-center p-3">
                  <div
                    className="d-flex align-items-center justify-content-center mb-2 rounded-3 mx-auto"
                    style={{ width: '44px', height: '44px', backgroundColor: item.bg, color: item.color }}
                  >
                    {item.icon}
                  </div>
                  <h6 className="fw-bold mb-1 small" style={{ color: 'var(--accent-blue)' }}>{item.title}</h6>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{item.sub}</span>
                </Card>
              </Col>
            ))}
          </Row>
        </Col>

        <Col lg={6}>
          <div className="glass-panel p-4 h-100">
            <h3 className="fw-bold mb-4" style={{ color: 'var(--accent-blue)' }}>Why Choose ResQConnect?</h3>
            <Row className="gy-3">
              {[
                'Real-time information and emergency alerts',
                'Secure and reliable government-grade platform',
                'Verified relief resources and shelter directories',
                'Built for communities — victims, NGOs, volunteers',
                'Easy to use across all devices',
                'Always operational when you need us most',
                'Coordinated response with government agencies',
                'Live tracking & SOS emergency dispatch',
              ].map((item, i) => (
                <Col md={6} key={i} className="d-flex align-items-start gap-2">
                  <FiCheck style={{ color: '#10b981', marginTop: '2px', flexShrink: 0 }} size={17} />
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', fontWeight: 500 }}>{item}</span>
                </Col>
              ))}
            </Row>

            {/* Disaster image row */}
            <Row className="g-2 mt-4">
              {['/images/earthquake_2.jpeg', '/images/flood_2.jpeg', '/images/fire_2.jpeg'].map((img, i) => (
                <Col xs={4} key={i}>
                  <div style={{ height: '80px', borderRadius: '8px', overflow: 'hidden' }}>
                    <img src={img} alt="disaster" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                </Col>
              ))}
            </Row>
          </div>
        </Col>
      </Row>

      {/* ── CALL TO ACTION BANNER ────────────────────────────────── */}
      <div
        className="rounded-4 overflow-hidden shadow-sm mb-4 fade-in-up"
        style={{
          background: "linear-gradient(90deg, rgba(11,25,44,0.95) 0%, rgba(44,82,130,0.9) 55%, rgba(44,82,130,0.75) 75%), url('/images/landslide_2.jpeg') right center / cover no-repeat",
          border: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center p-4 p-md-5">
          <div className="d-flex align-items-center gap-3 text-start mb-4 mb-md-0">
            <div
              className="d-flex align-items-center justify-content-center rounded-3"
              style={{ width: '52px', height: '52px', backgroundColor: 'rgba(245,158,11,0.25)', color: '#f59e0b', flexShrink: 0 }}
            >
              <FiActivity size={26} />
            </div>
            <div>
              <h4 className="fw-bold mb-1 text-light-blue" style={{ fontFamily: 'var(--font-heading)' }}>
                Together, we build a safer tomorrow.
              </h4>
              <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 0, fontSize: '0.9rem' }}>
                Join ResQConnect as a volunteer and be a part of the change you want to see.
              </p>
            </div>
          </div>

          <div className="d-flex gap-3 flex-shrink-0">
            <Button
              as={Link}
              to="/register"
              className="px-4 py-2 text-white border-0 fw-bold"
              style={{ backgroundColor: '#f59e0b', borderRadius: '8px', fontSize: '0.9rem' }}
            >
              Join as Volunteer
            </Button>
            <Button
              as={Link}
              to="/about"
              className="px-4 py-2 fw-bold"
              style={{ borderColor: 'rgba(255,255,255,0.5)', color: '#ffffff', backgroundColor: 'transparent', border: '1.5px solid rgba(255,255,255,0.5)', borderRadius: '8px', fontSize: '0.9rem' }}
            >
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

