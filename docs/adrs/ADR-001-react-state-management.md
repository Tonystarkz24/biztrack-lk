# ADR-001: State Management Approach in React Web Application

## Status
Accepted

## Context
The BizTrack LK web application provides an administrative and executive dashboard interface supporting inventory control, point-of-sale sales tracking, operational expenses, user authentication, and Agentic AI workflow monitoring and approvals. We evaluated the appropriate client-side state management architecture to balance component isolation, developer ergonomics, maintainability, and bundle size for a team of 4 software engineering students.

## Options Considered
1. **Redux Toolkit (RTK):**
   - *Pros:* Strict architectural conventions, robust Redux DevTools, predictable state transitions.
   - *Cons:* Heavy boilerplate (slices, thunks, store configuration), steep learning curve, redundant complexity for an application that primarily coordinates asynchronous server state.
2. **Zustand:**
   - *Pros:* Minimal boilerplate, hook-based, high performance without context provider wrapping.
   - *Cons:* Additional external npm dependency, less native familiarity across student team members.
3. **React Context API with Custom Hooks (Selected):**
   - *Pros:* Built directly into React 18 (zero third-party dependencies), intuitive provider pattern, seamless integration with `useReducer` and `useState`, and ideal for global concerns like user authentication (`AuthContext`) and theme/notifications.
   - *Cons:* Potential unnecessary re-renders if monolithic contexts are created without modular scoping.

## Decision
We chose **React Context API combined with focused Custom Hooks** for cross-cutting application state (e.g., `AuthContext`), and localized component-level hook state (`useState`, `useCallback`, `useEffect`) for page-level CRUD and telemetry views. Axios service abstractions (`dashboardService.js`, `productService.js`) encapsulate server communications with clear request interceptors for JWT token injection.

## Consequences
- **Positive:** No additional runtime bundle overhead. Quick onboarding for all team members. Clean separation between authentication state and domain entity workflows.
- **Negative:** For deeply nested domain data updates, components must explicitly trigger fresh API queries or lift state to nearest common ancestors. This is effectively mitigated by modular page designs and fast, parallelized backend API endpoints.
