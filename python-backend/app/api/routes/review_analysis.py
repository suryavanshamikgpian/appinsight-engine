from fastapi import APIRouter, status

from app.schemas.review_analysis import (
    ReviewAnalysisCreate,
    ReviewAnalysisListResponse,
    ReviewAnalysisResponse,
)
from app.services.review_analysis_service import review_analysis_service

router = APIRouter(prefix="/review-analysis-requests")


@router.post(
    "",
    response_model=ReviewAnalysisResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_review_analysis_request(payload: ReviewAnalysisCreate):
    return review_analysis_service.create_request(payload)


@router.get("", response_model=ReviewAnalysisListResponse)
def list_review_analysis_requests():
    return review_analysis_service.list_requests()
