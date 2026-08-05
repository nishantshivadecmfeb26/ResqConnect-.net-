import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Button, Modal, Form, Alert, Row, Col, Badge } from 'react-bootstrap';
import { userService } from '../../services/api';
import { toast } from 'react-toastify';
import { FiUsers, FiEdit2, FiTrash2 } from 'react-icons/fi';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    roleId: '1',
  });

  const fetchUsers = async () => {
    try {
      const data = await userService.getAll();
      setUsers(data);
    } catch (error) {
      console.error('Failed to load users list:', error);
      toast.error('Unable to fetch users registry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOpenEdit = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      roleId: user.roleId.toString(),
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, phone, roleId } = formData;

    if (!name || !email || !phone || !roleId) {
      toast.error('Please complete all form fields.');
      return;
    }

    try {
      const payload = {
        name,
        email,
        phone,
        roleId: parseInt(roleId),
      };

      const updated = await userService.update(selectedUser.id, payload);
      toast.success('User updated successfully!');
      setUsers((prev) => prev.map((u) => (u.id === selectedUser.id ? updated : u)));
      setShowModal(false);
    } catch (error) {
      console.error(error);
      toast.error('Failed to update user profiles details.');
    }
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    try {
      await userService.delete(userToDelete.id);
      toast.success('User account deleted.');
      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
      setShowDeleteModal(false);
      setUserToDelete(null);
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete user.');
    }
  };

  return (
    <Container className="py-4 text-start">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="text-white mb-1">User Configuration Management</h2>
          <p className="text-muted small">Edit global details, adjust roles permissions, and clean database profiles.</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
        </div>
      ) : users.length === 0 ? (
        <Alert variant="info" className="bg-dark border-light border-opacity-10 text-muted">
          No users logged.
        </Alert>
      ) : (
        <Card className="glass-panel border-0 bg-dark p-3">
          <Card.Body className="p-0">
            <div className="table-responsive">
              <Table hover variant="dark" className="align-middle bg-transparent mb-0">
                <thead>
                  <tr className="border-light border-opacity-10">
                    <th>User Name</th>
                    <th>Email Address</th>
                    <th>Phone Number</th>
                    <th>Role Designation</th>
                    <th>Registered Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-light border-opacity-10">
                      <td className="fw-semibold small">{u.name}</td>
                      <td className="small">{u.email}</td>
                      <td className="small text-muted">{u.phone || '-'}</td>
                      <td>
                        <Badge bg={u.roleName === 'Admin' ? 'danger' : u.roleName === 'NGO' ? 'purple' : 'primary'} style={{ backgroundColor: u.roleName === 'NGO' ? '#8b5cf6' : '' }}>
                          {u.roleName}
                        </Badge>
                      </td>
                      <td className="small text-muted" style={{ fontSize: '0.75rem' }}>
                        {new Date(new Date(u.createdAt).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })).toLocaleDateString('en-IN')}
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <Button 
                            variant="outline-primary" 
                            size="sm"
                            onClick={() => handleOpenEdit(u)}
                            className="d-flex align-items-center gap-1 py-1"
                          >
                            <FiEdit2 size={12} /> Edit
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => {
                              setUserToDelete(u);
                              setShowDeleteModal(true);
                            }}
                            disabled={u.roleName === 'Admin' && users.filter((admin) => admin.roleName === 'Admin').length === 1}
                            className="d-flex align-items-center gap-1 py-1"
                          >
                            <FiTrash2 size={12} /> Delete
                          </Button>
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

      {/* Edit User Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} contentClassName="glass-panel text-light" dialogClassName="modal-dark" centered>
        <Modal.Header closeButton closeVariant="white" className="border-light border-opacity-10 bg-dark">
          <Modal.Title className="fw-bold">Modify User Settings</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark text-start">
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="editUserName">
              <Form.Label className="text-muted small fw-semibold">Full Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="form-glass"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="editUserEmail">
              <Form.Label className="text-muted small fw-semibold">Email Address</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="form-glass"
                required
              />
            </Form.Group>

            <Row className="mb-4">
              <Col md={6}>
                <Form.Group controlId="editUserPhone">
                  <Form.Label className="text-muted small fw-semibold">Phone Number</Form.Label>
                  <Form.Control
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="form-glass"
                    required
                  />
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group controlId="editUserRole">
                  <Form.Label className="text-muted small fw-semibold">Role Access</Form.Label>
                  <Form.Select
                    name="roleId"
                    value={formData.roleId}
                    onChange={handleInputChange}
                    className="form-glass"
                    required
                  >
                    <option value="1" className="bg-dark">Victim</option>
                    <option value="2" className="bg-dark">Volunteer</option>
                    <option value="3" className="bg-dark">NGO</option>
                    <option value="4" className="bg-dark">Government Officer</option>
                    <option value="5" className="bg-dark">Admin</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="outline-light" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button type="submit" className="btn-premium">Save Changes</Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} contentClassName="glass-panel text-light" dialogClassName="modal-dark" centered>
        <Modal.Header closeButton closeVariant="white" className="border-light border-opacity-10 bg-dark">
          <Modal.Title className="fw-bold text-danger">Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark text-start">
          <p>Are you sure you want to delete the user account for <strong>{userToDelete?.name}</strong> ({userToDelete?.email})?</p>
          <p className="text-muted small">All linked listings, reports, and SOS tickets will be permanently deleted from the database. This action cannot be undone.</p>
          <div className="d-flex justify-content-end gap-2 mt-4">
            <Button variant="outline-light" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete}>Delete Account</Button>
          </div>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default AdminUsers;
