export function getPlayStoreAppId(link) {
  try {
    const url = new URL(link)
    const isPlayStore = url.hostname === 'play.google.com'
    const isAppDetails = url.pathname === '/store/apps/details'

    if (!isPlayStore || !isAppDetails) {
      return null
    }

    return url.searchParams.get('id')
  } catch {
    return null
  }
}
