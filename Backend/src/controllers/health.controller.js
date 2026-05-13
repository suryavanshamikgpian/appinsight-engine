export function getHealth(request, response) {
  response.json({
    status: 'ok',
    service: 'app-idea-scraper-backend',
  })
}
