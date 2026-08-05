import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Button, Badge, Modal, Form, Alert, Row, Col } from 'react-bootstrap';
import { volunteerService, campService, taskService } from '../../services/api';
import { toast } from 'react-toastify';
import { FiUsers, FiCheck, FiX, FiClipboard } from 'react-icons/fi';

const NGOVolunteers = () => {
  const [volunteers, setVolunteers] = useState([]);
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Assign Task Modal States
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [activeVolunteer, setActiveVolunteer] = useState(null);
  const [taskData, setTaskData] = useState({
    campId: '',
    description: '',
    priority: 'Medium',
    requiredSkillTier: '1',
  });

  // Verification Modal States
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyData, setVerifyData] = useState({
    verificationStatus: 'Verified',
    skillTier: '1',
  });

  const fetchData = async () => {
    try {
      const volList = await volunteerService.getAll();
      const campsList = await campService.getAll();

      setVolunteers(volList);
      setCamps(campsList);

      if (campsList.length > 0) {
        setTaskData((prev) => ({ 
          ...prev, 
          campId: campsList[0].id.toString(),
          requiredSkillTier: '1'
        }));
      }
    } catch (error) {
      console.error('Failed to load volunteer datasets:', error);
      toast.error('Unable to retrieve records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenVerifyModal = (volunteer) => {
    setActiveVolunteer(volunteer);
    setVerifyData({
      verificationStatus: volunteer.verificationStatus === 'Pending' ? 'Verified' : volunteer.verificationStatus,
      skillTier: (volunteer.skillTier || 1).toString(),
    });
    setShowVerifyModal(true);
  };

  const handleVerifyInputChange = (e) => {
    const { name, value } = e.target;
    setVerifyData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitVerification = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        verificationStatus: verifyData.verificationStatus,
        skillTier: parseInt(verifyData.skillTier),
      };
      await volunteerService.verify(activeVolunteer.id, payload);
      toast.success(`Volunteer details successfully updated!`);
      setShowVerifyModal(false);
      fetchData(); // Reload records
    } catch (error) {
      console.error(error);
      toast.error('Failed to verify volunteer.');
    }
  };

  const handleOpenAssignTask = (volunteer) => {
    if (camps.length === 0) {
      toast.error('No active relief camps found. Please register a relief camp first before assigning tasks.');
      return;
    }
    if (volunteer.availabilityStatus === 'Offline') {
      toast.error('Cannot assign task: This volunteer is currently offline.');
      return;
    }
    setActiveVolunteer(volunteer);
    setTaskData({
      campId: camps[0].id.toString(),
      description: '',
      priority: 'Medium',
      requiredSkillTier: '1',
    });
    setShowTaskModal(true);
  };

  const handleTaskInputChange = (e) => {
    const { name, value } = e.target;
    setTaskData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitTask = async (e) => {
    e.preventDefault();
    const { campId, description, priority, requiredSkillTier } = taskData;

    if (!campId || !description || !priority || !requiredSkillTier) {
      toast.error('Please complete all form fields.');
      return;
    }

    const reqTierInt = parseInt(requiredSkillTier);
    if (activeVolunteer && activeVolunteer.skillTier < reqTierInt) {
      toast.error(`Cannot assign task: Volunteer skill tier (${activeVolunteer.skillTier}) is below required tier (${reqTierInt}).`);
      return;
    }

    try {
      const payload = {
        volunteerId: activeVolunteer.id,
        campId: parseInt(campId),
        description,
        priority,
        requiredSkillTier: reqTierInt,
      };

      await taskService.create(payload);
      toast.success(`Task successfully assigned to ${activeVolunteer.userName}!`);
      setShowTaskModal(false);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to assign task.');
    }
  };

  const getVerificationBadge = (status) => {
    switch (status) {
      case 'Pending': return <Badge bg="warning" text="dark">Pending Review</Badge>;
      case 'Verified': return <Badge bg="success">Verified</Badge>;
      case 'Rejected': return <Badge bg="danger">Rejected</Badge>;
      default: return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const getAvailabilityBadge = (status) => {
    switch (status) {
      case 'Available': return <Badge bg="success">Available</Badge>;
      case 'Busy': return <Badge bg="danger">Busy</Badge>;
      case 'Offline': return <Badge bg="secondary">Offline</Badge>;
      default: return <Badge bg="dark">{status}</Badge>;
    }
  };

  const getTierLabel = (tier) => {
    switch (tier) {
      case 1: return 'Tier 1 (General)';
      case 2: return 'Tier 2 (Rescue/Field)';
      case 3: return 'Tier 3 (Critical/Medical)';
      default: return `Tier ${tier}`;
    }
  };

  return (
    <Container className="py-4 text-start">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="text-white mb-1">Volunteers Registry</h2>
          <p className="text-muted small">Verify volunteer credentials, view availability logs, assign camp tasks, and manage skill levels.</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
        </div>
      ) : volunteers.length === 0 ? (
        <Alert variant="info" className="bg-dark border-light border-opacity-10 text-muted">
          No registered volunteers currently recorded in the system.
        </Alert>
      ) : (
        <Card className="glass-panel border-0 bg-dark p-3">
          <Card.Body className="p-0">
            <div className="table-responsive">
              <Table hover variant="dark" className="align-middle bg-transparent mb-0">
                <thead>
                  <tr className="border-light border-opacity-10">
                    <th>Name</th>
                    <th>Email / Phone</th>
                    <th>Skills / Specialities</th>
                    <th>Skill Level / XP</th>
                    <th>Availability</th>
                    <th>Verification</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {volunteers.map((v) => (
                    <tr key={v.id} className="border-light border-opacity-10">
                      <td className="fw-semibold small">
                        {v.userName}
                        {v.idProofNumber && <span className="text-muted d-block" style={{ fontSize: '0.75rem' }}>ID: {v.idProofNumber}</span>}
                      </td>
                      <td className="small">
                        {v.userEmail} <span className="text-muted d-block" style={{ fontSize: '0.75rem' }}>{v.userPhone}</span>
                      </td>
                      <td className="small" style={{ maxWidth: '180px' }}>{v.skills}</td>
                      <td className="small">
                        <span className="text-primary fw-semibold">{getTierLabel(v.skillTier)}</span>
                        <span className="text-success d-block" style={{ fontSize: '0.75rem' }}>{v.credibilityScore} XP</span>
                      </td>
                      <td>{getAvailabilityBadge(v.availabilityStatus)}</td>
                      <td>{getVerificationBadge(v.verificationStatus)}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <Button 
                            variant="outline-info" 
                            size="sm"
                            onClick={() => handleOpenVerifyModal(v)}
                            className="d-flex align-items-center justify-content-center py-1 px-2"
                          >
                            Review & Verify
                          </Button>
                          
                          {v.verificationStatus === 'Verified' && (
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => handleOpenAssignTask(v)}
                              className="d-flex align-items-center gap-1 py-1"
                            >
                              <FiClipboard size={12} /> Assign Task
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Verify Volunteer Modal */}
      <Modal show={showVerifyModal} onHide={() => setShowVerifyModal(false)} contentClassName="glass-panel text-light" dialogClassName="modal-dark" centered>
        <Modal.Header closeButton closeVariant="white" className="border-light border-opacity-10 bg-dark">
          <Modal.Title className="fw-bold">Review Volunteer Credentials</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark text-start">
          {activeVolunteer && (
            <Form onSubmit={handleSubmitVerification}>
              <div className="mb-3">
                <p className="mb-1 text-muted small">Volunteer Name:</p>
                <p className="fw-semibold mb-0">{activeVolunteer.userName}</p>
              </div>

              <Row className="g-3 mb-3">
                <Col md={6}>
                  <p className="mb-1 text-muted small">Aadhaar / ID Proof:</p>
                  <p className="fw-semibold">{activeVolunteer.idProofNumber || 'Not provided (DigiLocker Mock)'}</p>
                </Col>
                <Col md={6}>
                  <p className="mb-1 text-muted small">Credibility Score:</p>
                  <p className="fw-semibold text-success">{activeVolunteer.credibilityScore} XP</p>
                </Col>
              </Row>

              <div className="mb-3">
                <p className="mb-1 text-muted small">Skills & Specialties:</p>
                <p className="small border p-2 rounded bg-secondary bg-opacity-10">{activeVolunteer.skills || 'None declared'}</p>
              </div>

              <div className="mb-3">
                <p className="mb-1 text-muted small">Verification Document:</p>
                {activeVolunteer.documentUrl ? (
                  <a href={activeVolunteer.documentUrl} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary d-inline-block">
                    Open Certification Document
                  </a>
                ) : (
                  <span className="text-muted small">No verification documents uploaded.</span>
                )}
              </div>

              <hr className="bg-secondary" />

              <Form.Group className="mb-3" controlId="verifyStatus">
                <Form.Label className="text-muted small fw-semibold">Verification Action</Form.Label>
                <Form.Select
                  name="verificationStatus"
                  value={verifyData.verificationStatus}
                  onChange={handleVerifyInputChange}
                  className="form-glass"
                  required
                >
                  <option value="Verified" className="bg-dark">Verify Profile (Approved)</option>
                  <option value="Rejected" className="bg-dark">Reject Profile (Denied)</option>
                  <option value="Pending" className="bg-dark">Leave Pending (In review)</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-4" controlId="verifyTier">
                <Form.Label className="text-muted small fw-semibold">Assigned Skill Level / Tier</Form.Label>
                <Form.Select
                  name="skillTier"
                  value={verifyData.skillTier}
                  onChange={handleVerifyInputChange}
                  className="form-glass"
                  required
                >
                  <option value="1" className="bg-dark">Tier 1 - General (Supply distribution, general help)</option>
                  <option value="2" className="bg-dark">Tier 2 - Field/Verified (Heavy driving, boat operations)</option>
                  <option value="3" className="bg-dark">Tier 3 - Critical/Medical (First Aid, Structural Rescue, Doctors)</option>
                </Form.Select>
              </Form.Group>

              <div className="d-flex justify-content-end gap-2">
                <Button variant="outline-light" onClick={() => setShowVerifyModal(false)}>Cancel</Button>
                <Button type="submit" className="btn-premium">Submit Verification</Button>
              </div>
            </Form>
          )}
        </Modal.Body>
      </Modal>

      {/* Assign Task Modal */}
      <Modal show={showTaskModal} onHide={() => setShowTaskModal(false)} contentClassName="glass-panel text-light" dialogClassName="modal-dark" centered>
        <Modal.Header closeButton closeVariant="white" className="border-light border-opacity-10 bg-dark">
          <Modal.Title className="fw-bold">Assign Work Order</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark text-start">
          {activeVolunteer && (
            <Form onSubmit={handleSubmitTask}>
              <div className="mb-3 d-flex justify-content-between align-items-center">
                <div>
                  <p className="small text-muted mb-0">Creating task assignment for:</p>
                  <strong>{activeVolunteer.userName}</strong>
                </div>
                <div>
                  <span className="badge bg-primary">Current Level: Tier {activeVolunteer.skillTier}</span>
                </div>
              </div>

              <Form.Group className="mb-3" controlId="taskCamp">
                <Form.Label className="text-muted small fw-semibold">Target Relief Camp</Form.Label>
                <Form.Select
                  name="campId"
                  value={taskData.campId}
                  onChange={handleTaskInputChange}
                  className="form-glass"
                  required
                >
                  {camps.map((c) => (
                    <option key={c.id} value={c.id} className="bg-dark">{c.name}</option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3" controlId="taskDescription">
                <Form.Label className="text-muted small fw-semibold">Work Order Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  placeholder="Describe the tasks to complete (e.g. Unload medical crates, verify entries at camp doors)"
                  value={taskData.description}
                  onChange={handleTaskInputChange}
                  className="form-glass"
                  required
                />
              </Form.Group>

              <Row className="g-3 mb-4">
                <Col md={6}>
                  <Form.Group controlId="taskPriority">
                    <Form.Label className="text-muted small fw-semibold">Task Priority</Form.Label>
                    <Form.Select
                      name="priority"
                      value={taskData.priority}
                      onChange={handleTaskInputChange}
                      className="form-glass"
                      required
                    >
                      <option value="Low" className="bg-dark">Low (Non-urgent)</option>
                      <option value="Medium" className="bg-dark">Medium (Standard dispatch)</option>
                      <option value="High" className="bg-dark">High (Urgent priority)</option>
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group controlId="taskRequiredTier">
                    <Form.Label className="text-muted small fw-semibold">Required Skill Level / Tier</Form.Label>
                    <Form.Select
                      name="requiredSkillTier"
                      value={taskData.requiredSkillTier}
                      onChange={handleTaskInputChange}
                      className="form-glass"
                      required
                    >
                      <option value="1" className="bg-dark">Tier 1 - General Help</option>
                      <option value="2" className="bg-dark">Tier 2 - Field/Rescue Ops</option>
                      <option value="3" className="bg-dark">Tier 3 - Critical Medical</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              {parseInt(taskData.requiredSkillTier) > activeVolunteer.skillTier && (
                <Alert variant="danger" className="py-2 small">
                  <strong>Warning:</strong> Task requires <strong>Tier {taskData.requiredSkillTier}</strong>, but volunteer is only <strong>Tier {activeVolunteer.skillTier}</strong>. Assignment will be rejected by the server.
                </Alert>
              )}

              <div className="d-flex justify-content-end gap-2">
                <Button variant="outline-light" onClick={() => setShowTaskModal(false)}>Cancel</Button>
                <Button type="submit" className="btn-premium" disabled={parseInt(taskData.requiredSkillTier) > activeVolunteer.skillTier}>Assign Task</Button>
              </div>
            </Form>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default NGOVolunteers;
