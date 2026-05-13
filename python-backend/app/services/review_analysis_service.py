from app.models.review_analysis import ReviewAnalysisRecord
from app.repositories.review_analysis_repository import review_analysis_repository
from app.schemas.review_analysis import (
    ReviewAnalysisCreate,
    ReviewAnalysisListResponse,
)


class ReviewAnalysisService:
    def create_request(self, payload: ReviewAnalysisCreate) -> ReviewAnalysisRecord:
        record = ReviewAnalysisRecord(request=payload)
        return review_analysis_repository.create(record)

    def list_requests(self) -> ReviewAnalysisListResponse:
        requests = review_analysis_repository.list()
        return ReviewAnalysisListResponse(count=len(requests), requests=requests)


review_analysis_service = ReviewAnalysisService()
