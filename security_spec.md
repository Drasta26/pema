# Firebase Firestore Security Specification

This specification defines the data invariants and threat-model payloads used to verify our Zero-Trust secure rules structure.

## 1. Data Invariants

- **User Profile Entity (`/users/{userId}`)**:
  - Must correspond to the user's lowercase email. Can only be retrieved/updated/created by the exact user owning that email.
  - Fields are strictly typed: `email` (string), `displayName` (string), and `createdAt` (timestamp).
  - Immortality rule: `createdAt` is immutable.

- **Meditation Session Log Entity (`/users/{userId}/history/{logId}`)**:
  - A user can only read, create, or update logs inside their own `/users/{userId}/history/` paths.
  - No user is allowed to modify another user's historical state tracking.
  - Fields are strictly typed: `id` (string), `date` (timestamp or ISO string), `state` (string), `technique` (string), `rating` (string/null), and `notes` (string/null), `userId` (string, matches path `userId`).
  - Strict key footprint constraints are validated dynamically.

---

## 2. The "Dirty Dozen" Threat Payloads (Test Specifications)

The following payloads represent malicious requests designed to breach integrity and authorization, all of which must return `PERMISSION_DENIED`:

1. **Identity Spoofing on Create**: Attempting to write a profile under `/users/attacker` using `victim@example.com` email.
2. **PII Isolation Leak**: Authenticated user trying to pull private info/profile from `/users/victim@example.com`.
3. **Ghost Field Poisoning**: Adding `isAdmin: true` during creation of a user profile document to elevate privilege.
4. **Immortality Modification**: Attempting to overwrite `createdAt` on an existing profile under `/users/my_email`.
5. **Session Cross-Write attempt**: Authenticated user `attacker@example.com` writing a history log to `/users/victim@example.com/history/log_id`.
6. **Cross-User Session Retrieval attempt**: Authenticated user `attacker@example.com` querying the collection group or list at `/users/victim@example.com/history`.
7. **Resource Poisoning (Junk document ID)**: Authenticated user attempting to write a history log with a 1.5KB long, corrupt junk ID under `/users/my_user/history/junk_id`.
8. **Null Type Injection**: Writing a log where `notes` or `rating` are not of type string, or lists/objects.
9. **Temporal Spoofing**: Overwriting a history log's creation timestamps with a client timestamp instead of the server's time indicator.
10. **Shadow state modification**: Modifying static field parameters (e.g., changing `technique`) on other users' logs.
11. **Client Delegation Bypass**: Attempting a list request without proper email filter or identifier.
12. **Denial-of-Wallet Recursive Attack**: Initiating deep queries or unauthenticated expensive collection checks.
