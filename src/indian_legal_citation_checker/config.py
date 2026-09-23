"""
Configuration and settings for Indian Legal Citation Checker.
"""

import os
from pydantic import BaseModel

class Settings(BaseModel):
    app_name: str = "Indian Legal Citation Checker"
    environment: str = os.getenv("ENV", "development")
    gemini_api_key: str = os.getenv("GEMINI_API_KEY", "")
    sample_dataset_path: str = os.getenv(
        "DATASET_PATH", "src/indian_legal_citation_checker/retrieval/sample_corpus.json"
    )
    port: int = int(os.getenv("PORT", "3000"))
    max_upload_size_mb: int = 10

settings = Settings()
