export function errorHandler(error, request, response, next) {
  if (response.headersSent) {
    next(error)
    return
  }

  const statusCode = error.statusCode || 500

  response.status(statusCode).json({
    message: error.message || 'Unexpected server error.',
    details: error.details || undefined,
  })
}
