import { useMemo, useState } from 'react'
import './App.css'

const sampleLink =
  'https://play.google.com/store/apps/details?id=com.example.app'

const timeRangeOptions = [
  { value: 'last_7_days', label: '1 week till now' },
  { value: 'last_30_days', label: '1 month till now' },
  { value: 'last_90_days', label: '3 months till now' },
  { value: 'last_180_days', label: '6 months till now' },
  { value: 'last_365_days', label: '1 year till now' },
  { value: 'all_time', label: 'All time' },
]

const aiOutputTypeOptions = [
  { value: 'summary', label: 'Summary' },
  { value: 'pain_points', label: 'Pain points' },
  { value: 'feature_ideas', label: 'Feature ideas' },
  { value: 'competitor_insights', label: 'Competitor insights' },
  { value: 'action_plan', label: 'Action plan' },
  { value: 'json_report', label: 'JSON report' },
]

const initialReviewOptions = {
  ratingMin: '4',
  ratingMax: '5',
  timeRange: 'last_30_days',
  minimumReviewLength: '80',
  removeSpam: true,
  removeDuplicates: true,
  englishOnly: true,
  analysisGoal: '',
  keywordsInclude: '',
  keywordsExclude: '',
  maxReviewsLimit: '500',
  aiOutputType: 'feature_ideas',
}

const initialChatMessage = {
  role: 'assistant',
  content: 'Context is loaded. Ask about review filters, pain points, or app ideas.',
}

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

function parseKeywords(value) {
  return value
    .split(',')
    .map((keyword) => keyword.trim())
    .filter(Boolean)
}

function getOptionLabel(options, value) {
  return options.find((option) => option.value === value)?.label || value
}

function getBooleanLabel(value) {
  return value ? 'Yes' : 'No'
}

function App() {
  const [screen, setScreen] = useState('setup')
  const [playStoreLink, setPlayStoreLink] = useState('')
  const [submittedLink, setSubmittedLink] = useState('')
  const [reviewOptions, setReviewOptions] = useState(initialReviewOptions)
  const [linkError, setLinkError] = useState('')
  const [formError, setFormError] = useState('')
  const [submitStatus, setSubmitStatus] = useState('idle')
  const [savedRequest, setSavedRequest] = useState(null)
  const [openAiKey, setOpenAiKey] = useState('')
  const [chatMessages, setChatMessages] = useState([initialChatMessage])
  const [chatInput, setChatInput] = useState('')
  const [chatStatus, setChatStatus] = useState('idle')
  const [chatError, setChatError] = useState('')

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
      setLinkError('Enter a valid Google Play app link.')
      return
    }

    setSubmittedLink(trimmedLink)
    setLinkError('')
    setFormError('')
    setSavedRequest(null)
    setSubmitStatus('idle')
  }

  function handleReviewOptionChange(event) {
    const { checked, name, type, value } = event.target

    setReviewOptions((currentOptions) => ({
      ...currentOptions,
      [name]: type === 'checkbox' ? checked : value,
    }))
    setFormError('')
    setSavedRequest(null)
  }

  function getPayload() {
    return {
      playStoreLink: submittedLink,
      appId,
      filters: {
        ratingRange: {
          min: Number(reviewOptions.ratingMin),
          max: Number(reviewOptions.ratingMax),
        },
        timeRange: reviewOptions.timeRange,
        minimumReviewLength: Number(reviewOptions.minimumReviewLength),
        removeSpam: reviewOptions.removeSpam,
        removeDuplicates: reviewOptions.removeDuplicates,
        englishOnly: reviewOptions.englishOnly,
        keywords: {
          include: parseKeywords(reviewOptions.keywordsInclude),
          exclude: parseKeywords(reviewOptions.keywordsExclude),
        },
        maxReviewsLimit: Number(reviewOptions.maxReviewsLimit),
      },
      analysis: {
        goal: reviewOptions.analysisGoal.trim(),
        aiOutputType: reviewOptions.aiOutputType,
      },
    }
  }

  function validateReviewOptions() {
    const ratingMin = Number(reviewOptions.ratingMin)
    const ratingMax = Number(reviewOptions.ratingMax)
    const minimumReviewLength = Number(reviewOptions.minimumReviewLength)
    const maxReviewsLimit = Number(reviewOptions.maxReviewsLimit)

    if (
      !Number.isInteger(ratingMin) ||
      !Number.isInteger(ratingMax) ||
      ratingMin < 1 ||
      ratingMax > 5 ||
      ratingMin > ratingMax
    ) {
      return 'Choose a rating range from 1 to 5 stars.'
    }

    if (!Number.isInteger(minimumReviewLength) || minimumReviewLength < 0) {
      return 'Minimum review length must be 0 or more characters.'
    }

    if (!Number.isInteger(maxReviewsLimit) || maxReviewsLimit < 1) {
      return 'Max reviews limit must be at least 1.'
    }

    if (!reviewOptions.analysisGoal.trim()) {
      return 'Enter an analysis goal.'
    }

    return ''
  }

  async function handleQuestionnaireSubmit(event) {
    event.preventDefault()

    const validationMessage = validateReviewOptions()

    if (validationMessage) {
      setFormError(validationMessage)
      return
    }

    setSubmitStatus('submitting')
    setFormError('')
    setSavedRequest(null)

    try {
      const response = await fetch('/api/review-analysis-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(getPayload()),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Backend rejected the request.')
      }

      setSavedRequest(data)
      setChatMessages([initialChatMessage])
      setChatInput('')
      setChatError('')
      setSubmitStatus('success')
      setScreen('chat')
    } catch (requestError) {
      setFormError(requestError.message)
      setSubmitStatus('error')
    }
  }

  async function handleChatSubmit(event) {
    event.preventDefault()

    const trimmedMessage = chatInput.trim()

    if (!trimmedMessage || !savedRequest) {
      return
    }

    const nextMessages = [
      ...chatMessages,
      { role: 'user', content: trimmedMessage },
    ]

    setChatMessages(nextMessages)
    setChatInput('')
    setChatStatus('submitting')
    setChatError('')

    try {
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId: savedRequest.id,
          apiKey: openAiKey,
          messages: nextMessages,
        }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'AI chat request failed.')
      }

      setChatMessages((currentMessages) => [
        ...currentMessages,
        { role: 'assistant', content: data.reply },
      ])
      setChatStatus('success')
    } catch (requestError) {
      setChatError(requestError.message)
      setChatStatus('error')
    }
  }

  function handleEditSetup() {
    setScreen('setup')
    setChatError('')
    setChatStatus('idle')
  }

  if (screen === 'chat' && savedRequest) {
    const { analysis, filters } = savedRequest.request

    return (
      <main className="chat-shell">
        <header className="chat-header">
          <div>
            <p className="eyebrow">AI Review Chat</p>
            <h1>{savedRequest.request.appId}</h1>
          </div>
          <div className="header-actions">
            <a
              className="secondary-link"
              href={savedRequest.request.playStoreLink}
              target="_blank"
              rel="noreferrer"
            >
              Open listing
            </a>
            <button className="secondary-button" onClick={handleEditSetup}>
              Edit setup
            </button>
          </div>
        </header>

        <section className="chat-layout" aria-label="AI chat workspace">
          <aside className="context-panel" aria-label="Analysis context">
            <label htmlFor="open-ai-key">
              OpenAI API key
              <input
                id="open-ai-key"
                type="password"
                value={openAiKey}
                onChange={(event) => setOpenAiKey(event.target.value)}
                placeholder="sk-..."
                autoComplete="off"
              />
            </label>

            <div className="context-block">
              <h2>Context</h2>
              <dl>
                <div>
                  <dt>Request ID</dt>
                  <dd>{savedRequest.id}</dd>
                </div>
                <div>
                  <dt>Rating</dt>
                  <dd>
                    {filters.ratingRange.min}-{filters.ratingRange.max} stars
                  </dd>
                </div>
                <div>
                  <dt>Time</dt>
                  <dd>{getOptionLabel(timeRangeOptions, filters.timeRange)}</dd>
                </div>
                <div>
                  <dt>Length</dt>
                  <dd>{filters.minimumReviewLength}+ chars</dd>
                </div>
                <div>
                  <dt>Limit</dt>
                  <dd>{filters.maxReviewsLimit} reviews</dd>
                </div>
                <div>
                  <dt>Output</dt>
                  <dd>
                    {getOptionLabel(aiOutputTypeOptions, analysis.aiOutputType)}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="context-block">
              <h2>Filters</h2>
              <div className="chip-row">
                <span>Spam: {getBooleanLabel(filters.removeSpam)}</span>
                <span>
                  Duplicates: {getBooleanLabel(filters.removeDuplicates)}
                </span>
                <span>English: {getBooleanLabel(filters.englishOnly)}</span>
              </div>
            </div>

            <div className="context-block">
              <h2>Keywords</h2>
              <p>Include: {filters.keywords.include.join(', ') || 'None'}</p>
              <p>Exclude: {filters.keywords.exclude.join(', ') || 'None'}</p>
            </div>

            <div className="context-block">
              <h2>Goal</h2>
              <p>{analysis.goal}</p>
            </div>
          </aside>

          <section className="chat-panel" aria-label="Chat messages">
            <div className="message-list">
              {chatMessages.map((message, index) => (
                <article
                  className={`message-bubble ${message.role}`}
                  key={`${message.role}-${index}`}
                >
                  <span>{message.role === 'user' ? 'You' : 'AI'}</span>
                  <p>{message.content}</p>
                </article>
              ))}
            </div>

            {chatError ? (
              <p className="feedback error chat-error" role="alert">
                {chatError}
              </p>
            ) : null}

            <form className="chat-form" onSubmit={handleChatSubmit}>
              <textarea
                value={chatInput}
                onChange={(event) => setChatInput(event.target.value)}
                placeholder="Ask about this analysis setup"
                rows="3"
              />
              <button type="submit" disabled={chatStatus === 'submitting'}>
                {chatStatus === 'submitting' ? 'Thinking...' : 'Send'}
              </button>
            </form>
          </section>
        </section>
      </main>
    )
  }

  return (
    <main className="app-shell">
      <section className="intro-panel" aria-labelledby="page-title">
        <p className="eyebrow">App Idea Scraper</p>
        <h1 id="page-title">Configure review analysis</h1>
        <p className="intro-copy">
          Start with a Play Store listing, then choose the review filters and
          AI output you want.
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
                setLinkError('')
              }}
              placeholder={sampleLink}
              aria-describedby={linkError ? 'link-error' : undefined}
            />
            <button type="submit">Submit</button>
          </div>
          {linkError ? (
            <p className="feedback error" id="link-error">
              {linkError}
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

        {submittedLink ? (
          <form
            className="questions-form"
            onSubmit={handleQuestionnaireSubmit}
            aria-label="Review analysis settings"
          >
            <div className="section-heading">
              <h2>Review filters</h2>
              <span>{appId}</span>
            </div>

            <fieldset className="field-group">
              <legend>Rating range</legend>
              <div className="range-row">
                <label htmlFor="rating-min">
                  From
                  <input
                    id="rating-min"
                    name="ratingMin"
                    type="number"
                    min="1"
                    max="5"
                    step="1"
                    value={reviewOptions.ratingMin}
                    onChange={handleReviewOptionChange}
                  />
                </label>
                <label htmlFor="rating-max">
                  To
                  <input
                    id="rating-max"
                    name="ratingMax"
                    type="number"
                    min="1"
                    max="5"
                    step="1"
                    value={reviewOptions.ratingMax}
                    onChange={handleReviewOptionChange}
                  />
                </label>
              </div>
            </fieldset>

            <div className="question-grid">
              <label htmlFor="time-range">
                Time range
                <select
                  id="time-range"
                  name="timeRange"
                  value={reviewOptions.timeRange}
                  onChange={handleReviewOptionChange}
                >
                  {timeRangeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label htmlFor="minimum-review-length">
                Minimum review length
                <input
                  id="minimum-review-length"
                  name="minimumReviewLength"
                  type="number"
                  min="0"
                  step="1"
                  value={reviewOptions.minimumReviewLength}
                  onChange={handleReviewOptionChange}
                  placeholder="Characters"
                />
              </label>

              <label htmlFor="max-reviews-limit">
                Max reviews limit
                <input
                  id="max-reviews-limit"
                  name="maxReviewsLimit"
                  type="number"
                  min="1"
                  step="1"
                  value={reviewOptions.maxReviewsLimit}
                  onChange={handleReviewOptionChange}
                />
              </label>

              <label htmlFor="ai-output-type">
                AI output type
                <select
                  id="ai-output-type"
                  name="aiOutputType"
                  value={reviewOptions.aiOutputType}
                  onChange={handleReviewOptionChange}
                >
                  {aiOutputTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <fieldset className="toggle-group">
              <legend>Cleanup</legend>
              <label className="toggle-row" htmlFor="remove-spam">
                <span>Remove spam?</span>
                <input
                  id="remove-spam"
                  name="removeSpam"
                  type="checkbox"
                  checked={reviewOptions.removeSpam}
                  onChange={handleReviewOptionChange}
                />
              </label>
              <label className="toggle-row" htmlFor="remove-duplicates">
                <span>Remove duplicates?</span>
                <input
                  id="remove-duplicates"
                  name="removeDuplicates"
                  type="checkbox"
                  checked={reviewOptions.removeDuplicates}
                  onChange={handleReviewOptionChange}
                />
              </label>
              <label className="toggle-row" htmlFor="english-only">
                <span>English only?</span>
                <input
                  id="english-only"
                  name="englishOnly"
                  type="checkbox"
                  checked={reviewOptions.englishOnly}
                  onChange={handleReviewOptionChange}
                />
              </label>
            </fieldset>

            <label htmlFor="analysis-goal">
              Analysis goal
              <textarea
                id="analysis-goal"
                name="analysisGoal"
                value={reviewOptions.analysisGoal}
                onChange={handleReviewOptionChange}
                placeholder="Example: Find repeated complaints and new app ideas"
                rows="4"
              />
            </label>

            <div className="question-grid">
              <label htmlFor="keywords-include">
                Keywords include
                <input
                  id="keywords-include"
                  name="keywordsInclude"
                  value={reviewOptions.keywordsInclude}
                  onChange={handleReviewOptionChange}
                  placeholder="pricing, bug, ads"
                />
              </label>

              <label htmlFor="keywords-exclude">
                Keywords exclude
                <input
                  id="keywords-exclude"
                  name="keywordsExclude"
                  value={reviewOptions.keywordsExclude}
                  onChange={handleReviewOptionChange}
                  placeholder="refund, unrelated"
                />
              </label>
            </div>

            {formError ? (
              <p className="feedback error" role="alert">
                {formError}
              </p>
            ) : null}

            <button type="submit" disabled={submitStatus === 'submitting'}>
              {submitStatus === 'submitting'
                ? 'Sending...'
                : 'Continue to chat'}
            </button>
          </form>
        ) : null}
      </section>
    </main>
  )
}

export default App
