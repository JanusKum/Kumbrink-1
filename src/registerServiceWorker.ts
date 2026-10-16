import { registerSW } from 'virtual:pwa-register'

// Browsers (Safari/iOS especially) only check for a new service worker
// opportunistically on navigation, which barely happens for an installed
// home-screen app that's just reopened from its icon. Polling explicitly
// closes that gap so a new deploy shows up without reinstalling the app.
const UPDATE_CHECK_INTERVAL_MS = 30 * 60 * 1000

export function registerServiceWorker() {
  registerSW({
    immediate: true,
    onRegisteredSW(_url, registration) {
      if (!registration) return

      const checkForUpdate = () => {
        if (document.visibilityState === 'visible') {
          registration.update().catch(() => {})
        }
      }

      // Also check right away: on some platforms (notably iOS home-screen
      // apps resumed from the app switcher) the browser's own navigation-time
      // update check doesn't reliably run, and visibilitychange only fires on
      // a hidden→visible transition, not on this initial load.
      checkForUpdate()
      setInterval(checkForUpdate, UPDATE_CHECK_INTERVAL_MS)
      document.addEventListener('visibilitychange', checkForUpdate)
    },
  })
}
