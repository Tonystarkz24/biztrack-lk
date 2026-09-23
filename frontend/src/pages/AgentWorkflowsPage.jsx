import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const AgentWorkflowsPage = () => {
  const { user } = useAuth();
  const [workflows, setWorkflows] = useState([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [decisionNote, setDecisionNote] = useState('');
  const [objectiveInput, setObjectiveInput] = useState('Perform comprehensive inventory audit and generate optimal supplier purchase orders');
  const [message, setMessage] = useState(null);

  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      const res = await api.get('/agent/workflows');
      setWorkflows(res.data);
      if (res.data.length > 0) {
        if (!selectedWorkflow) {
          fetchWorkflowDetail(res.data[0].id);
        } else {
          fetchWorkflowDetail(selectedWorkflow.id);
        }
      }
    } catch (err) {
      console.error('Failed to load workflows', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkflowDetail = async (id) => {
    try {
      const res = await api.get(`/agent/workflows/${id}`);
      setSelectedWorkflow(res.data);
    } catch (err) {
      console.error('Failed to load workflow detail', err);
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const handleInitiateWorkflow = async (e) => {
    e.preventDefault();
    if (!objectiveInput.trim()) return;

    try {
      setActionLoading(true);
      setMessage(null);
      const res = await api.post('/agent/workflows', {
        objective: objectiveInput,
        requesterRole: user?.role || 'Admin'
      });
      setMessage({ type: 'success', text: `Workflow ${res.data.workflowCode} initiated successfully!` });
      await fetchWorkflows();
      fetchWorkflowDetail(res.data.id);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to initiate workflow' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDecision = async (decision) => {
    if (!selectedWorkflow) return;
    try {
      setActionLoading(true);
      setMessage(null);
      const res = await api.post(`/agent/workflows/${selectedWorkflow.id}/decision`, {
        decision,
        note: decisionNote
      });
      setMessage({ type: 'success', text: `Workflow ${decision} successfully!` });
      setDecisionNote('');
      await fetchWorkflows();
      setSelectedWorkflow(res.data);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to submit decision' });
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'RequiresApproval':
        return 'badge-warning';
      case 'Approved':
        return 'badge-success';
      case 'Completed':
        return 'badge-info';
      case 'Rejected':
        return 'badge-danger';
      default:
        return 'badge-secondary';
    }
  };

  const getAgentStepNumber = (role) => {
    if (role.includes('Inventory') || role.includes('Auditor')) return '1';
    if (role.includes('Sales') || role.includes('Demand')) return '2';
    if (role.includes('Procurement') || role.includes('Cost') || role.includes('Action')) return '3';
    if (role.includes('Governance') || role.includes('Guardian') || role.includes('Validation')) return '4';
    if (role.includes('Planner') || role.includes('Coordinator')) return '1';
    return '•';
  };

  const getAgentStudentInfo = (role) => {
    if (role.includes('Inventory') || role.includes('Auditor')) return 'Student 1: Inventory';
    if (role.includes('Sales') || role.includes('Demand')) return 'Student 2: Sales & Demand (Gemini)';
    if (role.includes('Procurement') || role.includes('Cost') || role.includes('Action')) return 'Student 3: Expenses & Procurement (Gemini)';
    if (role.includes('Governance') || role.includes('Guardian') || role.includes('Validation')) return 'Student 4: Governance Guardian';
    return 'System Agent';
  };

  return (
    <div className="agent-page-container">
      <div className="page-header">
        <div>
          <h1>Controlled Agentic AI Subsystem</h1>
          <p className="page-subtitle">
            Autonomous multi-agent orchestration with allow-listed tools, deterministic validation, and human-in-the-loop approval.
          </p>
        </div>
      </div>

      {message && (
        <div className={`alert-banner alert-${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Trigger New Workflow Form */}
      {['Admin', 'InventoryManager'].includes(user?.role) ? (
        <div className="card workflow-init-card">
          <h3>Dispatch Autonomous Workflow</h3>
          <form onSubmit={handleInitiateWorkflow} className="workflow-init-form">
            <input
              type="text"
              className="input-field"
              value={objectiveInput}
              onChange={(e) => setObjectiveInput(e.target.value)}
              placeholder="Enter business objective (e.g. Audit low stock, replenish inventory)..."
              required
            />
            <button type="submit" className="btn btn-primary" disabled={actionLoading}>
              {actionLoading ? 'Executing Agents...' : 'Dispatch Workflow'}
            </button>
          </form>
        </div>
      ) : (
        <div className="card" style={{ padding: '1rem', background: '#f8fafc', marginBottom: '1.5rem', color: '#64748b' }}>
          Workflow dispatching is restricted to Admins and Inventory Managers.
        </div>
      )}

      <div className="workflow-grid-layout">
        {/* Left column: Workflows List */}
        <div className="card workflow-list-card">
          <h3>Workflow History</h3>
          {loading ? (
            <p className="text-muted">Loading workflows...</p>
          ) : workflows.length === 0 ? (
            <p className="text-muted">No workflows found. Dispatch one above!</p>
          ) : (
            <div className="workflow-list">
              {workflows.map((wf) => (
                <div
                  key={wf.id}
                  className={`workflow-item ${selectedWorkflow?.id === wf.id ? 'selected' : ''}`}
                  onClick={() => fetchWorkflowDetail(wf.id)}
                >
                  <div className="workflow-item-header">
                    <span className="workflow-code">{wf.workflowCode}</span>
                    <span className={`badge ${getStatusBadgeClass(wf.status)}`}>
                      {wf.status}
                    </span>
                  </div>
                  <p className="workflow-item-obj">{wf.objective}</p>
                  <div className="workflow-item-footer">
                    <small>Risk: <strong>{wf.riskLevel}</strong></small>
                    <small>{new Date(wf.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right column: Selected Workflow Detail & 4-Agent Trace */}
        <div className="card workflow-detail-card">
          {selectedWorkflow ? (
            <div>
              <div className="detail-header">
                <div>
                  <h2>{selectedWorkflow.workflowCode}</h2>
                  <p className="text-muted">Objective: {selectedWorkflow.objective}</p>
                </div>
                <span className={`badge badge-lg ${getStatusBadgeClass(selectedWorkflow.status)}`}>
                  {selectedWorkflow.status}
                </span>
              </div>

              {/* Human-in-the-loop Approval Banner */}
              {selectedWorkflow.status === 'RequiresApproval' && (
                <div className="approval-banner">
                  <div className="approval-info">
                    <h4>Human-in-the-Loop Review Required</h4>
                    <p>{selectedWorkflow.finalOutcome}</p>
                  </div>
                  {user?.role === 'Admin' ? (
                    <div className="approval-actions">
                      <input
                        type="text"
                        className="input-field input-sm"
                        placeholder="Approval or revision note..."
                        value={decisionNote}
                        onChange={(e) => setDecisionNote(e.target.value)}
                      />
                      <div className="button-group">
                        <button
                          className="btn btn-success"
                          onClick={() => handleDecision('Approved')}
                          disabled={actionLoading}
                        >
                          Approve Purchase Order
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() => handleDecision('Rejected')}
                          disabled={actionLoading}
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ marginTop: '0.75rem', padding: '0.75rem 1rem', background: '#fef3c7', borderRadius: '6px', color: '#92400e', fontSize: '0.9rem' }}>
                      <strong>Admin Action Required:</strong> Only users with the <strong>Admin</strong> role are authorized to sign off or reject budget commitments exceeding LKR 15,000.
                    </div>
                  )}
                </div>
              )}

              {/* Final Outcome if approved/rejected */}
              {selectedWorkflow.status !== 'RequiresApproval' && selectedWorkflow.finalOutcome && (
                <div className={`outcome-box outcome-${selectedWorkflow.status.toLowerCase()}`}>
                  <strong>Workflow Outcome ({selectedWorkflow.status}):</strong>
                  <p>{selectedWorkflow.finalOutcome}</p>
                </div>
              )}

              {/* 4 Distinct Agents Execution Trace */}
              <div className="execution-trace-section">
                <h3>4-Agent Execution Trace</h3>
                <div className="timeline">
                  {selectedWorkflow.executionLogs.map((log) => (
                    <div key={log.id} className="timeline-item">
                      <div className="timeline-badge">
                        {getAgentStepNumber(log.agentRole)}
                      </div>
                      <div className="timeline-content">
                        <div className="timeline-header">
                          <span className="agent-role-name">{log.agentRole}</span>
                          <span className="badge badge-info" style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem' }}>
                            {getAgentStudentInfo(log.agentRole)}
                          </span>
                          <span className="tool-tag">Tool: {log.toolName}</span>
                          <span className="timestamp">
                            {new Date(log.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="log-block">
                          <div className="log-subblock">
                            <strong>Tool Input:</strong>
                            <pre>{JSON.stringify(JSON.parse(log.toolInput || '{}'), null, 2)}</pre>
                          </div>
                          <div className="log-subblock">
                            <strong>Tool Output:</strong>
                            <pre>{JSON.stringify(JSON.parse(log.toolOutput || '{}'), null, 2)}</pre>
                          </div>
                          <div className="validation-pill">
                            <strong>Validation:</strong> {log.validationResult}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Approval History */}
              {selectedWorkflow.approvals?.length > 0 && (
                <div className="approvals-history-section">
                  <h3>Human Approvals & Sign-off History</h3>
                  <ul className="approvals-list">
                    {selectedWorkflow.approvals.map((app) => (
                      <li key={app.id} className="approval-item">
                        <span>Decision: <strong>{app.decision}</strong> by <em>{app.approverUsername}</em></span>
                        <span className="text-muted">{new Date(app.decidedAt).toLocaleString()}</span>
                        {app.decisionNote && <p className="approval-note">"{app.decisionNote}"</p>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <p className="text-muted">Select a workflow on the left to inspect its execution trace.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentWorkflowsPage;
