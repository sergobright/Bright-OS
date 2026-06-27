## ADDED Requirements

### Requirement: Inbound API routes by target
Bright OS SHALL expose a universal inbound API at `/v1/in/:target` where the
target path segment selects the connector handler.

#### Scenario: Inbound target handshakes
- **WHEN** an external app sends `GET /v1/in/inbox` with the inbound Bearer token
- **THEN** the API returns `{ "ok": true, "target": "inbox" }`

#### Scenario: Unknown target is requested
- **WHEN** an external app sends a request for an unsupported target
- **THEN** the API returns `404`
- **AND** no inbox data is mutated

### Requirement: Inbound Inbox receives text and image
Bright OS SHALL support `POST /v1/in/inbox` for the first inbound connector.

#### Scenario: Inbox payload is received
- **WHEN** an external app sends text and a base64 image with the inbound Bearer token
- **THEN** the text is stored in the Inbox explanation field
- **AND** the image is saved as an attachment
- **AND** the attachment path is stored in the Inbox attachment links
- **AND** the Inbox title is generated through the local Codex CLI or local fallback

#### Scenario: Inbound request is unauthorized
- **WHEN** an inbound request omits the valid inbound Bearer token
- **THEN** the API returns `401`
- **AND** no inbox data or attachment file is created
