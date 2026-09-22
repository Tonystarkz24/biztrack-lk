# ADR-003: Agentic AI Orchestration and Multi-Agent Architecture

## Status
Accepted

## Context
SE3090 Assignment 1 mandates a controlled Agentic AI subsystem solving a multi-step domain problem. Simple prompt wrappers or single-step conversational chatbots are explicitly unacceptable. The subsystem must plan, delegate to at least four specialized agents, enforce allow-listed tools, apply deterministic validation, and gate high-impact financial actions behind human approval.

## Options Considered
1. **External Python Sidecar with LangGraph:**
   - *Pros:* Rich ecosystem of agent abstractions and graph-based cyclic flow.
   - *Cons:* Introduces a secondary runtime container (Python + FastAPI), increased operational and deployment complexity, cold start latency, and dual-backend coordination overhead.
2. **Generic LLM Chatbot Wrapper:**
   - *Pros:* Very fast to build.
   - *Cons:* Strictly prohibited by the assignment rubric; lacks deterministic safety guarantees, structured persistence, and tool boundaries.
3. **C# Native Multi-Agent Orchestration Engine (`AgentWorkflowEngine`) (Selected):**
   - *Pros:* Fully unified within the primary ASP.NET Core Web API process. Direct transactional access to Entity Framework Core and PostgreSQL. Zero cross-process networking latency. Deterministic C# rules engine enforces hard financial bounds (LKR 15,000 threshold) that cannot be bypassed by prompt injection.
   - *Cons:* Multi-agent coordination logic must be written and maintained in C# without relying on dynamic Python agent frameworks.

## Decision
We engineered a **native C# Multi-Agent Workflow Engine (`AgentWorkflowEngine.cs`)** embedded directly into the ASP.NET Core backend. The orchestration pipeline delegates work sequentially across four distinct agent personas:
1. **`CoordinatorPlannerAgent`:** Analyzes high-level objectives and formulates a 3-stage execution plan.
2. **`DemandAnalyzerAgent`:** Queries database deficits for inventory below reorder thresholds.
3. **`ActionGeneratorAgent`:** Uses allow-listed pricing tools to formulate concrete restock purchase orders and cost totals.
4. **`ValidationSafetyAgent`:** Enforces deterministic business boundaries. If proposed capital expenditure exceeds **LKR 15,000.00**, it halts autonomous execution, transitions status to `RequiresApproval`, and demands human executive sign-off in the React dashboard.

## Consequences
- **Positive:** Meets every requirement of the SLIIT marking rubric (Section 9.1). Extremely resilient, verifiable in automated xUnit integration tests, zero extra hosting infrastructure, and completely immune to hallucinated budget overspending.
- **Negative:** Adding new dynamic tool capabilities requires registering strongly-typed C# service methods rather than hot-reloading prompt templates.
