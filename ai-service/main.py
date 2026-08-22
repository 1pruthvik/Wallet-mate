from fastapi import FastAPI

app = FastAPI(
    title="FinMitra AI Service",
    description="Financial Intelligence and AI services for FinMitra",
    version="0.1.0"
)


@app.get("/")
def root():
    return {
        "service": "FinMitra AI Service",
        "status": "running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }