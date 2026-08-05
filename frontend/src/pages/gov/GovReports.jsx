import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Row, Col, Alert, Button } from 'react-bootstrap';
import { disasterService, campService, sosService } from '../../services/api';
import { FiDownload, FiClipboard, FiFileText } from 'react-icons/fi';

const GovReports = () => {
  const [disasters, setDisasters] = useState([]);
  const [camps, setCamps] = useState([]);
  const [sosRequests, setSosRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const disastersList = await disasterService.getAll();
        const campsList = await campService.getAll();
        const sosList = await sosService.getAll();

        setDisasters(disastersList);
        setCamps(campsList);
        setSosRequests(sosList);
      } catch (error) {
        console.error('Failed to load report datasets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalDisasters = disasters.length;
  const activeDisasters = disasters.filter(d => d.status === 'Active').length;
  
  const totalCamps = camps.length;
  const totalOccupancy = camps.reduce((sum, c) => sum + c.currentOccupancy, 0);
  const totalCapacity = camps.reduce((sum, c) => sum + c.capacity, 0);
  
  const totalSOS = sosRequests.length;
  const pendingSOS = sosRequests.filter(s => s.status === 'Pending').length;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Container className="py-4 text-start">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="text-white mb-1">System Intelligence Reports</h2>
          <p className="text-muted small">Analyze summary statistics of active operations and print summaries.</p>
        </div>
        <Button onClick={handlePrint} className="btn-premium d-flex align-items-center">
          <FiDownload className="me-2" /> Print Summary Report
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
        </div>
      ) : (
        <div className="printable-report">
          {/* Executive Summary */}
          <Card className="glass-panel border-0 bg-dark p-4 mb-4">
            <Card.Body>
              <h4 className="text-white mb-4 d-flex align-items-center">
                <FiFileText className="text-primary me-2" /> Executive Summary
              </h4>
              
              <Row className="g-4 text-muted small text-start">
                <Col md={4} className="border-end border-light border-opacity-10">
                  <span className="text-white fw-bold d-block fs-5 mb-2">Disasters Logged</span>
                  <div className="d-flex justify-content-between mb-1">
                    <span>Active Emergency Incidents:</span>
                    <span className="fw-bold text-danger">{activeDisasters}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Archived Incidents:</span>
                    <span className="fw-bold text-white">{totalDisasters - activeDisasters}</span>
                  </div>
                </Col>

                <Col md={4} className="border-end border-light border-opacity-10">
                  <span className="text-white fw-bold d-block fs-5 mb-2">Shelter Occupancy</span>
                  <div className="d-flex justify-content-between mb-1">
                    <span>Relief Camps Operating:</span>
                    <span className="fw-bold text-white">{totalCamps}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Total Sheltered Victims:</span>
                    <span className="fw-bold text-success">{totalOccupancy} / {totalCapacity}</span>
                  </div>
                </Col>

                <Col md={4}>
                  <span className="text-white fw-bold d-block fs-5 mb-2">Distress SOS Tickets</span>
                  <div className="d-flex justify-content-between mb-1">
                    <span>Pending Responders:</span>
                    <span className="fw-bold text-warning">{pendingSOS}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Total Requests Handled:</span>
                    <span className="fw-bold text-white">{totalSOS}</span>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Incident Lists */}
          <Card className="glass-panel border-0 bg-dark p-3 mb-4">
            <Card.Header className="bg-transparent border-0 text-white fw-bold pb-3">
              Operational Camp Directory Details
            </Card.Header>
            <Card.Body className="p-0">
              {camps.length === 0 ? (
                <Alert variant="info" className="bg-dark border-light border-opacity-10 text-muted mb-0">No camps running.</Alert>
              ) : (
                <Table hover variant="dark" className="align-middle bg-transparent mb-0">
                  <thead>
                    <tr className="border-light border-opacity-10">
                      <th>Camp Name</th>
                      <th>Street Location</th>
                      <th>Max Capacity</th>
                      <th>Current Occupancy</th>
                      <th>Fill Percentage</th>
                      <th>Contact Number</th>
                    </tr>
                  </thead>
                  <tbody>
                    {camps.map((c) => (
                      <tr key={c.id} className="border-light border-opacity-10">
                        <td className="fw-semibold small">{c.name}</td>
                        <td className="small text-muted">{c.address}</td>
                        <td className="small text-muted">{c.capacity}</td>
                        <td className="fw-bold">{c.currentOccupancy}</td>
                        <td>
                          {((c.currentOccupancy / c.capacity) * 100).toFixed(1)}%
                        </td>
                        <td className="small text-muted">{c.contactNumber}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </div>
      )}
    </Container>
  );
};

export default GovReports;
