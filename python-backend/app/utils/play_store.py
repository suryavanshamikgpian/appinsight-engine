from urllib.parse import parse_qs, urlparse


def get_play_store_app_id(link: str) -> str | None:
    parsed_url = urlparse(link)

    if parsed_url.netloc != "play.google.com":
        return None

    if parsed_url.path != "/store/apps/details":
        return None

    query = parse_qs(parsed_url.query)
    app_id = query.get("id", [None])[0]
    return app_id or None
