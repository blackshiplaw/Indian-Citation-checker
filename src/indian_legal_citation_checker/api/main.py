"""
FastAPI application entry point.
"""

from fastapi import FastAPI
from .routes import router

app = FastAPI(
    title="Indian Legal Citation Checker API",
    description="API for extracting, normalizing, and verifying Indian legal citations against Open India Law corpus.",
    version="1.0.0"
)

app.include_router(router)

def start():
    import uvicorn
    uvicorn.run("indian_legal_citation_checker.api.main:app", host="0.0.0.0", port=8000, reload=True)

if __name__ == "__main__":
    start()
