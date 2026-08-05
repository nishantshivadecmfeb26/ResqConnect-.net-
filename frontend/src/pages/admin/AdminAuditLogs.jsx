import React, { useState } from 'react';
import { Container, Card, Table, Form, Badge } from 'react-bootstrap';
import { FiSearch, FiSliders } from 'react-icons/fi';

const AdminAuditLogs = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Seed/Mock Audit Logs since EF Core doesn't record request bodies by default without custom configuration
  const [logs] = useState([
    { id: 1, timestamp: '2026-06-28 14:10:15', user: 'admin@ResQConnect.com', action: 'DATABASE_SEED', description: 'Initial roles database tables populated.', status: 'SUCCESS' },
    { id: 2, timestamp: '2026-06-28 14:15:30', user: 'admin@ResQConnect.com', action: 'USER_LOGIN', description: 'Admin user successfully authenticated from local IP.', status: 'SUCCESS' },
    { id: 3, timestamp: '2026-06-28 14:22:12', user: 'officer@gov.org', action: 'DISASTER_CREATE', description: 'Declared active incident: Flood Advisory Sector 4.', status: 'SUCCESS' },
    { id: 4, timestamp: '2026-06-28 14:25:40', user: 'ngo@redcross.org', action: 'CAMP_CREATE', description: 'Created Relief Camp Alpha with capacity of 500.', status: 'SUCCESS' },
    { id: 5, timestamp: '2026-06-28 14:28:10', user: 'volunteer1@mail.com', action: 'VOLUNTEER_REGISTER', description: 'Volunteer profile initialized: General Assistance.', status: 'SUCCESS' },
    { id: 6, timestamp: '2026-06-28 14:31:05', user: 'victim@resilience.net', action: 'SOS_RAISE', description: 'Raised distress call from Sector 4 coordinates.', status: 'SUCCESS' },
    { id: 7, timestamp: '2026-06-28 14:35:50', user: 'ngo@redcross.org', action: 'RESOURCE_ADD', description: 'Added 500 Liters of Bottled Water to Camp Alpha.', status: 'SUCCESS' },
    { id: 8, timestamp: '2026-06-28 14:39:15', user: 'admin@ResQConnect.com', action: 'USER_UPDATE', description: 'Updated volunteer account registration state to Verified.', status: 'SUCCESS' },
  ]);

  const filteredLogs = logs.filter((l) =>
    l.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Container className="py-4 text-start">
      <h2 className="text-white mb-1">Audit Log Center</h2>
      <p className="text-muted small mb-4">Review system events, inspect database updates, and verify auth transactions.</p>

      {/* Filter controls */}
      <div className="position-relative mb-4" style={{ maxWidth: '400px' }}>
        <FiSearch className="position-absolute text-muted" style={{ top: '14px', left: '14px' }} />
        <Form.Control
          type="text"
          placeholder="Filter logs by user, action, or details..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="form-glass ps-5"
        />
      </div>

      <Card className="glass-panel border-0 bg-dark p-3">
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover variant="dark" className="align-middle bg-transparent mb-0">
              <thead>
                <tr className="border-light border-opacity-10">
                  <th>Timestamp</th>
                  <th>Operator</th>
                  <th>Action Event</th>
                  <th>Details Description</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.reverse().map((l) => (
                  <tr key={l.id} className="border-light border-opacity-10">
                    <td className="small text-muted" style={{ fontSize: '0.75rem' }}>{l.timestamp}</td>
                    <td className="fw-semibold small">{l.user}</td>
                    <td>
                      <Badge bg="secondary" className="font-monospace small">{l.action}</Badge>
                    </td>
                    <td className="small">{l.description}</td>
                    <td>
                      <Badge bg={l.status === 'SUCCESS' ? 'success' : 'danger'}>{l.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AdminAuditLogs;

