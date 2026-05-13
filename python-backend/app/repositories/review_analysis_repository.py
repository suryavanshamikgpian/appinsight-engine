from app.models.review_analysis import ReviewAnalysisRecord


class ReviewAnalysisRepository:
    def __init__(self):
        self._requests: list[ReviewAnalysisRecord] = []

    def create(self, record: ReviewAnalysisRecord) -> ReviewAnalysisRecord:
        self._requests.append(record)
        return record

    def list(self) -> list[ReviewAnalysisRecord]:
        return list(self._requests)

    def find_by_id(self, request_id: str) -> ReviewAnalysisRecord | None:
        return next(
            (request for request in self._requests if request.id == request_id),
            None,
        )


review_analysis_repository = ReviewAnalysisRepository()
