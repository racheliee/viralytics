export function handleAuthTokensFromUrl() {
  // Only run in browser environment
  if (typeof window === 'undefined') return

  const urlParams = new URLSearchParams(window.location.search)
  const igToken = urlParams.get('ig_token')
  const igUserId = urlParams.get('ig_user_id')

  // If tokens are present in URL, set them as cookies
  if (igToken) {
    document.cookie = `ig_token=${igToken};path=/;max-age=${60 * 60 * 24 * 7}` // 7 days
    // Clean up URL parameter
    urlParams.delete('ig_token')
  }

  if (igUserId) {
    document.cookie = `ig_user_id=${igUserId};path=/;max-age=${60 * 60 * 24 * 7}` // 7 days
    // Clean up URL parameter
    urlParams.delete('ig_user_id')
  }

  // If we modified the URL parameters, update the URL without reloading
  if (igToken || igUserId) {
    const newUrl = urlParams.toString()
      ? `${window.location.pathname}?${urlParams.toString()}`
      : window.location.pathname

    window.history.replaceState({}, '', newUrl)
  }
}
