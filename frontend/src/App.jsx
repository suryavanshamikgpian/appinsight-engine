import { useMemo, useState } from 'react'
import './App.css'

const sampleLink =
  'https://play.google.com/store/apps/details?id=com.example.app'

function getPlayStoreAppId(link) {
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

function App() {
  const [playStoreLink, setPlayStoreLink] = useState('')
  const [submittedLink, setSubmittedLink] = useState('')
  const [error, setError] = useState('')

  const appId = useMemo(
    () => getPlayStoreAppId(submittedLink),
    [submittedLink],
  )

  function handleSubmit(event) {
    event.preventDefault()

    const trimmedLink = playStoreLink.trim()
    const nextAppId = getPlayStoreAppId(trimmedLink)

    if (!nextAppId) {
      setSubmittedLink('')
      setError('Enter a valid Google Play app link.')
      return
    }

    setSubmittedLink(trimmedLink)
    setError('')
  }

  return (
    <main className="app-shell">
      <section className="intro-panel" aria-labelledby="page-title">
        <p className="eyebrow">App Idea Scraper</p>
        <h1 id="page-title">Enter a Play Store link</h1>
        <p className="intro-copy">
          Drop in an app listing URL and keep it ready for the next scrape.
        </p>
      </section>

      <section className="form-panel" aria-label="Play Store link form">
        <form className="link-form" onSubmit={handleSubmit}>
          <label htmlFor="play-store-link">Play Store URL</label>
          <div className="input-row">
            <input
              id="play-store-link"
              name="playStoreLink"
              type="url"
              value={playStoreLink}
              onChange={(event) => {
                setPlayStoreLink(event.target.value)
                setError('')
              }}
              placeholder={sampleLink}
              aria-describedby={error ? 'link-error' : undefined}
            />
            <button type="submit">Submit</button>
          </div>
          {error ? (
            <p className="feedback error" id="link-error">
              {error}
            </p>
          ) : null}
        </form>

        {submittedLink ? (
          <div className="result-box">
            <span>Ready</span>
            <strong>{appId}</strong>
            <a href={submittedLink} target="_blank" rel="noreferrer">
              Open listing
            </a>
          </div>
        ) : (
          <div className="empty-state">
            <span>Waiting for a Play Store app link</span>
          </div>
        )}
      </section>
    </main>
  )
}

export default App
