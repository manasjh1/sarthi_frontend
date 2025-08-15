import analytics from '@/lib/mixpanel'
import { ANALYTICS_EVENTS } from '@/lib/analytics-events'

export const trackError = (error: Error | string, context?: Record<string, any>) => {
  const errorMessage = typeof error === 'string' ? error : error.message
  const errorStack = typeof error === 'string' ? undefined : error.stack
  
  analytics.track(ANALYTICS_EVENTS.ERROR_OCCURRED, {
    error_message: errorMessage,
    error_stack: errorStack,
    page_url: typeof window !== 'undefined' ? window.location.href : '',
    timestamp: new Date().toISOString(),
    ...context
  })
}

// Usage example:
// try {
//   // some code
// } catch (error) {
//   trackError(error, { context: 'auth_verification', user_id: 'user123' })
// }