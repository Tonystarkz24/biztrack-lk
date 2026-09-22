# ADR-002: State Management and Architecture in Flutter Mobile Application

## Status
Accepted

## Context
The BizTrack LK Flutter mobile application is designed for field staff, warehouse workers, and cashiers to carry out point-of-sale operations, hardware camera-based barcode scanning, and mobile Agentic AI workflow submissions. We needed a state-management pattern that cleanly separates UI widgets from HTTP API communications, ensures secure persistent storage of JWT tokens across device restarts, and minimizes architectural friction.

## Options Considered
1. **BLoC (Business Logic Component) Pattern:**
   - *Pros:* Strict reactive event-to-state stream mapping, exceptional for large enterprise architectures.
   - *Cons:* High verbosity, requires extensive boilerplate for events and states for relatively straightforward POS and scanning screens.
2. **Riverpod:**
   - *Pros:* Compile-safe, decoupled from Flutter widget tree, modern.
   - *Cons:* Steeper learning curve for students learning mobile development within the 9-week timeframe.
3. **Provider with ChangeNotifier & flutter_secure_storage (Selected):**
   - *Pros:* Recommended by the official Flutter team, lightweight, intuitive `Consumer` and `context.watch()` reactivity, and straightforward integration with encrypted device hardware storage.
   - *Cons:* Requires disciplined separation to avoid bloated controller models.

## Decision
We adopted **`Provider` (v6.1.2)** for application state management in tandem with **`flutter_secure_storage`** for storing JWT authentication credentials in platform-native encrypted storage (Android Keystore / iOS Keychain). Business logic for cart/POS calculations and agent status polling resides in dedicated service providers (`ApiService`), keeping UI widgets purely declarative.

## Consequences
- **Positive:** Rapid feature development across the team. Clean authentication lifecycle with automated authorization headers on outbound HTTP requests. Seamless widget testability through mockable providers.
- **Negative:** For ultra-complex multi-stage reactive streams, manual state notification (`notifyListeners()`) must be carefully placed to avoid redundant rebuilds of scanner camera viewports.
