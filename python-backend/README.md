# Python Backend

FastAPI service for receiving Play Store review-analysis requests.

## Run

```bash
cd python-backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## Endpoints

- `GET /api/health`
- `POST /api/review-analysis-requests`
- `GET /api/review-analysis-requests`
