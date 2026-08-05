import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { userService, disasterService, campService, taskService } from '../../services/api';
import { FiUsers, FiAlertCircle, FiHome, FiGrid } from 'react-icons/fi';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [disasters, setDisasters] = useState([]);
  const [camps, setCamps] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const uList = await userService.getAll();
        const dList = await disasterService.getAll();
        const cList = await campService.getAll();
        const tList = await taskService.getAll();

        setUsers(uList);
        setDisasters(dList);
        setCamps(cList);
        setTasks(tList);
      } catch (error) {
        console.error('Failed to load Admin dashboard datasets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalUsers = users.length;
  const activeDisasters = disasters.filter((d) => d.status === 'Active').length;
  const totalCamps = camps.length;
  const activeTasks = tasks.filter((t) => t.status !== 'Completed' && t.status !== 'Cancelled').length;

  // Chart Data: Users by Role
  const roleChartData = {
    labels: ['Victim', 'Volunteer', 'NGO', 'Officer', 'Admin'],
    datasets: [
      {
        data: [
          users.filter((u) => u.roleName === 'Victim').length,
          users.filter((u) => u.roleName === 'Volunteer').length,
          users.filter((u) => u.roleName === 'NGO').length,
          users.filter((u) => u.roleName === 'Government Officer').length,
          users.filter((u) => u.roleName === 'Admin').length,
        ],
        backgroundColor: [
          'rgba(59, 130, 246, 0.6)', // Victim - blue
          'rgba(16, 185, 129, 0.6)', // Volunteer - green
          'rgba(139, 92, 246, 0.6)', // NGO - purple
          'rgba(245, 158, 11, 0.6)', // Officer - orange
          'rgba(244, 63, 94, 0.6)',  // Admin - red
        ],
        borderColor: ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#f43f5e'],
        borderWidth: 1,
      },
    ],
  };

  // Chart Data: Disaster Severity Spread
  const severityChartData = {
    labels: ['Low', 'Medium', 'High', 'Critical'],
    datasets: [
      {
        label: 'Incidents Count',
        data: [
          disasters.filter((d) => d.severity === 'Low').length,
          disasters.filter((d) => d.severity === 'Medium').length,
          disasters.filter((d) => d.severity === 'High').length,
          disasters.filter((d) => d.severity === 'Critical').length,
        ],
        backgroundColor: 'rgba(99, 102, 241, 0.6)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 1,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom', labels: { color: '#4a5568', font: { family: 'Plus Jakarta Sans' } } },
    },
  };

  const barOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        ticks: { color: '#4a5568', stepSize: 1, font: { family: 'Plus Jakarta Sans' } },
      },
      x: {
        grid: { display: false },
        ticks: { color: '#4a5568', font: { family: 'Plus Jakarta Sans' } },
      },
    },
    plugins: {
      legend: { display: false },
    },
  };

  return (
    <Container className="py-4 text-start">
      <h2 className="mb-1" style={{ color: 'var(--accent-blue)' }}>Global Admin Dashboard</h2>
      <p className="text-muted small mb-4">View overarching metrics, check databases profiles integrity, and examine API integrations.</p>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
        </div>
      ) : (
        <>
          {/* Quick Stats Grid */}
          <Row className="g-4 mb-4">
            <Col md={6} lg={3}>
              <Card className="glass-panel border-0 bg-dark p-3">
                <Card.Body>
                  <FiUsers className="text-primary mb-2" size={28} />
                  <h6 className="text-muted small uppercase fw-bold mb-1">Total Users</h6>
                  <h3 className="text-white fw-bold mb-0">{totalUsers}</h3>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6} lg={3}>
              <Card className="glass-panel border-0 bg-dark p-3">
                <Card.Body>
                  <FiAlertCircle className="text-danger mb-2" size={28} />
                  <h6 className="text-muted small uppercase fw-bold mb-1">Active Incidents</h6>
                  <h3 className="text-white fw-bold mb-0">{activeDisasters}</h3>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6} lg={3}>
              <Card className="glass-panel border-0 bg-dark p-3">
                <Card.Body>
                  <FiHome className="text-indigo mb-2" size={28} style={{ color: '#6366f1' }} />
                  <h6 className="text-muted small uppercase fw-bold mb-1">Active Shelters</h6>
                  <h3 className="text-white fw-bold mb-0">{totalCamps}</h3>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6} lg={3}>
              <Card className="glass-panel border-0 bg-dark p-3">
                <Card.Body>
                  <FiGrid className="text-warning mb-2" size={28} />
                  <h6 className="text-muted small uppercase fw-bold mb-1">Pending Tasks</h6>
                  <h3 className="text-white fw-bold mb-0">{activeTasks}</h3>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Graphs Row */}
          <Row className="g-4">
            <Col lg={5}>
              <Card className="glass-panel border-0 bg-dark p-3 h-100">
                <Card.Header className="bg-transparent border-0 text-white fw-bold pb-2">
                  User Role Distribution
                </Card.Header>
                <Card.Body className="d-flex justify-content-center align-items-center">
                  <div style={{ width: '80%', maxHeight: '250px' }}>
                    <Doughnut data={roleChartData} options={doughnutOptions} />
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={7}>
              <Card className="glass-panel border-0 bg-dark p-3 h-100">
                <Card.Header className="bg-transparent border-0 text-white fw-bold pb-2">
                  Disasters Severity Tallies
                </Card.Header>
                <Card.Body>
                  {disasters.length === 0 ? (
                    <div className="text-center py-5 text-muted small">No disasters logged.</div>
                  ) : (
                    <Bar data={severityChartData} options={barOptions} height={120} />
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </Container>
  );
};

export default AdminDashboard;
