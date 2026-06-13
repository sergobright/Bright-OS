# Local Services Specification

## Purpose

This specification records stable local service integrations available to Bright OS development workflows.

## Requirements

### Requirement: Kroki is available for diagram rendering
The project SHALL treat Kroki at `http://127.0.0.1:8000` as the local diagram rendering service.

#### Scenario: Diagram output is needed
- **WHEN** a task needs rendering or exporting text-based diagrams or visualizations
- **THEN** Kroki is used when it supports the requested format

### Requirement: Kroki uses the shared Docker network
Kroki SHALL be considered available on the shared Docker network named `bright-net`.

#### Scenario: A containerized workflow needs Kroki
- **WHEN** a project workflow runs in a container and needs diagram rendering
- **THEN** it connects to Kroki over the `bright-net` network

### Requirement: SVG is the preferred diagram output
Diagram rendering tasks SHALL prefer SVG output unless the user asks for another format.

#### Scenario: No output format is specified
- **WHEN** a diagram or visualization export is requested without an explicit format
- **THEN** SVG is selected as the default output format
