# QuickAPI diagnostics inventory

These are application-root endpoints, outside `/api/v1`. They are inventoried here separately from the browser business API; no diagnostics adapter or operations credentials are added to the frontend.

| Method/path    | Response                                                                                                      | Access and behavior                                                                                                     |
| -------------- | ------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `GET /`        | `RootResponseDto`: `message`                                                                                  | Public greeting.                                                                                                        |
| `GET /health`  | `HealthResponseDto`: `alive`, `status`, `uptime`, ISO `timestamp`                                             | Public process liveness; does not check dependencies.                                                                   |
| `GET /ready`   | `ReadyResponseDto`: `ready`, `status`, ISO `timestamp`, `checks`                                              | Public readiness; HTTP 200 when ready or 503 otherwise. Each dependency check has `name`, `status`, `response_time_ms`. |
| `GET /info`    | `InfoResponseDto`: application/runtime metadata                                                               | `DiagnosticsOperationsGuard`.                                                                                           |
| `GET /system`  | `SystemResponseDto`: uptime, numeric timestamp, event-loop lag, database, CPU, memory, process and OS metrics | `DiagnosticsOperationsGuard`.                                                                                           |
| `GET /metrics` | Prometheus plaintext, not JSON                                                                                | `MetricsOperationsGuard`; retain the response text and content type.                                                    |

In development, both operations guards allow access. Outside development, `/info` and `/system` require `DETAILED_DIAGNOSTICS_ENABLED`; `/metrics` requires `METRICS_ENABLED`. Disabled endpoints return 404. Enabled endpoints require an `X-Operations-Key` matching the backend's `OPERATIONS_TOKEN`, otherwise they return 401. These are operations credentials, separate from application bearer tokens. Any future diagnostics integration should run through an authorized server/operations client rather than embed that token in a Vite bundle.

Source of truth: QuickAPI-NestJS `ApplicationController`, application response models, `OperationsGuard`, and `ApiModule` route registration.
