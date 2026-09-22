# ADR-004: Relational Database Schema Strategy for Agent Workflow State

## Status
Accepted

## Context
Section 6 and 9 of the SE3090 specification state: *"Persist only the Agentic AI workflow state and execution summaries required by the design; do not store hidden reasoning, passwords, tokens or unnecessary sensitive data."* We required a database schema that provides full auditability, human approval traceability, and durable state without violating privacy or cluttering core transactional tables.

## Options Considered
1. **Document-Based JSON Storage (Single JSON column in a flat table):**
   - *Pros:* Schema flexibility for dynamic agent inputs and outputs.
   - *Cons:* Weak relational integrity, difficult to write indexed relational queries for dashboard filtering, risk of dumping unstructured conversational noise into the database.
2. **Normalized Relational Entity Triad (Selected):**
   - *Pros:* Fully normalized schema utilizing PostgreSQL foreign keys (`ON DELETE CASCADE`), structured tracking of each individual execution step, separate auditable sign-off ledger, and strong typing via EF Core entities.
   - *Cons:* Requires relational table migrations and join queries.

## Decision
We implemented a normalized three-tier relational schema in PostgreSQL:
1. **`agent_workflows`:** Root workflow entity recording `workflow_code`, `objective`, `status` (`InProgress`, `RequiresApproval`, `Approved`, `Rejected`, `Completed`), `risk_level`, `requires_human_approval`, `plan_summary`, and `final_outcome`.
2. **`agent_execution_logs`:** Step-by-step audit record linking to `workflow_id`, storing `step_number`, `agent_role`, `tool_name`, validated `tool_input`, structured `tool_output`, and `validation_result`.
3. **`workflow_approvals`:** Dedicated ledger recording authorized human decisions (`approver_username`, `decision`, `decision_note`, `decided_at`).

Passwords, JWT secrets, and intermediate LLM scratchpads are strictly excluded from persistence.

## Consequences
- **Positive:** Evaluators can inspect full step-by-step agent logs directly in PostgreSQL and through the React dashboard. Complete relational integrity with indexed timestamps.
- **Negative:** Schema migrations must be applied consistently via EF Core or `DbInitializer` startup DDL scripts.
