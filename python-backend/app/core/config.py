import os
from dataclasses import dataclass, field


def parse_csv(value: str) -> list[str]:
    return [item.strip() for item in value.split(",") if item.strip()]


@dataclass(frozen=True)
class Settings:
    app_name: str = "app-idea-scraper-python-backend"
    api_prefix: str = "/api"
    cors_origins: list[str] = field(
        default_factory=lambda: parse_csv(os.getenv("CORS_ORIGINS", ""))
    )


settings = Settings()
