---
name: data-pipeline
description: Procedures for building and testing data pipelines with validation and error handling
---

## Pipeline Structure

1. Extract: fetch data from source with retry logic
2. Validate: schema validation at ingestion (fail fast on bad data)
3. Transform: pure functions, no side effects, independently testable
4. Load: idempotent writes (upsert, not insert)

## Error Handling

- Wrap each stage in try/except with structured logging
- Distinguish retryable errors (network, timeout) from fatal errors (schema violation)
- Dead-letter queue pattern: log failed records, continue processing
- Always include: timestamp, record_id, stage, error_type in error logs

## Testing Pipelines

- Unit test each transform function with edge cases (null, empty, malformed)
- Integration test with sample data fixtures in tests/fixtures/
- Test idempotency: running the pipeline twice produces the same result
- Test partial failure: pipeline handles N-1 good records + 1 bad record

## Observability

- Log pipeline start/end with record counts
- Track: records_in, records_out, records_failed per stage
- Alert on: records_failed > threshold, runtime > expected
