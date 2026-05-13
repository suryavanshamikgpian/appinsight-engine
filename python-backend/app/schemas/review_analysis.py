from typing import Literal

from pydantic import BaseModel, Field, field_validator, model_validator

from app.utils.play_store import get_play_store_app_id


TimeRange = Literal[
    "last_7_days",
    "last_30_days",
    "last_90_days",
    "last_180_days",
    "last_365_days",
    "all_time",
]

AiOutputType = Literal[
    "summary",
    "pain_points",
    "feature_ideas",
    "competitor_insights",
    "action_plan",
    "json_report",
]


class RatingRange(BaseModel):
    min: int = Field(ge=1, le=5)
    max: int = Field(ge=1, le=5)

    @model_validator(mode="after")
    def validate_range(self):
        if self.min > self.max:
            raise ValueError("min cannot be greater than max")
        return self


class Keywords(BaseModel):
    include: list[str] = Field(default_factory=list)
    exclude: list[str] = Field(default_factory=list)

    @field_validator("include", "exclude")
    @classmethod
    def normalize_keywords(cls, keywords: list[str]) -> list[str]:
        normalized = [keyword.strip() for keyword in keywords if keyword.strip()]
        return normalized[:50]


class ReviewFilters(BaseModel):
    ratingRange: RatingRange
    timeRange: TimeRange
    minimumReviewLength: int = Field(ge=0, le=10000)
    removeSpam: bool
    removeDuplicates: bool
    englishOnly: bool
    keywords: Keywords = Field(default_factory=Keywords)
    maxReviewsLimit: int = Field(ge=1, le=10000)


class AnalysisOptions(BaseModel):
    goal: str = Field(min_length=1)
    aiOutputType: AiOutputType

    @field_validator("goal")
    @classmethod
    def normalize_goal(cls, goal: str) -> str:
        normalized = goal.strip()

        if not normalized:
            raise ValueError("goal is required")

        return normalized


class ReviewAnalysisCreate(BaseModel):
    playStoreLink: str
    appId: str | None = None
    filters: ReviewFilters
    analysis: AnalysisOptions

    @model_validator(mode="after")
    def validate_play_store_link(self):
        app_id = get_play_store_app_id(self.playStoreLink)

        if not app_id:
            raise ValueError("playStoreLink must be a valid Google Play app details URL")

        self.appId = app_id
        return self


class ReviewAnalysisResponse(BaseModel):
    id: str
    status: str
    receivedAt: str
    request: ReviewAnalysisCreate


class ReviewAnalysisListResponse(BaseModel):
    count: int
    requests: list[ReviewAnalysisResponse]
