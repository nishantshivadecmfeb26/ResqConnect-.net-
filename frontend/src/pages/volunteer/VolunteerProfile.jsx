import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { volunteerService } from '../../services/api';
import { toast } from 'react-toastify';
import { FiCheck, FiSettings, FiMapPin, FiCpu } from 'react-icons/fi';

const VolunteerProfile = () => {
  const [profile, setProfile] = useState({
    skills: '',
    currentLocation: '',
    availabilityStatus: 'Available',
    documentUrl: '',
    idProofNumber: '',
  });
  const [skillTier, setSkillTier] = useState(1);
  const [credibilityScore, setCredibilityScore] = useState(0);
  const [verificationStatus, setVerificationStatus] = useState('Pending');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchProfile = async () => {
    try {
      const data = await volunteerService.getMe();
      if (data) {
        setProfile({
          skills: data.skills || '',
          currentLocation: data.currentLocation || '',
          availabilityStatus: data.availabilityStatus || 'Available',
          documentUrl: data.documentUrl || '',
          idProofNumber: data.idProofNumber || '',
        });
        setSkillTier(data.skillTier || 1);
        setCredibilityScore(data.credibilityScore || 0);
        setVerificationStatus(data.verificationStatus || 'Pending');
      }
    } catch (error) {
      console.error('Failed to load volunteer profile:', error);
      toast.error('Unable to retrieve volunteer details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await volunteerService.updateProfile(profile);
      toast.success('Volunteer profile details updated!');
      await fetchProfile(); // Reload to get updated credentials/tier info
    } catch (error) {
      console.error(error);
      toast.error('Failed to update volunteer profile.');
    } finally {
      setSaving(false);
    }
  };

  const getTierName = (tier) => {
    switch (tier) {
      case 1: return 'Tier 1 (General Work)';
      case 2: return 'Tier 2 (Field/Verified Work)';
      case 3: return 'Tier 3 (Critical/Medical/Rescue)';
      default: return 'Tier 1';
    }
  };

  return (
    <Container className="py-4 text-start">
      <h2 className="text-white mb-1">Volunteer Profile</h2>
      <p className="text-muted small mb-4">Set availability status, define your skills, and verify your credentials to unlock higher skill tiers.</p>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
        </div>
      ) : (
        <Row className="g-4">
          <Col lg={4}>
            <Card className="glass-panel border-0 bg-dark text-white p-3 mb-4">
              <Card.Body className="text-center">
                <div className="mb-3">
                  <div className="d-inline-block bg-primary rounded-circle p-3 mb-2">
                    <FiCpu size={32} />
                  </div>
                  <h5 className="mb-0">Profile Status</h5>
                  <span className={`badge ${verificationStatus === 'Verified' ? 'bg-success' : (verificationStatus === 'Rejected' ? 'bg-danger' : 'bg-warning')} mt-1`}>
                    {verificationStatus}
                  </span>
                </div>
                <hr className="bg-secondary" />
                <div className="text-start">
                  <p className="mb-1 text-muted small">Current Level:</p>
                  <p className="fw-semibold text-primary">{getTierName(skillTier)}</p>
                  
                  <p className="mb-1 text-muted small">Credibility Score:</p>
                  <p className="fw-semibold text-success mb-0">{credibilityScore} XP</p>
                  <small className="text-muted d-block mt-1">Receive +10 XP for each completed task. Reaching 50 XP automatically upgrades you to Tier 2.</small>
                </div>
              </Card.Body>
            </Card>

            <Card className="glass-panel border-0 bg-dark text-white p-3">
              <Card.Body>
                <h6>Skill Tier Guidelines</h6>
                <div className="small text-muted">
                  <p className="mb-2"><strong>Tier 1:</strong> General logistics, supply sorting, and food distribution. Open to all volunteers.</p>
                  <p className="mb-2"><strong>Tier 2:</strong> Heavy vehicle driving, boat rescue operations, water logistics. Requires document submission (e.g. driving license).</p>
                  <p className="mb-0"><strong>Tier 3:</strong> Emergency medical care, structural rescue, specialized diving. Requires professional qualifications and authority review.</p>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={8}>
            <Card className="glass-panel border-0 bg-dark p-4">
              <Card.Body>
                <h4 className="text-white mb-4 d-flex align-items-center">
                  <FiSettings className="text-primary me-2" /> Configure Operations Profile
                </h4>
                
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3" controlId="volSkills">
                    <Form.Label className="text-muted small fw-semibold">Skills / Specialties</Form.Label>
                    <div className="position-relative">
                      <FiCpu className="position-absolute text-muted" style={{ top: '14px', left: '14px' }} />
                      <Form.Control
                         as="textarea"
                         rows={3}
                         name="skills"
                         placeholder="E.g. Search and Rescue, First-Aid certified, Truck Driving, Food Distribution"
                         value={profile.skills}
                         onChange={handleChange}
                         className="form-glass ps-5"
                         required
                      />
                    </div>
                    <Form.Text className="text-muted">Separate skills with commas (e.g. First Aid, Logistics, Translation).</Form.Text>
                  </Form.Group>

                  <Row className="g-3 mb-3">
                    <Col md={6}>
                      <Form.Group controlId="volLocation">
                        <Form.Label className="text-muted small fw-semibold">Current Operations Base</Form.Label>
                        <div className="position-relative">
                          <FiMapPin className="position-absolute text-muted" style={{ top: '14px', left: '14px' }} />
                          <Form.Control
                            type="text"
                            name="currentLocation"
                            placeholder="E.g. Camp Alpha / West Sector Bridge"
                            value={profile.currentLocation}
                            onChange={handleChange}
                            className="form-glass ps-5"
                            required
                          />
                        </div>
                      </Form.Group>
                    </Col>
                    
                    <Col md={6}>
                      <Form.Group controlId="volStatus">
                        <Form.Label className="text-muted small fw-semibold">Initial Availability</Form.Label>
                        <Form.Select
                          name="availabilityStatus"
                          value={profile.availabilityStatus}
                          onChange={handleChange}
                          className="form-glass"
                          required
                        >
                          <option value="Available" className="bg-dark">Available (Ready to dispatch)</option>
                          <option value="Busy" className="bg-dark">Busy (On active task)</option>
                          <option value="Offline" className="bg-dark">Offline (Inactive)</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>

                  <h5 className="text-white mt-4 mb-3 border-bottom pb-2">Identity & Skill Verification</h5>
                  
                  <Row className="g-3 mb-4">
                    <Col md={6}>
                      <Form.Group controlId="volAadhaar">
                        <Form.Label className="text-muted small fw-semibold">Aadhaar / ID Proof Number (DigiLocker Linked)</Form.Label>
                        <Form.Control
                          type="text"
                          name="idProofNumber"
                          placeholder="E.g. 1234-5678-9012"
                          value={profile.idProofNumber}
                          onChange={handleChange}
                          className="form-glass"
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group controlId="volDocUrl">
                        <Form.Label className="text-muted small fw-semibold">Certification Document URL (e.g. Medical, Driving, Rescue)</Form.Label>
                        <Form.Control
                          type="text"
                          name="documentUrl"
                          placeholder="E.g. https://drive.google.com/file/d/.../view"
                          value={profile.documentUrl}
                          onChange={handleChange}
                          className="form-glass"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <div className="d-flex justify-content-end">
                    <Button type="submit" className="btn-premium d-flex align-items-center" disabled={saving}>
                      <FiCheck className="me-2" />
                      {saving ? 'Saving Profile...' : 'Save Profile Details'}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default VolunteerProfile;
