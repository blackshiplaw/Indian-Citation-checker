# Dataset Integration: Open India Law Corpus

## Primary Corpus Source
The primary legal data source is the [Open India Law](https://github.com/Vaquill-AI/open-india-law) initiative created by **Vaquill AI** (licensed under Creative Commons Attribution 4.0 International - CC BY 4.0).

### Upstream Corpus Statistics
- **Scale**: ~32.5 million judgment chunks from the Supreme Court of India and all 25 High Courts, plus 1.1 million legislation provisions and decisions from 15 tribunals and regulators.
- **Coverage Dates**: Court judgments from 1950 to present.
- **Sourcing**: Exclusively official Indian government portals (`sci.gov.in`, `e-courts`, High Court official websites).

## Schema Alignment
Judgment data in Open India Law is stored in chunked Parquet files. Our adapter interfaces with this schema:

| Field Name | Type | Description |
| :--- | :--- | :--- |
| `case_id` | `string` | Stable deduplication identifier (e.g., `SC-1973-13364`) |
| `chunk_index` | `integer` | 0-indexed position of chunk within the full judgment |
| `total_chunks` | `integer` | Total chunks comprising the judgment |
| `title` / `case_name` | `string` | Full title of the case (Petitioner v. Respondent) |
| `court` | `string` | Pronouncing forum (e.g. `Supreme Court of India`) |
| `decision_date` | `string` | ISO Date `YYYY-MM-DD` |
| `year` | `integer` | Decision year |
| `citations` | `list[string]` | Primary and parallel citations (SCC, AIR, SCR, INSC) |
| `docket_number` | `string` | Case registration/petition number |
| `bench` | `list[string]` | Presiding judges |
| `source_url` | `string` | Official government PDF link |
| `text` | `string` | Text content of the chunk |

## Chunk Reconstruction Workflow
When streaming or querying chunked records:
1. Records are grouped by `case_id`.
2. Chunks are ordered strictly by ascending `chunk_index`.
3. Complete case metadata is derived from chunk 0 with chunk texts assembled into a coherent judgment view.

## Safe Memory Architecture
Because 32.5 million chunks require hundreds of gigabytes, the client never loads the complete dataset into browser memory. The application uses a local indexed sample snapshot for rapid dev/demo testing and connects via the Dataset Adapter interface to partitioned Parquet or SQLite FTS indexes in production.
