from datetime import datetime, timezone
from uuid import uuid4

from pydantic import BaseModel, Field

from app.schemas.review_analysis import ReviewAnalysisCreate


class ReviewAnalysisRecord(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    status: str = "received"
    receivedAt: str = Field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )
    request: ReviewAnalysisCreate
