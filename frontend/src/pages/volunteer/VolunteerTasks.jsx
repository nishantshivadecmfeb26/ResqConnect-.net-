import React, { useState, useEffect, useRef } from 'react';
import { Container, Card, Table, Badge, Button, Alert, Modal, Form } from 'react-bootstrap';
import { sosService } from '../../services/api';
import { toast } from 'react-toastify';
import { FiCheck, FiPlay, FiNavigation, FiCheckCircle, FiActivity, FiCamera, FiFileText } from 'react-icons/fi';

const VolunteerTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Proof Modal state
  const [showProofModal, setShowProofModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [proofData, setProofData] = useState({
    remarks: '',
    proofImage: '',
  });
  const [submittingProof, setSubmittingProof] = useState(false);
  const fileInputRef = useRef(null);

  const fetchTasks = async () => {
    try {
      const data = await sosService.getVolunteerTasks();
      setTasks(data);
    } catch (error) {
      console.error('Failed to load volunteer tasks:', error);
      toast.error('Unable to retrieve task list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleUpdateStatus = async (id, nextStatus) => {
    try {
      await sosService.updateVolunteerTaskStatus(id, nextStatus);
      toast.success(`Rescue status updated to: ${nextStatus}`);
      fetchTasks();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to update task status.');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size must be smaller than 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofData(prev => ({ ...prev, proofImage: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const openProofModal = (task) => {
    setSelectedTask(task);
    setProofData({
      remarks: '',
      proofImage: '',
    });
    setShowProofModal(true);
  };

  const handleSubmitProof = async (e) => {
    e.preventDefault();
    if (!proofData.proofImage) {
      toast.warn("Please upload a completion proof image.");
      return;
    }

    setSubmittingProof(true);
    try {
      const payload = {
        proofImageUrl: proofData.proofImage,
        remarks: proofData.remarks,
      };
      await sosService.uploadVolunteerTaskProof(selectedTask.id, payload);
      toast.success("Rescue proof submitted and distress call marked as Completed!");
      setShowProofModal(false);
      fetchTasks();
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload completion proof.");
    } finally {
      setSubmittingProof(false);
    }
  };

  const getPriorityBadge = (prio) => {
    switch (prio) {
      case 'Low': return <Badge bg="secondary">Low</Badge>;
      case 'Medium': return <Badge bg="primary">Medium</Badge>;
      case 'High': return <Badge bg="warning" text="dark">High</Badge>;
      case 'Critical': return <Badge bg="danger">Critical</Badge>;
      default: return <Badge bg="secondary">{prio}</Badge>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending': return <Badge bg="warning" text="dark">Pending</Badge>;
      case 'Assigned to NGO': return <Badge bg="info" text="dark">Assigned to NGO</Badge>;
      case 'Volunteer Assigned': return <Badge bg="primary">Volunteer Assigned</Badge>;
      case 'Accepted': return <Badge bg="" style={{ backgroundColor: '#6366f1', color: 'white' }}>Accepted</Badge>;
      case 'On The Way': return <Badge bg="info">On The Way</Badge>;
      case 'Reached': return <Badge bg="" style={{ backgroundColor: '#0d9488', color: 'white' }}>Reached</Badge>;
      case 'Rescue In Progress': return <Badge bg="warning" text="dark">Rescue In Progress</Badge>;
      case 'Victim Rescued': return <Badge bg="" style={{ backgroundColor: '#3b82f6', color: 'white' }}>Victim Rescued</Badge>;
      case 'Completed': return <Badge bg="success">Completed</Badge>;
      case 'Verified by NGO': return <Badge bg="success">Verified by NGO</Badge>;
      case 'Resolved': return <Badge bg="success">Resolved</Badge>;
      case 'Rejected': return <Badge bg="danger">Rejected</Badge>;
      case 'Cancelled': return <Badge bg="secondary">Cancelled</Badge>;
      default: return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const renderStatusActions = (t) => {
    const status = t.currentStatus || t.status;
    switch (status) {
      case 'Volunteer Assigned':
        return (
          <Button 
            variant="premium" 
            size="sm"
            onClick={() => handleUpdateStatus(t.id, 'Accepted')}
          >
            Accept Rescue Mission
          </Button>
        );
      case 'Accepted':
        return (
          <Button 
            variant="info" 
            size="sm"
            onClick={() => handleUpdateStatus(t.id, 'On The Way')}
          >
            Enroute / On the Way
          </Button>
        );
      case 'On The Way':
        return (
          <Button 
            variant="teal" 
            size="sm"
            style={{ backgroundColor: '#0d9488', color: 'white', border: 'none' }}
            onClick={() => handleUpdateStatus(t.id, 'Reached')}
          >
            Mark Reached Spot
          </Button>
        );
      case 'Reached':
        return (
          <Button 
            variant="warning" 
            size="sm"
            onClick={() => handleUpdateStatus(t.id, 'Rescue In Progress')}
          >
            Start Rescue Operation
          </Button>
        );
      case 'Rescue In Progress':
        return (
          <Button 
            variant="danger" 
            size="sm"
            onClick={() => handleUpdateStatus(t.id, 'Victim Rescued')}
          >
            Mark Victim Rescued
          </Button>
        );
      case 'Victim Rescued':
        return (
          <Button 
            variant="success" 
            size="sm"
            onClick={() => openProofModal(t)}
            className="d-flex align-items-center gap-1"
          >
            <FiCamera /> Submit Completion Proof
          </Button>
        );
      case 'Completed':
        return <span className="text-muted small">Awaiting NGO verification</span>;
      case 'Verified by NGO':
        return <span className="text-muted small">Awaiting Government resolution</span>;
      case 'Resolved':
        return <span className="text-success small fw-bold"><FiCheckCircle /> Mission Resolved</span>;
      default:
        return <span className="text-muted">-</span>;
    }
  };

  return (
    <Container className="py-4 text-start">
      <h2 className="text-white mb-1">Rescue Task Command</h2>
      <p className="text-muted small mb-4">View active rescue requests dispatched to you by your NGO coordinator, update coordinates, and submit completion reports.</p>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
        </div>
      ) : tasks.length === 0 ? (
        <Alert variant="info" className="bg-dark border-light border-opacity-10 text-muted">
          No rescue tasks have been assigned to you. Dispatched assignments from your NGO coordinator will appear here in real-time.
        </Alert>
      ) : (
        <Card className="glass-panel border-0 bg-dark p-3">
          <Card.Body className="p-0">
            <div className="table-responsive">
              <Table hover variant="dark" className="bg-transparent align-middle mb-0">
                <thead>
                  <tr className="border-light border-opacity-10">
                    <th>Time Dispatched</th>
                    <th>Victim / Phone</th>
                    <th>Crisis & Category</th>
                    <th>GPS Target</th>
                    <th>Risk Priority</th>
                    <th>Rescue Status</th>
                    <th>Operational Steps</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((t) => (
                    <tr key={t.id} className="border-light border-opacity-10">
                      <td className="small text-muted" style={{ fontSize: '0.75rem' }}>
                        {new Date(new Date(t.assignedDate || t.createdAt).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        <br/>
                        {new Date(new Date(t.assignedDate || t.createdAt).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })).toLocaleDateString('en-IN')}
                      </td>
                      <td>
                        <div className="fw-bold">{t.victimName}</div>
                        <div className="small text-muted">{t.contactNumber}</div>
                        <div className="small text-light">People: <strong>{t.numberOfPeople}</strong></div>
                      </td>
                      <td className="small">
                        <div className="fw-semibold">{t.disasterType}</div>
                        <div className="text-muted">{t.category}</div>
                      </td>
                      <td>
                        <div className="small font-monospace text-muted mb-1">{t.latitude.toFixed(5)}, {t.longitude.toFixed(5)}</div>
                        <a 
                          href={`https://www.google.com/maps/search/?api=1&query=${t.latitude},${t.longitude}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="btn btn-outline-light btn-xs py-0.5 px-2 d-inline-flex align-items-center gap-1 text-xs"
                          style={{ fontSize: '0.75rem' }}
                        >
                          <FiNavigation size={10} /> Google Maps
                        </a>
                      </td>
                      <td>{getPriorityBadge(t.emergencyLevel || t.priority)}</td>
                      <td>{getStatusBadge(t.currentStatus || t.status)}</td>
                      <td>{renderStatusActions(t)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Proof Submission Modal */}
      <Modal show={showProofModal} onHide={() => setShowProofModal(false)} contentClassName="glass-panel text-light" dialogClassName="modal-dark" centered>
        <Form onSubmit={handleSubmitProof}>
          <Modal.Header closeButton closeVariant="white" className="border-light border-opacity-10 bg-dark">
            <Modal.Title className="fw-bold d-flex align-items-center">
              <FiCamera className="text-danger me-2" /> Submit Rescue Proof
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="bg-dark text-start">
            {selectedTask && (
              <div>
                <div className="mb-3 bg-dark bg-opacity-50 p-2.5 rounded border border-secondary border-opacity-20 small">
                  <strong>Victim Name:</strong> {selectedTask.victimName} <br />
                  <strong>Situation:</strong> {selectedTask.description}
                </div>

                <Form.Group className="mb-3" controlId="proofFile">
                  <Form.Label className="text-muted small fw-semibold">Photo Proof of Completion *</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    className="form-glass"
                    required
                  />
                  {proofData.proofImage && (
                    <div className="mt-2 text-center">
                      <img src={proofData.proofImage} alt="Proof Preview" className="img-thumbnail rounded bg-dark" style={{ maxHeight: '150px' }} />
                    </div>
                  )}
                </Form.Group>

                <Form.Group className="mb-3" controlId="proofRemarks">
                  <Form.Label className="text-muted small fw-semibold">Rescue Remarks / Details *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Provide details about the rescue e.g. 'Victim successfully evacuated and housed at Green Valley Camp'"
                    value={proofData.remarks}
                    onChange={(e) => setProofData(prev => ({ ...prev, remarks: e.target.value }))}
                    className="form-glass"
                    required
                  />
                </Form.Group>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer className="bg-dark border-light border-opacity-10">
            <Button variant="outline-light" onClick={() => setShowProofModal(false)}>Cancel</Button>
            <Button type="submit" variant="success" disabled={submittingProof || !proofData.proofImage}>
              {submittingProof ? 'Uploading...' : 'Verify & Submit'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default VolunteerTasks;
